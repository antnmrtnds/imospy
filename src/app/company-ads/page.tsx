'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CompanyAdsPage() {
  const [companyName, setCompanyName] = useState('');
  const [percentage, setPercentage] = useState(10);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/analyze-ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyName, percentage }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze ads');
      }

      const data = await response.json();
      setAds(data.longestRunningAds);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const formatDuration = (ms: number) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Company Ads Analyzer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Nike"
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5 mt-4">
            <Label htmlFor="percentage">Top % Longest Running Ads</Label>
            <Input
              id="percentage"
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value))}
              placeholder="e.g. 10"
            />
          </div>
          <Button onClick={handleAnalyze} disabled={loading} className="mt-4">
            {loading ? 'Analyzing...' : 'Analyze Ads'}
          </Button>
        </CardContent>
      </Card>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ads.map((ad: any) => (
          <Card key={ad.ad_archive_id}>
            <CardHeader>
              <CardTitle>Ad from {ad.page_name}</CardTitle>
            </CardHeader>
            <CardContent>
              {ad.snapshot.videos && ad.snapshot.videos.length > 0 ? (
                <video controls src={ad.snapshot.videos[0].video_hd_url || ad.snapshot.videos[0].video_sd_url} className="w-full" />
              ) : ad.snapshot.images && ad.snapshot.images.length > 0 && (!ad.snapshot.videos || ad.snapshot.videos.length === 0) ? (
                <img
                  src={ad.snapshot.images[0].original_image_url}
                  alt="Ad creative"
                  className="w-full h-auto rounded-md mb-4"
                />
              ) : null}
              <p className="mt-4">{ad.ad_creative_bodies[0]}</p>
              <p className="mt-2 text-sm text-gray-500">
                Duration: {formatDuration(ad.duration)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 