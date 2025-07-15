'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Ad {
  adArchiveID: number;
  snapshot: {
    body: string;
    videos: { video_hd_url?: string; video_sd_url?: string }[];
    images: { original_image_url?: string }[];
  };
  duration: number;
  [key: string]: any;
}

interface Analysis {
  id: string;
  ran_at: string;
  percentage: number;
  results: {
    longestRunningAds: Ad[];
  };
}

export default function CompanyAdsPage() {
  const [companyName, setCompanyName] = useState('');
  const [percentage, setPercentage] = useState(10);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<Analysis[]>([]);

  useEffect(() => {
    if (companyName) {
      fetchAnalysisHistory();
    }
  }, [companyName]);

  const fetchAnalysisHistory = async () => {
    try {
      const response = await fetch(`/api/analyze-ads/history?companyName=${companyName}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analysis history');
      }
      const data = await response.json();
      setAnalysisHistory(data.history);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/analyze-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, percentage }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An error occurred');
      }
      const data = await response.json();
      setAds(data.longestRunningAds);
      fetchAnalysisHistory(); // Refresh history
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (analysis: Analysis) => {
    setAds(analysis.results.longestRunningAds);
  };

  const formatDuration = (ms: number) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    return `${days} days`;
  };

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Ads Analyzer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Nike"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="percentage">Top % Longest Running</Label>
              <Input
                id="percentage"
                type="number"
                value={percentage}
                onChange={(e) => setPercentage(Number(e.target.value))}
              />
            </div>
            <Button onClick={handleAnalyze} disabled={loading || !companyName}>
              {loading ? 'Analyzing...' : 'Run Analysis'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Analysis History</h2>
          {analysisHistory.length > 0 ? (
            <ul className="space-y-2">
              {analysisHistory.map((analysis) => (
                <li key={analysis.id}>
                  <Button
                    variant="link"
                    onClick={() => handleHistoryClick(analysis)}
                  >
                    {new Date(analysis.ran_at).toLocaleString()} - Top {analysis.percentage}%
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No history for this company.</p>
          )}
        </div>

        <div className="md:col-span-3">
          {ads.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map((ad) => (
                <Card key={ad.adArchiveID}>
                  <CardContent className="p-4">
                    {ad.snapshot.videos && ad.snapshot.videos.length > 0 ? (
                      <video
                        controls
                        src={ad.snapshot.videos[0].video_hd_url || ad.snapshot.videos[0].video_sd_url}
                        className="w-full h-auto rounded-md mb-4"
                      />
                    ) : ad.snapshot.images && ad.snapshot.images.length > 0 && (!ad.snapshot.videos || ad.snapshot.videos.length === 0) ? (
                      <img
                        src={ad.snapshot.images[0].original_image_url}
                        alt="Ad creative"
                        className="w-full h-auto rounded-md mb-4"
                      />
                    ) : null}
                    <p className="text-sm text-gray-600 mb-2">{ad.snapshot.body}</p>
                    <p className="text-xs text-gray-500">Duration: {formatDuration(ad.duration)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 