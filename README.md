# Brilla

Brilla es una app web de diseño en HTML, CSS y JavaScript. Incluye búsqueda y categorías de plantillas, vista previa en un panel lateral, editor de diapositivas y diseños movibles. Los proyectos, páginas, favoritos e imágenes se guardan en `localStorage` en el navegador actual; por ahora no se sincronizan entre dispositivos.

## Abrir en el navegador

Haz doble clic en `abrir-brilla.bat`. Se abrirá Brilla en Chrome, Opera, Edge o el navegador predeterminado. Mantén abierta la ventana del servidor mientras trabajas y presiona Ctrl+C en esa ventana para detenerlo. El servidor local admite rutas como `/categoria/presentacion` y `/editor/[id]`.

## Publicar en GitHub Pages

Sube el contenido de esta carpeta a la rama `main`. El flujo `.github/workflows/pages.yml` publica el sitio al recibir cada cambio. En **Settings → Secrets and variables → Actions**, configura `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` para usar registro e inicio de sesión por correo. El flujo genera `supabase/config.local.js` durante la publicación; ese archivo nunca se guarda en Git. Si solo quieres probar el editor local, puedes dejar esos secretos sin configurar y usar el modo local.

En **Settings → Pages**, selecciona **GitHub Actions** como fuente. Añade la dirección publicada a **Supabase → Authentication → URL Configuration → Redirect URLs** para que los enlaces de confirmación y recuperación vuelvan a Brilla. `404.html` conserva las rutas de categoría y del editor al abrirlas directamente.

## Correo de registro y recuperación

El SMTP de prueba de Supabase tiene límites y no está pensado para enviar a todos los usuarios. Para habilitar correos de forma amplia, configura un proveedor SMTP en **Authentication → SMTP Settings**. Mantén host, usuario, contraseña y remitente en Supabase, nunca en el repositorio. Consulta la [guía oficial de SMTP personalizado](https://supabase.com/docs/guides/auth/auth-smtp).

## Guardado local

Los diseños se guardan en el navegador donde se crearon. Exporta PNG, JPG, PDF o una copia `.brilla.json` desde el editor si necesitas conservarlos o moverlos. Borrar los datos del navegador también puede borrar los proyectos locales.

## Funciones incluidas

- Inicio con búsqueda, chips y formatos: presentaciones, documentos, videos, publicaciones, historias, volantes y documentos de varias páginas.
- Doce plantillas de presentación con portada, páginas de contenido y cierre.
- Categoría `/categoria/presentacion`, filtros de estilo e idioma, vista previa, carrusel de páginas y contenido similar. El editor tiene una ruta directa `/editor/[id]`.
- Editor con texto, tipografías Poppins, Inter y Montserrat, doodles separados, formas, imágenes, colores, undo/redo, páginas adicionales y exportaciones.
- Perfil, favoritos, duplicación y eliminación de proyectos.
