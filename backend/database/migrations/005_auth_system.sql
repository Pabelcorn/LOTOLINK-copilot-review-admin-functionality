-- ============================================================
-- LOTOLINK AUTH SYSTEM MIGRATIONS
-- PostgreSQL 14+
-- 
-- Adds authentication system features:
-- - Age verification (18+)
-- - OTP verification for phone
-- - Guest mode
-- - Admin secret access logging
-- ============================================================

-- ============================================================
-- EXTEND USERS TABLE
-- ============================================================
ALTER TABLE users
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS age_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS guest_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Create index for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_guest ON users(is_guest);
CREATE INDEX IF NOT EXISTS idx_users_age_verified ON users(age_verified);

-- Add comment to explain guest mode
COMMENT ON COLUMN users.is_guest IS 'Indicates if user is in guest/explore mode without full registration';
COMMENT ON COLUMN users.guest_expires_at IS 'Guest sessions expire after 30 days or can be converted to full account';
COMMENT ON COLUMN users.age_verified IS 'Required for full account - must be 18+ to use platform';

-- ============================================================
-- OTP CODES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS otp_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    purpose VARCHAR(50) NOT NULL, -- 'registration', 'login', 'verification'
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 5,
    verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_otp_codes_phone ON otp_codes(phone);
CREATE INDEX idx_otp_codes_code ON otp_codes(code);
CREATE INDEX idx_otp_codes_expires_at ON otp_codes(expires_at);
CREATE INDEX idx_otp_codes_verified ON otp_codes(verified);

COMMENT ON TABLE otp_codes IS 'Stores one-time passwords for phone verification';
COMMENT ON COLUMN otp_codes.max_attempts IS 'Maximum verification attempts before OTP is invalidated';

-- ============================================================
-- ADMIN ACCESS LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    secret_code VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES users(id),
    username VARCHAR(100),
    success BOOLEAN NOT NULL,
    ip_address VARCHAR(45), -- IPv6 support
    user_agent TEXT,
    error_message TEXT,
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_access_logs_secret_code ON admin_access_logs(secret_code);
CREATE INDEX idx_admin_access_logs_user_id ON admin_access_logs(user_id);
CREATE INDEX idx_admin_access_logs_accessed_at ON admin_access_logs(accessed_at);
CREATE INDEX idx_admin_access_logs_success ON admin_access_logs(success);
CREATE INDEX idx_admin_access_logs_ip_address ON admin_access_logs(ip_address);

COMMENT ON TABLE admin_access_logs IS 'Audit log for all admin secret code access attempts';
COMMENT ON COLUMN admin_access_logs.secret_code IS 'The secret code that was attempted (e.g., LOT20041227)';

-- ============================================================
-- GUEST SESSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS guest_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_token VARCHAR(255) NOT NULL UNIQUE,
    device_id VARCHAR(255),
    device_info JSONB,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    converted_to_user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_guest_sessions_token ON guest_sessions(session_token);
CREATE INDEX idx_guest_sessions_expires_at ON guest_sessions(expires_at);
CREATE INDEX idx_guest_sessions_device_id ON guest_sessions(device_id);

COMMENT ON TABLE guest_sessions IS 'Tracks guest mode sessions for users exploring without registration';
COMMENT ON COLUMN guest_sessions.converted_to_user_id IS 'Links guest session to full user account upon conversion';

-- ============================================================
-- ADMIN SECRET CODES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_secret_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    code_hash VARCHAR(255) NOT NULL,
    access_level VARCHAR(20) NOT NULL, -- 'super_admin', 'admin'
    active BOOLEAN DEFAULT TRUE,
    rate_limit INTEGER DEFAULT 3, -- Max attempts per hour
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deactivated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_admin_secret_codes_code ON admin_secret_codes(code);
CREATE INDEX idx_admin_secret_codes_active ON admin_secret_codes(active);

COMMENT ON TABLE admin_secret_codes IS 'Stores admin secret access codes';
COMMENT ON COLUMN admin_secret_codes.code_hash IS 'Hashed version of secret code for security';

-- ============================================================
-- RATE LIMITING TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier VARCHAR(255) NOT NULL, -- IP address or phone number
    action VARCHAR(50) NOT NULL, -- 'otp_send', 'admin_attempt', 'login'
    attempts INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    blocked_until TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_rate_limits_identifier ON rate_limits(identifier, action);
CREATE INDEX idx_rate_limits_blocked_until ON rate_limits(blocked_until);

COMMENT ON TABLE rate_limits IS 'Tracks rate limiting for sensitive operations';

-- ============================================================
-- INSERT DEFAULT ADMIN SECRET CODES
-- ============================================================
-- IMPORTANT: The hash values below are placeholders and MUST be replaced with
-- properly hashed values before deployment to production.
-- 
-- To generate proper bcrypt hashes, use the following Node.js code:
--   const bcrypt = require('bcrypt');
--   bcrypt.hash('LOT20041227', 10, (err, hash) => console.log(hash));
--   bcrypt.hash('LOTOLINK2024', 10, (err, hash) => console.log(hash));
--
-- For development/testing purposes, the AdminSecretService will validate
-- the raw codes directly if no matching hash is found in the database.
INSERT INTO admin_secret_codes (code, code_hash, access_level, description)
VALUES 
    ('LOT20041227', '$2b$10$PLACEHOLDER_HASH_NEEDS_REPLACEMENT_FOR_PRODUCTION', 'super_admin', 'Super Admin Access Code'),
    ('LOTOLINK2024', '$2b$10$PLACEHOLDER_HASH_NEEDS_REPLACEMENT_FOR_PRODUCTION', 'admin', 'Regular Admin Access Code')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- CLEANUP FUNCTION FOR EXPIRED OTPS
-- ============================================================
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM otp_codes WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- CLEANUP FUNCTION FOR EXPIRED GUEST SESSIONS
-- ============================================================
CREATE OR REPLACE FUNCTION cleanup_expired_guest_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM guest_sessions WHERE expires_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCTION TO CHECK AGE REQUIREMENT
-- ============================================================
CREATE OR REPLACE FUNCTION check_age_requirement(birth_date_input DATE)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (EXTRACT(YEAR FROM age(birth_date_input)) >= 18);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_age_requirement IS 'Validates that user is 18 years or older based on birth date';
