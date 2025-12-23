# 🎨 Guía Visual: Acceso al Panel de Administración

Esta guía te mostrará paso a paso cómo acceder y usar el Panel de Administración de LOTOLINK.

---

## 📺 Paso 1: Abrir Terminal

Abre tu terminal/consola:
- **Windows**: Presiona `Win + R`, escribe `cmd` y Enter
- **Mac**: Presiona `Cmd + Espacio`, escribe `Terminal` y Enter
- **Linux**: Presiona `Ctrl + Alt + T`

---

## 📂 Paso 2: Navegar al Proyecto

```bash
cd /ruta/a/tu/proyecto/LOTOLINK
```

Si acabas de clonar el repositorio:

```bash
git clone https://github.com/Pabelcorn/LOTOLINK.git
cd LOTOLINK
```

---

## 🚀 Paso 3: Iniciar el Sistema

Ejecuta el comando de inicio:

```bash
npm start
```

**Lo que verás:**

```
🚀 Iniciando LOTOLINK Sistema Completo...

✅ Node.js detectado: v18.x.x
✅ Archivo .env creado
✅ Dependencias instaladas
✅ PostgreSQL detectado

🔧 Iniciando Backend...
Esperando 5 segundos para que el backend inicie...
✅ Backend ejecutándose correctamente en http://localhost:3000

🎨 Iniciando Panel de Administración...

========================================
✅ LOTOLINK INICIADO CORRECTAMENTE
========================================

📊 Panel de Administración: http://localhost:8080/admin-panel.html
🔧 Backend API: http://localhost:3000
💚 Health Check: http://localhost:3000/health

📝 Logs:
  - Backend: tail -f backend.log
  - Panel: tail -f adminpanel.log

🛑 Para detener:
  - Backend PID: 12345
  - Panel PID: 12346
  - O ejecuta: ./scripts/stop-lotolink.sh

🌐 Abriendo navegador...

¡Disfruta usando LOTOLINK! 🎉
```

---

## 🌐 Paso 4: El Panel se Abre Automáticamente

Tu navegador se abrirá automáticamente en:

```
http://localhost:8080/admin-panel.html
```

**Lo que verás:**

```
┌─────────────────────────────────────────────────────────┐
│  🏦 Panel de Administración de Bancas                   │
│  Gestiona y aprueba el registro de bancas en LotoLink  │
│  ✅ Conectado                                           │
└─────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ [📝 Registrar Nueva Banca] [⏳ Solicitudes Pendientes]  │
│ [📋 Todas las Bancas]      [📊 Estadísticas]            │
└──────────────────────────────────────────────────────────┘
```

**Indicador de Conexión:**
- **✅ Conectado** (verde): Todo OK
- **❌ Sin conexión** (rojo): Backend no está funcionando
- **⏳ Verificando** (amarillo): Comprobando estado

---

## 📝 Paso 5: Registrar tu Primera Banca

### 5.1. Ir a "Registrar Nueva Banca"

La pestaña ya está seleccionada por defecto.

### 5.2. Completar el Formulario

**Campos del formulario:**

```
┌─────────────────────────────────────────────────┐
│ Nombre de la Banca *                            │
│ [Banca Ejemplo #1                           ]   │
│                                                  │
│ Tipo de Integración *                           │
│ [API ▼]                                         │
│                                                  │
│ RNC                                             │
│ [123456789                                  ]   │
│                                                  │
│ Email de Contacto *                             │
│ [contacto@bancaejemplo.com                  ]   │
│                                                  │
│ Teléfono                                        │
│ [809-555-1234                               ]   │
│                                                  │
│ Dirección                                       │
│ [Calle Principal #123, Santo Domingo        ]   │
│                                                  │
│ Endpoint API                                    │
│ [https://api.bancaejemplo.com/plays         ]   │
│                                                  │
│ [Registrar Banca]                               │
└─────────────────────────────────────────────────┘
```

### 5.3. Hacer Clic en "Registrar Banca"

Verás un mensaje de éxito:

```
┌─────────────────────────────────────────────────┐
│ ✅ Banca "Banca Ejemplo #1" registrada         │
│    exitosamente. Estado: Pendiente de          │
│    aprobación.                                  │
└─────────────────────────────────────────────────┘
```

---

## ⏳ Paso 6: Ver Solicitudes Pendientes

### 6.1. Ir a "Solicitudes Pendientes"

Haz clic en la pestaña **"⏳ Solicitudes Pendientes"**.

### 6.2. Verás la Banca Registrada

```
┌─────────────────────────────────────────────────────────────────────┐
│ SOLICITUDES PENDIENTES DE APROBACIÓN                               │
├──────────────┬───────────────┬──────┬───────────┬────────┬─────────┤
│ Nombre       │ Email         │ Tipo │ RNC       │ Tel    │ Acciones│
├──────────────┼───────────────┼──────┼───────────┼────────┼─────────┤
│ Banca        │ contacto@     │ api  │ 123456789 │ 809... │[✅][❌]│
│ Ejemplo #1   │ bancaejemplo  │      │           │        │         │
└──────────────┴───────────────┴──────┴───────────┴────────┴─────────┘
```

---

## ✅ Paso 7: Aprobar la Banca

### 7.1. Hacer Clic en "✅ Aprobar"

Se abrirá un cuadro de confirmación:

```
┌─────────────────────────────────────────┐
│ ⚠️  Confirmación                        │
│                                         │
│ ¿Aprobar la banca "Banca Ejemplo #1"?  │
│ Se generarán las credenciales           │
│ automáticamente.                        │
│                                         │
│         [Cancelar]    [Aceptar]         │
└─────────────────────────────────────────┘
```

### 7.2. Haz Clic en "Aceptar"

### 7.3. Se Mostrará el Modal de Credenciales

```
┌────────────────────────────────────────────────────┐
│ 🔐 Credenciales Generadas                         │
│                                                    │
│ ⚠️ IMPORTANTE: Estas credenciales solo se         │
│ mostrarán UNA VEZ. Cópialas ahora.                │
│                                                    │
│ Client ID                                          │
│ ┌────────────────────────────────────────────┐   │
│ │ client_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6   │   │
│ └────────────────────────────────────────────┘   │
│                                                    │
│ Client Secret                                      │
│ ┌────────────────────────────────────────────┐   │
│ │ AbCdEfGhIjKlMnOpQrStUvWxYz0123456789+/=    │   │
│ └────────────────────────────────────────────┘   │
│                                                    │
│ HMAC Secret                                        │
│ ┌────────────────────────────────────────────┐   │
│ │ XyZaBcDeFgHiJkLmNoPqRsTuVwXyZ012345678+/=  │   │
│ └────────────────────────────────────────────┘   │
│                                                    │
│ [📋 Copiar Todo]              [Cerrar]            │
└────────────────────────────────────────────────────┘
```

### 7.4. Copiar las Credenciales

Haz clic en **"📋 Copiar Todo"** para copiar todas las credenciales al portapapeles.

**Las credenciales copiadas:**

```
LotoLink - Credenciales de la Banca

Client ID: client_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
Client Secret: AbCdEfGhIjKlMnOpQrStUvWxYz0123456789+/=
HMAC Secret: XyZaBcDeFgHiJkLmNoPqRsTuVwXyZ012345678+/=
```

### 7.5. Guardar las Credenciales

**IMPORTANTE**: Guarda estas credenciales en un lugar seguro. Opciones:
- Archivo de texto cifrado
- Gestor de contraseñas
- Variables de entorno del servidor
- Sistema de gestión de secretos (Vault, AWS Secrets Manager)

**NO las compartas por:**
- WhatsApp
- Email no cifrado
- Slack/Discord público
- Mensajes de texto

---

## 📋 Paso 8: Ver Todas las Bancas

### 8.1. Ir a "Todas las Bancas"

Haz clic en la pestaña **"📋 Todas las Bancas"**.

### 8.2. Verás la Lista Completa

```
┌─────────────────────────────────────────────────────────────────────────┐
│ TODAS LAS BANCAS REGISTRADAS                                           │
├──────────────┬───────────────┬──────┬──────────┬────────┬──────────────┤
│ Nombre       │ Email         │ Tipo │ Estado   │ Activa │ Acciones     │
├──────────────┼───────────────┼──────┼──────────┼────────┼──────────────┤
│ Banca        │ contacto@     │ api  │ [ACTIVE] │   ✅   │ [⏸️ Suspender]│
│ Ejemplo #1   │ bancaejemplo  │      │          │        │              │
└──────────────┴───────────────┴──────┴──────────┴────────┴──────────────┘
```

**Estados posibles:**
- **[PENDING]** - Amarillo: Pendiente de aprobación
- **[APPROVED]** - Verde claro: Aprobada pero no activa
- **[ACTIVE]** - Azul: Funcionando normalmente
- **[SUSPENDED]** - Gris: Suspendida temporalmente
- **[REJECTED]** - Rojo: Rechazada

---

## 📊 Paso 9: Ver Estadísticas

### 9.1. Ir a "Estadísticas"

Haz clic en la pestaña **"📊 Estadísticas"**.

### 9.2. Verás el Dashboard

```
┌────────────────────────────────────────────────┐
│ ESTADÍSTICAS DEL SISTEMA                      │
│                                                │
│  ┌──────────────┐  ┌──────────────┐          │
│  │ Total        │  │ Pendientes   │          │
│  │      1       │  │      0       │          │
│  └──────────────┘  └──────────────┘          │
│                                                │
│  ┌──────────────┐  ┌──────────────┐          │
│  │ Activas      │  │ Suspendidas  │          │
│  │      1       │  │      0       │          │
│  └──────────────┘  └──────────────┘          │
└────────────────────────────────────────────────┘
```

---

## 🛑 Paso 10: Detener el Sistema

Cuando termines, detén el sistema:

### Opción 1: Script Automático

En una nueva terminal:

```bash
npm stop
```

### Opción 2: Manual

Presiona `Ctrl+C` en las terminales donde están corriendo el backend y el panel.

---

## 🎯 ¡Listo!

Has completado exitosamente:

✅ Instalación del sistema
✅ Inicio del backend y panel
✅ Registro de tu primera banca
✅ Aprobación y generación de credenciales
✅ Navegación por todas las secciones

---

## 🔄 Próximos Pasos

1. **Envía las credenciales a la banca** de forma segura
2. **Consulta la documentación de integración**: `docs/BANCA_INTEGRATION_GUIDE.md`
3. **Prueba la integración** con las credenciales generadas
4. **Monitorea el estado** de las bancas desde el panel

---

## 📞 ¿Necesitas Ayuda?

- [FAQ - Preguntas Frecuentes](ADMIN_PANEL_FAQ.md)
- [Guía de Solución de Problemas](ADMIN_PANEL_ACCESS.md#-solución-de-problemas)
- [Guía de Pruebas](ADMIN_PANEL_TESTING.md)

**¡Felicidades por configurar LOTOLINK!** 🎉
