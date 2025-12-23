# 🚀 ¿Cómo Empezar con LOTOLINK?

> **Guía visual rápida** para comenzar según tu objetivo

---

## 🎯 ¿Qué quieres hacer?

### 1️⃣ **Probar LOTOLINK en mi computadora (Desarrollo)**

```bash
# Paso 1: Clonar repositorio
git clone https://github.com/Pabelcorn/LOTOLINK.git
cd LOTOLINK

# Paso 2: Ejecutar script automático
chmod +x scripts/deploy.sh
./scripts/deploy.sh dev

# ¡Listo! 
# Abre: http://localhost:8080
```

📖 **Ver más:** [QUICK_START.md](QUICK_START.md)

---

### 2️⃣ **Desplegar en Producción (VPS/Servidor)**

```bash
# Paso 1: Conectar al servidor
ssh root@tu-servidor-ip

# Paso 2: Clonar repositorio
git clone https://github.com/Pabelcorn/LOTOLINK.git
cd LOTOLINK

# Paso 3: Ejecutar script de producción
chmod +x scripts/deploy.sh
./scripts/deploy.sh prod

# Paso 4: Configurar dominio y HTTPS
# Ver la guía completa abajo
```

📖 **Ver más:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)  
⚡ **Referencia rápida:** [DEPLOY_QUICK.md](DEPLOY_QUICK.md)

---

### 3️⃣ **Integrar mi Banca con LOTOLINK**

1. **Contacta al administrador** para obtener credenciales
2. **Lee la guía de integración:** [docs/BANCA_INTEGRATION_GUIDE.md](docs/BANCA_INTEGRATION_GUIDE.md)
3. **Descarga ejemplos de código:** [docs/integration-examples/](docs/integration-examples/)
4. **Importa la colección de Postman:** [docs/Lotolink-API.postman_collection.json](docs/Lotolink-API.postman_collection.json)

---

## 📚 Documentación por Tipo

### Para Desarrolladores 👨‍💻
- [README.md](README.md) - Arquitectura técnica completa
- [QUICK_START.md](QUICK_START.md) - Inicio rápido en 5 minutos
- [docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md) - Cómo ejecutar tests

### Para DevOps/SysAdmin 🔧
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Guía completa de despliegue (28 KB)
- [DEPLOY_QUICK.md](DEPLOY_QUICK.md) - Referencia rápida
- [config/nginx.conf](config/nginx.conf) - Configuración de Nginx
- [docker-compose.prod.yml](docker-compose.prod.yml) - Docker para producción

### Para Bancas 🏦
- [docs/BANCA_INTEGRATION_GUIDE.md](docs/BANCA_INTEGRATION_GUIDE.md) - Guía de integración
- [docs/integration-examples/](docs/integration-examples/) - Ejemplos de código
- [docs/openapi.yaml](docs/openapi.yaml) - Especificación OpenAPI

### Para Administradores 👨‍💼
- [docs/ADMIN_PANEL_GUIDE.md](docs/ADMIN_PANEL_GUIDE.md) - Panel de administración
- [docs/ADMIN_PANEL_ACCESS.md](docs/ADMIN_PANEL_ACCESS.md) - Acceso al panel

### Seguridad 🔒
- [SECURITY_SUMMARY.md](SECURITY_SUMMARY.md) - Resumen de seguridad
- [PRODUCCION_AUTH_GUIDE.md](PRODUCCION_AUTH_GUIDE.md) - Autenticación en producción
- [STRIPE_SECURITY_IMPLEMENTATION.md](STRIPE_SECURITY_IMPLEMENTATION.md) - Seguridad de pagos

---

## ⚡ Comandos Rápidos

### Desarrollo Local
```bash
# Iniciar todo
npm start

# Solo backend
cd backend && npm run start:dev

# Solo panel admin
npm run admin-panel

# Ejecutar tests
cd backend && npm test
```

### Producción con Docker
```bash
# Iniciar
./scripts/deploy.sh prod

# Ver logs
docker-compose logs -f

# Reiniciar
docker-compose restart

# Detener
./scripts/deploy.sh stop
```

### Producción sin Docker (PM2)
```bash
# Iniciar backend
cd backend
pm2 start dist/main.js --name lotolink-backend

# Ver logs
pm2 logs lotolink-backend

# Reiniciar
pm2 restart lotolink-backend
```

---

## 🗺️ Mapa del Repositorio

```
LOTOLINK/
│
├── 📄 Documentación Principal
│   ├── README.md                    ← Arquitectura y overview
│   ├── QUICK_START.md               ← Inicio rápido
│   ├── DEPLOYMENT_GUIDE.md          ← Despliegue completo ⭐
│   ├── DEPLOY_QUICK.md              ← Referencia rápida
│   └── DEPLOYMENT_SUMMARY.md        ← Resumen de implementación
│
├── 🔧 Configuración
│   ├── docker-compose.yml           ← Docker para desarrollo
│   ├── docker-compose.prod.yml      ← Docker para producción ⭐
│   ├── config/
│   │   └── nginx.conf               ← Configuración Nginx ⭐
│   └── backend/
│       ├── .env.example             ← Variables de desarrollo
│       └── .env.production.example  ← Variables de producción ⭐
│
├── 🤖 Scripts
│   └── scripts/
│       ├── deploy.sh                ← Script de despliegue ⭐
│       ├── start-lotolink.sh        ← Iniciar desarrollo
│       └── stop-lotolink.sh         ← Detener servicios
│
├── 💻 Código Fuente
│   ├── backend/                     ← API NestJS
│   ├── mobile-app/                  ← App móvil
│   ├── desktop-app/                 ← App de escritorio
│   └── index.html                   ← Frontend web
│
└── 📚 Documentación Adicional
    └── docs/                        ← Guías técnicas

⭐ = Nuevos archivos para despliegue
```

---

## 🎓 Flujo de Trabajo Recomendado

### 1. Primera Vez (Desarrollo)
```
Clonar repo → npm start → Probar en localhost
```

### 2. Desarrollo Activo
```
Modificar código → npm test → Commit → Push
```

### 3. Ir a Producción
```
Servidor listo → ./scripts/deploy.sh prod → Configurar dominio → ¡En vivo!
```

---

## 🆘 ¿Necesitas Ayuda?

1. **Problema con desarrollo local:** Ver [QUICK_START.md](QUICK_START.md)
2. **Problema con despliegue:** Ver [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) sección Troubleshooting
3. **Error específico:** Buscar en la guía de despliegue
4. **No encuentras algo:** Revisar [README.md](README.md)
5. **Aún necesitas ayuda:** Crear un issue en GitHub

---

## 🎯 Próximos Pasos Sugeridos

### Si eres nuevo:
1. ✅ Lee [README.md](README.md) para entender la arquitectura
2. ✅ Sigue [QUICK_START.md](QUICK_START.md) para probar localmente
3. ✅ Cuando estés listo, usa [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) para producción

### Si ya conoces el proyecto:
1. ✅ Usa [DEPLOY_QUICK.md](DEPLOY_QUICK.md) como referencia rápida
2. ✅ Ejecuta `./scripts/deploy.sh` para desplegar
3. ✅ Consulta troubleshooting si hay problemas

---

## 📞 Enlaces Útiles

- **Repositorio:** https://github.com/Pabelcorn/LOTOLINK
- **Issues:** https://github.com/Pabelcorn/LOTOLINK/issues
- **Releases:** https://github.com/Pabelcorn/LOTOLINK/releases

---

**¡Bienvenido a LOTOLINK!** 🎉

Esta guía te ayudará a comenzar rápidamente. Para más detalles, consulta las guías específicas mencionadas arriba.
