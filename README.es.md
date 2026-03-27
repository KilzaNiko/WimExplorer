🌐 **[English](README.md)** | **Español**

# WimExplorer

<p align="center">
  <img src="recursos/logo_wme.png" alt="Logo de WimExplorer" width="110">
</p>

<p align="center">
  <strong>Editor visual para archivos WIM, ESD y SWM en Windows</strong><br>
  Explora, extrae, agrega, reemplaza y elimina contenido sin pelearte con la linea de comandos.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.3-0f172a?style=for-the-badge" alt="v1.3">
  <img src="https://img.shields.io/badge/Windows-7%20%7C%2010%20%7C%2011-0f172a?style=for-the-badge&logo=windows&logoColor=white" alt="Windows">
  <img src="https://img.shields.io/badge/Node.js-18%2B-166534?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js 18+">
  <img src="https://img.shields.io/badge/wimlib-integrado-1d4ed8?style=for-the-badge" alt="wimlib">
  <img src="https://img.shields.io/badge/7--Zip-requerido-9a3412?style=for-the-badge" alt="7-Zip">
</p>

---

## Que es WimExplorer

WimExplorer es una interfaz visual para trabajar con imagenes `.wim`, `.esd` y `.swm` usando `wimlib-imagex` como motor de fondo. La idea es simple: hacer que editar este tipo de archivos sea rapido, claro y comodo, incluso si no quieres recordar comandos, parametros o flujos manuales.

Si alguna vez abrir, inspeccionar o modificar una imagen WIM te resulto tedioso, esta herramienta busca eliminar esa friccion.

## Por que destaca

| Ventaja | Que significa en la practica |
|---|---|
| Interfaz visual real | Navegas carpetas y archivos con arbol, tabla, breadcrumb y acciones directas |
| Operaciones comunes en un clic | Extraer, agregar, reemplazar y eliminar sin escribir comandos |
| Pensado para trabajo real | Deteccion de conflictos, logs en vivo, selector de imagen y bandeja del sistema |
| Motor confiable | Todas las operaciones pasan por `wimlib-imagex`, manteniendo compatibilidad con el formato |
| Launcher inteligente | Verifica requisitos automaticamente antes de iniciar la aplicacion |

## Caracteristicas principales

| Funcion | Descripcion |
|---|---|
| Explorador visual | Vista tipo Explorador de Windows con arbol de carpetas y tabla de contenido |
| Multi-imagen | Selector para WIM con varias imagenes internas |
| Extraccion selectiva | Exporta archivos o carpetas a cualquier ruta del sistema |
| Agregar contenido | Importa archivos o carpetas completas desde botones o arrastrando y soltando |
| Reemplazo de archivos | Sustituye elementos existentes de forma directa |
| Eliminacion segura | Confirmacion visual antes de borrar contenido |
| Deteccion de conflictos | Detecta duplicados antes de importar y permite decidir como continuar |
| Logs en tiempo real | Consola con streaming en vivo para seguir cada operacion |
| Terminal integrada | Ejecuta comandos de `wimlib-imagex` desde la propia interfaz |
| Integracion con 7-Zip | Obtiene metadatos como tamano y fecha para mejorar el listado |
| Bandeja del sistema | Acceso rapido y cierre controlado desde el area de notificacion |

## Inicio rapido

1. Ejecuta `WimExplorer-v1.3.exe`.
2. El launcher verificara automaticamente los requisitos del sistema.
3. La aplicacion iniciara el servidor local y abrira `http://localhost:3000`.
4. Selecciona tu archivo `.wim`, `.esd` o `.swm`.
5. Empieza a navegar y editar desde la interfaz.

## Launcher inteligente (v1.3)

`WimExplorer-v1.3.exe` es el unico punto de entrada para el usuario. Al ejecutarlo realiza estas verificaciones antes de iniciar:

### 1. Verificacion de Node.js

Si Node.js no esta instalado, el launcher muestra un dialogo con tres opciones:

| Opcion | Accion |
|---|---|
| Si | Instalacion automatica via `winget` (solicita permisos de administrador) |
| No | Abre `https://nodejs.org` para instalacion manual |
| Cancelar | Sale sin hacer nada |

Tras la instalacion automatica, el launcher re-verifica que Node quedo disponible antes de continuar.

### 2. Instalacion de dependencias

Si la carpeta `node_modules` no existe (primera ejecucion tras descomprimir el release), el launcher pregunta al usuario y ejecuta `npm install` automaticamente en la ruta correcta.

### 3. Inicio de la aplicacion

Con todos los requisitos cumplidos, lanza `node server.js` en segundo plano sin mostrar consola.

> El launcher resuelve todas las rutas en tiempo de ejecucion a partir de su propia ubicacion. La carpeta completa puede moverse a cualquier equipo o ruta sin que deje de funcionar.

## Flujo de uso recomendado

```text
Ejecutar WimExplorer-v1.3.exe
-> Launcher verifica Node.js (instala si falta)
-> Launcher verifica node_modules (instala si faltan)
-> Cargar archivo WIM/ESD/SWM
-> Elegir imagen interna si aplica
-> Explorar carpetas y archivos
-> Extraer / Agregar / Reemplazar / Eliminar
-> Revisar logs en tiempo real
-> Cerrar desde la interfaz o la bandeja del sistema
```

## Requisitos

- Windows 7, 10 u 11
- Node.js 18 o superior *(el launcher puede instalarlo automaticamente)*
- 7-Zip instalado

### Nota sobre 7-Zip

WimExplorer necesita `7z.exe` para enriquecer el listado de archivos. Si no lo encuentra, la aplicacion intenta ayudarte con una instalacion via `winget` o permitiendo indicar la ruta manualmente.

## Interfaz y experiencia

La aplicacion esta construida con una UI oscura de estilo moderno, con:

- panel de arbol lateral para la estructura
- tabla de contenido con nombre, tamano, fecha y tipo
- breadcrumb de navegacion
- barra de acciones inferior
- consola de logs y terminal integrada
- indicadores de estado para `wimlib` y `7-Zip`

## Atajos utiles

| Atajo | Accion |
|---|---|
| `Enter` | Abrir archivo WIM cuando el campo de ruta tiene foco |
| `Delete` | Eliminar elementos seleccionados |
| `Ctrl + A` | Seleccionar todos los archivos visibles |
| `Esc` | Cerrar modales y menus contextuales |
| Doble clic | Entrar en una carpeta |
| Clic derecho | Abrir menu contextual |
| Arrastrar y soltar | Importar archivos o carpetas |

## Tecnologias

- Backend: Node.js + Express
- Frontend: HTML, CSS y JavaScript vanilla
- Motor de imagenes: `wimlib-imagex`
- Soporte de listado avanzado: `7-Zip`
- Dependencias destacadas: `multer`, `open`, `systray2`, `7zip-bin`

## Licencias y terceros

WimExplorer utiliza `wimlib` como motor principal para trabajar con imagenes WIM.

- `wimlib` se redistribuye con sus textos de licencia dentro de `LICENSES/`
- el archivo [LICENSES/wimlib-COPYING.txt](LICENSES/wimlib-COPYING.txt) resume las condiciones de licencia del proyecto `wimlib`
- el texto de GPLv3 se incluye en [LICENSES/wimlib-COPYING.GPLv3.txt](LICENSES/wimlib-COPYING.GPLv3.txt)
- el texto de LGPL se incluye en [LICENSES/wimlib-COPYING.LGPL.txt](LICENSES/wimlib-COPYING.LGPL.txt)

Nota importante:

- `wimlib` en conjunto puede redistribuirse bajo GPLv3 o posterior
- `libwim` puede ofrecer una opcion LGPL en algunos casos, pero para `wimlib-imagex.exe` la referencia principal que debes conservar es la documentacion de `wimlib` incluida en `LICENSES/`
- si distribuyes WimExplorer junto con los binarios de `wimlib`, conviene mantener siempre estos archivos de licencia dentro del repositorio y tambien en cualquier paquete de distribucion

## Estructura del proyecto

```text
WimExplorer/
|-- WimExplorer-v1.3.exe     # Launcher principal (unica entrada para el usuario)
|-- README.md
|-- LICENSES/
|   |-- wimlib-COPYING.txt
|   |-- wimlib-COPYING.GPLv3.txt
|   `-- wimlib-COPYING.LGPL.txt
|-- wimlib/
|   |-- wimlib-imagex.exe    # Motor de gestion WIM
|   `-- libwim-15.dll
`-- recursos/
    |-- server.js            # Backend Express
    |-- start.vbs            # Fuente del launcher (compilada en el .exe)
    |-- start.bat            # Inicio alternativo para desarrollo
    |-- package.json
    |-- logo_wme.ico         # Icono del launcher
    |-- logo_wme.png
    |-- public/              # Interfaz web
    |   |-- index.html
    |   |-- app.js
    |   `-- styles.css
    `-- node_modules/        # Instalado automaticamente por el launcher
```

## Notas importantes

- La aplicacion trabaja sobre el formato real usando `wimlib-imagex`; no inventa un formato intermedio.
- La carpeta puede moverse de lugar. El launcher resuelve todas las rutas en tiempo de ejecucion.
- El proyecto esta orientado a Windows y a un uso local en `localhost:3000`.
- Si redistribuyes la aplicacion con `wimlib`, incluye tambien la carpeta `LICENSES/` y conserva la atribucion correspondiente.

## Ideal para

- editar imagenes de instalacion de Windows
- inspeccionar contenido de archivos WIM sin usar consola
- reemplazar o extraer archivos concretos rapidamente
- trabajar mas comodo con imagenes multi-indice

---

<p align="center">
  <strong>WimExplorer v1.3</strong><br>
  Edicion visual de imagenes WIM con una experiencia mas clara, rapida y amigable.
</p>
