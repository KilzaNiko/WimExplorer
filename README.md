# WimExplorer

🌐 Language: [English](#english) | [Español](#espanol)

<p align="center">
  <img src="recursos/logo_wme.png" alt="WimExplorer Logo" width="110">
</p>

<p align="center">
  <strong>Visual editor for WIM, ESD and SWM files on Windows</strong><br>
  Browse, extract, add, replace and delete content without fighting with the command line.<br><br>
  <strong>Editor visual para archivos WIM, ESD y SWM en Windows</strong><br>
  Explora, extrae, agrega, reemplaza y elimina contenido sin pelearte con la línea de comandos.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.3-0f172a?style=for-the-badge" alt="v1.3">
  <img src="https://img.shields.io/badge/Windows-7%20%7C%2010%20%7C%2011-0f172a?style=for-the-badge&logo=windows&logoColor=white" alt="Windows">
  <img src="https://img.shields.io/badge/Node.js-18%2B-166534?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js 18+">
  <img src="https://img.shields.io/badge/wimlib-bundled-1d4ed8?style=for-the-badge" alt="wimlib">
  <img src="https://img.shields.io/badge/7--Zip-required-9a3412?style=for-the-badge" alt="7-Zip">
</p>

---

<a id="english"></a>

## English

Jump to: [Español](#espanol)

### What is WimExplorer

WimExplorer is a visual interface for working with `.wim`, `.esd` and `.swm` images using `wimlib-imagex` as a backend engine. The idea is simple: make editing these file types fast, clear and comfortable, even if you do not want to remember commands, parameters or manual workflows.

If opening, inspecting or modifying a WIM image has ever felt tedious, this tool aims to remove that friction.

### Why it stands out

| Advantage | What it means in practice |
|---|---|
| Real visual interface | Browse folders and files with a tree, table, breadcrumb and direct actions |
| Common operations in one click | Extract, add, replace and delete without writing commands |
| Built for real work | Conflict detection, live logs, image selector and system tray |
| Reliable engine | All operations go through `wimlib-imagex`, maintaining format compatibility |
| Smart launcher | Automatically verifies requirements before starting the application |

### Key features

| Feature | Description |
|---|---|
| Visual explorer | Windows Explorer-style view with folder tree and content table |
| Multi-image | Selector for WIM files with multiple internal images |
| Selective extraction | Export files or folders to any system path |
| Add content | Import files or folders via buttons or drag-and-drop |
| File replacement | Replace existing items directly |
| Safe deletion | Visual confirmation before deleting content |
| Conflict detection | Detects duplicates before importing and lets you decide how to proceed |
| Real-time logs | Console with live streaming to follow every operation |
| Built-in terminal | Run `wimlib-imagex` commands from the interface itself |
| 7-Zip integration | Gets metadata like size and date to enhance the file listing |
| System tray | Quick access and controlled shutdown from the notification area |

### Quick start

1. Run `WimExplorer-v1.3.exe`.
2. The launcher will automatically verify system requirements.
3. The application will start the local server and open `http://localhost:3000`.
4. Select your `.wim`, `.esd` or `.swm` file.
5. Start browsing and editing from the interface.

### Smart launcher (v1.3)

`WimExplorer-v1.3.exe` is the only user entry point. Before starting the app, it performs these checks:

#### 1. Node.js check

If Node.js is not installed, the launcher shows a dialog with three options:

| Option | Action |
|---|---|
| Yes | Automatic installation via `winget` (requests administrator permissions) |
| No | Opens `https://nodejs.org` for manual installation |
| Cancel | Exits without doing anything |

After automatic installation, the launcher verifies that Node is available before continuing.

#### 2. Dependency installation

If the `node_modules` folder does not exist, the launcher asks the user and runs `npm install` automatically in the correct path.

#### 3. Application startup

With all requirements met, it launches `node server.js` in the background without showing a console window.

> The launcher resolves all paths at runtime based on its own location. The full folder can be moved anywhere and it will keep working.

### Recommended workflow

```text
Run WimExplorer-v1.3.exe
-> Launcher checks Node.js (installs if missing)
-> Launcher checks node_modules (installs if missing)
-> Load WIM/ESD/SWM file
-> Choose internal image if applicable
-> Browse folders and files
-> Extract / Add / Replace / Delete
-> Review real-time logs
-> Close from the interface or the system tray
```

### Requirements

- Windows 7, 10 or 11
- Node.js 18 or higher
- 7-Zip installed

#### Note about 7-Zip

WimExplorer needs `7z.exe` to enrich file listings. If it cannot find it, the application helps with installation via `winget` or lets you specify the path manually.

### Interface and experience

The application includes:

- side tree panel for structure
- content table with name, size, date and type
- navigation breadcrumb
- bottom action bar
- log console and built-in terminal
- status indicators for `wimlib` and `7-Zip`
- EN/ES language toggle

### Useful shortcuts

| Shortcut | Action |
|---|---|
| `Enter` | Open WIM file when the path field has focus |
| `Delete` | Delete selected items |
| `Ctrl + A` | Select all visible files |
| `Esc` | Close modals and context menus |
| Double click | Enter a folder |
| Right click | Open context menu |
| Drag and drop | Import files or folders |

### Technologies

- Backend: Node.js + Express
- Frontend: HTML, CSS and vanilla JavaScript
- Image engine: `wimlib-imagex`
- Advanced listing support: `7-Zip`
- Notable dependencies: `multer`, `open`, `systray2`, `7zip-bin`

### Licenses and third parties

WimExplorer uses `wimlib` as the main engine for working with WIM images.

- `wimlib` is redistributed with its license texts inside `LICENSES/`
- [LICENSES/wimlib-COPYING.txt](LICENSES/wimlib-COPYING.txt) summarizes the license terms of the `wimlib` project
- [LICENSES/wimlib-COPYING.GPLv3.txt](LICENSES/wimlib-COPYING.GPLv3.txt) includes the GPLv3 text
- [LICENSES/wimlib-COPYING.LGPL.txt](LICENSES/wimlib-COPYING.LGPL.txt) includes the LGPL text

Important note:

- `wimlib` as a whole can be redistributed under GPLv3 or later
- `libwim` may offer an LGPL option in some cases, but for `wimlib-imagex.exe` the main reference is the `wimlib` documentation included in `LICENSES/`
- if you distribute WimExplorer with the `wimlib` binaries, keep these license files in the repository and in any distribution package

### Project structure

```text
WimExplorer/
|-- WimExplorer-v1.3.exe     # Main launcher
|-- README.md                # Bilingual documentation
|-- LICENSES/
|   |-- wimlib-COPYING.txt
|   |-- wimlib-COPYING.GPLv3.txt
|   `-- wimlib-COPYING.LGPL.txt
|-- wimlib/
|   |-- wimlib-imagex.exe    # WIM management engine
|   `-- libwim-15.dll
`-- recursos/
    |-- server.js            # Express backend
    |-- start.vbs            # Launcher source (compiled into the .exe)
    |-- start.bat            # Alternative start for development
    |-- package.json
    |-- logo_wme.ico         # Launcher icon
    |-- logo_wme.png
    |-- public/              # Web interface
    |   |-- index.html
    |   |-- app.js
    |   |-- i18n.js          # EN/ES internationalization system
    |   `-- styles.css
    `-- node_modules/        # Automatically installed by the launcher
```

### Important notes

- The application works on the real format using `wimlib-imagex`; it does not invent an intermediate format.
- The folder can be moved anywhere. The launcher resolves all paths at runtime.
- The project is Windows-oriented and runs locally on `localhost:3000`.
- If you redistribute the application with `wimlib`, also include the `LICENSES/` folder and keep the corresponding attribution.

### Ideal for

- editing Windows installation images
- inspecting WIM contents without using a console
- quickly replacing or extracting specific files
- working more comfortably with multi-index images

---

<a id="espanol"></a>

## Español

Ir a: [English](#english)

### Qué es WimExplorer

WimExplorer es una interfaz visual para trabajar con imágenes `.wim`, `.esd` y `.swm` usando `wimlib-imagex` como motor de fondo. La idea es simple: hacer que editar este tipo de archivos sea rápido, claro y cómodo, incluso si no quieres recordar comandos, parámetros o flujos manuales.

Si alguna vez abrir, inspeccionar o modificar una imagen WIM te resultó tedioso, esta herramienta busca eliminar esa fricción.

### Por qué destaca

| Ventaja | Qué significa en la práctica |
|---|---|
| Interfaz visual real | Navegas carpetas y archivos con árbol, tabla, breadcrumb y acciones directas |
| Operaciones comunes en un clic | Extraer, agregar, reemplazar y eliminar sin escribir comandos |
| Pensado para trabajo real | Detección de conflictos, logs en vivo, selector de imagen y bandeja del sistema |
| Motor confiable | Todas las operaciones pasan por `wimlib-imagex`, manteniendo compatibilidad con el formato |
| Launcher inteligente | Verifica requisitos automáticamente antes de iniciar la aplicación |

### Características principales

| Función | Descripción |
|---|---|
| Explorador visual | Vista tipo Explorador de Windows con árbol de carpetas y tabla de contenido |
| Multi-imagen | Selector para WIM con varias imágenes internas |
| Extracción selectiva | Exporta archivos o carpetas a cualquier ruta del sistema |
| Agregar contenido | Importa archivos o carpetas desde botones o arrastrando y soltando |
| Reemplazo de archivos | Sustituye elementos existentes de forma directa |
| Eliminación segura | Confirmación visual antes de borrar contenido |
| Detección de conflictos | Detecta duplicados antes de importar y permite decidir cómo continuar |
| Logs en tiempo real | Consola con streaming en vivo para seguir cada operación |
| Terminal integrada | Ejecuta comandos de `wimlib-imagex` desde la propia interfaz |
| Integración con 7-Zip | Obtiene metadatos como tamaño y fecha para mejorar el listado |
| Bandeja del sistema | Acceso rápido y cierre controlado desde el área de notificación |

### Inicio rápido

1. Ejecuta `WimExplorer-v1.3.exe`.
2. El launcher verificará automáticamente los requisitos del sistema.
3. La aplicación iniciará el servidor local y abrirá `http://localhost:3000`.
4. Selecciona tu archivo `.wim`, `.esd` o `.swm`.
5. Empieza a navegar y editar desde la interfaz.

### Launcher inteligente (v1.3)

`WimExplorer-v1.3.exe` es el único punto de entrada para el usuario. Al ejecutarlo realiza estas verificaciones antes de iniciar:

#### 1. Verificación de Node.js

Si Node.js no está instalado, el launcher muestra un diálogo con tres opciones:

| Opción | Acción |
|---|---|
| Sí | Instalación automática vía `winget` (solicita permisos de administrador) |
| No | Abre `https://nodejs.org` para instalación manual |
| Cancelar | Sale sin hacer nada |

Tras la instalación automática, el launcher vuelve a verificar que Node quedó disponible antes de continuar.

#### 2. Instalación de dependencias

Si la carpeta `node_modules` no existe, el launcher pregunta al usuario y ejecuta `npm install` automáticamente en la ruta correcta.

#### 3. Inicio de la aplicación

Con todos los requisitos cumplidos, lanza `node server.js` en segundo plano sin mostrar consola.

> El launcher resuelve todas las rutas en tiempo de ejecución a partir de su propia ubicación. La carpeta completa puede moverse a cualquier equipo o ruta sin dejar de funcionar.

### Flujo de uso recomendado

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

### Requisitos

- Windows 7, 10 u 11
- Node.js 18 o superior
- 7-Zip instalado

#### Nota sobre 7-Zip

WimExplorer necesita `7z.exe` para enriquecer el listado de archivos. Si no lo encuentra, la aplicación intenta ayudarte con una instalación vía `winget` o permitiendo indicar la ruta manualmente.

### Interfaz y experiencia

La aplicación incluye:

- panel de árbol lateral para la estructura
- tabla de contenido con nombre, tamaño, fecha y tipo
- breadcrumb de navegación
- barra de acciones inferior
- consola de logs y terminal integrada
- indicadores de estado para `wimlib` y `7-Zip`
- selector de idioma EN/ES

### Atajos útiles

| Atajo | Acción |
|---|---|
| `Enter` | Abrir archivo WIM cuando el campo de ruta tiene foco |
| `Delete` | Eliminar elementos seleccionados |
| `Ctrl + A` | Seleccionar todos los archivos visibles |
| `Esc` | Cerrar modales y menús contextuales |
| Doble clic | Entrar en una carpeta |
| Clic derecho | Abrir menú contextual |
| Arrastrar y soltar | Importar archivos o carpetas |

### Tecnologías

- Backend: Node.js + Express
- Frontend: HTML, CSS y JavaScript vanilla
- Motor de imágenes: `wimlib-imagex`
- Soporte de listado avanzado: `7-Zip`
- Dependencias destacadas: `multer`, `open`, `systray2`, `7zip-bin`

### Licencias y terceros

WimExplorer utiliza `wimlib` como motor principal para trabajar con imágenes WIM.

- `wimlib` se redistribuye con sus textos de licencia dentro de `LICENSES/`
- [LICENSES/wimlib-COPYING.txt](LICENSES/wimlib-COPYING.txt) resume las condiciones de licencia del proyecto `wimlib`
- [LICENSES/wimlib-COPYING.GPLv3.txt](LICENSES/wimlib-COPYING.GPLv3.txt) incluye el texto GPLv3
- [LICENSES/wimlib-COPYING.LGPL.txt](LICENSES/wimlib-COPYING.LGPL.txt) incluye el texto LGPL

Nota importante:

- `wimlib` en conjunto puede redistribuirse bajo GPLv3 o posterior
- `libwim` puede ofrecer una opción LGPL en algunos casos, pero para `wimlib-imagex.exe` la referencia principal es la documentación de `wimlib` incluida en `LICENSES/`
- si distribuyes WimExplorer junto con los binarios de `wimlib`, conserva estos archivos de licencia dentro del repositorio y también en cualquier paquete de distribución

### Estructura del proyecto

```text
WimExplorer/
|-- WimExplorer-v1.3.exe     # Launcher principal
|-- README.md                # Documentación bilingüe
|-- LICENSES/
|   |-- wimlib-COPYING.txt
|   |-- wimlib-COPYING.GPLv3.txt
|   `-- wimlib-COPYING.LGPL.txt
|-- wimlib/
|   |-- wimlib-imagex.exe    # Motor de gestión WIM
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
    |   |-- i18n.js          # Sistema de internacionalización EN/ES
    |   `-- styles.css
    `-- node_modules/        # Instalado automáticamente por el launcher
```

### Notas importantes

- La aplicación trabaja sobre el formato real usando `wimlib-imagex`; no inventa un formato intermedio.
- La carpeta puede moverse de lugar. El launcher resuelve todas las rutas en tiempo de ejecución.
- El proyecto está orientado a Windows y a un uso local en `localhost:3000`.
- Si redistribuyes la aplicación con `wimlib`, incluye también la carpeta `LICENSES/` y conserva la atribución correspondiente.

### Ideal para

- editar imágenes de instalación de Windows
- inspeccionar contenido WIM sin usar consola
- reemplazar o extraer archivos concretos rápidamente
- trabajar más cómodo con imágenes multiíndice

---

<p align="center">
  <strong>WimExplorer v1.3</strong><br>
  Visual WIM image editing with a clearer, faster and friendlier experience.<br>
  Edición visual de imágenes WIM con una experiencia más clara, rápida y amigable.
</p>
