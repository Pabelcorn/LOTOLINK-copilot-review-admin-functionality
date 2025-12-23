# Guía: Configuración de Cuentas Bancarias por Banca

## Resumen del Cambio

Se ha actualizado el sistema LotoLink para soportar configuración de cuentas bancarias individuales por cada banca (sucursal), en lugar de tener una configuración global.

## ¿Qué cambió?

### Antes
- Una sola configuración global para todas las bancas
- ID de cuenta para comisiones (marca)
- ID de cuenta para pagos netos (banca)
- Todas las bancas compartían las mismas cuentas

### Ahora
- Cada banca puede tener su propia configuración de cuentas
- Cada banca puede tener su propio porcentaje de comisión
- Cada banca puede tener su propia cuenta para comisiones
- Cada banca puede tener su propia cuenta para pagos netos

## Nuevos Campos en la Entidad Banca

```typescript
{
  commissionPercentage?: number;           // Porcentaje de comisión (0-100)
  commissionStripeAccountId?: string;      // ID de cuenta Stripe para comisiones
  cardProcessingAccountId?: string;        // ID de cuenta Stripe para pagos netos
}
```

## Cómo Configurar

### 1. Acceder al Panel de Administración

1. Inicia sesión como administrador
2. Navega a la pestaña "Todas las Bancas"
3. Haz clic en "✏️ Editar" junto a la banca que deseas configurar

### 2. Configurar las Cuentas Bancarias

En el formulario de edición, encontrarás una sección "💳 Configuración de Cuentas Bancarias" con los siguientes campos:

#### Porcentaje de Comisión (%)
- **Descripción**: Porcentaje que se retiene de cada pago con tarjeta
- **Ejemplo**: `5.0` para retener 5% de comisión
- **Rango**: 0 - 100
- **Opcional**: Si se deja vacío, se usará la configuración global

#### ID de Cuenta Stripe - Comisiones (Marca)
- **Descripción**: Cuenta de Stripe donde se depositan las comisiones
- **Formato**: `acct_xxxxxxxxxx`
- **Ejemplo**: `acct_1MZj7xKZ4xC5eR2m`
- **Opcional**: Si se deja vacío, se usará la configuración global

#### ID de Cuenta Stripe - Pagos Netos (Banca)
- **Descripción**: Cuenta de Stripe donde se transfieren los pagos después de restar la comisión
- **Formato**: `acct_xxxxxxxxxx`
- **Ejemplo**: `acct_1MZj8yKZ4xC5eR2n`
- **Opcional**: Si se deja vacío, se usará la configuración global

### 3. Ejemplo de Configuración

#### Escenario: Banca "Central RD"

```
Porcentaje de Comisión: 5.0
ID Cuenta Comisiones: acct_1MZj7xKZ4xC5eR2m
ID Cuenta Pagos Netos: acct_1MZj8yKZ4xC5eR2n
```

**Resultado cuando un usuario paga $1,000 DOP:**
1. Pago total: $1,000 DOP
2. Comisión (5%): $50 DOP → va a `acct_1MZj7xKZ4xC5eR2m`
3. Pago neto (95%): $950 DOP → va a `acct_1MZj8yKZ4xC5eR2n`
4. Billetera del usuario: +$1,000 DOP

#### Escenario: Banca "Norte Santiago"

```
Porcentaje de Comisión: 3.5
ID Cuenta Comisiones: acct_1NZj7xKZ4xC5eR2x
ID Cuenta Pagos Netos: acct_1NZj8yKZ4xC5eR2y
```

**Resultado cuando un usuario paga $1,000 DOP:**
1. Pago total: $1,000 DOP
2. Comisión (3.5%): $35 DOP → va a `acct_1NZj7xKZ4xC5eR2x`
3. Pago neto (96.5%): $965 DOP → va a `acct_1NZj8yKZ4xC5eR2y`
4. Billetera del usuario: +$1,000 DOP

## Compatibilidad con Configuración Global

El sistema mantiene compatibilidad con la configuración global existente:

- Si una banca NO tiene configuración específica, se usará la configuración global
- Si una banca tiene configuración específica, se usará su configuración propia
- Esto permite una migración gradual banca por banca

### Orden de Prioridad

1. **Configuración específica de la banca** (si existe)
2. **Configuración global del sistema** (fallback)
3. **Sin separación de cuentas** (si no hay configuración)

## Migración de Configuración Existente

Si ya tienes una configuración global en el archivo `.env`:

```env
COMMISSION_PERCENTAGE=5.0
COMMISSION_STRIPE_ACCOUNT_ID=acct_global_comisiones
CARD_PROCESSING_ACCOUNT_ID=acct_global_pagos
```

Esta configuración seguirá funcionando para todas las bancas que no tengan configuración específica.

### Pasos para Migrar

1. **Identificar las bancas**: Lista todas las bancas del sistema
2. **Por cada banca**:
   - Determina si necesita cuentas separadas
   - Si SÍ: Configura las cuentas específicas en el panel de admin
   - Si NO: Deja la configuración vacía para usar la global
3. **Verificar**: Realiza un pago de prueba en cada banca configurada
4. **Opcional**: Una vez todas las bancas estén configuradas individualmente, puedes remover la configuración global del `.env`

## API Changes

### GET /admin/bancas/:id
Ahora incluye los nuevos campos:
```json
{
  "id": "uuid",
  "name": "Banca Central",
  "commissionPercentage": 5.0,
  "commissionStripeAccountId": "acct_xxx",
  "cardProcessingAccountId": "acct_yyy",
  ...
}
```

### PUT /admin/bancas/:id
Acepta los nuevos campos opcionales:
```json
{
  "commissionPercentage": 5.0,
  "commissionStripeAccountId": "acct_xxx",
  "cardProcessingAccountId": "acct_yyy"
}
```

## Verificación

### 1. Verificar en el Panel de Admin
- Edita una banca
- Ingresa los valores de configuración
- Guarda los cambios
- Verifica que los valores se hayan guardado correctamente

### 2. Verificar en Stripe Dashboard
Después de un pago:
1. Ve a **Payments** en Stripe Dashboard
2. Busca el pago reciente
3. Verifica que la comisión y transferencia correspondan a las cuentas configuradas

### 3. Verificar en Logs del Backend
```
[StripePaymentGateway] Commission configured: 5% = 50 DOP, destination: acct_xxx
[StripePaymentGateway] Using banca-specific account configuration
```

## Troubleshooting

### Error: "Invalid Stripe account ID"
**Solución**: Verifica que el ID de cuenta comience con `acct_` y exista en tu cuenta de Stripe

### No se aplican las configuraciones específicas
**Solución**: Verifica que los campos no estén vacíos en la base de datos. Usa el panel de admin para confirmar.

### Las transferencias van a la cuenta incorrecta
**Solución**: Verifica el orden de prioridad. Si la banca tiene configuración específica, esa se usará. Caso contrario, se usa la global.

## Soporte

Para problemas o preguntas:
1. Revisa los logs del backend
2. Verifica la configuración en el panel de admin
3. Consulta la documentación de Stripe Connect

## Cambios Técnicos

### Entidades Modificadas
- `Banca` (domain entity): Agregados 3 campos opcionales
- `BancaEntity` (database entity): Agregadas 3 columnas
- `BancaResponseDto`: Incluye los nuevos campos
- `UpdateBancaDto`: Acepta los nuevos campos

### Servicios Modificados
- `BancaService.updateBanca()`: Soporta actualización de cuentas bancarias
- `StripePaymentGateway.charge()`: Verifica primero configuración de banca, luego global

### UI Modificada
- `admin-panel.html`: Modal de edición con campos de configuración bancaria

## Base de Datos

### Nuevas Columnas
```sql
ALTER TABLE bancas ADD COLUMN commission_percentage DECIMAL(5, 2);
ALTER TABLE bancas ADD COLUMN commission_stripe_account_id VARCHAR(255);
ALTER TABLE bancas ADD COLUMN card_processing_account_id VARCHAR(255);
```

**Nota**: Si usas TypeORM con `synchronize: true`, estos cambios se aplicarán automáticamente.
