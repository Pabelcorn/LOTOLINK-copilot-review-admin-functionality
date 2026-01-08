# Web App Backend Integration Guide
**Implementation Guide for Virtual Tickets API Integration**

---

## Overview

This guide provides step-by-step instructions for integrating the Web App's virtual ticket system with the backend API. Currently, the Web App uses localStorage for demo data. This needs to be replaced with real API calls.

**Estimated Time:** 4-8 hours  
**Skill Level:** Intermediate JavaScript/API Integration  
**Prerequisites:** Backend API running, Authentication working

---

## Current State vs. Target State

### Current State (Demo Mode)
```javascript
// In index.html, around line 4494
const [tickets, setTickets] = useState(() => 
  JSON.parse(localStorage.getItem("ll_history") || "[]")
);
```

### Target State (API Integration)
```javascript
const [tickets, setTickets] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchTickets();
}, []);

async function fetchTickets() {
  try {
    setLoading(true);
    const response = await ticketsAPI.getMyTickets(user.id);
    setTickets(response.tickets);
  } catch (error) {
    console.error('Failed to load tickets:', error);
    showError('No se pudieron cargar los tickets');
  } finally {
    setLoading(false);
  }
}
```

---

## Step 1: Create Tickets API Module

### Location: Create new file `tickets-api.js` inline in index.html or as external file

```javascript
/* ====================================
   TICKETS API MODULE
   ==================================== */

const TicketsAPI = (function() {
  // Configuration
  const API_BASE = window.LOTOLINK_API_URL || 'http://localhost:3000/api';
  
  /**
   * Get authentication token from storage
   */
  function getAuthToken() {
    const user = JSON.parse(localStorage.getItem('ll_user') || 'null');
    return user?.token || '';
  }
  
  /**
   * Make authenticated API request
   */
  async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers
      }
    };
    
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || 'API request failed');
    }
    
    return response.json();
  }
  
  /**
   * Transform backend play data to ticket format
   */
  function transformPlayToTicket(play) {
    // Handle both camelCase and snake_case responses
    return {
      id: play.id || play.play_id || play.playId,
      ticketCode: play.ticketCode || play.ticket_code || play.playIdBanca || `TKT-${play.id}`,
      barcode: play.barcode || generateBarcode(play.id),
      
      // Bet information
      type: play.betType || play.bet_type || 'QN',
      numbers: play.numbers || [],
      amount: play.amount || play.total_amount || 0,
      
      // Status
      status: play.status || 'pending',
      timestamp: play.createdAt || play.created_at || new Date().toISOString(),
      
      // Sorteo information
      sorteoName: play.sorteoName || play.sorteo_name || 'Lotería Real',
      sorteoNumber: play.sorteoNumber || play.sorteo_number || '00000',
      sorteoTime: play.sorteoTime || play.sorteo_time || play.draw_time || '1:00 PM',
      
      // Banca information
      bancaName: play.bancaName || play.banca_name || 'LOTEKA',
      bancaLogo: play.bancaLogo || play.banca_logo,
      
      // Sucursal information
      sucursalName: play.sucursalName || play.sucursal_name || 'Principal',
      sucursalCode: play.sucursalCode || play.sucursal_code || '4000-01',
      sucursalAddress: play.sucursalAddress || play.sucursal_address,
      sucursalPhone: play.sucursalPhone || play.sucursal_phone,
      
      // Operator
      operatorId: play.operatorUserId || play.operator_user_id,
      
      // Validity
      validUntil: play.validUntil || play.valid_until || 
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        
      // For backward compatibility with existing UI
      bank: play.bancaName || play.banca_name || 'LOTEKA',
      total: play.amount || play.total_amount || 0,
      createdAt: play.createdAt || play.created_at || new Date().toISOString(),
      plays: [{
        type: play.betType || play.bet_type || 'QN',
        numbers: play.numbers || []
      }]
    };
  }
  
  /**
   * Generate barcode from ticket ID
   */
  function generateBarcode(ticketId) {
    const numericId = String(ticketId).replace(/[^0-9]/g, '');
    return numericId.padStart(14, '0').slice(0, 14);
  }
  
  /**
   * Get all tickets for a user
   */
  async function getMyTickets(userId, filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    
    if (filters.limit) {
      params.append('limit', filters.limit);
    }
    
    if (filters.offset) {
      params.append('offset', filters.offset);
    }
    
    const queryString = params.toString();
    const endpoint = `/users/${userId}/plays${queryString ? '?' + queryString : ''}`;
    
    const response = await apiRequest(endpoint);
    
    return {
      tickets: response.plays.map(transformPlayToTicket),
      total: response.total || response.plays.length,
      hasMore: response.hasMore || false
    };
  }
  
  /**
   * Get single ticket by ID
   */
  async function getTicketById(ticketId) {
    const response = await apiRequest(`/plays/${ticketId}`);
    return transformPlayToTicket(response);
  }
  
  // Public API
  return {
    getMyTickets,
    getTicketById,
    transformPlayToTicket
  };
})();
```

---

## Step 2: Update MyTickets Component

### Find the MyTickets function (around line 4493 in index.html)

### Replace the current implementation:

```javascript
function MyTickets({ user, onLogin }) {
  // OLD CODE - REMOVE
  // const [tickets, setTickets] = useState(() => JSON.parse(localStorage.getItem("ll_history") || "[]"));
  
  // NEW CODE - ADD
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  
  // Load tickets from API
  useEffect(() => {
    if (user?.id) {
      loadTickets();
    } else {
      setIsLoading(false);
    }
  }, [user, filterStatus]);
  
  async function loadTickets() {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await TicketsAPI.getMyTickets(user.id, {
        status: filterStatus,
        limit: 50,
        offset: 0
      });
      
      setTickets(response.tickets);
    } catch (err) {
      console.error('Error loading tickets:', err);
      setError(err.message);
      
      // Fallback to localStorage for demo if API fails
      const fallbackTickets = JSON.parse(localStorage.getItem("ll_history") || "[]");
      setTickets(fallbackTickets);
    } finally {
      setIsLoading(false);
    }
  }
  
  // Rest of the component remains the same...
  // Just add loading state handling in the render
  
  if (!user) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-6">🎟️</div>
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Inicia Sesión</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
          Inicia sesión para ver tus tickets virtuales
        </p>
        <button onClick={onLogin} className="btn-apple-primary">
          Iniciar Sesión
        </button>
      </div>
    );
  }
  
  // NEW: Add loading state
  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Cargando tickets...</p>
      </div>
    );
  }
  
  // NEW: Add error state with retry
  if (error && tickets.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-6">⚠️</div>
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Error al Cargar</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {error}
        </p>
        <button onClick={loadTickets} className="btn-apple-primary">
          Reintentar
        </button>
      </div>
    );
  }
  
  // Rest of the existing render code...
  const filteredTickets = tickets.filter(t => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });
  
  // ... continue with existing code
}
```

---

## Step 3: Add Configuration

### Add at the top of index.html in a `<script>` tag before any components:

```html
<script>
  // API Configuration
  // In production, this should be set via environment variable or build-time configuration
  window.LOTOLINK_API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api'  // Development
    : 'https://api.lotolink.com/api';  // Production
    
  console.log('API URL configured:', window.LOTOLINK_API_URL);
</script>
```

---

## Step 4: Update Ticket Creation Flow

### Find the checkout function (around line 5780 in index.html)

### Update to save to backend after successful play:

```javascript
const checkout = async () => {
  if (cart.length === 0) {
    alert('Tu bolso está vacío');
    return;
  }
  
  // Get payment method selection (if implemented)
  const paymentMethod = 'app'; // or 'branch'
  
  try {
    // Show loading state
    setIsProcessingCheckout(true);
    
    // Create play via API
    const playData = {
      userId: user.id,
      lotteryId: selectedLottery?.id || 'default-lottery',
      numbers: cart[0].numbers,  // Adjust based on your cart structure
      betType: cart[0].type || 'QN',
      amount: calculateTotal(),
      currency: 'DOP',
      payment: {
        method: paymentMethod,
        walletTransactionId: paymentMethod === 'app' ? generateTransactionId() : undefined
      },
      bancaId: selectedBank?.id,
      requestId: generateUUID()
    };
    
    // Call backend API to create play
    const response = await fetch(`${window.LOTOLINK_API_URL}/plays`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify(playData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create play');
    }
    
    const createdPlay = await response.json();
    
    // Transform to ticket format
    const ticket = TicketsAPI.transformPlayToTicket(createdPlay);
    
    // Still save to localStorage for backward compatibility and offline access
    const history = JSON.parse(localStorage.getItem("ll_history") || "[]");
    history.unshift(ticket);
    localStorage.setItem("ll_history", JSON.stringify(history.slice(0, 50)));
    
    // Update state
    setTicket(ticket);
    setConfirmedTicket(ticket);
    setCart([]);
    setCartBanca(null);
    setIsCartOpen(false);
    setShowPaymentOptions(false);
    setShowTicketConfirmation(true);
    
  } catch (error) {
    console.error('Checkout failed:', error);
    alert('Error al procesar el pago. Por favor intente nuevamente.');
  } finally {
    setIsProcessingCheckout(false);
  }
};

// Helper functions
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function generateTransactionId() {
  return 'TXN-' + Date.now() + '-' + Math.random().toString(36).substring(7);
}
```

---

## Step 5: Add Network Error Handling

### Create a utility function for network errors:

```javascript
function handleAPIError(error) {
  console.error('API Error:', error);
  
  let userMessage = 'Ocurrió un error. Por favor intente nuevamente.';
  
  if (!navigator.onLine) {
    userMessage = 'No hay conexión a internet. Verifique su conexión.';
  } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
    userMessage = 'Sesión expirada. Por favor inicie sesión nuevamente.';
    // Trigger logout
    window.dispatchEvent(new Event('auth:logout'));
  } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
    userMessage = 'No tiene permiso para realizar esta acción.';
  } else if (error.message.includes('404') || error.message.includes('Not Found')) {
    userMessage = 'Ticket no encontrado.';
  } else if (error.message.includes('500')) {
    userMessage = 'Error del servidor. Intente más tarde.';
  }
  
  return userMessage;
}
```

---

## Step 6: Testing the Integration

### Test Checklist:

1. **Start Backend:**
```bash
cd backend
npm run start:dev
```

2. **Verify API Endpoints:**
```bash
# Test plays endpoint
curl http://localhost:3000/api/users/test-user-id/plays

# Should return JSON with plays array
```

3. **Test in Browser:**
   - Open DevTools > Network tab
   - Navigate to "Mis Tickets"
   - Should see API request to `/users/{id}/plays`
   - Should see tickets loaded from API
   - Check Console for any errors

4. **Test Error Scenarios:**
   - Stop backend → Should show error with retry
   - Invalid token → Should prompt to login
   - No tickets → Should show empty state

5. **Test Ticket Creation:**
   - Place a bet
   - Should see POST to `/plays`
   - Should receive ticket in response
   - New ticket should appear in "Mis Tickets"

---

## Step 7: Backward Compatibility & Migration

### Keep localStorage as fallback:

```javascript
async function loadTickets() {
  try {
    // Try API first
    const response = await TicketsAPI.getMyTickets(user.id, { status: filterStatus });
    setTickets(response.tickets);
    
    // Also save to localStorage for offline access
    localStorage.setItem("ll_history", JSON.stringify(response.tickets));
    
  } catch (err) {
    console.warn('API failed, using localStorage fallback:', err);
    
    // Fallback to localStorage
    const fallbackTickets = JSON.parse(localStorage.getItem("ll_history") || "[]");
    setTickets(fallbackTickets);
    
    setError('Mostrando tickets guardados localmente. ' + err.message);
  }
}
```

---

## Step 8: Environment Configuration

### For Production Deployment:

Create a `config.js` file:

```javascript
// config.js
const CONFIG = {
  development: {
    apiUrl: 'http://localhost:3000/api',
    debug: true
  },
  production: {
    apiUrl: 'https://api.lotolink.com/api',
    debug: false
  }
};

const ENV = window.location.hostname === 'localhost' ? 'development' : 'production';

window.LOTOLINK_CONFIG = CONFIG[ENV];
```

Load in index.html:
```html
<script src="config.js"></script>
```

Update API calls:
```javascript
const API_BASE = window.LOTOLINK_CONFIG?.apiUrl || 'http://localhost:3000/api';
```

---

## Step 9: Monitoring and Logging

### Add logging for production debugging:

```javascript
function logAPICall(endpoint, method, status, duration) {
  if (window.LOTOLINK_CONFIG?.debug) {
    console.log(`[API] ${method} ${endpoint} - ${status} (${duration}ms)`);
  }
  
  // Could send to analytics service
  if (window.gtag) {
    gtag('event', 'api_call', {
      endpoint,
      method,
      status,
      duration
    });
  }
}

// Use in apiRequest function:
async function apiRequest(endpoint, options = {}) {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const duration = Date.now() - startTime;
    
    logAPICall(endpoint, options.method || 'GET', response.status, duration);
    
    // ... rest of function
  } catch (error) {
    const duration = Date.now() - startTime;
    logAPICall(endpoint, options.method || 'GET', 'ERROR', duration);
    throw error;
  }
}
```

---

## Step 10: Deployment

### Pre-deployment Checklist:

- [ ] API_URL configured correctly for production
- [ ] CORS configured on backend for production domain
- [ ] Authentication token handling tested
- [ ] Error messages user-friendly
- [ ] Loading states implemented
- [ ] Fallback to localStorage working
- [ ] Browser console clean (no errors)
- [ ] Network tab shows successful API calls
- [ ] Tested with slow 3G connection
- [ ] Tested with backend offline

### Deployment Steps:

1. Update index.html with TicketsAPI module
2. Update MyTickets component
3. Update checkout function
4. Add config.js with production API URL
5. Test on staging environment
6. Deploy to production
7. Monitor for errors in first 24 hours

---

## Troubleshooting

### Issue: CORS Error
```
Access to fetch at 'http://localhost:3000/api/users/...' from origin 'http://localhost:8080' 
has been blocked by CORS policy
```

**Solution:** Update backend CORS configuration
```typescript
// In backend main.ts
app.enableCors({
  origin: ['http://localhost:8080', 'https://app.lotolink.com'],
  credentials: true
});
```

### Issue: 401 Unauthorized
```
Failed to load tickets: Unauthorized
```

**Solutions:**
1. Check if user token is valid: `console.log(localStorage.getItem('ll_user'))`
2. Verify token format in Authorization header
3. Check if token is expired on backend
4. Ensure user is logged in

### Issue: Tickets not showing
```
Tickets loaded but UI shows empty
```

**Solutions:**
1. Check if `transformPlayToTicket` is mapping fields correctly
2. Verify backend returns expected field names
3. Check browser console for transformation errors
4. Add `console.log(response.tickets)` to see raw data

---

## Next Steps

1. **Implement this guide** - Follow steps 1-10
2. **Test thoroughly** - Use Step 6 testing checklist
3. **Deploy to staging** - Test in staging environment
4. **Monitor logs** - Watch for API errors
5. **Deploy to production** - After successful staging tests

---

**Estimated Implementation Time:**
- Steps 1-3: 2 hours (API module + MyTickets update)
- Steps 4-5: 1 hour (Checkout + Error handling)
- Steps 6-7: 2 hours (Testing + Fallback)
- Steps 8-10: 1 hour (Config + Deployment)
- **Total: 6 hours**

**Questions?** 
- Check existing mobile app implementation: `mobile-app/src/services/tickets.service.ts`
- Review backend DTOs: `backend/src/application/dtos/play.dto.ts`
- Test API endpoints with Postman or curl

**Ready to start?** Begin with Step 1 and work through each step sequentially.
