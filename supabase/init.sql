DROP TABLE IF EXISTS content;
DROP TABLE IF EXISTS tracked_accounts;
DROP TABLE IF EXISTS user_profiles;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tracked Accounts
CREATE TABLE IF NOT EXISTS tracked_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'linkedin')),
  account_handle TEXT NOT NULL,
  account_name TEXT,
  account_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scraped Content
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracked_account_id UUID NOT NULL REFERENCES tracked_accounts(id) ON DELETE CASCADE,
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'story', 'video')),
  content_url TEXT,
  caption TEXT,
  media_urls TEXT[],
  engagement_data JSONB,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tracked_account_id, content_id)
); 