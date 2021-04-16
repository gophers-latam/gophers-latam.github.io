# **Gophers LATAM** [Hugo website builder]

# Instalar **Hugo**:

Para poder manejar el generar del sitio statico es necesario instalar el binario hugo en modo extendido. Para opciones de instalación ver la opciones en la [documentación oficial](https://gohugo.io/), por ejemplo en **Linux** sería: [gohugo.io/getting-started/installing/#linux](https://gohugo.io/getting-started/installing/#linux)

# Directorios y uso del contenido:

## **archetypes** 

- es donde se colocan las plantillas de *Markdown* para generación de bases de contenido a editar. 

Un "arquetipo" es un modelo o patrón original que usas como base para otras cosas del mismo tipo. Hugo usa los archivos de la carpeta `archetypes` como modelos cuando se generan nuevas páginas de contenido. Hay uno predeterminado (`default.md`) que coloca un título y una fecha en el archivo y con el estado de borrador en falso.

Se definieron arquetipos para contenido de `post` y `proyectos`.

## **config.toml**

- contiene variables de configuración del sitio que Hugo usa internamente al construir las páginas, pero también usa valores de este archivo en el tema y configuraciones personalizadas de complementos permitidos en Hugo.

## **content**

- almacena todo el contenido del sitio. Puede organizarse el contenido en subdirectorios como los `post`, `proyectos` y videos; por ejemplo. Cada directorio contendría una colección de documentos HTML o Markdown, también recursos internos como imagenes.

### Crear posts:

- Post **simple**: 
```shell
hugo new posts/tercer-post.md
```
- Post **page bundle content**: 
```shell
hugo new posts/cuarto-post/index.md
```

### Crear proyectos:

- Proyecto **simple**: 
```shell
hugo new proyectos/awesomelatam.md
```
- Proyecto **page bundle content**: 
```shell
hugo new proyectos/awesomelatam/index.md
```

-- **simple**: *De esta forma seria incluir archivos multimedia de forma externa.*

-- **page bundle content**: *De esta forma se usarian archivos multimedia internamente en directorio del post.*

## **data**

- contiene archivos de datos en YAML, JSON o TOML. Pueden cargarse estos archivos de datos y extraer sus datos para completar listas u otros aspectos de su sitio.

Se creo una para redes y 
- `redes.json` 

aparte en el tema que se crean intermanente para indexación y busqueda de contenido.

- `search.json`, `list.json`

## **layouts**

- es donde se define la apariencia del sitio. Hay uno por defecto para la pagina de `contacto`, todos los layouts se manejaron en tema con el nombre de ese directorio coincidente que sobrescribe o combina directorio por defecto en raiz.

- `theme/basic/layouts`

## **static** | theme/**static**

- contienen los archivos CSS, JavaScript, imágenes y cualquier otro activo que no haya generado Hugo.

## theme/**assets**

- contienen archivos manipulados para generación de recursos procesados en `./resources`.

## **themes**

- contiene los temas que se descargan o crean. Puede utilizarse la carpeta de `layouts` para anular o ampliar un tema que se haya descargado.

# Comandos necesarios para el sitio:

- Build public sitio: 
```shell
hugo
```
- Limpiar y build public sitio: 
```shell
hugo --cleanDestinationDir

# equivalente, eliminando cache de archivos:

hugo -gc
```
- Limpiar y build minificado public sitio: 
```shell
hugo --cleanDestinationDir --minify
```


- Servidor desarrollo: 
```shell
hugo server
```
- Servidor desarrollo sin cache: 
```shell
hugo server --disableFastRender
```

- Crear tema: 
```shell
hugo new theme nombre-tema
```

- Crear contenido en `content`: 
```shell
hugo new nombre.md
```
- Crear contenido en `content/type`: 
```shell
hugo new type/nombre.md

# ejemplos:

hugo new posts/nombre-post.md

hugo new proyectos/nombre-proyecto.md
```

# Consideraciones:

Para ver Disqus de los comentarios en local usar **localtunnel**:
```shell
npx localtunnel -p 1313

npx: installed 55 in 63.292s
your url is: https://grumpy-turtle-68.localtunnel.me

# -p flag, coincidente con el de hugo server
```

# Publicación del sitio:

- **[gohugo.io/hosting-and-deployment/hosting-on-github/](https://gohugo.io/hosting-and-deployment/hosting-on-github/)**

Sólo subir cambios al repo, el resto es magia de **Github Page** y **Github Action** tomando la rama principal.

## Rediseño:

Versión de nuevo diseño se esta manejando en la rama [redesign](https://github.com/gophers-latam/gophers-latam.github.io/tree/redesing).

<div><hr></div>

# Aportar al sitio

Las aportaciones son bienvenidas y agradecidas. 

- Ya sea haciendo fork y pull request externo, como tambien acercarse al [Discord](https://discord.com/invite/AEarh2kSvn) y ser invitados a [github.com/gophers-latam](https://github.com/gophers-latam) dejando en el canal [📊-github-contrib](https://discord.com/channels/764989185077542942/808708853352235099) del discord, nickname de la url de su perfil de usuario en github.