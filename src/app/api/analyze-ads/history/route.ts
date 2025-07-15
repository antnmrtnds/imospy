import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyName = searchParams.get('companyName');

  if (!companyName) {
    return NextResponse.json({ error: 'Missing companyName' }, { status: 400 });
  }

  try {
    // 1. Find the company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('name', companyName)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ history: [] }); // No history if company not found
    }

    // 2. Fetch analyses for the company
    const { data: analyses, error: analysesError } = await supabase
      .from('analyses')
      .select('*')
      .eq('company_id', company.id)
      .order('ran_at', { ascending: false });

    if (analysesError) throw analysesError;

    // 3. For each analysis, fetch the full ad details
    const history = await Promise.all(
      analyses.map(async (analysis) => {
        const adArchiveIds = analysis.results.longestRunningAds;
        const { data: ads, error: adsError } = await supabase
          .from('ads')
          .select('*')
          .in('ad_archive_id', adArchiveIds);

        if (adsError) throw adsError;

        // Reconstruct the ads with duration for the frontend
        const longestRunningAds = ads.map(ad => {
            const startTime = new Date(ad.start_date).getTime();
            const endTime = ad.end_date ? new Date(ad.end_date).getTime() : Date.now();
            return {
                ...ad,
                snapshot: { // Reconstruct snapshot for frontend compatibility
                    body: ad.ad_creative_body,
                    videos: ad.is_video ? [{ video_hd_url: ad.media_url, video_preview_image_url: ad.thumbnail_url }] : [],
                    images: !ad.is_video ? [{ original_image_url: ad.media_url }] : [],
                },
                adArchiveID: ad.ad_archive_id,
                duration: endTime - startTime,
            }
        });

        return {
          ...analysis,
          results: {
            longestRunningAds,
          },
        };
      })
    );

    return NextResponse.json({ history });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'An error occurred while fetching history' }, { status: 500 });
  }
} 