export interface TrackedAccount {
  id: string
  user_id: string
  platform: 'instagram' | 'tiktok' | 'linkedin'
  account_handle: string
  account_name: string
  account_url?: string
  is_active: boolean
  added_at: string
}

export interface CreateAccountData {
  platform: 'instagram' | 'tiktok' | 'linkedin'
  account_handle: string
  account_name?: string
  account_url?: string
}

export interface UpdateAccountData {
  is_active?: boolean
  account_name?: string
} 