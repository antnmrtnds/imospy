-- Add unique constraint to content table for tracked_account_id and content_id
-- This allows proper upsert functionality in the scrape API

ALTER TABLE content 
ADD CONSTRAINT content_tracked_account_content_id_unique 
UNIQUE (tracked_account_id, content_id); 