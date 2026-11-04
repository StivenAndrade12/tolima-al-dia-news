# Tolima Al Dia News

Rol y Objetivo: Crea una aplicación web completa (Full-Stack) de un portal de noticias digitales para una emisora de radio institucional en el Tolima, inspirada en el diseño limpio y editorial de elcronista.co/destacadas. El sitio debe estar completamente en español, ser 100% responsivo (móvil y escritorio) y contar con una interfaz pública de lectura y un Panel de Administración (CMS) privado.

1. Diseño Visual y Estructura Pública:

Estilo: Editorial moderno, fondo blanco/gris muy claro, tipografía serif o sans-serif de alta legibilidad para periodismo, con acentos de color institucionales (vinotinto y dorado suave, representativos del Tolima, combinados con gris oscuro).

Header (Encabezado): Logo de la emisora/medio a la izquierda, barra de búsqueda funcional y una barra de navegación principal fija (sticky) con exactamente estas 5 pestañas:

Inicio (Muestra todas las noticias recientes y destacadas)

Regional (Noticias del Tolima)

Colombia (Noticias nacionales)

Mundo (Noticias internacionales)

Deportes

Reproductor de Radio (Opcional visual): Un pequeño botón o barra discreta en la esquina superior que diga "Radio en Vivo" (preparado para enlazar un stream de audio en el futuro).

Vista de Listado de Noticias (Estilo El Cronista):

Una noticia destacada grande en la parte superior del Inicio.

Debajo, una cuadrícula (Grid de 3 columnas en escritorio, 1 en móvil) de tarjetas de noticias.

Cada tarjeta debe mostrar: Imagen de portada con proporción 16:9 (con efecto zoom suave al pasar el mouse), etiqueta pequeña de la categoría (Regional, Deportes, etc.), Título de la noticia en negrita, fecha de publicación (ej. "04 de Nov, 2026") y un resumen corto de 2 líneas.

Paginación numérica en la parte inferior o botón de "Cargar más noticias".

2. Vista de Detalle de la Noticia (Al hacer clic en una tarjeta):

Título grande de la noticia, categoría, fecha de publicación y autor/redactor.

Imagen principal en alta calidad.

Cuerpo de la noticia bien formateado (párrafos claros, subtítulos).

Soporte Multimedia: Si la noticia incluye galería de imágenes adicionales, mostrarlas en un carrusel o cuadrícula. Si incluye un video (enlace de YouTube, Facebook, TikTok o archivo MP4), mostrar el reproductor de video incrustado (embed) de forma responsiva dentro del artículo.

Botones para compartir en WhatsApp, Facebook y X.

Sección inferior de "Noticias Relacionadas" de la misma categoría.

3. Panel de Administración (CMS para el cliente):

Ruta protegida (/admin) con pantalla de inicio de sesión (correo y contraseña).

Dashboard principal: Lista en tabla de todas las noticias publicadas con buscador, filtro por categoría (Regional, Colombia, Mundo, Deportes) y botones de acción rápida para Editar o Eliminar cada noticia.

Formulario de "Crear / Editar Noticia": Debe ser sumamente fácil de usar para alguien no técnico. Debe incluir:

Campo para el Título de la noticia.

Selector desplegable para la Categoría (Regional, Colombia, Mundo, Deportes).

Casilla (checkbox) para marcar si es "Noticia Destacada" (para que aparezca de primera en la portada).

Subida de Imagen Principal (permitiendo subir archivo desde el computador/celular o pegar URL) y opción para agregar imágenes secundarias.

Campo para Video (Opcional): Un campo donde pueda pegar un link de YouTube/Facebook/X y que el sistema lo convierta automáticamente en un video embebido en la noticia, o subir un video corto.

Editor de texto enriquecido (o área de texto clara) para el Contenido/Cuerpo de la noticia.

Botón grande de "Publicar Noticia".

4. Datos Iniciales (Mock Data):

Precarga el portal con 8 noticias de ejemplo distribuidas en las 4 categorías (Regional, Colombia, Mundo, Deportes) con imágenes de prueba reales (Unsplash) y fechas actuales para que el diseño se vea lleno y funcional desde el primer momento.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://tolima-al-dia-news.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bb5ffd2c-1ac4-4fbf-b96c-7a815749d897).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
