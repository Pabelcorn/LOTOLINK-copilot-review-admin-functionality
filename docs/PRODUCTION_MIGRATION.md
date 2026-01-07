# Production Migration Guide

This guide explains how to migrate from mock/development data to production-ready configuration for the LOTOLINK system.

## Table of Contents
1. [Environment Configuration](#environment-configuration)
2. [Database Migration](#database-migration)
3. [Mock to Production Adapter](#mock-to-production-adapter)
4. [Testing Production Setup](#testing-production-setup)
5. [Rollback Procedure](#rollback-procedure)

---

## 1. Environment Configuration

### Backend Configuration

The system uses the `USE_MOCK_BANCA` environment variable to control whether to use mock or real banca adapters.

**Development (Mock Mode):**
```bash
USE_MOCK_BANCA=true
```

**Production (Real Mode):**
```bash
USE_MOCK_BANCA=false
```

### Setting Environment Variables

**Option A: Using `.env` file**

Create or update `backend/.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/lotolink_prod

# Banca Adapter Mode
USE_MOCK_BANCA=false

# API Configuration
PORT=3000
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your-secure-jwt-secret-here
JWT_EXPIRES_IN=7d

# Stripe Configuration (if using payments)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Option B: Using Docker Compose**

Update `docker-compose.prod.yml`:

```yaml
environment:
  - USE_MOCK_BANCA=false
  - DATABASE_URL=postgresql://user:password@db:5432/lotolink_prod
  - NODE_ENV=production
```

---

## 2. Database Migration

### Step 1: Backup Development Database

```bash
# Backup current database
pg_dump -U postgres lotolink_dev > backup_dev_$(date +%Y%m%d).sql
```

### Step 2: Clean Mock Data

Run the cleanup script to remove mock/test bancas:

```bash
# From the root directory
npm run db:clean-mocks
```

Or manually run SQL:

```sql
-- Remove mock bancas (those created for testing)
DELETE FROM bancas 
WHERE name LIKE '%Test%' 
   OR name LIKE '%Mock%'
   OR name LIKE '%Demo%'
   OR id IN (
     SELECT id FROM bancas 
     WHERE created_at > '2024-01-01' 
     AND status = 'pending'
   );

-- Remove test users
DELETE FROM users 
WHERE email LIKE '%test%' 
   OR email LIKE '%example.com';

-- Remove test plays
DELETE FROM plays 
WHERE created_at < NOW() - INTERVAL '30 days';
```

### Step 3: Seed Production Data

If you have real banca data ready, seed it:

```bash
npm run db:seed:prod
```

---

## 3. Mock to Production Adapter

The system uses a factory pattern to switch between mock and real banca adapters.

### Current Implementation

Located in `backend/src/app.module.ts`:

```typescript
{
  provide: BANCA_ADAPTER,
  useFactory: (configService: ConfigService) => {
    const useMock = configService.get<string>('USE_MOCK_BANCA', 'true') === 'true';
    
    if (useMock) {
      console.log('🔧 Using MockBancaAdapter (Development Mode)');
      return new MockBancaAdapter();
    } else {
      console.log('🚀 Using ApiBancaAdapter (Production Mode)');
      return new ApiBancaAdapter();
    }
  },
  inject: [ConfigService],
}
```

### What Changes in Production Mode?

**Mock Mode (Development):**
- Uses `MockBancaAdapter`
- Returns hardcoded test bancas
- No external API calls
- Fast and predictable

**Production Mode:**
- Uses `ApiBancaAdapter`
- Fetches real bancas from database
- Calculates real distances
- May integrate with external banca APIs

---

## 4. Testing Production Setup

### Step 1: Verify Environment

```bash
# Check environment variables
cd backend
npm run env:check
```

### Step 2: Test Database Connection

```bash
# Run database migrations
npm run migration:run

# Verify database schema
npm run db:verify
```

### Step 3: Test API Endpoints

```bash
# Start backend in production mode
npm run start:prod

# Test nearby bancas endpoint
curl -X GET "http://localhost:3000/api/v1/admin/bancas/nearby?latitude=18.4861&longitude=-69.9312&radius_km=10"

# Expected response: Real bancas from database
```

### Step 4: Integration Tests

```bash
# Run integration tests
npm run test:e2e

# Run specific banca tests
npm run test:e2e -- --grep "Banca API"
```

---

## 5. Rollback Procedure

If you need to rollback to mock mode:

### Quick Rollback

```bash
# 1. Set environment variable
export USE_MOCK_BANCA=true

# 2. Restart backend
pm2 restart lotolink-backend
# or
docker-compose restart backend
```

### Full Rollback with Database Restore

```bash
# 1. Stop application
pm2 stop lotolink-backend

# 2. Restore database backup
psql -U postgres lotolink_dev < backup_dev_YYYYMMDD.sql

# 3. Set mock mode
export USE_MOCK_BANCA=true

# 4. Restart application
pm2 start lotolink-backend
```

---

## Checklist for Production Migration

- [ ] Backup development database
- [ ] Update `.env` file with production values
- [ ] Set `USE_MOCK_BANCA=false`
- [ ] Run database migrations
- [ ] Clean mock/test data
- [ ] Seed production banca data (if available)
- [ ] Test nearby bancas API endpoint
- [ ] Verify GPS location works correctly
- [ ] Test banca selection flow in all platforms:
  - [ ] Web app
  - [ ] Desktop app
  - [ ] Mobile app
- [ ] Monitor logs for errors
- [ ] Set up monitoring/alerting for production

---

## Monitoring Production

### Log Files

Check logs regularly:

```bash
# Backend logs
tail -f logs/backend.log

# Or with pm2
pm2 logs lotolink-backend
```

### Key Metrics to Monitor

1. **Banca API Response Times**
   - Average: < 200ms
   - Max: < 1000ms

2. **GPS Location Success Rate**
   - Should be > 90%
   - Fallback to Santo Domingo if fails

3. **Database Queries**
   - Monitor slow queries (> 500ms)
   - Optimize indexes if needed

4. **Error Rates**
   - API errors should be < 1%
   - Log all adapter errors

---

## Troubleshooting

### Issue: "No bancas found"

**Cause:** Database has no active bancas.

**Solution:**
```bash
# Check database
psql -U postgres lotolink_prod -c "SELECT COUNT(*) FROM bancas WHERE status = 'active';"

# If count is 0, seed production data
npm run db:seed:prod
```

### Issue: "Still seeing mock data"

**Cause:** Environment variable not set correctly.

**Solution:**
```bash
# Verify environment
node -e "console.log(process.env.USE_MOCK_BANCA)"

# Should output: false

# If not, update .env and restart
pm2 restart lotolink-backend
```

### Issue: "GPS not working"

**Cause:** Browser permissions or HTTPS required.

**Solution:**
- Ensure app is served over HTTPS in production
- Check browser console for permission errors
- Verify geolocation API is enabled in browser

---

## Support

For additional help:
- Check logs: `pm2 logs lotolink-backend`
- Review documentation: `docs/`
- Contact: support@lotolink.com

---

*Last updated: 2024*
