# Guía de Configuración de Notificaciones por Email

## Resumen

LotoLink ahora incluye un sistema completo de notificaciones por correo electrónico para:
- Solicitudes de registro de bancas
- Formularios de contacto ("Únete a LotoLink")
- Confirmaciones a usuarios

## Características

✅ **Envío de emails automático** cuando alguien envía un formulario
✅ **Notificaciones al admin** con todos los detalles de la solicitud
✅ **Confirmaciones al usuario** para mejor experiencia
✅ **Compatible con Gmail, Outlook, SMTP personalizado**
✅ **Plantillas HTML profesionales**

## Configuración

### Opción 1: Usar Gmail (Recomendado para Empezar)

#### Paso 1: Obtener Contraseña de Aplicación de Gmail

1. **Habilita la verificación en 2 pasos** en tu cuenta de Gmail
   - Ve a https://myaccount.google.com/security
   - Activa "Verificación en 2 pasos"

2. **Genera una contraseña de aplicación**
   - Ve a https://myaccount.google.com/apppasswords
   - Selecciona "Correo" y "Otro (nombre personalizado)"
   - Escribe "LotoLink Backend"
   - Haz clic en "Generar"
   - Copia la contraseña de 16 caracteres

#### Paso 2: Configurar Variables de Entorno

Edita el archivo `.env` en el directorio `backend/`:

```env
# Habilitar emails
EMAIL_ENABLED=true

# Configuración de Gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # La contraseña de aplicación de 16 caracteres
EMAIL_FROM=noreply@lotolink.com

# Email del administrador (recibirá las notificaciones)
ADMIN_EMAIL=admin@lotolink.com
```

### Opción 2: Usar Outlook/Hotmail

```env
EMAIL_ENABLED=true
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@outlook.com
EMAIL_PASSWORD=tu_contraseña
EMAIL_FROM=noreply@lotolink.com
ADMIN_EMAIL=admin@lotolink.com
```

### Opción 3: Usar un Servicio SMTP Personalizado

Para servicios como SendGrid, Mailgun, Amazon SES:

```env
EMAIL_ENABLED=true
EMAIL_HOST=smtp.tu-servicio.com
EMAIL_PORT=587  # o 465 para SSL
EMAIL_SECURE=false  # true si usas puerto 465
EMAIL_USER=tu_usuario
EMAIL_PASSWORD=tu_contraseña
EMAIL_FROM=noreply@lotolink.com
ADMIN_EMAIL=admin@lotolink.com
```

## Endpoints de la API

### 1. Registro de Banca

**Endpoint:** `POST /api/v1/contact/registration`

**Request Body:**
```json
{
  "bancaName": "Banca La Suerte",
  "location": "Santo Domingo, Los Mina",
  "ownerName": "Juan Pérez",
  "phone": "809-555-1234",
  "email": "juan@example.com",
  "bankAccount": "Banco Popular - Cuenta #123456789"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Solicitud enviada exitosamente. Revisa tu correo para confirmación."
}
```

**Emails Enviados:**
1. **Al administrador:**
   - Asunto: "Nueva Solicitud de Registro: Banca La Suerte"
   - Contenido: Todos los detalles de la banca

2. **Al solicitante:**
   - Asunto: "Confirmación de Solicitud - LotoLink"
   - Contenido: Confirmación de que recibimos su solicitud

### 2. Formulario "Únete a LotoLink"

**Endpoint:** `POST /api/v1/contact/join`

**Request Body:**
```json
{
  "name": "Banca El Millón",
  "location": "Santiago",
  "phone": "809-555-5678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Solicitud enviada exitosamente. Nos pondremos en contacto contigo pronto."
}
```

**Email Enviado:**
- **Al administrador:**
  - Asunto: "Solicitud de Contacto: Banca El Millón"
  - Contenido: Nombre, ubicación y teléfono

## Actualizar el Frontend

Los formularios en `index.html` ya están listos, solo necesitan conectarse a la API:

### Ejemplo: Actualizar el Formulario de Registro

Busca el formulario en `index.html` y actualiza el handler `onSubmit`:

```javascript
// En el componente BancaPortal
const handleRegistrationSubmit = async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = {
    bancaName: formData.get('bancaName'),
    location: formData.get('location'),
    ownerName: formData.get('ownerName'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    bankAccount: formData.get('bankAccount'),
  };
  
  try {
    const response = await fetch('http://localhost:3000/api/v1/contact/registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (result.success) {
      setSubmitted(true);
      // Mostrar mensaje de éxito
      alert(result.message);
    }
  } catch (error) {
    console.error('Error al enviar solicitud:', error);
    alert('Hubo un error al enviar la solicitud. Por favor intenta de nuevo.');
  }
};
```

### Ejemplo: Actualizar "Únete a LotoLink"

```javascript
// En el componente JoinUs
function submit(e) { 
  e.preventDefault();
  
  const data = {
    name: name,
    location: loc,
    phone: phone,
  };
  
  fetch('http://localhost:3000/api/v1/contact/join', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setName(""); 
        setLoc(""); 
        setPhone("");
      }, 3000);
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
}
```

## Verificación

### 1. Verificar que el Servicio Está Activo

Al iniciar el backend, deberías ver en los logs:

```
[EmailService] Email service initialized with host: smtp.gmail.com
```

O si está deshabilitado:

```
[EmailService] Email service is disabled. Set EMAIL_ENABLED=true to enable.
```

### 2. Probar el Envío de Email

Puedes usar `curl` para probar:

```bash
curl -X POST http://localhost:3000/api/v1/contact/join \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Banca Test",
    "location": "Santo Domingo",
    "phone": "809-555-0000"
  }'
```

### 3. Verificar en Logs

Cuando se envía un email exitosamente:

```
[EmailService] Email sent successfully to admin@lotolink.com. Message ID: <abc123@gmail.com>
```

Si falla:

```
[EmailService] Failed to send email to admin@lotolink.com: Error message
```

## Plantillas de Email

### Email de Registro (al Admin)

```
Asunto: Nueva Solicitud de Registro: [Nombre de Banca]

Contenido:
- Información de la Banca
  - Nombre de la Banca
  - Ubicación
- Datos de Contacto
  - Propietario
  - Teléfono
  - Email
- Datos de Pago
  - Cuenta Bancaria
```

### Email de Confirmación (al Usuario)

```
Asunto: Confirmación de Solicitud - LotoLink

Contenido:
Hemos recibido tu solicitud de registro para [Nombre de Banca].
Nuestro equipo la revisará y se pondrá en contacto contigo pronto.
```

### Email de Contacto (al Admin)

```
Asunto: Solicitud de Contacto: [Nombre de Banca]

Contenido:
- Nombre de la Banca
- Ubicación
- Teléfono
```

## Problemas Comunes

### Error: "Email transporter is not initialized"

**Causa:** Falta configuración de EMAIL_HOST, EMAIL_USER o EMAIL_PASSWORD

**Solución:**
```env
EMAIL_ENABLED=true
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_de_app
```

### Error: "Invalid login: 535 Authentication failed"

**Causas posibles:**
1. Contraseña incorrecta
2. No usaste contraseña de aplicación (si usas Gmail)
3. Verificación en 2 pasos no habilitada

**Solución:**
- Verifica que la contraseña sea correcta
- Para Gmail, usa una contraseña de aplicación, no tu contraseña normal
- Asegúrate de tener 2FA habilitado en Gmail

### Los emails no llegan

**Verifica:**
1. Revisa la carpeta de spam
2. Confirma que `ADMIN_EMAIL` esté configurado correctamente
3. Revisa los logs del backend para errores
4. Verifica que `EMAIL_ENABLED=true`

### Error: "Connection timeout"

**Causas:**
1. Puerto bloqueado por firewall
2. HOST incorrecto

**Solución:**
- Verifica el puerto (587 para Gmail)
- Confirma que no haya firewall bloqueando
- Intenta con `EMAIL_SECURE=true` y puerto 465

## Modo de Desarrollo

Si quieres probar sin configurar email real:

```env
EMAIL_ENABLED=false
```

Con esto:
- Los formularios seguirán funcionando
- No se enviarán emails reales
- Los logs mostrarán: "Email sending is disabled. Would have sent to: [email]"

## Servicios de Email Recomendados

### Para Producción

1. **SendGrid**
   - Hasta 100 emails/día gratis
   - Muy confiable
   - Fácil configuración

2. **Amazon SES**
   - Muy económico
   - Alta deliverability
   - Requiere verificación de dominio

3. **Mailgun**
   - 5,000 emails/mes gratis primeros 3 meses
   - Buena para aplicaciones
   - API simple

### Para Desarrollo/Testing

1. **Gmail**
   - Gratis
   - Límite: 500 emails/día
   - Perfecto para empezar

2. **Mailtrap**
   - Solo para testing
   - Los emails no se envían realmente
   - Útil para desarrollo

## Seguridad

⚠️ **Importante:**

1. **Nunca** commitees tu `.env` al repositorio
2. **Usa contraseñas de aplicación** para Gmail
3. **Rota las contraseñas** regularmente
4. **Valida** los datos antes de enviar emails
5. **Limita** el rate de envío para prevenir spam

## Próximos Pasos

1. ✅ Configurar variables de entorno
2. ✅ Reiniciar el backend
3. ✅ Actualizar formularios en el frontend
4. ✅ Probar el envío de emails
5. ✅ Verificar que lleguen las notificaciones
6. ✅ Personalizar plantillas si es necesario

## Resumen

```env
# Configuración mínima para Gmail
EMAIL_ENABLED=true
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_de_app
EMAIL_FROM=noreply@lotolink.com
ADMIN_EMAIL=admin@lotolink.com
```

¡Listo! Con esta configuración, todos los formularios de contacto enviarán notificaciones por email automáticamente.
