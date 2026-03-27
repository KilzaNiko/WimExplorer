🌐 **English** | **[Español](README.es.md)**

# WimExplorer

<p align="center">
  <img src="recursos/logo_wme.png" alt="WimExplorer Logo" width="110">
</p>

<p align="center">
  <strong>Visual editor for WIM, ESD and SWM files on Windows</strong><br>
  Browse, extract, add, replace and delete content without fighting with the command line.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.2-0f172a?style=for-the-badge" alt="v1.2">
  <img src="https://img.shields.io/badge/Windows-7%20%7C%2010%20%7C%2011-0f172a?style=for-the-badge&logo=windows&logoColor=white" alt="Windows">
  <img src="https://img.shields.io/badge/Node.js-18%2B-166534?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js 18+">
  <img src="https://img.shields.io/badge/wimlib-bundled-1d4ed8?style=for-the-badge" alt="wimlib">
  <img src="https://img.shields.io/badge/7--Zip-required-9a3412?style=for-the-badge" alt="7-Zip">
</p>

---

## What is WimExplorer

WimExplorer is a visual interface for working with `.wim`, `.esd` and `.swm` images using `wimlib-imagex` as a backend engine. The idea is simple: make editing these file types fast, clear and comfortable, even if you don't want to remember commands, parameters or manual workflows.

If you've ever found opening, inspecting or modifying a WIM image tedious, this tool aims to eliminate that friction.

## Why it stands out

| Advantage | What it means in practice |
|---|---|
| Real visual interface | Browse folders and files with a tree, table, breadcrumb and direct actions |
| Common operations in one click | Extract, add, replace and delete without writing commands |
| Built for real work | Conflict detection, live logs, image selector and system tray |
| Reliable engine | All operations go through `wimlib-imagex`, maintaining format compatibility |
| Smart launcher | Automatically verifies requirements before starting the application |

## Key features

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

## Quick start

1. Run `WimExplorer-v1.2.exe`.
2. The launcher will automatically verify system requirements.
3. The application will start the local server and open `http://localhost:3000`.
4. Select your `.wim`, `.esd` or `.swm` file.
5. Start browsing and editing from the interface.

## Smart Launcher (v1.2)

`WimExplorer-v1.2.exe` is the only entry point for the user. When run, it performs these checks before starting:

### 1. Node.js check

If Node.js is not installed, the launcher shows a dialog with three options:

| Option | Action |
|---|---|
| Yes | Automatic installation via `winget` (requests administrator permissions) |
| No | Opens `https://nodejs.org` for manual installation |
| Cancel | Exits without doing anything |

After automatic installation, the launcher re-verifies that Node is available before continuing.

### 2. Dependency installation

If the `node_modules` folder doesn't exist (first run after extracting the release), the launcher asks the user and runs `npm install` automatically at the correct path.

### 3. Application startup

With all requirements met, it launches `node server.js` in the background without showing a console window.

> The launcher resolves all paths at runtime based on its own location. The entire folder can be moved to any machine or path and it will continue to work.

## Recommended workflow

```text
Run WimExplorer-v1.2.exe
-> Launcher checks Node.js (installs if missing)
-> Launcher checks node_modules (installs if missing)
-> Load WIM/ESD/SWM file
-> Choose internal image if applicable
-> Browse folders and files
-> Extract / Add / Replace / Delete
-> Review real-time logs
-> Close from the interface or the system tray
```

## Requirements

- Windows 7, 10 or 11
- Node.js 18 or higher *(the launcher can install it automatically)*
- 7-Zip installed

### Note about 7-Zip

WimExplorer needs `7z.exe` to enrich the file listing. If it can't find it, the application tries to help you with an installation via `winget` or by allowing you to specify the path manually.

## Interface and experience

The application is built with a modern dark-style UI, featuring:

- side tree panel for structure
- content table with name, size, date and type
- navigation breadcrumb
- bottom action bar
- log console and built-in terminal
- status indicators for `wimlib` and `7-Zip`
- EN/ES language toggle

## Useful shortcuts

| Shortcut | Action |
|---|---|
| `Enter` | Open WIM file when the path field has focus |
| `Delete` | Delete selected items |
| `Ctrl + A` | Select all visible files |
| `Esc` | Close modals and context menus |
| Double click | Enter a folder |
| Right click | Open context menu |
| Drag and drop | Import files or folders |

## Technologies

- Backend: Node.js + Express
- Frontend: HTML, CSS and vanilla JavaScript
- Image engine: `wimlib-imagex`
- Advanced listing support: `7-Zip`
- Notable dependencies: `multer`, `open`, `systray2`, `7zip-bin`

## Licenses and third parties

WimExplorer uses `wimlib` as the main engine for working with WIM images.

- `wimlib` is redistributed with its license texts inside `LICENSES/`
- the file [LICENSES/wimlib-COPYING.txt](LICENSES/wimlib-COPYING.txt) summarizes the license terms of the `wimlib` project
- the GPLv3 text is included in [LICENSES/wimlib-COPYING.GPLv3.txt](LICENSES/wimlib-COPYING.GPLv3.txt)
- the LGPL text is included in [LICENSES/wimlib-COPYING.LGPL.txt](LICENSES/wimlib-COPYING.LGPL.txt)

Important note:

- `wimlib` as a whole can be redistributed under GPLv3 or later
- `libwim` may offer an LGPL option in some cases, but for `wimlib-imagex.exe` the main reference you should keep is the `wimlib` documentation included in `LICENSES/`
- if you distribute WimExplorer along with the `wimlib` binaries, you should always keep these license files in the repository and also in any distribution package

## Project structure

```text
WimExplorer/
|-- WimExplorer-v1.2.exe     # Main launcher (only entry point for the user)
|-- README.md                # English documentation
|-- README.es.md             # Spanish documentation
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

## Important notes

- The application works on the real format using `wimlib-imagex`; it doesn't invent an intermediate format.
- The folder can be moved anywhere. The launcher resolves all paths at runtime.
- The project is Windows-oriented and runs locally on `localhost:3000`.
- If you redistribute the application with `wimlib`, also include the `LICENSES/` folder and keep the corresponding attribution.

## Ideal for

- editing Windows installation images
- inspecting WIM file contents without using a console
- quickly replacing or extracting specific files
- working more comfortably with multi-index images

---

<p align="center">
  <strong>WimExplorer v1.2</strong><br>
  Visual WIM image editing with a clearer, faster and friendlier experience.
</p>
