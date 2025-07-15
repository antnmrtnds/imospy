ALTER TABLE ads RENAME COLUMN ad_snapshot_url TO media_url;
ALTER TABLE ads RENAME COLUMN video_preview_image_url TO thumbnail_url;
ALTER TABLE ads ADD COLUMN is_video BOOLEAN DEFAULT FALSE; 