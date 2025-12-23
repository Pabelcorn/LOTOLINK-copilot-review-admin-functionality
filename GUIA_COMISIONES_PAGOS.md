# Guía de Configuración de Comisiones y Pagos con Tarjeta

## Resumen

Este documento explica cómo funciona el sistema de pagos con tarjeta en LotoLink y cómo se separan las comisiones de los pagos principales usando Stripe Connect.

## Arquitectura de Pagos

### 1. Flujo de Pago Básico

Cuando un usuario realiza un pago con tarjeta:
1. El usuario ingresa su tarjeta o selecciona una tarjeta guardada
2. El backend procesa el pago a través de Stripe
3. El dinero se deposita en la cuenta de Stripe de LotoLink
4. La billetera del usuario se actualiza con el monto cargado

### 2. Separación de Comisiones

LotoLink ha implementado un sistema de separación de comisiones que funciona de la siguiente manera:

#### Sin Separación de Comisiones (Configuración por Defecto)
- Todos los pagos van a una sola cuenta de Stripe
- No se aplican comisiones adicionales
- Simple y directo para empezar

#### Con Separación de Comisiones (Stripe Connect)
Cuando se configura, el sistema automáticamente:
1. **Calcula la comisión** según el porcentaje configurado (ej: 5%)
2. **Retiene la comisión** en la cuenta principal de la plataforma
3. **Transfiere el resto** a una cuenta bancaria separada configurada

## Configuración Paso a Paso

### Opción 1: Configuración Simple (Una Sola Cuenta)

Esta es la configuración por defecto y la más sencilla.

**Archivo `.env`:**
```env
# Pagos básicos
USE_MOCK_PAYMENT=false
STRIPE_SECRET_KEY=sk_live_tu_clave_secreta_aqui
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_aqui

# Comisiones deshabilitadas
COMMISSION_PERCENTAGE=0
```

**Resultado:** Todos los pagos van directamente a tu cuenta de Stripe principal.

### Opción 2: Configuración Avanzada (Separación de Comisiones)

Esta configuración requiere Stripe Connect y cuentas conectadas.

#### Paso 1: Configurar Stripe Connect

1. **Accede a tu Dashboard de Stripe**
   - Ve a https://dashboard.stripe.com

2. **Habilita Stripe Connect**
   - Navega a "Connect" en el menú lateral
   - Configura tu plataforma Connect
   - Elige "Standard accounts" para cuentas independientes

3. **Crea una Cuenta Conectada para Procesamiento de Pagos**
   - Desde Connect, crea una nueva cuenta conectada
   - Esta será la cuenta que recibirá los pagos netos (después de comisiones)
   - Guarda el ID de cuenta (empieza con `acct_`)

#### Paso 2: Configurar Variables de Entorno

**Archivo `.env`:**
```env
# Pagos con Stripe
USE_MOCK_PAYMENT=false
STRIPE_SECRET_KEY=sk_live_tu_clave_secreta_aqui
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_aqui

# Configuración de comisiones
COMMISSION_PERCENTAGE=5.0
COMMISSION_STRIPE_ACCOUNT_ID=acct_comision_lotolink_id
CARD_PROCESSING_ACCOUNT_ID=acct_banco_principal_id
```

**Explicación de las variables:**
- `COMMISSION_PERCENTAGE`: Porcentaje de comisión (ej: 5.0 = 5%)
- `COMMISSION_STRIPE_ACCOUNT_ID`: ID de la cuenta donde se retienen comisiones (tu cuenta principal)
- `CARD_PROCESSING_ACCOUNT_ID`: ID de la cuenta conectada donde van los pagos netos

#### Paso 3: Flujo de Dinero

Con esta configuración, cuando un usuario paga $100:

1. **Pago total:** $100
2. **Comisión (5%):** $5 → Se queda en cuenta principal de LotoLink
3. **Pago neto (95%):** $95 → Se transfiere a `CARD_PROCESSING_ACCOUNT_ID`

### Opción 3: Separación con Múltiples Bancos

Si quieres enviar comisiones y pagos a cuentas bancarias completamente separadas:

#### Paso 1: Conectar Cuentas Bancarias

1. **Cuenta Bancaria 1 - Comisiones**
   - Conecta esta cuenta a tu cuenta principal de Stripe
   - Las comisiones se depositarán aquí automáticamente

2. **Cuenta Bancaria 2 - Pagos Principales**
   - Crea una cuenta conectada de Stripe
   - Conecta esta cuenta a tu segunda cuenta bancaria
   - Los pagos netos se transferirán aquí

#### Paso 2: Configurar Transferencias Automáticas

En el Dashboard de Stripe:
1. Para tu cuenta principal: Configura transferencias automáticas a Banco 1
2. Para la cuenta conectada: Configura transferencias automáticas a Banco 2

## Ejemplo Práctico

### Escenario: Usuario Paga $1000 DOP

**Configuración:**
```env
COMMISSION_PERCENTAGE=5.0
CARD_PROCESSING_ACCOUNT_ID=acct_1234567890
```

**Resultado:**
- Usuario carga $1000 DOP a su billetera
- Stripe procesa el pago exitosamente
- Comisión LotoLink: $50 DOP (se queda en cuenta principal)
- Transferencia a cuenta de procesamiento: $950 DOP
- Billetera del usuario: +$1000 DOP

**En los logs verás:**
```
Commission configured: 5% = 50 DOP, destination: acct_1234567890
Charge successful: pi_abc123
```

## Verificación de la Configuración

### 1. Verificar en Stripe Dashboard

Después de un pago:
1. Ve a **Payments** en tu Dashboard de Stripe
2. Busca el pago reciente
3. Verifica:
   - ✅ Monto total cobrado
   - ✅ Application fee (comisión)
   - ✅ Transfer to connected account (si está configurado)

### 2. Verificar en Logs del Backend

El backend registra cada pago:
```
[StripePaymentGateway] Processing charge for user abc123: 1000 DOP
[StripePaymentGateway] Commission configured: 5% = 50 DOP, destination: acct_xxx
[StripePaymentGateway] Charge successful: pi_abc123
```

### 3. Verificar Transferencias

En Stripe Dashboard:
1. Ve a **Connect** → **Transfers**
2. Verifica que las transferencias se hayan realizado a la cuenta correcta
3. Confirma que los montos sean correctos (monto original - comisión)

## Preguntas Frecuentes

### ¿Cómo funcionan las comisiones si no configuro cuentas separadas?

Si solo configuras `COMMISSION_PERCENTAGE` sin `CARD_PROCESSING_ACCOUNT_ID`:
- La comisión se retiene en tu cuenta principal
- El monto restante también queda en tu cuenta principal
- Útil para tracking pero no hay separación física de fondos

### ¿Puedo cambiar el porcentaje de comisión?

Sí, simplemente actualiza `COMMISSION_PERCENTAGE` en `.env` y reinicia el backend.
Los cambios aplicarán a todos los pagos nuevos.

### ¿Las comisiones afectan el saldo de la billetera del usuario?

No. El usuario siempre recibe el monto completo que paga en su billetera.
La comisión es transparente para el usuario y se maneja internamente.

### ¿Cómo se manejan los reembolsos?

Los reembolsos funcionan automáticamente:
- Si se emite un reembolso, Stripe revierte tanto el pago como la comisión
- El dinero regresa a la tarjeta del usuario
- La billetera del usuario se debita automáticamente

### ¿Necesito Stripe Connect para la separación de comisiones?

Sí. Para transferir fondos a cuentas separadas, necesitas:
1. Una cuenta de Stripe estándar (cuenta principal)
2. Stripe Connect habilitado
3. Cuentas conectadas creadas para cada destino de fondos

## Problemas Comunes

### Error: "Invalid account"

**Causa:** El ID de cuenta conectada no existe o no está vinculado a tu plataforma.

**Solución:**
1. Verifica el ID en Stripe Dashboard → Connect
2. Asegúrate que empiece con `acct_`
3. Confirma que la cuenta esté activa

### Error: "Insufficient permissions"

**Causa:** Tu cuenta no tiene permisos para realizar transferencias.

**Solución:**
1. Verifica que Stripe Connect esté habilitado
2. Asegúrate de usar la API key correcta
3. Revisa los permisos de tu cuenta conectada

### No se realizan transferencias

**Posibles causas:**
1. `CARD_PROCESSING_ACCOUNT_ID` no está configurado
2. La cuenta conectada no está verificada
3. El porcentaje de comisión está en 0

**Solución:**
1. Verifica todas las variables de entorno
2. Activa la cuenta conectada en Stripe Dashboard
3. Configura `COMMISSION_PERCENTAGE` > 0

## Contacto y Soporte

Si tienes problemas con la configuración:
1. Revisa los logs del backend para mensajes de error
2. Verifica tu configuración en Stripe Dashboard
3. Consulta la documentación oficial de Stripe Connect: https://stripe.com/docs/connect

## Resumen de Configuración

### Para Empezar Simple (Recomendado)
```env
USE_MOCK_PAYMENT=false
STRIPE_SECRET_KEY=sk_live_xxx
COMMISSION_PERCENTAGE=0
```

### Para Comisiones Básicas
```env
USE_MOCK_PAYMENT=false
STRIPE_SECRET_KEY=sk_live_xxx
COMMISSION_PERCENTAGE=5.0
```

### Para Separación Completa
```env
USE_MOCK_PAYMENT=false
STRIPE_SECRET_KEY=sk_live_xxx
COMMISSION_PERCENTAGE=5.0
CARD_PROCESSING_ACCOUNT_ID=acct_xxx
```
