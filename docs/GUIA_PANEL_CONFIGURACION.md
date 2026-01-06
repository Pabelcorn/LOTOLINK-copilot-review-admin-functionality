# Panel de Configuración del Administrador

## ¡Nueva Funcionalidad Implementada! ⚙️

Ahora puedes configurar **emails y comisiones directamente desde el panel de administración** sin necesidad de editar archivos `.env`.

## Acceso al Panel de Configuración

1. **Accede al Panel de Administración:**
   - Abre `admin-panel.html` en tu navegador
   - Inicia sesión con credenciales de administrador

2. **Navega a la pestaña "Configuración":**
   - Haz clic en el botón **⚙️ Configuración** en el menú superior

![Panel de Configuración](https://github.com/user-attachments/assets/5be5746e-2b30-4501-9e09-8a910acf7406)

## Configuración de Email 📧

### Campos Disponibles:

1. **Habilitar notificaciones por email**
   - Activa/desactiva el envío de emails

2. **Servidor SMTP (Host)**
   - Ejemplo: `smtp.gmail.com`, `smtp-mail.outlook.com`

3. **Puerto SMTP**
   - Común: 587 (TLS), 465 (SSL)

4. **Usar SSL/TLS**
   - Marca si tu servidor requiere conexión segura

5. **Usuario SMTP**
   - Tu dirección de email

6. **Contraseña SMTP**
   - Para Gmail: usa una contraseña de aplicación
   - Instrucciones: https://myaccount.google.com/apppasswords

7. **Email de envío (From)**
   - Dirección que aparecerá como remitente

8. **Email del administrador**
   - Donde recibirás las notificaciones de formularios de contacto

### Ejemplo de Configuración para Gmail:

```
Servidor SMTP: smtp.gmail.com
Puerto SMTP: 587
Usar SSL/TLS: ❌ (desactivado para puerto 587)
Usuario SMTP: tu-email@gmail.com
Contraseña SMTP: [contraseña de aplicación de 16 caracteres]
Email de envío: noreply@lotolink.com
Email del administrador: admin@lotolink.com
```

## Configuración de Comisiones 💳

### Campos Disponibles:

1. **Porcentaje de comisión (%)**
   - Ejemplo: `5.0` para 5% de comisión
   - Se retiene automáticamente de cada pago

2. **Cuenta Stripe para comisiones**
   - ID de cuenta Stripe donde se retienen las comisiones
   - Formato: `acct_xxxxxxxxxx`
   - Opcional si no usas separación de cuentas

3. **Cuenta Stripe para procesamiento**
   - ID de cuenta Stripe donde se transfieren los pagos netos
   - Formato: `acct_xxxxxxxxxx`
   - Requiere Stripe Connect configurado

### Ejemplo de Configuración de Comisiones:

```
Porcentaje de comisión: 5.0
Cuenta Stripe para comisiones: (vacío - usar cuenta principal)
Cuenta Stripe para procesamiento: acct_1234567890
```

**Resultado:** Cuando un usuario paga $100:
- Comisión (5%): $5 → Se queda en tu cuenta principal
- Pago neto (95%): $95 → Se transfiere a la cuenta de procesamiento
- Billetera del usuario: +$100

## Funciones Disponibles

### 💾 Guardar Configuración
- Guarda todos los cambios en la base de datos
- Los cambios se aplican inmediatamente
- El servicio de email se reinicia automáticamente

### 🔄 Recargar
- Vuelve a cargar la configuración desde la base de datos
- Útil para descartar cambios no guardados

### 📧 Probar Email
- Verifica que la configuración de email esté completa
- Muestra el estado actual de la configuración
- No envía un email de prueba, solo verifica los ajustes

## Flujo de Trabajo Recomendado

### Primera Configuración:

1. **Configura Email:**
   ```
   1. Activa "Habilitar notificaciones por email"
   2. Completa todos los campos de email
   3. Haz clic en "Guardar Configuración"
   4. Haz clic en "Probar Email" para verificar
   ```

2. **Configura Comisiones (Opcional):**
   ```
   1. Define el porcentaje de comisión
   2. Agrega las cuentas Stripe si las tienes
   3. Haz clic en "Guardar Configuración"
   ```

3. **Prueba el Sistema:**
   ```
   1. Ve a la aplicación principal
   2. Llena el formulario "Únete a LotoLink"
   3. Verifica que el email llegue a tu administrador
   ```

## Ventajas sobre Variables de Entorno

### ✅ **Fácil de Usar**
- No necesitas editar archivos `.env`
- No necesitas reiniciar el servidor
- Interfaz visual amigable

### ✅ **Cambios Inmediatos**
- Los cambios se aplican al guardar
- No requiere redeploy

### ✅ **Más Seguro**
- Configuración protegida con autenticación JWT
- Solo admins pueden acceder
- Contraseñas enmascaradas en la interfaz
- **⚠️ IMPORTANTE:** En producción, usa **HTTPS** para proteger las credenciales en tránsito

### ✅ **Auditable**
- Cada cambio se registra en la base de datos
- Historial de modificaciones disponible

## Compatibilidad con Variables de Entorno

El sistema **sigue siendo compatible** con variables de entorno:

1. **Primera prioridad:** Configuración en base de datos (desde admin panel)
2. **Segunda prioridad:** Variables de entorno (archivo `.env`)

**Esto significa:**
- Si configuras desde el panel admin, esa configuración prevalece
- Si no hay configuración en base de datos, usa `.env`
- Puedes migrar gradualmente de `.env` a admin panel

## Seguridad

### Autenticación Requerida
- Solo usuarios con rol `ADMIN` pueden acceder
- Requiere token JWT válido
- Sesión expira después de 24 horas

### Protección de Datos Sensibles
- Las contraseñas se muestran enmascaradas (`********`)
- Solo se actualiza la contraseña si se modifica
- Comunicación segura con JWT

### ⚠️ **Recomendaciones de Seguridad para Producción**

1. **Usa HTTPS siempre:**
   - Las contraseñas SMTP se transmiten al servidor
   - HTTPS encripta toda la comunicación
   - Nunca uses HTTP en producción

2. **Considera encriptar en base de datos:**
   - Actualmente las contraseñas se almacenan en texto plano en DB
   - Para mayor seguridad, implementa encriptación en reposo
   - Usa un servicio de secrets como AWS Secrets Manager o HashiCorp Vault

3. **Audita los accesos:**
   - Revisa regularmente quién accede al panel
   - Monitorea cambios en la configuración
   - Mantén logs de todas las modificaciones

### Logs del Sistema
- Todos los cambios se registran
- Errores se loguean para debugging
- No se exponen datos sensibles en logs

## Solución de Problemas

### "Error al cargar configuración"
**Causa:** No estás autenticado o el token expiró

**Solución:**
1. Cierra el panel de administración
2. Inicia sesión nuevamente en la app principal como admin
3. Vuelve a abrir el panel de administración

### "Error al guardar"
**Causa:** Backend no está corriendo o hay problemas de conexión

**Solución:**
1. Verifica que el backend esté corriendo: `cd backend && npm run start:dev`
2. Verifica la URL del backend en admin-panel.html (línea 768)
3. Revisa los logs del backend para más detalles

### Los emails no se envían después de configurar
**Causa:** Configuración incorrecta o credenciales inválidas

**Solución:**
1. Verifica que "Habilitar notificaciones por email" esté activado
2. Verifica tus credenciales SMTP
3. Para Gmail, asegúrate de usar contraseña de aplicación
4. Revisa los logs del backend para errores específicos

## Próximos Pasos

Después de configurar el sistema:

1. **Prueba los formularios de contacto:**
   - Formulario de registro de banca
   - Formulario "Únete a LotoLink"

2. **Verifica que lleguen los emails:**
   - Al administrador (notificaciones)
   - A los usuarios (confirmaciones)

3. **Configura Stripe Connect (si usas comisiones):**
   - Crea cuentas conectadas en Stripe Dashboard
   - Agrega los IDs en el panel de configuración

4. **Monitorea los logs:**
   - Verifica que no haya errores
   - Confirma que las comisiones se calculen correctamente

## Resumen

Ya no necesitas:
- ❌ Editar archivos `.env`
- ❌ Reiniciar el servidor para cambios
- ❌ Acceso SSH para configurar
- ❌ Conocimientos técnicos avanzados

Ahora puedes:
- ✅ Configurar todo desde el navegador
- ✅ Ver cambios inmediatamente
- ✅ Gestionar múltiples configuraciones
- ✅ Probar fácilmente diferentes ajustes

**¡La configuración del sistema ahora es tan fácil como llenar un formulario!** 🎉
