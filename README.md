# Flag Nation - Liga de Tocho Flag Football Querétaro

Sitio web oficial de **Flag Nation**, la liga de tocho bandera (flag football) en Querétaro, México.

## Estructura del Proyecto

- `index.html`: Página principal con carrusel editorial, calendario de la temporada 2026, sección de posiciones y tienda oficial.
- `calendar.html`: Calendario de partidos y rol de juegos.
- `positions.html`: Tabla de posiciones de los equipos.
- `articles.html` y `articles/`: Sección y páginas completas de noticias y crónicas de la liga.
- `store.html`, `clothing/`, `accessories.html`: Catálogo de uniformes, gorras y accesorios oficiales.
- `tickets.html`: Venta de boletos y pases de temporada.
- `contact.html`: Información de contacto para inscripciones y patrocinadores.
- `legal/`: Términos, condiciones y políticas de privacidad.
- `assets/`: Fuentes tipográficas locales e imágenes optimizadas (100% desconectado e independiente de servidores externos).
- `.nojekyll`: Archivo de configuración para compatibilidad total con GitHub Pages.

## Cómo desplegar en GitHub Pages

1. Sube los cambios a tu repositorio de GitHub:
   ```bash
   git add .
   git commit -m "Sitio web Flag Nation adaptado para GitHub Pages y 100% desconectado"
   git push origin main
   ```
2. En tu repositorio de GitHub en el navegador, ve a **Settings** > **Pages**.
3. En **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **main** (o `master`) / **(root)**.
4. Haz clic en **Save**. En un par de minutos tu sitio estará en línea en `https://<tu-usuario>.github.io/Flag-Nation/`.