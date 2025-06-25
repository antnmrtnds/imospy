import { currentUser } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all content for user's tracked accounts
    const { data, error } = await supabase
      .from('content')
      .select(`
        *,
        tracked_accounts!inner(
          id,
          account_name,
          account_handle,
          platform,
          user_id
        )
      `)
      .eq('tracked_accounts.user_id', user.id)
      .order('scraped_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Transform the data to include account info
    const transformedContent = data.map(item => ({
      id: item.id,
      account_id: item.account_id,
      content_id: item.content_id,
      content_type: item.content_type,
      content_url: item.content_url,
      caption: item.caption,
      media_urls: item.media_urls,
      engagement_data: item.engagement_data,
      scraped_at: item.scraped_at,
      account: item.tracked_accounts
    }))

    return NextResponse.json({ 
      content: transformedContent,
      count: transformedContent.length 
    })

  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 