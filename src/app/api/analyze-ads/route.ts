import { NextRequest, NextResponse } from 'next/server';
import { ScrapeCreatorsAPI, FacebookAd, FacebookAdDetails } from '@/lib/scrapeCreators';

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

    // 1. Get all of a company's ads
    const companyAds = await scrapeCreators.getCompanyAds(companyName);

    // 2. Store the response in a json (in-memory for now)
    const adsById: { [key: string]: FacebookAd } = {};
    for (const ad of companyAds.ads) {
      adsById[ad.ad_archive_id] = ad;
    }

    // 3. Extract each ad's id
    const adIds = Object.keys(adsById);

    // 4. Run each ad id through the Ad Details api
    const adDetailsPromises = adIds.map(id => scrapeCreators.getAdDetails(id));
    const adDetails: FacebookAdDetails[] = await Promise.all(adDetailsPromises);

    // 5. Log the response in a new json file (in-memory for now)
    const adDetailsLog = adDetails;

    // 6. Parse all ads and store in a new json file the top (x)% longest running ads.
    const adsWithDuration: AdWithDuration[] = adDetails.map((ad: FacebookAdDetails) => {
      const startTime = new Date(ad.ad_delivery_start_time).getTime();
      const endTime = ad.ad_delivery_stop_time ? new Date(ad.ad_delivery_stop_time).getTime() : Date.now();
      const duration = endTime - startTime;
      return { ...ad, duration };
    });

    adsWithDuration.sort((a: AdWithDuration, b: AdWithDuration) => b.duration - a.duration);

    const topXPercent = Math.ceil(adsWithDuration.length * (percentage / 100));
    const longestRunningAds = adsWithDuration.slice(0, topXPercent);

    return NextResponse.json({ longestRunningAds });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'An error occurred during analysis' }, { status: 500 });
  }
} 