# Brilla

Prototipo de diseño en HTML/CSS/JavaScript. Sin Supabase configurado, perfiles y diseños se guardan en el navegador. Con Supabase configurado, la interfaz usa Auth y sincroniza los proyectos con una tabla privada por cuenta.

## Abrir en el navegador

Haz doble clic en `abrir-brilla.bat`. Se abrirá Brilla en el navegador predeterminado de Windows; sirve en Chrome, Opera y Edge. Mantén abierta la ventana del servidor mientras trabajas y presiona Ctrl+C en esa ventana para detenerlo. Si Windows tiene otro navegador predeterminado, copia la dirección local que aparece en la ventana del servidor y ábrela en el navegador que prefieras.

## Publicar en GitHub Pages

La carpeta ya contiene un flujo de publicación en `.github/workflows/pages.yml`. Para activarlo, crea un repositorio GitHub y sube el contenido de esta carpeta a la rama `main`. En **Settings → Secrets and variables → Actions**, agrega `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY`. En **Settings → Pages**, elige **GitHub Actions** como fuente. Cada actualización de `main` publicará el sitio; GitHub muestra la dirección final en la ejecución del flujo. Después añade esa dirección a **Authentication → URL Configuration** en Supabase. La clave se inserta desde los secretos al publicar; `config.local.js` permanece fuera de Git.

## Preparar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com/).
2. Abre **SQL Editor** y ejecuta `supabase/schema.sql`.
3. En **Project Settings → API Keys**, copia la URL del proyecto y su clave `publishable`.
4. Copia `supabase/config.js` como `supabase/config.local.js` y completa los dos valores. El archivo local está excluido de Git; nunca incluyas una clave `service_role`.
5. Sirve la carpeta con VS Code Live Server o un host web. No abras el HTML como archivo `file://` para probar el acceso.
6. Añade el dominio de prueba en **Authentication → URL Configuration → Redirect URLs** y configura el envío de confirmación de correo. Para el servidor local de Brilla, permite `http://127.0.0.1:5187/**` hasta `http://127.0.0.1:5199/**`; el puerto elegido depende de cuáles estén libres. Añade también el dominio publicado. Estos permisos permiten que el enlace de recuperación vuelva a Brilla.

### Correo para usuarios

El SMTP de prueba de Supabase sirve para probar flujos y tiene límites; no es el envío recomendado para usuarios reales. Para habilitar confirmaciones y recuperación de contraseña para todos, configura un proveedor SMTP en **Authentication → SMTP Settings** en Supabase. Introduce allí el host, puerto, usuario, contraseña y remitente que proporcione el servicio de correo. Mantén esos datos en Supabase y no los pongas en `config.local.js` ni en Git. [Guía oficial de SMTP personalizado](https://supabase.com/docs/guides/auth/auth-smtp).

La tabla `designs` y el bucket privado `design-assets` usan políticas para que cada cuenta solo pueda leer y modificar sus propios datos. Vuelve a ejecutar `supabase/schema.sql` para crear el bucket y sus políticas. Al iniciar sesión, los diseños locales se importan si la cuenta cloud aún no tiene proyectos. Las imágenes se comprimen y se guardan en Storage; el documento conserva solo su ruta.

## Estado actual

El editor incluye texto, formas e imágenes movibles y redimensionables, capas, controles de fuente/alineación/color, historial, plantillas adicionales y exportación a PNG, JPG y PDF. La interfaz incluye alta e inicio de sesión por correo y contraseña, recuperación de contraseña por correo, carga y sincronización de diseños, perfil, cierre de sesión y guardado privado de imágenes cuando la configuración está completa. El modo local sigue disponible sin credenciales. Para publicar el sitio todavía falta aplicar el SQL actualizado, comprobar el flujo con tu proyecto y desplegarlo en un dominio.

