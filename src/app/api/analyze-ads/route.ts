import { NextRequest, NextResponse } from 'next/server';
import { ScrapeCreatorsAPI, FacebookAd, FacebookAdDetails } from '@/lib/scrapeCreators';
import { supabase } from '@/lib/supabaseClient';

const scrapeCreators = new ScrapeCreatorsAPI({
  apiKey: process.env.SCRAPECREATORS_API_KEY!,
  baseUrl: 'https://api.scrapecreators.com',
});

interface AdWithDuration extends FacebookAdDetails {
  duration: number;
}

export async function POST(req: NextRequest) {
  try {
    const { companyName, percentage } = await req.json();

    if (!companyName || !percentage) {
      return NextResponse.json({ error: 'Missing companyName or percentage' }, { status: 400 });
    }

    // 1. Get or create the company
    let { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('name', companyName)
      .single();

    if (companyError && companyError.code !== 'PGRST116') { // Ignore 'not found' error
      throw companyError;
    }

    if (!company) {
      const { data: newCompany, error: newCompanyError } = await supabase
        .from('companies')
        .insert({ name: companyName })
        .select('id')
        .single();
      if (newCompanyError) throw newCompanyError;
      company = newCompany;
    }

    const companyId = company!.id;

    // 2. Get all of a company's ads from ScrapeCreators
    const companyAds: { results: FacebookAd[] } = await scrapeCreators.getCompanyAds(companyName);

    // 3. Run each ad id through the Ad Details api
    const adDetailsPromises = companyAds.results.map(ad => scrapeCreators.getAdDetails(ad.ad_archive_id));
    const adDetails: FacebookAdDetails[] = await Promise.all(adDetailsPromises);

    // 4. Upsert ad details into Supabase
    const adRecords = adDetails.map(ad => {
      const isVideo = ad.snapshot.videos && ad.snapshot.videos.length > 0;
      return {
        company_id: companyId,
        ad_archive_id: ad.adArchiveID.toString(),
        ad_creation_time: ad.creation_time ? new Date(ad.creation_time * 1000).toISOString() : null,
        ad_creative_body: ad.snapshot.body,
        ad_creative_link_caption: ad.snapshot.caption,
        ad_creative_link_title: ad.snapshot.title,
        media_url: isVideo ? ad.snapshot.videos[0].video_hd_url : ad.snapshot.images[0]?.original_image_url,
        thumbnail_url: isVideo ? ad.snapshot.videos[0].video_preview_image_url : ad.snapshot.images[0]?.original_image_url,
        is_video: isVideo,
        start_date: new Date(ad.startDate * 1000).toISOString(),
        end_date: ad.endDate ? new Date(ad.endDate * 1000).toISOString() : null,
      }
    });

    const { error: upsertError } = await supabase.from('ads').upsert(adRecords, {
      onConflict: 'ad_archive_id',
    });

    if (upsertError) throw upsertError;
    
    // 5. Analyze and save the analysis
    const adsWithDuration: AdWithDuration[] = adDetails.map((ad: FacebookAdDetails) => {
      const startTime = ad.startDate * 1000;
      const endTime = ad.endDate ? ad.endDate * 1000 : Date.now();
      const duration = endTime - startTime;
      return { ...ad, duration };
    });

    adsWithDuration.sort((a: AdWithDuration, b: AdWithDuration) => b.duration - a.duration);

    const topXPercent = Math.ceil(adsWithDuration.length * (percentage / 100));
    const longestRunningAds = adsWithDuration.slice(0, topXPercent);

    const { error: analysisError } = await supabase.from('analyses').insert({
      company_id: companyId,
      percentage,
      results: {
        longestRunningAds: longestRunningAds.map(ad => ad.adArchiveID),
      },
    });

    if (analysisError) throw analysisError;

    return NextResponse.json({ longestRunningAds });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'An error occurred during analysis' }, { status: 500 });
  }
} 