/* ═══════════════════════════════════════════════════════════════════
   WimExplorer — i18n (EN / ES)
   Default language: English (en)
   ═══════════════════════════════════════════════════════════════════ */

const I18N = {
  en: {
    // ─── Header ────────────────────────────────────────────────────
    'header.placeholder': 'Path to .wim file',
    'header.browse': '📁',
    'header.open': '📂 Open',
    'header.imageLabel': 'Image:',
    'header.themeTitle': 'Switch theme',
    'header.langTitle': 'Switch language',
    'header.7zTitle': '7-Zip status',
    'header.logs': '🖥️ Logs',
    'header.terminal': '⌨️ Terminal',
    'header.exit': '⏻ Exit',

    // ─── Tree / Content panels ─────────────────────────────────────
    'tree.title': '📂 Structure',
    'tree.collapseAll': '▼',
    'tree.empty': 'Open a .wim file to see its contents',
    'content.title': '📄 Content',
    'content.empty': 'Select a folder to view its contents',
    'content.emptyFolder': 'This folder is empty',
    'content.root': 'Root',
    'content.items': 'items',
    'content.folder': 'Folder',
    'content.file': 'File',
    'tree.root': '(root)',

    // ─── Table headers ────────────────────────────────────────────
    'table.name': 'Name',
    'table.size': 'Size',
    'table.modified': 'Modified',
    'table.type': 'Type',

    // ─── Toolbar ───────────────────────────────────────────────────
    'toolbar.add': 'Add',
    'toolbar.addFiles': '📄 Files',
    'toolbar.addFolder': '📁 Folder',
    'toolbar.delete': 'Delete',
    'toolbar.extract': 'Extract',
    'toolbar.replace': 'Replace',
    'toolbar.copyStatus': 'Copy status',

    // ─── Console / Terminal ────────────────────────────────────────
    'console.tabLogs': '🖥️ Logs',
    'console.tabTerminal': '⌨️ Terminal',
    'console.title': '🖥️ Log Console',
    'console.copyLog': '📋 Copy log',
    'console.fullscreen': '⛶ Fullscreen',
    'console.clear': '🗑️',
    'console.close': '✕',
    'terminal.title': '⌨️ wimlib Terminal',
    'terminal.copyText': '📋 Copy terminal text',
    'terminal.fullscreen': '⛶ Fullscreen',
    'terminal.close': '✕',
    'terminal.placeholder': 'e.g.: info test.wim 1  |  -help for help',
    'terminal.run': 'Run',
    'terminal.welcome': 'To see wimlib commands, type -help',
    'terminal.noOutput': '(no output)',
    'terminal.exitCode': 'Exit code:',

    // ─── Modal: Delete ─────────────────────────────────────────────
    'modal.delete.title': '🗑️ Confirm deletion',
    'modal.delete.body': 'Delete the following items?',
    'modal.delete.warning': '⚠️ This action cannot be undone.',
    'modal.delete.cancel': 'Cancel',
    'modal.delete.confirm': 'Delete',

    // ─── Modal: Extract ────────────────────────────────────────────
    'modal.extract.title': '📥 Extract files',
    'modal.extract.body': 'Destination directory:',
    'modal.extract.placeholder': 'C:\\destination\\path',
    'modal.extract.cancel': 'Cancel',
    'modal.extract.confirm': 'Extract',
    'modal.extract.browseTitle': 'Browse folder',

    // ─── Modal: Replace ────────────────────────────────────────────
    'modal.replace.title': '🔄 Replace file',
    'modal.replace.fileLabel': 'File to replace:',
    'modal.replace.newFile': 'New file:',
    'modal.replace.cancel': 'Cancel',
    'modal.replace.confirm': 'Replace',

    // ─── Modal: Exit ───────────────────────────────────────────────
    'modal.exit.title': '⏻ Close WimExplorer',
    'modal.exit.body': 'Are you sure you want to close WimExplorer and stop the service?',
    'modal.exit.cancel': 'Cancel',
    'modal.exit.confirm': 'Close application',

    // ─── Modal: Conflict ───────────────────────────────────────────
    'modal.conflict.title': '⚠️ Conflicts detected',
    'modal.conflict.new': '🆕 New',
    'modal.conflict.replace': '🔄 Replacements',
    'modal.conflict.cancel': 'Cancel',
    'modal.conflict.confirm': '✅ Import all',
    'modal.conflict.none': '(none)',

    // ─── Modal: Image Select ───────────────────────────────────────
    'modal.imageSelect.title': '📦 Select image',
    'modal.imageSelect.body': 'The WIM file contains multiple images. Select the one you want to explore:',

    // ─── Modal: Folder Warning ─────────────────────────────────────
    'modal.folderWarn.title': '📁 Select folder',
    'modal.folderWarn.body': 'The folder picker will open. The browser may show an additional confirmation prompt to access the files.',
    'modal.folderWarn.note': 'This is normal and necessary to read the structure of the selected folder.',
    'modal.folderWarn.cancel': 'Cancel',
    'modal.folderWarn.confirm': 'Continue',

    // ─── Modal: 7-Zip Required ─────────────────────────────────────
    'modal.7z.title': '⚠️ 7-Zip required',
    'modal.7z.body': 'WimExplorer requires <strong>7-Zip</strong> to work properly.<br>Select an option:',
    'modal.7z.installWinget': 'Install 7-Zip automatically',
    'modal.7z.installSub': 'via winget',
    'modal.7z.browse': 'I already have 7-Zip installed',
    'modal.7z.browseSub': 'browse folder manually',
    'modal.7z.exit': 'Exit WimExplorer',
    'modal.7z.installing': 'Installing 7-Zip via winget...',
    'modal.7z.installed': '✅ 7-Zip installed successfully',

    // ─── Modal: Logs/Terminal Fullscreen ───────────────────────────
    'modal.logsFull.title': '🖥️ Log Console',
    'modal.logsFull.copy': '📋 Copy',
    'modal.logsFull.clear': '🗑️',
    'modal.termFull.title': '⌨️ wimlib Terminal',
    'modal.termFull.copy': '📋 Copy',

    // ─── Context Menu ──────────────────────────────────────────────
    'ctx.extract': '📥 Extract',
    'ctx.replace': '🔄 Replace',
    'ctx.delete': '🗑️ Delete',

    // ─── Loading ───────────────────────────────────────────────────
    'loading.processing': 'Processing...',
    'loading.viewConsole': '🖥️ View console',

    // ─── Status / dynamic messages ─────────────────────────────────
    'status.waiting': 'Waiting for .wim file...',
    'status.openingExplorer': 'Opening file explorer...',
    'status.fileSelected': 'File selected',
    'status.selectionCancelled': 'Selection cancelled',
    'status.enterPath': '⚠️ Enter the path to the .wim file',
    'status.openingWim': 'Opening WIM file...',
    'status.loadingStructure': 'Loading structure...',
    'status.extracting': 'Extracting...',
    'status.enterDestDir': '⚠️ Enter the destination directory',
    'status.deleting': 'Deleting...',
    'status.replacing': 'Replacing...',
    'status.selectFile': '⚠️ Select a file',
    'status.closingApp': 'Closing WimExplorer...',
    'status.logCopied': '📋 Log copied to clipboard',
    'status.terminalCopied': '📋 Terminal copied to clipboard',
    'status.copyError': '❌ Error copying',
    'status.statusCopied': '✓',
    'status.7zNotAvailable': 'Not available',
    'status.elementsLoaded': 'elements loaded',
    'status.imageSelected': 'Image {0} selected',
    'status.opened': 'Opened: {0} image(s)',
    'status.noName': 'No name',
    'status.files': 'files',
    'status.folders': 'folders',
    'status.importing': 'Importing {0} file(s)…',
    'status.analyzing': 'Analyzing {0} file(s)…',
    'status.conflictSummary': '{0} item(s) found: {1} new and {2} already exist in the WIM.',
    'status.andMore': '… and {0} more',
    'status.opsWarning': '⚠️ There are {0} active operation(s). Forcing close could corrupt data.',
    'status.verifying': 'Verifying {0}...',
    'status.7zFound': '✅ 7-Zip found: {0}',
    'status.installingWinget': 'Installing 7-Zip via winget...',
  },

  es: {
    // ─── Header ────────────────────────────────────────────────────
    'header.placeholder': 'Ruta al archivo .wim',
    'header.browse': '📁',
    'header.open': '📂 Abrir',
    'header.imageLabel': 'Imagen:',
    'header.themeTitle': 'Cambiar tema',
    'header.langTitle': 'Cambiar idioma',
    'header.7zTitle': 'Estado de 7-Zip',
    'header.logs': '🖥️ Logs',
    'header.terminal': '⌨️ Terminal',
    'header.exit': '⏻ Salir',

    // ─── Tree / Content panels ─────────────────────────────────────
    'tree.title': '📂 Estructura',
    'tree.collapseAll': '▼',
    'tree.empty': 'Abre un archivo .wim para ver su contenido',
    'content.title': '📄 Contenido',
    'content.empty': 'Selecciona una carpeta para ver su contenido',
    'content.emptyFolder': 'Esta carpeta está vacía',
    'content.root': 'Raíz',
    'content.items': 'elementos',
    'content.folder': 'Carpeta',
    'content.file': 'Archivo',
    'tree.root': '(raíz)',

    // ─── Table headers ────────────────────────────────────────────
    'table.name': 'Nombre',
    'table.size': 'Tamaño',
    'table.modified': 'Modificado',
    'table.type': 'Tipo',

    // ─── Toolbar ───────────────────────────────────────────────────
    'toolbar.add': 'Agregar',
    'toolbar.addFiles': '📄 Archivos',
    'toolbar.addFolder': '📁 Carpeta',
    'toolbar.delete': 'Eliminar',
    'toolbar.extract': 'Extraer',
    'toolbar.replace': 'Reemplazar',
    'toolbar.copyStatus': 'Copiar estado',

    // ─── Console / Terminal ────────────────────────────────────────
    'console.tabLogs': '🖥️ Logs',
    'console.tabTerminal': '⌨️ Terminal',
    'console.title': '🖥️ Consola de Logs',
    'console.copyLog': '📋 Copiar log',
    'console.fullscreen': '⛶ Pantalla completa',
    'console.clear': '🗑️',
    'console.close': '✕',
    'terminal.title': '⌨️ Terminal wimlib',
    'terminal.copyText': '📋 Copiar texto terminal',
    'terminal.fullscreen': '⛶ Pantalla completa',
    'terminal.close': '✕',
    'terminal.placeholder': 'ej: info test.wim 1  |  -help para ayuda',
    'terminal.run': 'Ejecutar',
    'terminal.welcome': 'Si desea ver los comandos de wimlib, escriba -help',
    'terminal.noOutput': '(sin salida)',
    'terminal.exitCode': 'Código de salida:',

    // ─── Modal: Delete ─────────────────────────────────────────────
    'modal.delete.title': '🗑️ Confirmar eliminación',
    'modal.delete.body': '¿Eliminar los siguientes elementos?',
    'modal.delete.warning': '⚠️ Esta acción no se puede deshacer.',
    'modal.delete.cancel': 'Cancelar',
    'modal.delete.confirm': 'Eliminar',

    // ─── Modal: Extract ────────────────────────────────────────────
    'modal.extract.title': '📥 Extraer archivos',
    'modal.extract.body': 'Directorio de destino:',
    'modal.extract.placeholder': 'C:\\ruta\\destino',
    'modal.extract.cancel': 'Cancelar',
    'modal.extract.confirm': 'Extraer',
    'modal.extract.browseTitle': 'Buscar carpeta',

    // ─── Modal: Replace ────────────────────────────────────────────
    'modal.replace.title': '🔄 Reemplazar archivo',
    'modal.replace.fileLabel': 'Archivo a reemplazar:',
    'modal.replace.newFile': 'Nuevo archivo:',
    'modal.replace.cancel': 'Cancelar',
    'modal.replace.confirm': 'Reemplazar',

    // ─── Modal: Exit ───────────────────────────────────────────────
    'modal.exit.title': '⏻ Cerrar WimExplorer',
    'modal.exit.body': '¿Estás seguro de que deseas cerrar WimExplorer y detener el servicio?',
    'modal.exit.cancel': 'Cancelar',
    'modal.exit.confirm': 'Cerrar aplicación',

    // ─── Modal: Conflict ───────────────────────────────────────────
    'modal.conflict.title': '⚠️ Conflictos detectados',
    'modal.conflict.new': '🆕 Nuevos',
    'modal.conflict.replace': '🔄 Reemplazos',
    'modal.conflict.cancel': 'Cancelar',
    'modal.conflict.confirm': '✅ Importar todo',
    'modal.conflict.none': '(ninguno)',

    // ─── Modal: Image Select ───────────────────────────────────────
    'modal.imageSelect.title': '📦 Seleccionar imagen',
    'modal.imageSelect.body': 'El archivo WIM contiene múltiples imágenes. Selecciona la que deseas explorar:',

    // ─── Modal: Folder Warning ─────────────────────────────────────
    'modal.folderWarn.title': '📁 Seleccionar carpeta',
    'modal.folderWarn.body': 'Se abrirá el selector de carpetas. El navegador puede mostrar un aviso de confirmación adicional para acceder a los archivos.',
    'modal.folderWarn.note': 'Esto es normal y necesario para leer la estructura de la carpeta seleccionada.',
    'modal.folderWarn.cancel': 'Cancelar',
    'modal.folderWarn.confirm': 'Continuar',

    // ─── Modal: 7-Zip Required ─────────────────────────────────────
    'modal.7z.title': '⚠️ 7-Zip requerido',
    'modal.7z.body': 'WimExplorer necesita <strong>7-Zip</strong> para funcionar correctamente.<br>Selecciona una opción:',
    'modal.7z.installWinget': 'Instalar 7-Zip automáticamente',
    'modal.7z.installSub': 'via winget',
    'modal.7z.browse': 'Ya tengo 7-Zip instalado',
    'modal.7z.browseSub': 'buscar carpeta manualmente',
    'modal.7z.exit': 'Salir de WimExplorer',
    'modal.7z.installing': 'Instalando 7-Zip via winget...',
    'modal.7z.installed': '✅ 7-Zip instalado correctamente',

    // ─── Modal: Logs/Terminal Fullscreen ───────────────────────────
    'modal.logsFull.title': '🖥️ Consola de Logs',
    'modal.logsFull.copy': '📋 Copiar',
    'modal.logsFull.clear': '🗑️',
    'modal.termFull.title': '⌨️ Terminal wimlib',
    'modal.termFull.copy': '📋 Copiar',

    // ─── Context Menu ──────────────────────────────────────────────
    'ctx.extract': '📥 Extraer',
    'ctx.replace': '🔄 Reemplazar',
    'ctx.delete': '🗑️ Eliminar',

    // ─── Loading ───────────────────────────────────────────────────
    'loading.processing': 'Procesando...',
    'loading.viewConsole': '🖥️ Ver consola',

    // ─── Status / dynamic messages ─────────────────────────────────
    'status.waiting': 'Esperando archivo .wim...',
    'status.openingExplorer': 'Abriendo explorador de archivos...',
    'status.fileSelected': 'Archivo seleccionado',
    'status.selectionCancelled': 'Selección cancelada',
    'status.enterPath': '⚠️ Ingresa la ruta al archivo .wim',
    'status.openingWim': 'Abriendo archivo WIM...',
    'status.loadingStructure': 'Cargando estructura...',
    'status.extracting': 'Extrayendo...',
    'status.enterDestDir': '⚠️ Ingresa el directorio de destino',
    'status.deleting': 'Eliminando...',
    'status.replacing': 'Reemplazando...',
    'status.selectFile': '⚠️ Selecciona un archivo',
    'status.closingApp': 'Cerrando WimExplorer...',
    'status.logCopied': '📋 Log copiado al portapapeles',
    'status.terminalCopied': '📋 Terminal copiado al portapapeles',
    'status.copyError': '❌ Error al copiar',
    'status.statusCopied': '✓',
    'status.7zNotAvailable': 'No disponible',
    'status.elementsLoaded': 'elementos cargados',
    'status.imageSelected': 'Imagen {0} seleccionada',
    'status.opened': 'Abierto: {0} imagen(es)',
    'status.noName': 'Sin nombre',
    'status.files': 'archivos',
    'status.folders': 'carpetas',
    'status.importing': 'Importando {0} archivo(s)…',
    'status.analyzing': 'Analizando {0} archivo(s)…',
    'status.conflictSummary': 'Se encontraron {0} elemento(s): {1} nuevo(s) y {2} que ya existen en el WIM.',
    'status.andMore': '… y {0} más',
    'status.opsWarning': '⚠️ Hay {0} operación(es) en curso. Forzar el cierre podría corromper datos.',
    'status.verifying': 'Verificando {0}...',
    'status.7zFound': '✅ 7-Zip encontrado: {0}',
    'status.installingWinget': 'Instalando 7-Zip via winget...',
  }
};

// ─── State ─────────────────────────────────────────────────────────
let _currentLang = localStorage.getItem('wme-lang') || 'en';

function getLang() { return _currentLang; }

function setLang(lang) {
  _currentLang = lang;
  localStorage.setItem('wme-lang', lang);
  document.documentElement.lang = lang;
  applyLang();
}

/** Translate a key, with optional {0},{1},... replacements */
function t(key, ...args) {
  const dict = I18N[_currentLang] || I18N.en;
  let str = dict[key] ?? I18N.en[key] ?? key;
  args.forEach((v, i) => { str = str.replace(`{${i}}`, v); });
  return str;
}

/** Apply translations to all [data-i18n] elements in DOM */
function applyLang() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    // Use innerHTML for keys that contain HTML (like modal.7z.body)
    if (val.includes('<') && val.includes('>')) el.innerHTML = val;
    else el.textContent = val;
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.getAttribute('data-i18n-title'));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });
  // Update the lang toggle button text
  const btn = document.getElementById('btnLangToggle');
  if (btn) btn.textContent = '\ud83c\udf10 ' + _currentLang.toUpperCase();
}
