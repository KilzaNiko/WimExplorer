const express = require('express');
const { execFile, execFileSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = 3000;

// ─── Paths ────────────────────────────────────────────────────────
const WIMLIB_EXE = path.resolve(__dirname, '..', 'wimlib', 'wimlib-imagex.exe');
const TMP_DIR = path.join(__dirname, 'tmp');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

// ─── 7-Zip Detection (required) ──────────────────────────────────
let sevenZipPath = null;
let sevenZipStatus = { available: false, path: '', type: '', error: '' };

function detect7z(customDir) {
  const candidates = [];

  // If a custom directory is provided, check it first
  if (customDir) {
    candidates.push(path.join(customDir, '7z.exe'));
    candidates.push(path.join(customDir, '7-Zip', '7z.exe'));
  }

  // Standard system locations
  candidates.push(
    'C:\\Program Files\\7-Zip\\7z.exe',
    'C:\\Program Files (x86)\\7-Zip\\7z.exe',
    'C:\\ProgramData\\chocolatey\\bin\\7z.exe',
    (process.env.LOCALAPPDATA || '') + '\\Microsoft\\WindowsApps\\7z.exe',
  );

  // Also check PATH
  const pathDirs = (process.env.PATH || '').split(';');
  for (const dir of pathDirs) {
    if (dir) candidates.push(path.join(dir, '7z.exe'));
  }

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        sevenZipPath = p;
        sevenZipStatus = { available: true, path: p, type: 'system-7z', error: '' };
        addLog('info', `✅ 7-Zip encontrado: ${p}`);
        return;
      }
    } catch(e) {}
  }

  sevenZipPath = null;
  sevenZipStatus = { available: false, path: '', type: 'not-found', error: '7-Zip no encontrado. Es necesario para el funcionamiento de WimExplorer.' };
  addLog('warn', '⚠️ 7-Zip no encontrado. Se requiere 7-Zip para listar archivos WIM.');
}

// ─── Multer ───────────────────────────────────────────────────────
const upload = multer({ dest: TMP_DIR });

// ─── Middleware ───────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── State ────────────────────────────────────────────────────────
let currentWim = { path: null, imageIndex: 1, images: [], tree: null };
let wimPathsLower = new Set(); // Cached lowercase paths for O(1) conflict lookup
let activeOperations = 0;
let active7zChild = null; // Track 7z spawn process to kill before writes

// ─── Log System ───────────────────────────────────────────────────
const logBuffer = [];
const MAX_LOGS = 2000;
const sseClients = new Set();

function addLog(type, message) {
  const entry = { ts: new Date().toISOString(), type, msg: String(message) };
  logBuffer.push(entry);
  if (logBuffer.length > MAX_LOGS) logBuffer.shift();
  for (const c of sseClients) {
    try { c.write(`data: ${JSON.stringify(entry)}\n\n`); } catch(e) { sseClients.delete(c); }
  }
}

function startOp(name) { activeOperations++; addLog('op', `▶ Iniciando: ${name}`); }
function endOp(name) { activeOperations = Math.max(0, activeOperations - 1); addLog('op', `✅ Completado: ${name}`); }

// ─── SSE Endpoint ─────────────────────────────────────────────────
app.get('/api/logs/stream', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
  res.write(`data: ${JSON.stringify({ type: 'init', msg: 'Conectado al stream de logs' })}\n\n`);
  sseClients.add(res);
  req.on('close', () => sseClients.delete(res));
});

app.get('/api/logs/history', (req, res) => res.json(logBuffer.slice(-200)));
app.get('/api/status', (req, res) => res.json({ activeOperations, wimPath: currentWim.path, imageIndex: currentWim.imageIndex }));

// ─── API: wimlib version ──────────────────────────────────────────
app.get('/api/wimlib-version', (req, res) => {
  execFile(WIMLIB_EXE, ['--version'], { timeout: 5000, windowsHide: true }, (err, stdout) => {
    if (err) return res.status(500).json({ error: err.message });
    const firstLine = (stdout || '').split('\n')[0] || '';
    const match = firstLine.match(/wimlib-imagex\s+([\d.]+)/i);
    res.json({ version: match ? match[1] : firstLine.trim(), raw: firstLine.trim() });
  });
});

// ─── API: 7-Zip status ───────────────────────────────────────────
app.get('/api/7z-status', (req, res) => {
  res.json(sevenZipStatus);
});

app.post('/api/7z-test', async (req, res) => {
  detect7z();
  if (sevenZipPath) {
    try {
      const output = await new Promise((resolve, reject) => {
        execFile(sevenZipPath, ['--help'], { timeout: 5000, windowsHide: true }, (err, stdout) => {
          if (err) reject(err); else resolve(stdout);
        });
      });
      const version = output.split('\n')[0] || '7-Zip';
      sevenZipStatus.version = version.trim();
      addLog('info', `✅ 7-Zip verificado: ${version.trim()}`);
      res.json({ ...sevenZipStatus, version: version.trim() });
    } catch(e) {
      res.json({ ...sevenZipStatus, error: e.message });
    }
  } else {
    res.json(sevenZipStatus);
  }
});

// ─── API: Install 7-Zip via winget ────────────────────────────────
app.post('/api/7z-install', (req, res) => {
  addLog('info', '📥 Instalando 7-Zip via winget...');
  const child = spawn('winget', [
    'install', '7zip.7zip',
    '--accept-package-agreements', '--accept-source-agreements',
    '--silent'
  ], { windowsHide: true, shell: true });

  let stdout = '', stderr = '';
  child.stdout.on('data', d => {
    const line = d.toString().trim();
    if (line) { stdout += line + '\n'; addLog('info', `[winget] ${line}`); }
  });
  child.stderr.on('data', d => {
    const line = d.toString().trim();
    if (line) { stderr += line + '\n'; addLog('warn', `[winget] ${line}`); }
  });
  child.on('close', code => {
    if (code === 0 || stdout.includes('installed') || stdout.includes('Ya instalado') || stdout.includes('already installed')) {
      addLog('info', '✅ 7-Zip instalado correctamente via winget');
      // Re-detect after install
      detect7z();
      res.json({ success: true, ...sevenZipStatus });
    } else {
      addLog('error', `winget finalizó con código ${code}`);
      res.status(500).json({ success: false, error: stderr || `winget falló (código ${code})`, output: stdout });
    }
  });
  child.on('error', err => {
    addLog('error', `Error al ejecutar winget: ${err.message}`);
    res.status(500).json({ success: false, error: `No se pudo ejecutar winget: ${err.message}` });
  });
});

// ─── API: Set custom 7-Zip path ──────────────────────────────────
app.post('/api/7z-set-path', (req, res) => {
  const { dirPath } = req.body;
  if (!dirPath) return res.status(400).json({ error: 'dirPath requerido' });

  addLog('info', `Buscando 7z.exe en: ${dirPath}`);
  detect7z(dirPath);

  if (sevenZipStatus.available) {
    res.json({ success: true, ...sevenZipStatus });
  } else {
    res.status(404).json({ success: false, error: `No se encontró 7z.exe en "${dirPath}"` });
  }
});

// ─── Helper: Kill active 7z process before writes ────────────────
function kill7zIfActive() {
  if (active7zChild) {
    try { active7zChild.kill(); } catch(e) {}
    active7zChild = null;
    addLog('info', '7z child process terminated');
  }
  // Also kill any lingering 7z.exe processes (Windows)
  try {
    execFileSync('taskkill', ['/F', '/IM', '7z.exe'], { windowsHide: true, timeout: 3000 });
    addLog('info', 'taskkill: 7z.exe processes killed');
  } catch(e) {
    // Normal: "no se encontró el proceso" means no 7z running — that's fine
  }
}

// ─── Helper: Ensure WIM file is writable ──────────────────────────
function ensureWritable(wimPath) {
  try {
    // Remove read-only flag
    const stat = fs.statSync(wimPath);
    if (!(stat.mode & 0o200)) {
      fs.chmodSync(wimPath, stat.mode | 0o666);
      addLog('info', `Removed read-only flag from ${path.basename(wimPath)}`);
    }
    // Test actual write access
    const fd = fs.openSync(wimPath, 'r+');
    fs.closeSync(fd);
  } catch(e) {
    addLog('warn', `Write-access check failed: ${e.message}`);
    throw new Error(`No se puede escribir en el archivo WIM: ${e.message}`);
  }
}

// ─── Helper: Run wimlib ───────────────────────────────────────────
function runWimlib(args) {
  return new Promise((resolve, reject) => {
    addLog('cmd', `wimlib-imagex ${args.join(' ')}`);
    execFile(WIMLIB_EXE, args, { maxBuffer: 100 * 1024 * 1024, windowsHide: true }, (err, stdout, stderr) => {
      if (err) { addLog('error', stderr || stdout || err.message); reject(new Error(stderr || stdout || err.message)); }
      else resolve(stdout);
    });
  });
}

// ─── Helper: Parse raw command string into arg array ─────────────
function parseArgs(rawStr) {
  const args = [];
  let cur = '', inQ = false;
  for (let i = 0; i < rawStr.length; i++) {
    const c = rawStr[i];
    if (c === '"') { inQ = !inQ; continue; }
    if (c === ' ' && !inQ) { if (cur.length) { args.push(cur); cur = ''; } continue; }
    cur += c;
  }
  if (cur.length) args.push(cur);
  return args;
}

// ─── API: wimlib manual command terminal ─────────────────────────
app.post('/api/wimlib-cmd', (req, res) => {
  const { rawArgs } = req.body;
  if (typeof rawArgs !== 'string' || !rawArgs.trim())
    return res.status(400).json({ error: 'rawArgs requerido' });

  const normalized = rawArgs.trim() === '-help' ? '--help' : rawArgs.trim();
  const args = parseArgs(normalized);
  addLog('cmd', `[terminal] wimlib-imagex ${args.join(' ')}`);

  execFile(WIMLIB_EXE, args, { maxBuffer: 10 * 1024 * 1024, windowsHide: true, timeout: 30000 },
    (err, stdout, stderr) => {
      res.json({ stdout: stdout || '', stderr: stderr || '', exitCode: err ? (err.code || 1) : 0 });
    });
});

function runWimlibUpdate(wimPath, imageIndex, commands, attempt = 1) {
  return new Promise(async (resolve, reject) => {
    // Kill 7z and ensure writable before every attempt
    kill7zIfActive();
    try {
      ensureWritable(wimPath);
    } catch(e) {
      if (attempt < 3) {
        addLog('warn', `Intento ${attempt}: archivo bloqueado, reintentando en ${attempt}s...`);
        await new Promise(r => setTimeout(r, attempt * 1000));
        try { return resolve(await runWimlibUpdate(wimPath, imageIndex, commands, attempt + 1)); }
        catch(e2) { return reject(e2); }
      }
      return reject(e);
    }

    addLog('cmd', `wimlib-imagex update (stdin: ${commands.trim()})`);
    const child = execFile(WIMLIB_EXE, ['update', wimPath, String(imageIndex)], { maxBuffer: 100 * 1024 * 1024, windowsHide: true }, (err, stdout, stderr) => {
      if (err) {
        const msg = stderr || stdout || err.message;
        // Retry on permission denied (error code 47)
        if (attempt < 3 && (msg.includes('Permission denied') || msg.includes('error code 47'))) {
          addLog('warn', `Intento ${attempt} falló (permiso), reintentando...`);
          kill7zIfActive();
          setTimeout(async () => {
            try { resolve(await runWimlibUpdate(wimPath, imageIndex, commands, attempt + 1)); }
            catch(e2) { reject(e2); }
          }, attempt * 1500);
          return;
        }
        addLog('error', msg);
        reject(new Error(msg));
      } else {
        resolve(stdout);
      }
    });
    child.stdin.write(commands);
    child.stdin.end();
  });
}

// ─── Parse wimlib info (text fallback) ───────────────────────────
function parseWimInfo(output) {
  const images = [];
  const lines = output.split('\n');
  let cur = null, wimInfo = {};
  for (const raw of lines) {
    const l = raw.trim();
    if (l.startsWith('Image Count:')) wimInfo.imageCount = parseInt(l.split(':')[1], 10);
    if (l.startsWith('Compression:') && !cur) wimInfo.compression = l.split(':')[1].trim();
    if (l.startsWith('Index:')) { if (cur) images.push(cur); cur = { index: parseInt(l.split(':')[1], 10) }; }
    if (cur) {
      if (l.startsWith('Name:')) cur.name = l.split(':').slice(1).join(':').trim();
      if (l.startsWith('Description:')) cur.description = l.split(':').slice(1).join(':').trim();
      if (l.startsWith('Directory Count:')) cur.dirCount = parseInt(l.split(':')[1], 10);
      if (l.startsWith('File Count:')) cur.fileCount = parseInt(l.split(':')[1], 10);
    }
  }
  if (cur) images.push(cur);
  return { wimInfo, images };
}

// ─── Parse wimlib info (XML) ──────────────────────────────────────
// wimlib-imagex info <wim> --xml emits the WIM's embedded XML metadata.
// Expected structure:
//   <WIM>
//     <IMAGE INDEX="1">
//       <NAME>...</NAME>
//       <DESCRIPTION>...</DESCRIPTION>
//       <DIRCOUNT>N</DIRCOUNT>
//       <FILECOUNT>N</FILECOUNT>
//       ...
//     </IMAGE>
//   </WIM>
// NOTE: Compression info is NOT present in the embedded XML; it stays null.
// NOTE: If a WIM has only one image, fast-xml-parser may parse IMAGE as an
//       object instead of an array — isArray() forces it to always be an array.
let _xmlParser = null;
function getXmlParser() {
  if (_xmlParser) return _xmlParser;
  const { XMLParser } = require('fast-xml-parser');
  _xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseAttributeValue: true,
    parseNodeValue: true,
    isArray: (tagName) => tagName === 'IMAGE',
  });
  return _xmlParser;
}

function parseWimInfoXml(xmlOutput) {
  // Strip BOM if present (wimlib may emit UTF-16 LE BOM)
  const cleaned = xmlOutput.replace(/^\uFEFF/, '').trim();
  if (!cleaned.startsWith('<')) throw new Error('La salida no parece XML válido');

  const parser = getXmlParser();
  const result = parser.parse(cleaned);

  // Normalize: handle both <WIM> root and bare <IMAGE> roots
  const wim = result.WIM || result;
  const imageElements = Array.isArray(wim.IMAGE) ? wim.IMAGE
    : wim.IMAGE ? [wim.IMAGE]
    : [];

  if (imageElements.length === 0) throw new Error('XML sin elementos <IMAGE>');

  const images = imageElements.map(img => {
    // INDEX can be an attribute (@_INDEX) or, in rare cases, a child element
    const index = parseInt(img['@_INDEX'] ?? img.INDEX, 10) || 0;
    return {
      index,
      name:        String(img.NAME        ?? '').trim(),
      description: String(img.DESCRIPTION ?? '').trim(),
      dirCount:    parseInt(img.DIRCOUNT,  10) || 0,
      fileCount:   parseInt(img.FILECOUNT, 10) || 0,
    };
  });

  const wimInfo = {
    imageCount:  images.length,
    compression: null, // not available in embedded XML
  };

  return { wimInfo, images };
}

// ─── 7-Zip Listing ────────────────────────────────────────────────
function run7zList(wimPath, imageIndex, imageCount) {
  return new Promise((resolve, reject) => {
    if (!sevenZipPath) return reject(new Error('7-Zip no disponible'));

    const args = ['l', '-slt', wimPath];
    addLog('7z', `Listando con 7-Zip: ${path.basename(wimPath)} (imagen ${imageIndex}/${imageCount || '?'})`);
    const child = spawn(sevenZipPath, args, { windowsHide: true });
    active7zChild = child;
    let output = '';
    let fileCount = 0;

    child.stdout.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      const newEntries = (chunk.match(/^Path = /gm) || []).length;
      if (newEntries > 0) {
        fileCount += newEntries;
        if (fileCount % 1000 === 0) addLog('7z', `Escaneando... ${fileCount.toLocaleString()} elementos`);
      }
    });
    child.stderr.on('data', (data) => addLog('7z-err', data.toString().trim()));
    child.on('close', (code) => {
      active7zChild = null;
      if (code === 0) {
        addLog('7z', `Escaneo completo: procesando ${fileCount.toLocaleString()} entradas`);
        try {
          const files = parse7zSlt(output, imageIndex, imageCount || 1);
          addLog('7z', `✅ ${files.length.toLocaleString()} elementos en imagen ${imageIndex}`);
          resolve(files);
        } catch(e) {
          reject(e);
        }
      } else {
        reject(new Error(`7z salió con código ${code}`));
      }
    });
    child.on('error', (err) => { active7zChild = null; reject(err); });
  });
}

function parse7zSlt(output, imageIndex, imageCount) {
  // 7z -slt separates the header from file listing with '----------'
  // Individual entries within the listing are separated by blank lines
  const parts = output.split('----------');
  if (parts.length < 2) {
    addLog('warn', 'parse7zSlt: no se encontró separador ----------');
    return [];
  }

  // The file listing is everything after the last '----------'
  const fileSection = parts[parts.length - 1];

  // Split entries by blank lines (one or more consecutive newlines)
  const entries = fileSection.split(/\n\s*\n/).filter(e => e.trim());
  addLog('debug', `parse7zSlt: ${entries.length} entradas encontradas, imageIndex=${imageIndex}, imageCount=${imageCount}`);

  const files = [];
  let skippedArchive = 0;

  for (const entry of entries) {
    const props = {};
    for (const line of entry.split('\n')) {
      const eq = line.indexOf(' = ');
      if (eq > 0) {
        const key = line.substring(0, eq).trim();
        if (key.length < 30) {
          props[key] = line.substring(eq + 3).trim();
        }
      }
    }
    if (!props.Path) continue;

    // Skip the archive-level entry
    const lowerPath = props.Path.toLowerCase();
    if (props.Type === 'wim' || props.Type === 'Wim' || props.Type === 'WIM') { skippedArchive++; continue; }
    if (lowerPath.endsWith('.wim') || lowerPath.endsWith('.esd') || lowerPath.endsWith('.swm')) { skippedArchive++; continue; }

    let entryPath = props.Path.replace(/\//g, '\\');

    // For multi-image WIMs, 7z may prefix paths with the image number
    if (imageCount > 1) {
      const prefixMatch = entryPath.match(/^\[?(\d+)\]?[\\\/]/);
      if (prefixMatch) {
        const idx = parseInt(prefixMatch[1], 10);
        if (idx !== imageIndex) continue;
        entryPath = entryPath.substring(prefixMatch[0].length);
      }
    }

    if (!entryPath || entryPath === '\\') continue;

    const isDir = props.Folder === '+' || (props.Attributes && props.Attributes.includes('D'));
    files.push({
      path: entryPath.startsWith('\\') ? entryPath : '\\' + entryPath,
      isDir,
      size: parseInt(props.Size, 10) || 0,
      modified: props.Modified ? props.Modified.substring(0, 19) : '',
    });
  }

  addLog('info', `7z parse: ${files.length.toLocaleString()} elementos (${skippedArchive} entradas de archivo omitidas)`);
  return files;
}

// ─── Build tree from flat list ────────────────────────────────────
function buildTree(files) {
  const root = { name: '\\', path: '\\', type: 'directory', size: 0, modified: '', children: [] };
  const dirMap = { '\\': root };

  // First pass: ensure all directories exist
  for (const f of files) {
    const parts = f.path.split('\\').filter(p => p);
    let curPath = '\\';
    for (let i = 0; i < parts.length; i++) {
      const parentPath = curPath;
      curPath = curPath === '\\' ? '\\' + parts[i] : curPath + '\\' + parts[i];
      const isLast = i === parts.length - 1;
      if (!dirMap[curPath]) {
        const node = {
          name: parts[i],
          path: curPath,
          type: (isLast && !f.isDir) ? 'file' : 'directory',
          size: isLast ? (f.size || 0) : 0,
          modified: isLast ? (f.modified || '') : '',
          children: []
        };
        dirMap[curPath] = node;
        if (dirMap[parentPath]) dirMap[parentPath].children.push(node);
      } else if (isLast) {
        dirMap[curPath].size = f.size || 0;
        dirMap[curPath].modified = f.modified || '';
        if (f.isDir) dirMap[curPath].type = 'directory';
      }
    }
  }

  // Sort
  (function sort(n) {
    if (n.children.length) {
      n.children.sort((a, b) => {
        if (a.type === 'directory' && b.type !== 'directory') return -1;
        if (a.type !== 'directory' && b.type === 'directory') return 1;
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      });
      n.children.forEach(sort);
    }
  })(root);
  return root;
}

// ─── Fallback: wimlib dir ─────────────────────────────────────────
function parseDirOutput(output) {
  const lines = output.split('\n').map(l => l.replace(/\r/, '').trim()).filter(l => l.startsWith('\\'));
  addLog('info', `wimlib-imagex dir devolvió ${lines.length.toLocaleString()} entradas`);
  const files = lines.map(l => ({ path: l, isDir: false, size: 0, modified: '' }));
  return buildTree(files);
}

// ─── File Picker ──────────────────────────────────────────────────
const PICKER_SCRIPT = path.join(__dirname, 'pick-file.ps1');
app.get('/api/pick-file', (req, res) => {
  // Use a standalone .ps1 file to avoid PowerShell argument parsing issues
  execFile('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', PICKER_SCRIPT],
    { windowsHide: false, timeout: 120000 }, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: stderr || err.message });
    res.json({ path: stdout.trim() || null });
  });
});

// ─── Folder Picker ────────────────────────────────────────────────
const FOLDER_PICKER_SCRIPT = path.join(__dirname, 'pick-folder.ps1');
app.get('/api/pick-folder', (req, res) => {
  execFile('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', FOLDER_PICKER_SCRIPT],
    { windowsHide: false, timeout: 120000 }, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: stderr || err.message });
    res.json({ path: stdout.trim() || null });
  });
});

// ─── API: Open WIM ────────────────────────────────────────────────
app.post('/api/open', async (req, res) => {
  try {
    const { wimPath } = req.body;
    if (!wimPath) return res.status(400).json({ error: 'wimPath required' });
    if (!fs.existsSync(wimPath)) return res.status(404).json({ error: `No encontrado: ${wimPath}` });

    addLog('info', `Abriendo: ${wimPath}`);
    let parsed;
    try {
      const xmlOutput = await runWimlib(['info', wimPath, '--xml']);
      parsed = parseWimInfoXml(xmlOutput);
      addLog('info', `Metadatos leídos via XML (${parsed.images.length} imagen(es))`);
    } catch (xmlErr) {
      addLog('warn', `XML parse falló (${xmlErr.message}), usando parser de texto...`);
      const output = await runWimlib(['info', wimPath]);
      parsed = parseWimInfo(output);
    }
    currentWim.path = wimPath;
    currentWim.imageIndex = parsed.images.length > 0 ? parsed.images[0].index : 1;
    currentWim.images = parsed.images;
    addLog('info', `✅ Abierto: ${parsed.images.length} imagen(es)`);
    res.json({ path: wimPath, ...parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── API: Browse (7z → wimlib fallback) ───────────────────────────
app.get('/api/browse', async (req, res) => {
  try {
    if (!currentWim.path) return res.status(400).json({ error: 'No hay WIM abierto' });
    const imageIndex = parseInt(req.query.image || currentWim.imageIndex, 10);
    currentWim.imageIndex = imageIndex;

    startOp('Listar contenido');
    let tree;

    if (sevenZipPath) {
      try {
        const files = await run7zList(currentWim.path, imageIndex, currentWim.images.length);
        tree = buildTree(files);
      } catch (e) {
        addLog('warn', `7-Zip falló: ${e.message}. Usando wimlib-imagex dir...`);
        const output = await runWimlib(['dir', currentWim.path, String(imageIndex)]);
        tree = parseDirOutput(output);
      }
    } else {
      addLog('info', 'Usando wimlib-imagex dir (7-Zip no disponible)...');
      const output = await runWimlib(['dir', currentWim.path, String(imageIndex)]);
      tree = parseDirOutput(output);
    }

    endOp('Listar contenido');
    currentWim.tree = tree;
    // Build cached lowercase path Set for fast conflict detection
    wimPathsLower = new Set();
    (function collect(n) { wimPathsLower.add(n.path.toLowerCase()); if (n.children) n.children.forEach(collect); })(tree);
    addLog('info', `Índice de conflictos: ${wimPathsLower.size.toLocaleString()} rutas`);
    res.json(tree);
  } catch (err) {
    endOp('Listar contenido');
    res.status(500).json({ error: err.message });
  }
});

// ─── API: Extract ─────────────────────────────────────────────────
app.post('/api/extract', async (req, res) => {
  try {
    if (!currentWim.path) return res.status(400).json({ error: 'No hay WIM abierto' });
    const { paths, destDir } = req.body;
    if (!paths?.length || !destDir) return res.status(400).json({ error: 'paths y destDir requeridos' });
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    startOp(`Extraer ${paths.length} elemento(s)`);
    await runWimlib(['extract', currentWim.path, String(currentWim.imageIndex), ...paths, `--dest-dir=${destDir}`, '--no-globs']);
    endOp(`Extraer ${paths.length} elemento(s)`);
    res.json({ success: true, message: `Extraído(s) ${paths.length} elemento(s) a ${destDir}` });
  } catch (err) { endOp('Extraer'); res.status(500).json({ error: err.message }); }
});

// ─── API: Add (upload) ────────────────────────────────────────────
app.post('/api/add', upload.array('files', 50), async (req, res) => {
  try {
    if (!currentWim.path) return res.status(400).json({ error: 'No hay WIM abierto' });
    const destPath = req.body.destPath || '\\';
    if (!req.files?.length) return res.status(400).json({ error: 'No hay archivos' });
    startOp(`Agregar ${req.files.length} archivo(s)`);
    const cmds = req.files.map(f => {
      const dest = destPath === '\\' ? `\\${f.originalname}` : `${destPath}\\${f.originalname}`;
      return `add "${f.path}" "${dest}"`;
    }).join('\n') + '\n';
    await runWimlibUpdate(currentWim.path, currentWim.imageIndex, cmds);
    req.files.forEach(f => { try { fs.unlinkSync(f.path); } catch(e) {} });
    endOp(`Agregar ${req.files.length} archivo(s)`);
    res.json({ success: true, message: `Agregado(s) ${req.files.length} archivo(s)` });
  } catch (err) {
    if (req.files) req.files.forEach(f => { try { fs.unlinkSync(f.path); } catch(e) {} });
    endOp('Agregar'); res.status(500).json({ error: err.message });
  }
});

// ─── API: Delete ──────────────────────────────────────────────────
app.post('/api/delete', async (req, res) => {
  try {
    if (!currentWim.path) return res.status(400).json({ error: 'No hay WIM abierto' });
    const { paths } = req.body;
    if (!paths?.length) return res.status(400).json({ error: 'paths requerido' });
    startOp(`Eliminar ${paths.length} elemento(s)`);
    const cmds = paths.map(p => `delete "${p}"`).join('\n') + '\n';
    await runWimlibUpdate(currentWim.path, currentWim.imageIndex, cmds);
    endOp(`Eliminar ${paths.length} elemento(s)`);
    res.json({ success: true, message: `Eliminado(s) ${paths.length} elemento(s)` });
  } catch (err) { endOp('Eliminar'); res.status(500).json({ error: err.message }); }
});

// ─── API: Replace ─────────────────────────────────────────────────
app.post('/api/replace', upload.single('file'), async (req, res) => {
  try {
    if (!currentWim.path) return res.status(400).json({ error: 'No hay WIM abierto' });
    const { targetPath } = req.body;
    if (!targetPath || !req.file) return res.status(400).json({ error: 'targetPath y file requeridos' });
    startOp(`Reemplazar ${targetPath}`);
    const cmds = `delete "${targetPath}"\nadd "${req.file.path}" "${targetPath}"\n`;
    await runWimlibUpdate(currentWim.path, currentWim.imageIndex, cmds);
    try { fs.unlinkSync(req.file.path); } catch(e) {}
    endOp(`Reemplazar ${targetPath}`);
    res.json({ success: true, message: `Reemplazado: ${targetPath}` });
  } catch (err) {
    if (req.file) try { fs.unlinkSync(req.file.path); } catch(e) {}
    endOp('Reemplazar'); res.status(500).json({ error: err.message });
  }
});

// ─── API: Status ──────────────────────────────────────────────────
app.get('/api/status', (req, res) => {
  res.json({ activeOperations, currentWim: currentWim.path || null });
});

// ─── API: Check conflicts (uses cached wimPathsLower Set) ──────
app.post('/api/check-conflicts', (req, res) => {
  try {
    if (!currentWim.path) return res.status(400).json({ error: 'No hay WIM abierto' });
    const { files, destPath } = req.body; // files = [{name, relativePath}]
    if (!files?.length) return res.status(400).json({ error: 'No hay archivos' });

    const newFiles = [], conflicts = [];
    for (const f of files) {
      const wimDest = (destPath === '\\' ? '\\' : destPath + '\\') + (f.relativePath || f.name);
      if (wimPathsLower.has(wimDest.toLowerCase())) {
        conflicts.push({ name: f.name, relativePath: f.relativePath, wimPath: wimDest });
      } else {
        newFiles.push({ name: f.name, relativePath: f.relativePath, wimPath: wimDest });
      }
    }

    res.json({ total: files.length, newCount: newFiles.length, conflictCount: conflicts.length, conflictList: conflicts, newList: newFiles });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// ─── API: Batch import (with server-side revalidation) ─────────
app.post('/api/batch-import', upload.array('files', 200), async (req, res) => {
  try {
    if (!currentWim.path) return res.status(400).json({ error: 'No hay WIM abierto' });
    const destPaths = JSON.parse(req.body.destPaths || '[]'); // Array of WIM destination paths per file
    if (!req.files?.length) return res.status(400).json({ error: 'No hay archivos' });

    startOp(`Importar ${req.files.length} archivo(s)`);

    // Server-side revalidation: compute actual conflicts from cached index
    const revalidatedDeletes = [];
    for (let i = 0; i < req.files.length; i++) {
      const dest = destPaths[i] || '\\' + req.files[i].originalname;
      if (wimPathsLower.has(dest.toLowerCase())) {
        revalidatedDeletes.push(dest);
      }
    }

    // Build commands: first delete confirmed conflicts, then add all
    let cmds = '';
    for (const dp of revalidatedDeletes) {
      cmds += `delete "${dp}"\n`;
    }
    for (let i = 0; i < req.files.length; i++) {
      const dest = destPaths[i] || '\\' + req.files[i].originalname;
      cmds += `add "${req.files[i].path}" "${dest}"\n`;
    }

    await runWimlibUpdate(currentWim.path, currentWim.imageIndex, cmds);
    req.files.forEach(f => { try { fs.unlinkSync(f.path); } catch(e) {} });
    endOp(`Importar ${req.files.length} archivo(s)`);
    res.json({ success: true, message: `Importados ${req.files.length} archivo(s) (${revalidatedDeletes.length} reemplazados)` });
  } catch(err) {
    if (req.files) req.files.forEach(f => { try { fs.unlinkSync(f.path); } catch(e) {} });
    endOp('Importar'); res.status(500).json({ error: err.message });
  }
});

// ─── API: Exit ────────────────────────────────────────────────────
app.post('/api/exit', (req, res) => {
  const { force } = req.body;
  if (activeOperations > 0 && !force) {
    return res.json({ blocked: true, activeOperations, message: `Hay ${activeOperations} operación(es) en curso` });
  }
  addLog('info', '🛑 Cerrando WimExplorer...');
  res.json({ success: true });
  setTimeout(() => process.exit(0), 500);
});

// ─── System Tray ──────────────────────────────────────────────────
const TRAY_ICON_PATH = path.join(__dirname, 'logo_wme.ico');

function getTrayIcon() {
  try {
    if (fs.existsSync(TRAY_ICON_PATH)) {
      return fs.readFileSync(TRAY_ICON_PATH).toString('base64');
    }
  } catch(e) {}
  // Fallback: small blue square
  const w = 16, h = 16, px = w * h * 4, bmpH = 40, imgSz = bmpH + px;
  const buf = Buffer.alloc(6 + 16 + imgSz);
  let o = 0;
  buf.writeUInt16LE(0,o); o+=2; buf.writeUInt16LE(1,o); o+=2; buf.writeUInt16LE(1,o); o+=2;
  buf[o++]=w; buf[o++]=h; buf[o++]=0; buf[o++]=0;
  buf.writeUInt16LE(1,o); o+=2; buf.writeUInt16LE(32,o); o+=2;
  buf.writeUInt32LE(imgSz,o); o+=4; buf.writeUInt32LE(22,o); o+=4;
  buf.writeUInt32LE(bmpH,o); o+=4; buf.writeInt32LE(w,o); o+=4;
  buf.writeInt32LE(h*2,o); o+=4; buf.writeUInt16LE(1,o); o+=2;
  buf.writeUInt16LE(32,o); o+=2;
  buf.writeUInt32LE(0,o); o+=4; buf.writeUInt32LE(px,o); o+=4;
  buf.writeInt32LE(0,o); o+=4; buf.writeInt32LE(0,o); o+=4;
  buf.writeUInt32LE(0,o); o+=4; buf.writeUInt32LE(0,o); o+=4;
  for (let i = 0; i < w * h; i++) { buf[o++]=0xFF; buf[o++]=0xA6; buf[o++]=0x58; buf[o++]=0xFF; }
  return buf.toString('base64');
}

function setupTray() {
  try {
    const SysTray = require('systray2').default;
    const tray = new SysTray({
      menu: {
        icon: getTrayIcon(),
        title: '', tooltip: 'WimExplorer',
        items: [
          { title: 'Abrir WimExplorer', tooltip: 'Abrir en el navegador', checked: false, enabled: true },
          { title: 'Terminar proceso', tooltip: 'Cerrar WimExplorer', checked: false, enabled: true }
        ]
      }, debug: false, copyDir: false
    });
    tray.onClick(async (action) => {
      if (action.seq_id === 0) {
        try { const o = (await import('open')).default; o(`http://localhost:${PORT}`); } catch(e) {}
      } else if (action.seq_id === 1) {
        // Show confirmation dialog via PowerShell
        try {
          const result = execFileSync('powershell', [
            '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command',
            `Add-Type -AssemblyName System.Windows.Forms; $r = [System.Windows.Forms.MessageBox]::Show('¿Cerrar WimExplorer y detener el servicio?','WimExplorer - Confirmar cierre','YesNo','Question'); Write-Output $r`
          ], { timeout: 60000, encoding: 'utf8' }).trim();
          if (result === 'Yes') {
            addLog('info', '🛑 Cerrando WimExplorer...');
            tray.kill(false);
            setTimeout(() => process.exit(0), 500);
          }
        } catch(e) {
          addLog('warn', `Error en diálogo de cierre: ${e.message}`);
        }
      }
    });
    addLog('info', '📌 WimExplorer activo en la bandeja del sistema');
  } catch(e) { addLog('warn', `Bandeja no disponible: ${e.message}`); }
}

// ─── Start ────────────────────────────────────────────────────────
const server = app.listen(PORT, async () => {
  console.log(`\n  ✅ WimExplorer running at http://localhost:${PORT}\n`);
  addLog('info', `WimExplorer iniciado en http://localhost:${PORT}`);
  detect7z();
  setupTray();
  try { const o = (await import('open')).default; o(`http://localhost:${PORT}`); } catch(e) {}
});
process.on('SIGINT', () => { server.close(() => process.exit(0)); });
