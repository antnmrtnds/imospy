import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { scrapeCreatorsAPI } from '@/lib/scrapeCreators'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST - Manually trigger scraping for specific account
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { accountId } = body

    if (!accountId) {
      return NextResponse.json({ 
        error: 'Account ID is required' 
      }, { status: 400 })
    }

    // Verify account belongs to user
    const { data: account, error: accountError } = await supabase
      .from('tracked_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', userId)
      .single()

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    if (!account.is_active) {
      return NextResponse.json({ 
        error: 'Account is paused' 
      }, { status: 400 })
    }

    // Check if API key is configured
    if (!process.env.SCRAPECREATORS_API_KEY) {
      return NextResponse.json({ 
        error: 'ScrapeCreators API key not configured' 
      }, { status: 500 })
    }

    try {
      // Scrape latest posts from the platform
      console.log(`Attempting to scrape ${account.platform} posts for handle: ${account.account_handle}`)
      
      const posts = await scrapeCreatorsAPI.getPosts(
        account.platform, 
        account.account_handle
      )

      console.log(`Scraped ${posts.length} posts from ${account.platform}`)
      
      // Log Instagram limitation
      if (account.platform === 'instagram' && posts.length === 12) {
        console.warn('Instagram API Limitation: Only ~12 recent posts available from profile endpoint. This is a known limitation of the ScrapeCreators API.')
      }
      
      // Log details about the first few posts for debugging
      if (posts.length > 0) {
        console.log('Sample post data:')
        posts.slice(0, 2).forEach((post, idx) => {
          console.log(`Post ${idx + 1}:`, {
            id: post.id || 'no-id',
            shortcode: (post as any).shortcode || 'no-shortcode',
            __typename: (post as any).__typename || 'no-typename',
            is_video: (post as any).is_video || false,
            display_url: (post as any).display_url ? 'has-display-url' : 'no-display-url',
            media_count: (post as any).edge_sidecar_to_children?.edges?.length || 1
          })
        })
      }

      if (posts.length === 0) {
        return NextResponse.json({
          message: 'No content found for this account',
          scraped_count: 0,
          stored_count: 0
        })
      }

      // Store scraped content in database
      const contentToInsert = posts.map(post => ({
        tracked_account_id: account.id,
        content_id: getContentId(post, account.platform),
        content_type: getContentType(post, account.platform),
        content_url: getContentUrl(post, account.platform),
        caption: getCaption(post, account.platform),
        media_urls: getMediaUrls(post, account.platform),
        engagement_data: getEngagementData(post, account.platform),
        scraped_at: new Date().toISOString()
      }))

      // Insert content, handling duplicates
      const { data: insertedContent, error: insertError } = await supabase
        .from('content')
        .upsert(contentToInsert, { 
          onConflict: 'tracked_account_id,content_id',
          ignoreDuplicates: false 
        })
        .select()

      if (insertError) {
        console.error('Database insertion error:', insertError)
        return NextResponse.json({ 
          error: 'Failed to store scraped content',
          details: insertError.message 
        }, { status: 500 })
      }

      return NextResponse.json({
        message: 'Content scraped successfully',
        scraped_count: posts.length,
        stored_count: insertedContent?.length || 0
      })

    } catch (scrapeError: any) {
      console.error('ScrapeCreators API error:', scrapeError)
      
      // Provide more specific error messages
      if (scrapeError.message?.includes('404')) {
        return NextResponse.json({ 
          error: `Content not available for ${account.platform} account "${account.account_handle}". The account might be private, not exist, or the platform endpoint might be temporarily unavailable.`,
          details: scrapeError.message
        }, { status: 400 })
      }
      
      if (scrapeError.message?.includes('401')) {
        return NextResponse.json({ 
          error: 'ScrapeCreators API authentication failed. Please check your API key.',
          details: scrapeError.message
        }, { status: 500 })
      }
      
      return NextResponse.json({ 
        error: `Failed to scrape content from ${account.platform}`,
        details: scrapeError.message
      }, { status: 500 })
    }

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper functions to normalize data across platforms
function getContentId(post: any, platform: string): string {
  switch (platform) {
    case 'instagram':
      return post.id || post.shortcode
    case 'tiktok':
      return post.id
    case 'linkedin':
      // Extract ID from LinkedIn post URL if available
      if (post.url) {
        const urlParts = post.url.split('-')
        const idPart = urlParts[urlParts.length - 1]
        if (idPart) return idPart
      }
      return post.id || `linkedin-${Date.now()}-${Math.random()}`
    default:
      return `${platform}-${Date.now()}-${Math.random()}`
  }
}

function getContentType(post: any, platform: string): string {
  switch (platform) {
    case 'instagram':
      // Handle different Instagram content types based on __typename
      if (post.__typename === 'GraphSidecar') return 'carousel'
      if (post.__typename === 'GraphVideo' || post.is_video) return 'video'
      if (post.__typename === 'GraphImage') return 'image'
      // Fallback to 'post' for other types
      return 'post'
    case 'tiktok':
      // TikTok posts are always videos
      return 'video'
    case 'linkedin':
      // LinkedIn posts can have different types based on content
      if (post.media && post.media.length > 0) {
        // Check if media contains videos
        const hasVideo = post.media.some((media: any) => 
          media.includes('.mp4') || media.includes('video') || media.type === 'video'
        )
        if (hasVideo) return 'video'
        
        // Check if multiple media items (carousel-like)
        if (post.media.length > 1) return 'carousel'
        
        // Single image/media
        return 'image'
      }
      
      // Text-only post
      return 'post'
    default:
      return 'post'
  }
}

function getContentUrl(post: any, platform: string): string {
  switch (platform) {
    case 'instagram':
      return `https://instagram.com/p/${post.shortcode}/`
    case 'tiktok':
      // For TikTok, try to construct the URL or use provided URL
      if (post.url) return post.url
      if (post.id && post.author?.uniqueId) {
        return `https://www.tiktok.com/@${post.author.uniqueId}/video/${post.id}`
      }
      // Fallback to video play address as last resort
      return post.video?.playAddr || ''
    case 'linkedin':
      // LinkedIn company API provides direct post URLs
      if (post.url) return post.url
      if (post.postUrl) return post.postUrl
      // Fallback to author profile URL
      return post.author?.profileUrl || ''
    default:
      return ''
  }
}

function getCaption(post: any, platform: string): string {
  switch (platform) {
    case 'instagram':
      return post.edge_media_to_caption?.edges?.[0]?.node?.text || ''
    case 'tiktok':
      return post.desc || ''
    case 'linkedin':
      return post.text || ''
    default:
      return ''
  }
}

function getMediaUrls(post: any, platform: string): string[] {
  switch (platform) {
    case 'instagram':
      const urls: string[] = []
      
      // Handle carousel posts (multiple images/videos)
      if (post.__typename === 'GraphSidecar' && post.edge_sidecar_to_children?.edges) {
        post.edge_sidecar_to_children.edges.forEach((edge: any) => {
          const child = edge.node
          urls.push(child.display_url)
          if (child.is_video && child.video_url) {
            urls.push(child.video_url)
          }
        })
      } else {
        // Single image/video post
        if (post.display_url) {
          urls.push(post.display_url)
        }
        if (post.is_video && post.video_url) {
          urls.push(post.video_url)
        }
      }
      
      // Debug logging for media URLs
      console.log('Instagram media extraction:', {
        post_id: post.id || post.shortcode,
        post_type: post.__typename,
        is_video: post.is_video,
        display_url: post.display_url ? 'present' : 'missing',
        video_url: post.video_url ? 'present' : 'missing',
        extracted_urls: urls.length,
        url_types: urls.map(url => {
          if (url.includes('.mp4') || url.includes('video')) return 'video'
          if (url.includes('.jpg') || url.includes('.jpeg')) return 'image'
          return 'unknown'
        })
      })
      
      return urls.filter(Boolean)
    case 'tiktok':
      const tiktokUrls = [
        post.video?.cover,           // Thumbnail/cover image
        post.video?.dynamicCover,    // Dynamic cover image
        post.video?.playAddr         // Video URL
      ].filter(Boolean)
      
      // Debug logging for TikTok URLs
      console.log('TikTok media extraction:', {
        post_id: post.id,
        has_video: !!post.video,
        cover: post.video?.cover ? 'present' : 'missing',
        dynamic_cover: post.video?.dynamicCover ? 'present' : 'missing',
        play_addr: post.video?.playAddr ? 'present' : 'missing',
        extracted_urls: tiktokUrls.length
      })
      
      return tiktokUrls
    case 'linkedin':
      const linkedinUrls = []
      
      // LinkedIn company API doesn't return media URLs directly in posts
      // Posts only contain text content and metadata
      // The media would need to be extracted from the post content or fetched separately
      
      // LinkedIn posts may have media arrays (profile endpoint)
      if (post.media && Array.isArray(post.media)) {
        linkedinUrls.push(...post.media)
      }
      
      // LinkedIn posts may have images in different structure (profile endpoint)
      if (post.images && Array.isArray(post.images)) {
        linkedinUrls.push(...post.images)
      }
      
      // Debug logging for LinkedIn URLs
      console.log('LinkedIn media extraction:', {
        post_url: post.url,
        has_media: !!post.media,
        has_images: !!post.images,
        media_length: post.media?.length || 0,
        images_length: post.images?.length || 0,
        extracted_urls: linkedinUrls.length,
        post_text_length: post.text?.length || 0
      })
      
      return linkedinUrls.filter(Boolean)
    default:
      return []
  }
}

function getEngagementData(post: any, platform: string): object {
  switch (platform) {
    case 'instagram':
      const engagementData = {
        likes: post.edge_liked_by?.count || 0,
        comments: post.edge_media_to_comment?.count || 0,
        timestamp: new Date(post.taken_at_timestamp * 1000).toISOString()
      }
      
      // Debug logging for engagement data
      console.log('Instagram engagement extraction:', {
        post_id: post.id || post.shortcode,
        raw_likes_data: post.edge_liked_by,
        raw_comments_data: post.edge_media_to_comment,
        extracted_likes: engagementData.likes,
        extracted_comments: engagementData.comments,
        timestamp: engagementData.timestamp
      })
      
      return engagementData
    case 'tiktok':
      const tiktokEngagement = {
        plays: post.stats?.playCount || 0,
        likes: post.stats?.likeCount || 0,
        comments: post.stats?.commentCount || 0,
        shares: post.stats?.shareCount || 0,
        timestamp: post.createTime ? new Date(post.createTime * 1000).toISOString() : new Date().toISOString()
      }
      
      // Debug logging for TikTok engagement
      console.log('TikTok engagement extraction:', {
        post_id: post.id,
        raw_stats: post.stats,
        extracted_plays: tiktokEngagement.plays,
        extracted_likes: tiktokEngagement.likes,
        extracted_comments: tiktokEngagement.comments,
        extracted_shares: tiktokEngagement.shares,
        timestamp: tiktokEngagement.timestamp
      })
      
      return tiktokEngagement
    case 'linkedin':
      // LinkedIn: Use enriched data from combined company + post endpoints
      let timestamp = new Date().toISOString()
      if (post.datePublished) {
        timestamp = new Date(post.datePublished).toISOString()
      } else if (post.timestamp) {
        timestamp = post.timestamp
      } else if (post.publishedAt) {
        timestamp = post.publishedAt
      }
      
      const linkedinEngagement = {
        // Use enriched engagement data from post endpoint or fallback to raw reactions
        likes: typeof post.likeCount === 'number' ? post.likeCount : (post.reactions?.likes ?? post.likes ?? 0),
        comments: typeof post.commentCount === 'number' ? post.commentCount : (post.reactions?.comments ?? post.comments ?? 0),
        reposts: post.reactions?.reposts ?? post.reposts ?? post.shares ?? 0,
        timestamp: timestamp,
        // Track enrichment status for UI display
        _enriched: post._enriched ?? false
      }
      
      // Debug logging for LinkedIn engagement
      console.log('LinkedIn engagement extraction:', {
        post_url: post.url,
        enrichment_status: post._enriched ? 'success' : 'failed',
        enriched_likeCount: post.likeCount,
        enriched_commentCount: post.commentCount,
        extracted_likes: linkedinEngagement.likes,
        extracted_comments: linkedinEngagement.comments,
        final_timestamp: linkedinEngagement.timestamp
      })
      
      return linkedinEngagement
    default:
      return {
        timestamp: new Date().toISOString()
      }
  }
} 