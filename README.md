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

## Panel administrativo con Firebase

El panel está en `admin/index.html`. Es privado por autenticación y reglas de Firestore; no se debe enlazar desde el menú público.

### Configuración inicial

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/) y registra una aplicación web.
2. En **Authentication > Sign-in method**, activa **Google** y agrega el dominio de GitHub Pages en los dominios autorizados.
3. Crea una base de datos **Cloud Firestore**.
4. Publica las reglas de [firestore.rules](firestore.rules). Desde Firebase Console puedes pegarlas manualmente; después, con Firebase CLI, usa `firebase deploy --only firestore:rules`.
5. Copia el objeto de configuración de la app web en [admin/firebase-config.js](admin/firebase-config.js). La configuración web identifica el proyecto; no sustituye las reglas de seguridad.
6. Inicia sesión una vez en `admin/` y copia el UID mostrado por Firebase Authentication. En Firestore crea el documento `admins/<UID>` con, por ejemplo, `{ "email": "tu-correo@dominio.com" }`. Este primer alta se hace desde la consola de Firebase; a partir de ahí las reglas permiten a un administrador gestionar accesos.
7. Abre `admin/`, inicia sesión y usa **Cargar predefinidos** para registrar los equipos iniciales. Luego podrás crear partidos, actualizar horarios, estados y marcadores.

### Modelo de datos

- `teams/{teamId}`: nombre, abreviatura, escudo y estado activo.
- `games/{gameId}`: fecha, equipos, marcador, estado, sede y visibilidad pública.
- `admins/{uid}`: rol que habilita escritura administrativa.

Nunca subas `admin/firebase-config.local.js`; ya está ignorado por Git.
