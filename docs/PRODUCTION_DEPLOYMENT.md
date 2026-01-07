# Production Deployment Guide

This guide covers the steps needed to prepare the LotoLink application for production deployment, including cleaning up test/demo data.

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Database Cleanup](#database-cleanup)
3. [Environment Configuration](#environment-configuration)
4. [Security Verification](#security-verification)
5. [Testing](#testing)

## Pre-Deployment Checklist

Before deploying to production, ensure:
- [ ] All test/demo bancas are marked as inactive or removed
- [ ] Test user accounts are removed or disabled
- [ ] Demo lottery draws are cleaned up
- [ ] Environment variables are configured for production
- [ ] SSL certificates are in place
- [ ] Database backups are configured
- [ ] Monitoring and logging are set up

## Database Cleanup

### Test Bancas Cleanup

Test and demo bancas should be identified and removed or deactivated before production deployment.

#### Option 1: Deactivate Test Bancas (Recommended)

Deactivating test bancas preserves data for reference but prevents them from appearing in production:

```sql
-- STEP 1: Review bancas that will be deactivated
-- IMPORTANT: Manually review this list before proceeding!
SELECT id, name, email, status, is_active, created_at
FROM bancas 
WHERE (
    name LIKE '%Test%' 
    OR name LIKE '%Demo%'
    OR name LIKE '%Prueba%'
    OR email LIKE '%@test.%'
    OR email LIKE '%@demo.%'
    OR email LIKE '%@example.%'
  )
  AND is_active = true
ORDER BY created_at DESC;

-- STEP 2: After manual review, deactivate test bancas
-- NOTE: Adjust WHERE clause based on your naming conventions
UPDATE bancas 
SET is_active = false,
    status = 'inactive',
    updated_at = CURRENT_TIMESTAMP
WHERE id IN (
  -- Replace with actual IDs from Step 1 review
  -- Example: 'banca-id-1', 'banca-id-2'
  -- DO NOT run without explicit IDs!
  SELECT id FROM bancas WHERE 1=0  -- Placeholder - replace with real IDs
);

-- Alternative: More conservative pattern matching
-- Only matches bancas with "test" or "demo" in name AND test email domain
UPDATE bancas 
SET is_active = false,
    status = 'inactive',
    updated_at = CURRENT_TIMESTAMP
WHERE is_active = true
  AND (
    (LOWER(name) LIKE '%test%' AND LOWER(email) LIKE '%@test.%')
    OR (LOWER(name) LIKE '%demo%' AND LOWER(email) LIKE '%@demo.%')
    OR (LOWER(name) LIKE '%prueba%' AND LOWER(email) LIKE '%@test.%')
  );
```

#### Option 2: Delete Test Bancas

⚠️ **Warning**: This permanently removes data. Only use if you're certain you don't need the test data.

```sql
-- First, delete related data (adjust based on your schema)
DELETE FROM banca_lotteries WHERE banca_id IN (
  SELECT id FROM bancas WHERE name LIKE '%Test%' OR name LIKE '%Demo%' OR name LIKE '%Prueba%'
);

DELETE FROM banca_number_limits WHERE banca_id IN (
  SELECT id FROM bancas WHERE name LIKE '%Test%' OR name LIKE '%Demo%' OR name LIKE '%Prueba%'
);

DELETE FROM banca_daily_sales WHERE banca_id IN (
  SELECT id FROM bancas WHERE name LIKE '%Test%' OR name LIKE '%Demo%' OR name LIKE '%Prueba%'
);

-- Finally, delete the bancas
DELETE FROM bancas 
WHERE name LIKE '%Test%' 
   OR name LIKE '%Demo%'
   OR name LIKE '%Prueba%'
   OR email LIKE '%@test.%'
   OR email LIKE '%@demo.%';
```

### Test User Accounts Cleanup

```sql
-- Identify test users
SELECT id, email, phone, created_at 
FROM users 
WHERE email LIKE '%@test.%' 
   OR email LIKE '%@demo.%'
   OR phone LIKE '%555%'; -- Adjust based on your test phone pattern

-- Deactivate test users
UPDATE users 
SET is_active = false,
    updated_at = CURRENT_TIMESTAMP
WHERE email LIKE '%@test.%' 
   OR email LIKE '%@demo.%';
```

### Demo Lottery Draws Cleanup

```sql
-- Remove demo lottery draws if any
DELETE FROM lottery_draws 
WHERE is_demo = true 
   OR draw_date < '2024-01-01'; -- Adjust date as needed
```

### Automated Cleanup Script

Create a SQL migration file for production deployment:

**File**: `backend/database/migrations/production-cleanup.sql`

```sql
-- Production Cleanup Migration
-- Run this before deploying to production

BEGIN;

-- Log cleanup action
CREATE TABLE IF NOT EXISTS cleanup_log (
  id SERIAL PRIMARY KEY,
  cleanup_type VARCHAR(100),
  records_affected INTEGER,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deactivate test bancas
WITH deactivated AS (
  UPDATE bancas 
  SET is_active = false,
      status = 'inactive',
      updated_at = CURRENT_TIMESTAMP
  WHERE name LIKE '%Test%' 
     OR name LIKE '%Demo%'
     OR name LIKE '%Prueba%'
     OR email LIKE '%@test.%'
     OR email LIKE '%@demo.%'
  RETURNING id
)
INSERT INTO cleanup_log (cleanup_type, records_affected)
SELECT 'test_bancas_deactivated', COUNT(*) FROM deactivated;

-- Deactivate test users
WITH deactivated_users AS (
  UPDATE users 
  SET is_active = false,
      updated_at = CURRENT_TIMESTAMP
  WHERE email LIKE '%@test.%' 
     OR email LIKE '%@demo.%'
  RETURNING id
)
INSERT INTO cleanup_log (cleanup_type, records_affected)
SELECT 'test_users_deactivated', COUNT(*) FROM deactivated_users;

-- Remove demo draws if applicable
WITH deleted_draws AS (
  DELETE FROM lottery_draws 
  WHERE is_demo = true
  RETURNING id
)
INSERT INTO cleanup_log (cleanup_type, records_affected)
SELECT 'demo_draws_deleted', COUNT(*) FROM deleted_draws;

COMMIT;

-- Verify cleanup
SELECT * FROM cleanup_log ORDER BY executed_at DESC LIMIT 10;
```

## Environment Configuration

### Production Environment Variables

Ensure the following environment variables are set for production:

```bash
# Backend (.env.production)
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@host:5432/lotolink_prod
DATABASE_SSL=true

# JWT and Security
JWT_SECRET=<strong-random-secret>
JWT_EXPIRES_IN=24h
ADMIN_USERNAME=<admin-username>
ADMIN_PASSWORD_HASH=<bcrypt-hashed-password>

# API Keys
STRIPE_SECRET_KEY=<production-stripe-key>
STRIPE_WEBHOOK_SECRET=<production-webhook-secret>

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Email (if applicable)
SMTP_HOST=<smtp-host>
SMTP_PORT=587
SMTP_USER=<smtp-user>
SMTP_PASSWORD=<smtp-password>

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=<sentry-dsn> # if using Sentry
```

### Mobile App Configuration

Update `mobile-app/.env.production`:

```bash
VITE_API_URL=https://api.yourdomain.com/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=<production-stripe-publishable-key>
VITE_APP_VERSION=1.0.0
```

## Security Verification

### Pre-Deployment Security Checklist

- [ ] All API endpoints require authentication
- [ ] Rate limiting is enabled
- [ ] CORS is properly configured
- [ ] SQL injection prevention is in place
- [ ] XSS protection is enabled
- [ ] CSRF protection is enabled
- [ ] Sensitive data is encrypted
- [ ] Secrets are not in source control
- [ ] HTTPS is enforced
- [ ] Security headers are set

### Run Security Scans

```bash
# Install dependencies
npm install

# Run security audit
npm audit

# Fix vulnerabilities if any
npm audit fix

# Run CodeQL scan (if integrated with GitHub)
# This should be part of your CI/CD pipeline
```

## Testing

### Pre-Production Testing

1. **Database Verification**
   ```bash
   # Connect to production database (read-only connection recommended)
   psql $DATABASE_URL
   
   # Verify no test data exists
   SELECT COUNT(*) FROM bancas WHERE is_active = true AND (name LIKE '%Test%' OR name LIKE '%Demo%');
   SELECT COUNT(*) FROM users WHERE is_active = true AND (email LIKE '%@test.%' OR email LIKE '%@demo.%');
   ```

2. **API Smoke Tests**
   ```bash
   # Test health endpoint
   curl https://api.yourdomain.com/health
   
   # Test bancas endpoint (should not return test bancas)
   curl https://api.yourdomain.com/api/v1/admin/bancas
   ```

3. **Mobile App Testing**
   - Test banca listing (should show real bancas only)
   - Test play functionality
   - Test user registration/login
   - Test payment processing with test cards
   - Verify nearby bancas feature works correctly

## Post-Deployment

### Monitoring

Set up monitoring for:
- API response times
- Error rates
- Database performance
- User activity
- Payment processing

### Backup Verification

```bash
# Verify database backups are working
# This depends on your hosting provider
# Example for PostgreSQL:
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Rollback Plan

Document your rollback procedure:
1. Keep previous version's Docker images tagged
2. Have database backup before deployment
3. Document steps to revert to previous version
4. Test rollback procedure in staging

## Support

For issues or questions about production deployment:
- Check logs: `docker logs lotolink-backend`
- Review error monitoring dashboard (Sentry, etc.)
- Contact: [your support email/channel]

---

**Last Updated**: January 2026
**Version**: 1.0.0
