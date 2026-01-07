# Cross-Platform Location-Based Banca Implementation

## Overview

This document provides a comprehensive overview of the location-based banca selection and nearby bancas features implemented across all LOTOLINK platforms (Web, Desktop, and Mobile).

## Implementation Summary

### ✅ Completed Features

#### 1. GPS Location & Distance Calculation

**Implementation:**
- Haversine formula for accurate distance calculation
- Graceful fallback to default location (Santo Domingo: 18.4861, -69.9312)
- Distance formatting (meters for < 1km, kilometers otherwise)

**Platforms:**
- ✅ Mobile App (Ionic/React)
- ✅ Web App (index.html)
- ✅ Desktop App (desktop-app/index.html)

**Code Locations:**
- Mobile: `mobile-app/src/services/geolocation.service.ts`
- Web: `index.html` (lines ~1926-1953)
- Desktop: `desktop-app/index.html` (lines ~1932-1959)

#### 2. Nearby Bancas API Integration

**Endpoint:** `GET /admin/bancas/nearby?latitude={lat}&longitude={lng}&radius_km={radius}`

**Features:**
- Fetches bancas within configurable radius (default: 25km)
- Sorts bancas by distance (nearest first)
- Stores user location for persistent calculations
- Auto-selects nearest banca on first load

**Platforms:**
- ✅ Mobile App: Via `SucursalContext` and `bancas.service.ts`
- ✅ Web App: Via `loadNearbyBancas()` function
- ✅ Desktop App: Via `loadNearbyBancas()` function

#### 3. Homepage - Nearby Bancas Section

**Features:**
- Displays top 3 nearest bancas
- Shows distance from user location
- "⭐ Más cercana" badge on nearest banca
- "📍 Distance" badge on all bancas
- Click to select and navigate to play
- Address display
- Hours display

**Platforms:**
- ✅ Mobile: `mobile-app/src/pages/Home.tsx`
- ✅ Web: `index.html` (homepage section)
- ✅ Desktop: `desktop-app/index.html` (homepage section)

#### 4. Banca Selection & Persistence

**Storage:**
- Mobile: Capacitor Preferences API (`lotolink_selected_sucursal`)
- Web: localStorage (`ll_selected_banca`)
- Desktop: localStorage (`ll_selected_banca`)

**Features:**
- Persists across sessions
- Restores on app load
- Updates when user selects different banca

#### 5. Distance Sorting in Bancas List

**Implementation:**
- All bancas sorted by distance (nearest first)
- Distance badges on each banca
- "Más cercana" badge on first banca
- Map view with user location marker

**Platforms:**
- ✅ Mobile: `mobile-app/src/pages/Bancas.tsx`
- ✅ Web: `loadNearbyBancas()` sorts results
- ✅ Desktop: `loadNearbyBancas()` sorts results

#### 6. Play Flow with Selected Banca

**Mobile:**
- Play.tsx shows selected sucursal info
- "Cambiar" button opens SucursalSelector
- Ticket generated with real sucursal data

**Web & Desktop:**
- Selected banca shown in UI
- Banca info included in cart
- Ticket uses real banca data

#### 7. Configuration & Constants

**Mobile:** `mobile-app/src/constants.ts`
```typescript
export const GEOLOCATION = {
  DEFAULT_LOCATION: {
    latitude: 18.4861,
    longitude: -69.9312,
    name: 'Santo Domingo',
  },
  DEFAULT_RADIUS_KM: 10,
  MAX_RADIUS_KM: 50,
} as const;
```

**Web & Desktop:** Constants in script section
```javascript
const DEFAULT_LOCATION = { latitude: 18.4861, longitude: -69.9312 };
const DEFAULT_SEARCH_RADIUS_KM = 25;
```

---

## Architecture

### Mobile App (Ionic/React)

```
┌─────────────────────────────────────┐
│          SucursalContext            │
│  - Selected sucursal state          │
│  - Nearby bancas state              │
│  - loadNearbyBancas()               │
│  - setSelectedSucursal()            │
└─────────────────────────────────────┘
           ▲         ▲         ▲
           │         │         │
    ┌──────┴───┐ ┌──┴──────┐ ┌┴────────────┐
    │ Home.tsx │ │Play.tsx │ │ Bancas.tsx  │
    │ Top 3    │ │ Uses    │ │ All bancas  │
    │ nearby   │ │ selected│ │ with map    │
    └──────────┘ └─────────┘ └─────────────┘
```

**Services:**
- `geolocation.service.ts`: GPS, distance calculation
- `bancas.service.ts`: API integration
- `SucursalContext.tsx`: State management

### Web & Desktop Apps

```
┌─────────────────────────────────────┐
│        React State (useState)       │
│  - availableBancas                  │
│  - selectedBank                     │
│  - userLocation                     │
│  - loadingBancas                    │
└─────────────────────────────────────┘
           ▲         ▲
           │         │
    ┌──────┴───┐ ┌──┴──────┐
    │ Homepage │ │  Bancas │
    │ Section  │ │  View   │
    │ Top 3    │ │  All    │
    └──────────┘ └─────────┘
```

**Functions:**
- `calculateDistance()`: Haversine formula
- `formatDistance()`: Display formatting
- `loadNearbyBancas()`: API fetch with GPS

---

## API Specifications

### GET /admin/bancas/nearby

**Request:**
```
GET /admin/bancas/nearby?latitude=18.4861&longitude=-69.9312&radius_km=25
```

**Response:**
```json
[
  {
    "id": "abc123",
    "name": "Loteka - Av. Duarte",
    "address": "Av. Duarte #123, Santo Domingo",
    "phone": "809-555-1234",
    "city": "Santo Domingo",
    "region": "Distrito Nacional",
    "latitude": 18.4693,
    "longitude": -69.8990,
    "status": "active",
    "hours": {
      "open": "08:00",
      "close": "20:00",
      "days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    },
    "lotteries_supported": ["leidsa", "loteka", "nacional"]
  }
]
```

**Backend Implementation:**
- Calculates distance using PostGIS or Haversine
- Filters by radius
- Sorts by distance
- Returns active bancas only

---

## Configuration

### Environment Variables

**Backend (.env):**
```env
# Mock vs Production
USE_MOCK_BANCA=false

# Default location for fallback
DEFAULT_LATITUDE=18.4861
DEFAULT_LONGITUDE=-69.9312
DEFAULT_SEARCH_RADIUS_KM=25
```

**Mobile App (constants.ts):**
```typescript
export const GEOLOCATION = {
  DEFAULT_LOCATION: {
    latitude: 18.4861,
    longitude: -69.9312,
    name: 'Santo Domingo',
  },
  DEFAULT_RADIUS_KM: 10,
  MAX_RADIUS_KM: 50,
};
```

**Web/Desktop (inline):**
```javascript
const DEFAULT_LOCATION = { latitude: 18.4861, longitude: -69.9312 };
const DEFAULT_SEARCH_RADIUS_KM = 25;
```

---

## User Flow

### First Time User

1. **App Load**
   - Request GPS permission
   - Get current location (or use default)
   - Fetch nearby bancas within radius
   - Sort by distance

2. **Auto-Selection**
   - Select nearest banca automatically
   - Store in local storage/preferences
   - Display on homepage

3. **Play**
   - User navigates to play
   - See selected banca info
   - Can change banca via selector
   - Generate ticket with real banca data

### Returning User

1. **App Load**
   - Restore selected banca from storage
   - Optionally refresh nearby bancas
   - Show restored selection

2. **Browse Bancas**
   - See all bancas sorted by distance
   - View on map
   - Select different banca

---

## Testing

### Manual Testing Checklist

- [ ] GPS permission request works
- [ ] Location fallback works when GPS denied
- [ ] Nearby bancas load correctly
- [ ] Distance calculations are accurate
- [ ] Sorting by distance works
- [ ] "Más cercana" badge shows on first banca
- [ ] Distance badges display correctly
- [ ] Banca selection persists across sessions
- [ ] Selected banca appears in play flow
- [ ] Ticket shows correct banca info

### Unit Tests

```typescript
// Distance calculation test
test('calculateDistance returns correct km', () => {
  const distance = calculateDistance(
    18.4861, -69.9312,  // Santo Domingo
    18.4693, -69.8990   // Nearby location
  );
  expect(distance).toBeCloseTo(3.5, 1); // ~3.5 km
});

// Distance formatting test
test('formatDistance formats correctly', () => {
  expect(formatDistance(0.5)).toBe('500 m');
  expect(formatDistance(2.3)).toBe('2.3 km');
  expect(formatDistance(15)).toBe('15 km');
});
```

---

## Production Migration

See [PRODUCTION_MIGRATION.md](./PRODUCTION_MIGRATION.md) for complete guide.

**Quick steps:**
1. Set `USE_MOCK_BANCA=false`
2. Run `./scripts/clean-mock-data.sh`
3. Seed production banca data
4. Test API endpoints
5. Deploy

---

## Troubleshooting

### "No bancas found"

**Cause:** No bancas in database or all too far away.

**Solution:**
- Check database has active bancas
- Increase search radius
- Verify banca coordinates are correct

### "GPS not working"

**Cause:** Permission denied or HTTPS required.

**Solution:**
- Ensure HTTPS in production
- Check browser permissions
- Verify geolocation API enabled

### "Wrong distances shown"

**Cause:** Incorrect coordinates or calculation error.

**Solution:**
- Verify banca coordinates in database
- Check Haversine formula implementation
- Test with known distances

---

## Future Enhancements

1. **Real-time Location Tracking**
   - Update user location as they move
   - Recalculate distances dynamically

2. **Banca Availability**
   - Show open/closed status
   - Filter by open now

3. **Route Navigation**
   - Integrate with Google Maps
   - Show directions to selected banca

4. **User Preferences**
   - Remember favorite bancas
   - Custom search radius

5. **Analytics**
   - Track which bancas are most selected
   - Distance distribution analysis

---

## Documentation Links

- [Production Migration Guide](./PRODUCTION_MIGRATION.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Admin Panel Guide](./ADMIN_PANEL_GUIDE.md)
- [Testing Guide](./TESTING_GUIDE.md)

---

*Last updated: January 2024*
