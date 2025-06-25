import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch user's tracked accounts
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: accounts, error } = await supabase
      .from('tracked_accounts')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
    }

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Add new tracked account
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { platform, account_handle, account_name, account_url } = body

    // Validate required fields
    if (!platform || !account_handle) {
      return NextResponse.json({ 
        error: 'Platform and account handle are required' 
      }, { status: 400 })
    }

    // Validate platform
    if (!['instagram', 'tiktok', 'linkedin'].includes(platform)) {
      return NextResponse.json({ 
        error: 'Platform must be instagram, tiktok, or linkedin' 
      }, { status: 400 })
    }

    // Check if user already has 5 accounts
    const { count } = await supabase
      .from('tracked_accounts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (count && count >= 5) {
      return NextResponse.json({ 
        error: 'Maximum of 5 accounts allowed' 
      }, { status: 400 })
    }

    // Check if account already exists for this user
    const { data: existing } = await supabase
      .from('tracked_accounts')
      .select('id')
      .eq('user_id', userId)
      .eq('platform', platform)
      .eq('account_handle', account_handle)
      .single()

    if (existing) {
      return NextResponse.json({ 
        error: 'Account already being tracked' 
      }, { status: 400 })
    }

    // Insert new account
    const { data: newAccount, error } = await supabase
      .from('tracked_accounts')
      .insert({
        user_id: userId,
        platform,
        account_handle,
        account_name: account_name || account_handle,
        account_url,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to add account' }, { status: 500 })
    }

    return NextResponse.json({ account: newAccount }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 