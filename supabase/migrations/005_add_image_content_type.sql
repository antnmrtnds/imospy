-- 005_add_image_content_type.sql

-- 1) Drop the old constraint
ALTER TABLE content
  DROP CONSTRAINT IF EXISTS content_content_type_check;

-- 2) Re-create it to include 'image'
ALTER TABLE content
  ADD CONSTRAINT content_content_type_check
    CHECK (content_type IN ('post','story','video','carousel','image')); 