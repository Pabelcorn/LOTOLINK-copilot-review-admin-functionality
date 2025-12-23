# Guía Completa de Configuración de Stripe
## Para Web, Móvil y Escritorio

Esta guía te mostrará paso a paso cómo configurar Stripe en las tres plataformas de LotoLink.

---

## 📋 Tabla de Contenidos

1. [Crear Cuenta de Stripe](#1-crear-cuenta-de-stripe)
2. [Obtener Claves API](#2-obtener-claves-api)
3. [Configurar Backend](#3-configurar-backend)
4. [Configurar App Móvil](#4-configurar-app-móvil)
5. [Configurar App Web](#5-configurar-app-web)
6. [Configurar App de Escritorio](#6-configurar-app-de-escritorio)
7. [Probar con Tarjetas de Prueba](#7-probar-con-tarjetas-de-prueba)
8. [Activar Modo Producción](#8-activar-modo-producción)
9. [Verificación Final](#9-verificación-final)

---

## 1. Crear Cuenta de Stripe

### Paso 1.1: Registro
1. Ir a [https://stripe.com](https://stripe.com)
2. Click en "Sign up" (Registrarse)
3. Completar el formulario con:
   - Email
   - Nombre completo
   - Contraseña
   - País (República Dominicana)

### Paso 1.2: Verificación de Email
1. Revisar tu email
2. Click en el link de verificación
3. Acceder al Dashboard de Stripe

### Paso 1.3: Completar Información de Negocio
1. En el Dashboard, ir a "Settings" → "Business settings"
2. Completar:
   - Nombre del negocio: "LotoLink"
   - Tipo de negocio: "Technology / Software"
   - Sitio web: tu dominio
   - Descripción: "Plataforma de lotería online"

**⏱️ Tiempo estimado: 5-10 minutos**

---

## 2. Obtener Claves API

### Paso 2.1: Acceder a API Keys
1. En Dashboard de Stripe
2. Click en "Developers" en el menú superior
3. Click en "API keys" en el menú lateral

### Paso 2.2: Modo de Prueba (Test Mode)
Por defecto, estarás en modo de prueba. Verás:

**Publishable key (Clave Pública):**
```
pk_test_51QS...
```

**Secret key (Clave Secreta):**
```
sk_test_51QS...
```

### Paso 2.3: Copiar las Claves
1. **Publishable key**: Click en "Reveal test key token"
2. Copiar la clave (comienza con `pk_test_`)
3. **Secret key**: Click en "Reveal test key token"
4. Copiar la clave (comienza con `sk_test_`)

⚠️ **IMPORTANTE**: 
- La **publishable key** va en el frontend (segura para exponer)
- La **secret key** va en el backend (NUNCA la expongas públicamente)

**⏱️ Tiempo estimado: 2 minutos**

---

## 3. Configurar Backend

### Paso 3.1: Editar Archivo .env
```bash
cd backend
cp .env.example .env
nano .env  # o usar tu editor preferido
```

### Paso 3.2: Configurar Variables
En el archivo `.env`, editar:

```env
# Cambiar de true a false para usar Stripe real
USE_MOCK_PAYMENT=false

# Pegar tu Secret Key de Stripe
STRIPE_SECRET_KEY=sk_test_TU_CLAVE_SECRETA_AQUI

# Opcional: Para webhooks (configurar después)
STRIPE_WEBHOOK_SECRET=
```

### Paso 3.3: Verificar Instalación
```bash
# Verificar que Stripe SDK está instalado
npm list stripe

# Debería mostrar: stripe@17.4.0
```

### Paso 3.4: Reiniciar Backend
```bash
npm run start:dev
```

**Verificar en consola:**
```
[Nest] LOG [StripePaymentGateway] Stripe Payment Gateway initialized successfully
```

**⏱️ Tiempo estimado: 3 minutos**

---

## 4. Configurar App Móvil

### Paso 4.1: Crear Archivo de Entorno
```bash
cd mobile-app
cp .env.example .env
nano .env
```

### Paso 4.2: Configurar Variables
```env
# URL del backend
VITE_API_URL=http://localhost:3000

# Pegar tu Publishable Key de Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_TU_CLAVE_PUBLICA_AQUI
```

### Paso 4.3: Verificar Integración
La app móvil ya tiene integrado el servicio de Stripe en:
- `src/services/stripe.service.ts` ✅
- `src/pages/PaymentMethods.tsx` ✅

### Paso 4.4: Probar la App
```bash
# Instalar dependencias (si no lo has hecho)
npm install --legacy-peer-deps

# Ejecutar en desarrollo
npm start

# O construir
npm run build
```

**⏱️ Tiempo estimado: 5 minutos**

---

## 5. Configurar App Web

### Paso 5.1: Verificar Stripe.js
El archivo `index.html` ya incluye Stripe.js:
```html
<script src="https://js.stripe.com/v3/"></script>
```
✅ Ya está configurado

### Paso 5.2: Configurar Stripe en JavaScript
Buscar en `index.html` donde se inicializa Stripe y agregar:

```javascript
// Inicializar Stripe
const stripe = Stripe('pk_test_TU_CLAVE_PUBLICA_AQUI');

// Función para agregar tarjeta
async function addPaymentMethod(cardData) {
  try {
    // Crear token
    const { token, error } = await stripe.createToken('card', {
      number: cardData.number,
      exp_month: cardData.exp_month,
      exp_year: cardData.exp_year,
      cvc: cardData.cvc,
      name: cardData.name,
    });

    if (error) {
      console.error('Error:', error);
      return { success: false, error: error.message };
    }

    // Enviar token al backend
    const response = await fetch('http://localhost:3000/api/v1/users/USER_ID/payment-methods', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer ' + JWT_TOKEN,
      },
      body: JSON.stringify({
        token: token.id,
        type: 'card',
        setAsDefault: true,
      }),
    });

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

**⏱️ Tiempo estimado: 10 minutos**

---

## 6. Configurar App de Escritorio

### Paso 6.1: Verificar Stripe.js
El archivo `desktop-app/index.html` ya incluye Stripe.js:
```html
<script src="https://js.stripe.com/v3/"></script>
```
✅ Ya está configurado

### Paso 6.2: Misma Configuración que Web
La app de escritorio usa el mismo código JavaScript que la web.
Seguir los mismos pasos del punto 5.2.

### Paso 6.3: Probar App de Escritorio
```bash
cd desktop-app
npm install
npm start
```

**⏱️ Tiempo estimado: 5 minutos**

---

## 7. Probar con Tarjetas de Prueba

### Paso 7.1: Tarjetas de Prueba de Stripe

| Número de Tarjeta    | Marca      | Resultado              |
|---------------------|------------|------------------------|
| 4242 4242 4242 4242 | Visa       | ✅ Pago exitoso        |
| 5555 5555 5555 4444 | Mastercard | ✅ Pago exitoso        |
| 3782 822463 10005   | Amex       | ✅ Pago exitoso        |
| 4000 0000 0000 0002 | Visa       | ❌ Tarjeta rechazada   |
| 4000 0000 0000 9995 | Visa       | ❌ Fondos insuficientes|

**Datos adicionales para todas las tarjetas de prueba:**
- **Fecha de vencimiento**: Cualquier fecha futura (ej: 12/25, 06/26)
- **CVC**: Cualquier 3 dígitos (ej: 123, 456)
- **Nombre**: Cualquier nombre (ej: "Juan Pérez")
- **País**: República Dominicana
- **ZIP**: Cualquier código postal

### Paso 7.2: Flujo de Prueba Completo

#### En App Móvil:
1. Abrir la app
2. Ir a Perfil → Métodos de Pago
3. Click en "Agregar Tarjeta"
4. Ingresar datos de tarjeta de prueba:
   - Número: `4242 4242 4242 4242`
   - Vencimiento: `12/25`
   - CVC: `123`
   - Nombre: `Usuario Prueba`
5. Click en "Agregar Tarjeta"
6. ✅ Debería aparecer en la lista

#### En Web/Escritorio:
1. Abrir la aplicación
2. Navegar a sección de pagos
3. Usar la función `addPaymentMethod()`
4. ✅ Verificar en Dashboard de Stripe

### Paso 7.3: Verificar en Dashboard de Stripe
1. Ir a [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Asegurarse de estar en "Test Mode" (toggle arriba a la derecha)
3. Click en "Payments" → "Customers"
4. Deberías ver los clientes y tarjetas creadas

**⏱️ Tiempo estimado: 10 minutos**

---

## 8. Activar Modo Producción

⚠️ **SOLO cuando estés listo para aceptar pagos reales**

### Paso 8.1: Completar Activación de Cuenta
1. En Dashboard → "Settings" → "Business settings"
2. Completar toda la información requerida:
   - Información del negocio
   - Información bancaria (para recibir pagos)
   - Documentos de identificación
   - Términos y condiciones

### Paso 8.2: Obtener Claves de Producción
1. En Dashboard, toggle "View test data" → OFF
2. Ir a "Developers" → "API keys"
3. Copiar las claves de producción:
   - Publishable key: `pk_live_...`
   - Secret key: `sk_live_...`

### Paso 8.3: Actualizar Configuración

**Backend (.env):**
```env
USE_MOCK_PAYMENT=false
STRIPE_SECRET_KEY=sk_live_TU_CLAVE_LIVE_AQUI
```

**Mobile App (.env):**
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_TU_CLAVE_LIVE_AQUI
```

**Web/Desktop:**
```javascript
const stripe = Stripe('pk_live_TU_CLAVE_LIVE_AQUI');
```

### Paso 8.4: Configurar Webhooks (Opcional pero Recomendado)
1. En Dashboard → "Developers" → "Webhooks"
2. Click "Add endpoint"
3. URL: `https://tu-dominio.com/api/v1/webhooks/stripe`
4. Seleccionar eventos:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copiar "Signing secret" (empieza con `whsec_`)
6. Agregar a backend/.env:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_TU_SECRET_AQUI
   ```

**⏱️ Tiempo estimado: 30 minutos**

---

## 9. Verificación Final

### ✅ Checklist de Verificación

#### Backend
- [ ] Stripe SDK instalado (`stripe@17.4.0`)
- [ ] `.env` configurado con `STRIPE_SECRET_KEY`
- [ ] `USE_MOCK_PAYMENT=false`
- [ ] Backend arranca sin errores
- [ ] Log muestra "Stripe Payment Gateway initialized successfully"

#### App Móvil
- [ ] `@stripe/stripe-js` instalado
- [ ] `.env` configurado con `VITE_STRIPE_PUBLISHABLE_KEY`
- [ ] Servicio `stripe.service.ts` presente
- [ ] `PaymentMethods.tsx` actualizado
- [ ] App compila sin errores

#### App Web
- [ ] `<script src="https://js.stripe.com/v3/"></script>` en HTML
- [ ] Código de inicialización con publishable key
- [ ] Función `addPaymentMethod()` implementada

#### App Escritorio
- [ ] `<script src="https://js.stripe.com/v3/"></script>` en HTML
- [ ] Misma configuración que web
- [ ] App de escritorio funciona

#### Pruebas
- [ ] Tarjeta de prueba agregada exitosamente
- [ ] Aparece en Dashboard de Stripe
- [ ] Se puede cargar wallet con tarjeta
- [ ] Se puede eliminar tarjeta
- [ ] Logs no muestran errores

### 🎯 Prueba End-to-End

1. **Agregar Tarjeta**
   ```
   App → Agregar tarjeta de prueba → ✅ Aparece en lista
   ```

2. **Verificar en Stripe**
   ```
   Dashboard → Customers → ✅ Cliente y tarjeta visible
   ```

3. **Cargar Wallet**
   ```
   App → Cargar RD$ 100 → ✅ Cargo exitoso
   ```

4. **Verificar Pago**
   ```
   Dashboard → Payments → ✅ Pago registrado
   ```

---

## 📞 Soporte

### Problemas Comunes

**Error: "Stripe is not configured"**
- ✅ Verificar que `STRIPE_SECRET_KEY` esté en `.env`
- ✅ Verificar que `USE_MOCK_PAYMENT=false`
- ✅ Reiniciar el backend

**Error: "Invalid API key"**
- ✅ Verificar que la clave empiece con `sk_test_` o `sk_live_`
- ✅ No debe tener espacios al inicio o final
- ✅ Copiar directamente desde Dashboard de Stripe

**Error: "Card declined" en modo test**
- ✅ Usar tarjetas oficiales de prueba de Stripe
- ✅ Verificar que estás en modo test en Dashboard
- ✅ Ver: https://stripe.com/docs/testing

### Recursos Adicionales

- **Documentación de Stripe**: https://stripe.com/docs
- **Dashboard de Stripe**: https://dashboard.stripe.com
- **Soporte de Stripe**: https://support.stripe.com
- **Documentación del Proyecto**: `PAYMENT_INTEGRATION_GUIDE.md`

---

## 🎉 ¡Listo!

Una vez completados todos los pasos, tu aplicación LotoLink estará lista para:

✅ Registrar tarjetas de crédito y débito reales  
✅ Procesar pagos monetarios reales  
✅ Funcionar en móvil, web y escritorio  
✅ Cumplir con estándares PCI DSS  
✅ Escalar a producción  

**Tiempo total de configuración: 1-2 horas**

---

*Última actualización: 14 de diciembre de 2025*
