# Guía de Creación de Releases con GitHub Actions

Este documento explica cómo crear releases de LotoLink utilizando los workflows de GitHub Actions.

## Contexto del Problema

Anteriormente, los workflows solo creaban releases cuando se ejecutaban desde **tags** (etiquetas de git). Si ejecutabas el workflow manualmente o desde un push a la rama `main`, los instaladores se generaban como **artefactos** pero **no aparecían en la sección de Releases**.

## Solución Implementada

Ahora tienes **dos formas** de crear releases:

### 1. Método Tradicional: Usando Tags (Recomendado para Producción)

Este es el método recomendado para versiones oficiales:

**Para Desktop:**
```bash
git tag v1.0.7
git push origin v1.0.7
```

**Para Mobile:**
```bash
git tag mobile-v1.0.7
git push origin mobile-v1.0.7
```

El workflow se ejecutará automáticamente y creará un **release público** con todos los instaladores.

### 2. Método Nuevo: Ejecución Manual con Opción de Release

Ahora puedes ejecutar los workflows manualmente y crear un **release en borrador** (draft):

#### Desktop Installers:

1. Ve a: [Actions → Build Desktop Installers](https://github.com/Pabelcorn/LOTOLINK/actions/workflows/build-installers.yml)
2. Haz clic en **"Run workflow"**
3. Configura los parámetros:
   - **Branch**: Selecciona la rama (ej: `main`)
   - **Platforms**: `all`, `windows`, `macos`, o `linux`
   - **Create a GitHub release (draft)**: ✅ Marca esta opción
   - **Release tag name**: Ingresa un tag (ej: `v1.0.7`)
4. Haz clic en **"Run workflow"**

#### Mobile Installers:

1. Ve a: [Actions → Build Mobile Installers](https://github.com/Pabelcorn/LOTOLINK/actions/workflows/mobile-build.yml)
2. Haz clic en **"Run workflow"**
3. Configura los parámetros:
   - **Branch**: Selecciona la rama (ej: `main`)
   - **Platforms**: `all`, `android`, o `ios`
   - **Create a GitHub release (draft)**: ✅ Marca esta opción
   - **Release tag name**: Ingresa un tag (ej: `mobile-v1.0.7`)
4. Haz clic en **"Run workflow"**

## ¿Qué Sucede con los Releases en Borrador?

Cuando usas la ejecución manual con `create_release = true`:

1. ✅ Se crea un **release en borrador** (draft)
2. ✅ Se marca como **pre-release** (pre-lanzamiento)
3. ✅ Los instaladores se suben al release
4. ✅ El release **NO es visible públicamente** hasta que lo publiques

### Publicar un Release en Borrador:

1. Ve a la sección [Releases](https://github.com/Pabelcorn/LOTOLINK/releases)
2. Verás el release marcado como **Draft**
3. Haz clic en **"Edit"**
4. Revisa que todo esté correcto
5. Desmarca **"Set as a pre-release"** si es una versión estable
6. Haz clic en **"Publish release"**

## Comparación de Métodos

| Característica | Con Tag | Manual con Flag |
|----------------|---------|-----------------|
| **Visibilidad inicial** | Público inmediatamente | Borrador (privado) |
| **Recomendado para** | Releases oficiales | Testing, pre-releases |
| **Crea el tag en git** | Sí | Sí (automáticamente) |
| **Marcado como pre-release** | No | Sí (hasta que lo publiques) |
| **Requiere acceso a repo** | Sí (para crear tag) | Sí (para ejecutar workflow) |

## Ejemplos de Uso

### Caso 1: Release Oficial de Desktop (v1.0.7)
```bash
# Método con tag (recomendado)
git tag v1.0.7 -m "Release 1.0.7 - Nuevas características"
git push origin v1.0.7
```

### Caso 2: Probar Instaladores Antes de Release Oficial
1. Ejecuta workflow manual con `create_release = true` y tag `v1.0.7-beta`
2. Descarga y prueba los instaladores del release en borrador
3. Si todo funciona, publica el release o crea el tag oficial

### Caso 3: Release de Emergencia sin Tag Local
1. Ejecuta workflow manual con `create_release = true` y tag `v1.0.8-hotfix`
2. Revisa el release en borrador
3. Publica cuando esté listo

## Por Qué No Aparecían los Releases Anteriormente

Los jobs que ejecutaste (IDs 20212913793 y 20212718896) probablemente fueron:
- ❌ Ejecutados desde la rama `main` (sin tag)
- ❌ Ejecutados manualmente (workflow_dispatch)
- ❌ **NO** activados por un tag que comience con `v*` o `mobile-v*`

Por lo tanto, el paso "Upload to Release (if tag)" tenía esta condición:
```yaml
if: startsWith(github.ref, 'refs/tags/')
```

Como `github.ref` era `refs/heads/main` en lugar de `refs/tags/v1.0.x`, el paso **se saltó** y no se creó el release.

## Acceso a Artefactos vs Releases

### Artefactos (Artifacts)
- Se generan en **todas** las ejecuciones del workflow
- Duración: **30 días**
- Ubicación: Actions → Workflow Run → Artifacts (al final de la página)
- **No son públicos**, solo para usuarios con acceso al repo

### Releases
- Solo se crean cuando:
  - Se ejecuta desde un **tag**, o
  - Se ejecuta manualmente con `create_release = true`
- Duración: **Permanente**
- Ubicación: [Releases](https://github.com/Pabelcorn/LOTOLINK/releases)
- **Públicos** (una vez publicados)

## Solución de Problemas

### "No veo la opción para crear release en el workflow"
- Asegúrate de estar usando la versión actualizada de los workflows
- Verifica que estás en la rama correcta (los cambios están en la rama actual)

### "El release se creó pero está vacío"
- Verifica que el build se completó exitosamente
- Revisa los logs del paso "Upload to Release"
- Los archivos deben existir en las rutas especificadas

### "Quiero eliminar un release en borrador"
1. Ve a [Releases](https://github.com/Pabelcorn/LOTOLINK/releases)
2. Haz clic en el release en borrador
3. Haz clic en **"Delete"**
4. **Nota**: Esto NO elimina el tag de git

## Mejores Prácticas

1. ✅ Usa **tags** para releases oficiales y públicos
2. ✅ Usa **manual + draft** para testing y pre-releases
3. ✅ Siempre prueba los instaladores antes de publicar un release
4. ✅ Usa nombres de tag consistentes (`v1.0.7`, `mobile-v1.0.7`)
5. ✅ Documenta los cambios en el release notes

## Referencias

- [Documentación de GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [Documentación de softprops/action-gh-release](https://github.com/softprops/action-gh-release)
