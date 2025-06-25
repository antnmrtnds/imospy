-- Migration: Change tracked_accounts.user_id from UUID to TEXT

-- Drop foreign key constraint (auto-named) referencing auth.users
ALTER TABLE tracked_accounts
DROP CONSTRAINT IF EXISTS tracked_accounts_user_id_fkey;

-- Alter column type to TEXT
ALTER TABLE tracked_accounts
ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- (Optional) Remove default if any
ALTER TABLE tracked_accounts
ALTER COLUMN user_id DROP DEFAULT; 