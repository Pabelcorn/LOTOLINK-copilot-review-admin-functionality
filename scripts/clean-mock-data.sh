#!/bin/bash

# Script to clean mock/test data from the database
# Run this before deploying to production

set -e  # Exit on error

echo "🧹 LOTOLINK Database Cleanup Script"
echo "===================================="
echo ""

# Load environment variables
if [ -f "backend/.env" ]; then
    source backend/.env
fi

# Database connection details
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-lotolink_prod}"
DB_USER="${DB_USER:-postgres}"

echo "📊 Database: $DB_NAME on $DB_HOST:$DB_PORT"
echo ""

# Confirm before proceeding
read -p "⚠️  This will delete mock/test data. Continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Cancelled by user"
    exit 1
fi

echo ""
echo "🗑️  Cleaning mock/test data..."
echo ""

# Create SQL cleanup script
cat > /tmp/cleanup_mocks.sql <<'EOF'
-- Backup counts before deletion
DO $$
DECLARE
    banca_count INT;
    user_count INT;
    play_count INT;
BEGIN
    SELECT COUNT(*) INTO banca_count FROM bancas WHERE name LIKE '%Test%' OR name LIKE '%Mock%' OR name LIKE '%Demo%';
    SELECT COUNT(*) INTO user_count FROM users WHERE email LIKE '%test%' OR email LIKE '%example.com';
    SELECT COUNT(*) INTO play_count FROM plays WHERE created_at < NOW() - INTERVAL '30 days' AND status = 'pending';
    
    RAISE NOTICE 'Found % mock bancas to delete', banca_count;
    RAISE NOTICE 'Found % test users to delete', user_count;
    RAISE NOTICE 'Found % old test plays to delete', play_count;
END $$;

-- Start transaction
BEGIN;

-- 1. Remove mock/test bancas
DELETE FROM bancas 
WHERE name LIKE '%Test%' 
   OR name LIKE '%Mock%'
   OR name LIKE '%Demo%'
   OR (status = 'pending' AND created_at < NOW() - INTERVAL '7 days');

-- 2. Remove test users
DELETE FROM users 
WHERE email LIKE '%test%' 
   OR email LIKE '%example.com'
   OR email LIKE '%fake%';

-- 3. Remove old test plays (older than 30 days and pending)
DELETE FROM plays 
WHERE created_at < NOW() - INTERVAL '30 days'
  AND status = 'pending';

-- 4. Remove orphaned sucursals
DELETE FROM sucursals
WHERE banca_id NOT IN (SELECT id FROM bancas);

-- 5. Clean up expired OTP codes
DELETE FROM otp_codes
WHERE expires_at < NOW();

-- 6. Clean up expired guest sessions
DELETE FROM guest_sessions
WHERE expires_at < NOW();

-- 7. Remove old webhook events (keep last 90 days only)
DELETE FROM webhook_events
WHERE created_at < NOW() - INTERVAL '90 days';

-- Display final counts
DO $$
DECLARE
    banca_count INT;
    user_count INT;
    play_count INT;
BEGIN
    SELECT COUNT(*) INTO banca_count FROM bancas;
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO play_count FROM plays;
    
    RAISE NOTICE 'Remaining bancas: %', banca_count;
    RAISE NOTICE 'Remaining users: %', user_count;
    RAISE NOTICE 'Remaining plays: %', play_count;
END $$;

-- Commit transaction
COMMIT;

-- Vacuum to reclaim space
VACUUM ANALYZE bancas;
VACUUM ANALYZE users;
VACUUM ANALYZE plays;

EOF

# Run cleanup script
echo "📝 Executing cleanup SQL..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f /tmp/cleanup_mocks.sql

# Clean up temp file
rm /tmp/cleanup_mocks.sql

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📊 Next steps:"
echo "   1. Verify data: npm run db:verify"
echo "   2. Run migrations: npm run migration:run"
echo "   3. Seed production data: npm run db:seed:prod"
echo "   4. Update USE_MOCK_BANCA=false in .env"
echo "   5. Restart application"
echo ""
