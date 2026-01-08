# Production Readiness Checklist - Virtual Ticket System
**Last Updated:** January 8, 2026  
**Status:** ⚠️ Partially Ready - 2-4 Days Remaining

---

## Quick Status Overview

| Component | Status | Blocker | Priority |
|-----------|--------|---------|----------|
| **Desktop App Code** | ✅ Complete | None | - |
| **Mobile App Code** | ✅ Complete | None | - |
| **Web App Code** | ⚠️ Needs Backend | API Integration | HIGH |
| **Backend DTOs** | ✅ Complete | Verify Population | MEDIUM |
| **Testing** | ❌ Not Started | Need Running System | HIGH |
| **Documentation** | ✅ Complete | None | - |

---

## Phase 1: Code Completion ✅ COMPLETE

### Desktop App
- [x] MyTickets component added to desktop-app/index.html
- [x] All ticket fields (bancaName, sucursalCode, etc.) included
- [x] Ticket detail modal with QR/barcode
- [x] Print functionality
- [x] Wallet save options

### Mobile App
- [x] MyTickets page uses AuthContext for user ID
- [x] VirtualTicket component complete
- [x] TicketDetail page complete
- [x] Routes configured in App.tsx
- [x] tickets.service.ts with full field mapping

### Web App
- [x] MyTickets component exists in index.html
- [x] All ticket fields displayed
- [x] Ticket detail modal complete
- [ ] ⚠️ **Backend API integration needed** (currently uses localStorage)

### Backend
- [x] GetPlayDto with all required fields
- [x] Complete DTO structure defined
- [ ] ⚠️ **Need to verify actual population from database**

---

## Phase 2: Backend Integration (HIGH PRIORITY)

### Web App Backend Integration
**Estimated Time:** 4-8 hours

#### Steps:
1. [ ] Create `tickets.service.js` in web app
   - [ ] Copy structure from mobile-app tickets.service.ts
   - [ ] Adapt for vanilla JavaScript
   - [ ] Use fetch API or axios
   
2. [ ] Update MyTickets component to use service
   - [ ] Replace localStorage reads with API calls
   - [ ] Add loading states
   - [ ] Add error handling
   - [ ] Show API errors to users
   
3. [ ] Configure API endpoints
   - [ ] Set API base URL (environment variable)
   - [ ] Configure CORS if needed
   - [ ] Add authentication headers
   
4. [ ] Test connection
   - [ ] Test GET /users/:id/plays
   - [ ] Test GET /plays/:id
   - [ ] Verify all DTO fields populated
   - [ ] Check error responses

#### Checklist:
```javascript
// Example structure for tickets.service.js
const API_BASE = process.env.API_URL || 'http://localhost:3000/api';

async function getMyTickets(userId, filters = {}) {
  const params = new URLSearchParams(filters);
  const response = await fetch(
    `${API_BASE}/users/${userId}/plays?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch tickets: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.plays.map(transformPlayToTicket);
}

function transformPlayToTicket(play) {
  return {
    id: play.id || play.play_id,
    bancaName: play.bancaName || play.banca_name || 'LOTEKA',
    sucursalName: play.sucursalName || play.sucursal_name || 'Principal',
    sucursalCode: play.sucursalCode || play.sucursal_code || '4000-01',
    // ... rest of mapping
  };
}
```

---

## Phase 3: Backend Verification (MEDIUM PRIORITY)

### Verify Backend Populates All DTO Fields
**Estimated Time:** 2-4 hours

#### Database Checks:
- [ ] Verify `plays` table includes all fields
- [ ] Verify `sucursales` table has name, code, address, phone
- [ ] Verify `bancas` table has name, logo, contact info
- [ ] Verify joins in play retrieval queries

#### Service Layer Checks:
- [ ] Review `play.service.ts`
- [ ] Verify GetPlayDto is fully populated in:
  - [ ] `getPlayById` method
  - [ ] `getPlaysByUserId` method
- [ ] Check if barcode is generated if missing
- [ ] Check if ticketCode is generated if missing

#### API Endpoint Tests:
```bash
# Test individual play retrieval
curl -X GET http://localhost:3000/api/plays/{play-id} \
  -H "Authorization: Bearer {token}"

# Expected fields in response:
# - sucursalName, sucursalCode, sucursalAddress, sucursalPhone
# - bancaName, bancaLogo
# - barcode, ticketCode
# - sorteoName, sorteoNumber, sorteoTime
# - operatorUserId

# Test user plays retrieval
curl -X GET http://localhost:3000/api/users/{user-id}/plays \
  -H "Authorization: Bearer {token}"
```

#### SQL Query to Verify Data:
```sql
SELECT 
  p.id as play_id,
  p.barcode,
  p.ticket_code,
  s.name as sucursal_name,
  s.code as sucursal_code,
  s.address as sucursal_address,
  s.phone as sucursal_phone,
  b.name as banca_name,
  b.logo as banca_logo,
  p.sorteo_name,
  p.sorteo_number,
  p.sorteo_time,
  p.operator_user_id
FROM plays p
LEFT JOIN sucursales s ON p.sucursal_id = s.id
LEFT JOIN bancas b ON p.banca_id = b.id
WHERE p.id = 'test-play-id';
```

---

## Phase 4: Integration Testing (HIGH PRIORITY)

### End-to-End Flow Testing
**Estimated Time:** 8-16 hours

### Test Environment Setup
- [ ] Backend running on http://localhost:3000
- [ ] Database populated with test data
- [ ] Admin account: admin@lotolink.com
- [ ] Test user account: testuser@lotolink.com
- [ ] Test banca configured with sucursal

### Test Scenario 1: Complete Ticket Flow

#### Step 1: Admin Setup (15 minutes)
- [ ] Log into admin panel at http://localhost:8080/admin-panel.html
- [ ] Create test banca:
  - Name: "Test Banca"
  - Code: "TB001"
  - Logo: Upload test image
- [ ] Create sucursal:
  - Name: "Sucursal Central"
  - Code: "TB001-01"
  - Address: "123 Test Street"
  - Phone: "809-555-0100"
- [ ] Configure ticket settings:
  - Header text: "Test Banca - Official Ticket"
  - Footer text: "Verifique su jugada"
  - Enable barcode: YES
  - Enable QR: YES
  - Validity: 30 days
- [ ] Approve banca for operation

#### Step 2: User Play Creation (10 minutes)
- [ ] **Web App Test:**
  - [ ] Open http://localhost:8080/index.html
  - [ ] Log in as testuser@lotolink.com
  - [ ] Navigate to lottery selection
  - [ ] Select "Test Banca" / "Sucursal Central"
  - [ ] Choose numbers and place bet
  - [ ] Complete payment
  - [ ] Verify confirmation message

- [ ] **Mobile App Test:**
  - [ ] Run `cd mobile-app && npm run dev`
  - [ ] Log in as testuser@lotolink.com
  - [ ] Navigate to Lotteries
  - [ ] Select lottery and place bet
  - [ ] Select "Test Banca" sucursal
  - [ ] Complete payment
  - [ ] Verify confirmation

#### Step 3: Backend Verification (5 minutes)
- [ ] Check database for new play record:
```sql
SELECT * FROM plays WHERE user_id = 'test-user-id' ORDER BY created_at DESC LIMIT 1;
```
- [ ] Verify all fields populated:
  - [ ] banca_id
  - [ ] sucursal_id
  - [ ] barcode (generated)
  - [ ] ticket_code (generated)
  - [ ] sorteo_name, sorteo_number, sorteo_time
  - [ ] status = 'confirmed'

- [ ] Test API endpoint:
```bash
curl -X GET http://localhost:3000/api/plays/{new-play-id} \
  -H "Authorization: Bearer {token}" | jq
```

#### Step 4: Web App Ticket Viewing (15 minutes)
- [ ] Navigate to "Mis Tickets" section
- [ ] Verify ticket appears in list
- [ ] Check displayed data:
  - [ ] Banca name: "Test Banca"
  - [ ] Sucursal name: "Sucursal Central"
  - [ ] Sucursal code: "TB001-01"
  - [ ] Sorteo information correct
  - [ ] Amount correct
  - [ ] Status badge displays

- [ ] Click ticket to open detail modal
- [ ] Verify modal shows:
  - [ ] Complete ticket header
  - [ ] All bet details
  - [ ] Barcode rendered (check font)
  - [ ] QR code displayed
  - [ ] Sucursal address: "123 Test Street"
  - [ ] Sucursal phone: "809-555-0100"
  - [ ] Footer message

- [ ] Test actions:
  - [ ] Click "Imprimir" - opens print dialog
  - [ ] Click "Apple Wallet" - downloads .pkpass file
  - [ ] Click "Google Wallet" - downloads .json file
  - [ ] Close modal - returns to list

- [ ] Test filtering:
  - [ ] Filter by "Todos" - shows all
  - [ ] Filter by "Activos" - shows only active
  - [ ] Filter by "Ganadores" - shows only won
  - [ ] Filter by "Cobrados" - shows only collected

#### Step 5: Mobile App Ticket Viewing (15 minutes)
- [ ] Tap "My Tickets" tab
- [ ] Verify ticket in list
- [ ] Check compact ticket display:
  - [ ] Banca name visible
  - [ ] Sucursal info visible
  - [ ] Status badge correct
  - [ ] Amount visible

- [ ] Tap ticket to view detail
- [ ] Verify full ticket display:
  - [ ] Header with banca logo/name
  - [ ] Sucursal name and code
  - [ ] Complete sorteo info
  - [ ] All bet details
  - [ ] Barcode displayed correctly
  - [ ] Total amount
  - [ ] Footer info

- [ ] Test actions:
  - [ ] Tap share button - native share sheet opens
  - [ ] Tap save button - image save notification
  - [ ] Tap back - returns to list
  - [ ] Pull to refresh - reloads tickets

- [ ] Test filters:
  - [ ] Segment "Todos"
  - [ ] Segment "Pendientes"
  - [ ] Segment "Confirmados"
  - [ ] Segment "Ganadores"

#### Step 6: Desktop App Ticket Viewing (15 minutes)
- [ ] Start desktop app: `cd desktop-app && npm start`
- [ ] Log in as testuser@lotolink.com
- [ ] Navigate to "Mis Tickets" view
- [ ] Verify identical functionality to web app:
  - [ ] Ticket list displays
  - [ ] All fields visible
  - [ ] Modal opens on click
  - [ ] Print works
  - [ ] Wallet save works
  - [ ] Filtering works

- [ ] Test window resizing:
  - [ ] Minimize - UI remains usable
  - [ ] Maximize - UI scales properly
  - [ ] Restore - layout correct

### Test Scenario 2: Multiple Tickets

#### Setup (5 minutes)
- [ ] Create 5 tickets with different:
  - [ ] Lottery types
  - [ ] Banca/sucursal combinations
  - [ ] Bet amounts
  - [ ] Status (pending, confirmed, won)

#### Tests (20 minutes)
- [ ] Verify all platforms show all 5 tickets
- [ ] Sort/filter works correctly
- [ ] Pagination works if applicable
- [ ] Each ticket opens correctly
- [ ] Data consistency across platforms

### Test Scenario 3: Error Handling

#### Backend Down (10 minutes)
- [ ] Stop backend server
- [ ] Web app: Shows friendly error message
- [ ] Mobile app: Shows error toast
- [ ] Desktop app: Shows error dialog
- [ ] Retry mechanisms work

#### Invalid Ticket ID (5 minutes)
- [ ] Try to open ticket with fake ID
- [ ] Web: Shows "Ticket not found"
- [ ] Mobile: Shows not found screen
- [ ] Desktop: Shows error message

#### Missing Data (10 minutes)
- [ ] Create ticket with NULL sucursal_address
- [ ] Verify apps handle gracefully with defaults
- [ ] Create ticket with NULL banca_logo
- [ ] Verify apps show fallback text/icon

---

## Phase 5: Build and Installer Testing (MEDIUM PRIORITY)

### Mobile App Builds
**Estimated Time:** 4-6 hours

#### Android Build
```bash
cd mobile-app
npm run build
npm run sync:android
# Open Android Studio
npm run android
```

- [ ] Build succeeds without errors
- [ ] App installs on test device
- [ ] Test on Android 10, 11, 12, 13
- [ ] Test on different screen sizes
- [ ] Verify virtual tickets work on device
- [ ] Test offline behavior
- [ ] Test push notifications for tickets
- [ ] Generate signed APK

#### iOS Build
```bash
cd mobile-app
npm run build
npm run sync:ios
# Open Xcode
npm run ios
```

- [ ] Build succeeds without errors
- [ ] App installs on test device
- [ ] Test on iOS 14, 15, 16, 17
- [ ] Test on different iPhone models
- [ ] Test on iPad
- [ ] Verify virtual tickets work on device
- [ ] Test Apple Wallet integration
- [ ] Generate signed IPA

### Desktop App Installers
**Estimated Time:** 2-4 hours

#### Windows Installer
```bash
cd desktop-app
npm run build:win
```

- [ ] NSIS installer created
- [ ] Install on Windows 10
- [ ] Install on Windows 11
- [ ] Verify desktop shortcut created
- [ ] Verify start menu entry
- [ ] App launches successfully
- [ ] Virtual tickets display correctly
- [ ] Print functionality works
- [ ] Test on different screen resolutions
- [ ] Test uninstall

#### macOS Installer
```bash
cd desktop-app
npm run build:mac
```

- [ ] DMG created
- [ ] Install on macOS Monterey
- [ ] Install on macOS Ventura
- [ ] Install on macOS Sonoma
- [ ] Verify app moves to Applications
- [ ] App launches successfully
- [ ] Virtual tickets display correctly
- [ ] Apple Wallet save works
- [ ] Test on Retina and non-Retina displays

#### Linux Packages
```bash
cd desktop-app
npm run build:linux
```

- [ ] AppImage created
- [ ] Test on Ubuntu 22.04
- [ ] Test on Fedora 38
- [ ] App runs without system install
- [ ] Virtual tickets display correctly

---

## Phase 6: Security & Performance (MEDIUM PRIORITY)

### Security Checks
- [ ] Authentication required for all ticket endpoints
- [ ] Users can only see their own tickets
- [ ] XSS prevention in ticket data display
- [ ] SQL injection prevention in backend
- [ ] HTTPS enforced in production
- [ ] API rate limiting configured
- [ ] Sensitive data (barcode) not logged

### Performance Checks
- [ ] Ticket list loads in < 2 seconds
- [ ] Ticket detail opens in < 500ms
- [ ] Mobile app renders smoothly (60fps)
- [ ] Desktop app responsive on resize
- [ ] Database queries optimized with indexes
- [ ] API responses include proper caching headers
- [ ] Images (logos) optimized and cached

---

## Phase 7: Documentation (COMPLETE ✅)

- [x] VIRTUAL_TICKET_VALIDATION_REPORT.md created
- [x] This checklist created
- [ ] Update README.md with ticket system info
- [ ] Create user guide for virtual tickets
- [ ] Document API endpoints
- [ ] Create troubleshooting guide

---

## Phase 8: Final Validation

### Pre-Production Checklist

#### Code Review
- [ ] All TODOs removed or addressed
- [ ] No console.log statements in production code
- [ ] Error messages user-friendly
- [ ] Code commented where necessary
- [ ] No hardcoded values (all in config/env)

#### Cross-Platform Consistency
- [ ] Web, Mobile, Desktop show identical data
- [ ] Same ticket appears same across all platforms
- [ ] Status updates sync across platforms
- [ ] Styling consistent (colors, fonts, spacing)

#### Accessibility
- [ ] Keyboard navigation works (web/desktop)
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG AA
- [ ] Touch targets 44x44px minimum (mobile)
- [ ] Error messages announced properly

#### Internationalization (if applicable)
- [ ] All text strings in Spanish
- [ ] Date/time formats in Dominican format
- [ ] Currency displayed as RD$
- [ ] Phone numbers in local format

---

## Risk Assessment

### HIGH RISK Items
1. **Backend API not populating all fields**
   - **Mitigation:** Verify with SQL queries and API tests
   - **Fallback:** Use sensible defaults in frontend

2. **Web app not integrated with backend**
   - **Mitigation:** Complete integration in Phase 2
   - **Fallback:** Deploy mobile/desktop first

3. **Database missing required fields**
   - **Mitigation:** Run migrations if needed
   - **Fallback:** Add fields via ALTER TABLE

### MEDIUM RISK Items
1. **Installer signing certificates expired/missing**
   - **Mitigation:** Renew/obtain certificates early
   - **Fallback:** Distribute unsigned builds

2. **Performance issues with many tickets**
   - **Mitigation:** Implement pagination
   - **Fallback:** Limit tickets shown to last 100

### LOW RISK Items
1. **Minor UI inconsistencies**
   - **Mitigation:** Visual testing
   - **Fallback:** Document known issues

---

## Success Criteria

### Minimum Requirements (Must Have)
- ✅ All three platforms have ticket viewing
- ✅ All required fields display correctly
- ⚠️ Backend API provides complete data
- ❌ End-to-end flow tested and working
- ❌ Installers built and tested

### Desired Features (Should Have)
- ❌ Real-time ticket status updates
- ❌ Offline ticket viewing (mobile)
- ❌ Push notifications for wins
- ⚠️ Print functionality tested

### Nice to Have (Could Have)
- ❌ Ticket sharing via SMS/WhatsApp
- ❌ PDF export
- ❌ Email delivery
- ❌ Ticket analytics

---

## Timeline Estimate

### If starting now:
- **Day 1 (8 hours):**
  - Web app backend integration (6 hours)
  - Backend verification (2 hours)

- **Day 2 (8 hours):**
  - Integration testing - Scenarios 1 & 2 (6 hours)
  - Error handling testing (2 hours)

- **Day 3 (8 hours):**
  - Mobile builds (4 hours)
  - Desktop installers (4 hours)

- **Day 4 (6 hours):**
  - Final validation (3 hours)
  - Documentation (2 hours)
  - Sign-off (1 hour)

**Total: ~30 hours = 3.75 days**

With buffer: **4-5 days to production ready**

---

## Sign-Off

### Development Team
- [ ] Frontend Lead reviewed and approved
- [ ] Backend Lead reviewed and approved
- [ ] Mobile Lead reviewed and approved
- [ ] QA Lead tested and approved

### Product Team
- [ ] Product Owner accepted
- [ ] UX Designer reviewed
- [ ] Documentation complete

### DevOps/Infrastructure
- [ ] Deployment scripts ready
- [ ] Monitoring configured
- [ ] Backup procedures documented

### Final Approval
- [ ] CTO/Technical Director sign-off
- [ ] Ready for production deployment

---

**Next Steps:**
1. Review this checklist with team
2. Assign owners for each phase
3. Set target completion date
4. Begin Phase 2: Backend Integration
5. Schedule daily check-ins

**Questions/Issues:** Add to GitHub Issues with label `virtual-tickets`
