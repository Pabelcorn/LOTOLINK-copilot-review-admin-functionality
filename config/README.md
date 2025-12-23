# Archivos de Configuración

Este directorio contiene archivos de configuración de ejemplo para desplegar LOTOLINK.

## Archivos Disponibles

### nginx.conf

Configuración de Nginx para usar como reverse proxy en producción.

**Uso:**
```bash
# Copiar configuración
sudo cp config/nginx.conf /etc/nginx/sites-available/lotolink

# Editar y reemplazar "tu-dominio.com" con tu dominio real
sudo nano /etc/nginx/sites-available/lotolink

# Habilitar el sitio
sudo ln -s /etc/nginx/sites-available/lotolink /etc/nginx/sites-enabled/

# Probar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

**Características incluidas:**
- ✅ Redirección HTTP a HTTPS
- ✅ Configuración SSL/TLS segura
- ✅ Proxy reverso para API backend
- ✅ Servir archivos estáticos del frontend
- ✅ Compresión Gzip
- ✅ Headers de seguridad
- ✅ Cache optimizado para assets
- ✅ Logs separados por servicio

## Más Información

Ver la guía completa de despliegue: [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)
