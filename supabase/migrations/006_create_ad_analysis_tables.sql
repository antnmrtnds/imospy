-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ads Table
CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  ad_archive_id TEXT NOT NULL UNIQUE,
  ad_creation_time TIMESTAMP WITH TIME ZONE,
  ad_creative_body TEXT,
  ad_creative_link_caption TEXT,
  ad_creative_link_title TEXT,
  ad_creative_link_description TEXT,
  ad_delivery_start_time TIMESTAMP WITH TIME ZONE,
  ad_delivery_stop_time TIMESTAMP WITH TIME ZONE,
  ad_snapshot_url TEXT,
  bylines TEXT,
  currency TEXT,
  spend JSONB,
  impressions JSONB,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analyses Table
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  percentage INT NOT NULL,
  ran_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  results JSONB
); 