-- Migration: Add social auth fields to users table
-- Date: 2026-01-07
-- Description: Add email_verified, provider, and provider_id fields to support Google and Apple sign-in

-- Add email_verified column
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Add provider column (google, apple, etc.)
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(50);

-- Add provider_id column (unique ID from the provider)
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider);
CREATE INDEX IF NOT EXISTS idx_users_provider_id ON users(provider_id);

-- Add comments for documentation
COMMENT ON COLUMN users.email_verified IS 'Whether the user email has been verified';
COMMENT ON COLUMN users.provider IS 'OAuth provider (google, apple, etc.)';
COMMENT ON COLUMN users.provider_id IS 'Unique identifier from the OAuth provider';
