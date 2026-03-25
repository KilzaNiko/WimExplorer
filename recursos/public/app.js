/* ═══════════════════════════════════════════════════════════════════
   WimExplorer — Frontend Logic v4.0
   Unified conflict detection, preserve-dir, multi-image modal
   ═══════════════════════════════════════════════════════════════════ */

const state = { wimPath: null, images: [], imageIndex: 1, tree: null, currentPath: '\\', selectedItems: new Set(), flatTree: null };

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const els = {
  wimPathInput: $('#wimPathInput'), btnOpen: $('#btnOpen'), btnBrowseFile: $('#btnBrowseFile'),
  imageSelect: $('#imageSelect'), imageSelectorContainer: $('#imageSelectorContainer'),
  treeContainer: $('#treeContainer'), treeEmpty: $('#treeEmpty'),
  contentContainer: $('#contentContainer'), contentEmpty: $('#contentEmpty'),
  fileTable: $('#fileTable'), fileTableBody: $('#fileTableBody'), selectAll: $('#selectAll'),
  breadcrumbBar: $('#breadcrumbBar'), contentTitle: $('#contentTitle'), fileCount: $('#fileCount'),
  statusText: $('#statusText'), statusBar: $('#statusBar'), btnCopyStatus: $('#btnCopyStatus'),
  btnAdd: $('#btnAdd'), btnDelete: $('#btnDelete'),
  btnExtract: $('#btnExtract'), btnReplace: $('#btnReplace'), btnCollapseAll: $('#btnCollapseAll'),
  btnConsole: $('#btnConsole'), btnExit: $('#btnExit'), consoleDot: $('#consoleDot'),
  consolePanel: $('#consolePanel'), consoleBody: $('#consoleBody'),
  btnClearConsole: $('#btnClearConsole'), btnCloseConsole: $('#btnCloseConsole'),
  btnCopyConsole: $('#btnCopyConsole'),
  btn7zStatus: $('#btn7zStatus'), sevenZipDot: $('#sevenZipDot'),
  wimlibVersionBadge: $('#wimlibVersionBadge'), wimlibVersionText: $('#wimlibVersionText'),
  modalDelete: $('#modalDelete'), modalExtract: $('#modalExtract'),
  modalReplace: $('#modalReplace'), modalExit: $('#modalExit'),
  modalConflict: $('#modalConflict'), modalImageSelect: $('#modalImageSelect'),
  modalFolderWarn: $('#modalFolderWarn'), modal7zRequired: $('#modal7zRequired'),
  btn7zInstallWinget: $('#btn7zInstallWinget'), btn7zBrowsePath: $('#btn7zBrowsePath'), btn7zExit: $('#btn7zExit'),
  sevenZipProgress: $('#sevenZipProgress'), sevenZipProgressLabel: $('#sevenZipProgressLabel'),
  sevenZipProgressFill: $('#sevenZipProgressFill'), sevenZipError: $('#sevenZipError'),
  sevenZipErrorText: $('#sevenZipErrorText'),
  deleteList: $('#deleteList'), extractList: $('#extractList'), extractDestInput: $('#extractDestInput'),
  btnBrowseExtractDest: $('#btnBrowseExtractDest'),
  replaceTarget: $('#replaceTarget'), replaceFileInput: $('#replaceFileInput'),
  btnConfirmDelete: $('#btnConfirmDelete'), btnConfirmExtract: $('#btnConfirmExtract'),
  btnConfirmReplace: $('#btnConfirmReplace'),
  btnConfirmConflict: $('#btnConfirmConflict'),
  btnConfirmExit: $('#btnConfirmExit'),
  btnConfirmFolderSelect: $('#btnConfirmFolderSelect'),
  exitMessage: $('#exitMessage'), exitOpsWarning: $('#exitOpsWarning'),
  imageSelectList: $('#imageSelectList'),
  conflictSummary: $('#conflictSummary'), conflictNewCount: $('#conflictNewCount'),
  conflictReplaceCount: $('#conflictReplaceCount'), conflictNewList: $('#conflictNewList'),
  conflictReplaceList: $('#conflictReplaceList'),
  addFileInput: $('#addFileInput'), addFolderInput: $('#addFolderInput'),
  btnAddMenu: $('#btnAddMenu'), addDropdown: $('#addDropdown'),
  optAddFiles: $('#optAddFiles'), optAddFolder: $('#optAddFolder'),
  loadingOverlay: $('#loadingOverlay'), loadingText: $('#loadingText'),
  loadingProgressBar: $('#loadingProgressBar'), progressFill: $('#progressFill'),
  btnShowLoadingLogs: $('#btnShowLoadingLogs'),
  contextMenu: $('#contextMenu'), resizeHandle: $('#resizeHandle'), treePanel: $('#treePanel'),
  btnLogsFullscreen: $('#btnLogsFullscreen'), modalLogsFullscreen: $('#modalLogsFullscreen'),
  consoleBodyModal: $('#consoleBodyModal'), btnCopyLogsModal: $('#btnCopyLogsModal'),
  btnClearLogsModal: $('#btnClearLogsModal'),
  btnTerminal: $('#btnTerminal'),
  tabLogs: $('#tabLogs'), tabTerminal: $('#tabTerminal'),
  paneLogsHeader: $('#paneLogsHeader'), paneTerminalHeader: $('#paneTerminalHeader'),
  terminalBody: $('#terminalBody'), terminalInput: $('#terminalInput'),
  btnRunTerminal: $('#btnRunTerminal'), btnCopyTerminal: $('#btnCopyTerminal'),
  btnTerminalFullscreen: $('#btnTerminalFullscreen'), btnCloseTerminal: $('#btnCloseTerminal'),
  modalTerminal: $('#modalTerminal'),
  terminalBodyModal: $('#terminalBodyModal'), terminalInputModal: $('#terminalInputModal'),
  btnRunTerminalModal: $('#btnRunTerminalModal'), btnCopyTerminalModal: $('#btnCopyTerminalModal'),
};

// ─── API ──────────────────────────────────────────────────────────
async function api(url, opts = {}) {
  const res = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

let isLoading = false;
function showLoading(text) { isLoading = true; els.loadingText.textContent = text; els.loadingOverlay.style.display = 'flex'; els.loadingProgressBar.style.display = 'none'; els.btnShowLoadingLogs.style.display = 'inline-flex'; }
function hideLoading() { isLoading = false; els.loadingOverlay.style.display = 'none'; els.consolePanel.style.zIndex = ''; }
function setStatus(text, type = 'info') {
  els.statusText.textContent = text;
  els.statusBar.querySelector('.status-icon').textContent = type === 'error' ? '❌' : type === 'success' ? '✅' : '📋';
}
function copyStatus() {
  navigator.clipboard.writeText(els.statusText.textContent).then(() => {
    const orig = els.btnCopyStatus.textContent;
    els.btnCopyStatus.textContent = '✓';
    setTimeout(() => els.btnCopyStatus.textContent = orig, 1500);
  });
}

// ─── Console / SSE ────────────────────────────────────────────────
let sseSource = null, consoleOpen = false;
function connectSSE() {
  if (sseSource) return;
  sseSource = new EventSource('/api/logs/stream');
  sseSource.onmessage = (e) => {
    try {
      const entry = JSON.parse(e.data);
      appendConsoleEntry(entry);
      els.consoleDot.classList.add('active');
      clearTimeout(els.consoleDot._timer);
      els.consoleDot._timer = setTimeout(() => els.consoleDot.classList.remove('active'), 3000);
    } catch(err) {}
  };
  sseSource.onerror = () => { sseSource.close(); sseSource = null; setTimeout(connectSSE, 3000); };
}
function appendConsoleEntry(entry) {
  const div = document.createElement('div');
  div.className = `log-entry log-${entry.type}`;
  const time = entry.ts ? entry.ts.substring(11, 19) : '';
  div.innerHTML = `<span class="log-time">${time}</span>${escapeHtml(entry.msg)}`;
  els.consoleBody.appendChild(div);
  els.consoleBody.scrollTop = els.consoleBody.scrollHeight;
  while (els.consoleBody.children.length > 500) els.consoleBody.removeChild(els.consoleBody.firstChild);
}
function escapeHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function toggleConsole(forceOpen, tab) {
  if (forceOpen === true) consoleOpen = true;
  else if (forceOpen === false) consoleOpen = false;
  else consoleOpen = !consoleOpen;
  els.consolePanel.style.display = consoleOpen ? 'flex' : 'none';
  if (consoleOpen && tab) switchConsoleTab(tab);
}
function copyConsoleLogs() {
  const lines = [];
  els.consoleBody.querySelectorAll('.log-entry').forEach(el => lines.push(el.textContent));
  navigator.clipboard.writeText(lines.join('\n')).then(() => setStatus('📋 Log copiado al portapapeles', 'success')).catch(() => setStatus('❌ Error al copiar', 'error'));
}
async function loadLogHistory() { try { const logs = await api('/api/logs/history'); logs.forEach(appendConsoleEntry); } catch(e) {} }

// ─── Terminal ─────────────────────────────────────────────────────
const terminalLines = [];
let terminalWelcomed = false;

function terminalWelcome() {
  if (terminalWelcomed) return;
  terminalWelcomed = true;
  terminalLines.push({ cls: 't-welcome', html: 'Si desea ver los comandos de wimlib, escriba -help' });
  renderTerminal();
}

function renderTerminal() {
  [els.terminalBody, els.terminalBodyModal].forEach(el => {
    el.innerHTML = '';
    terminalLines.forEach(line => {
      const div = document.createElement('div');
      div.className = 'terminal-line ' + line.cls;
      div.innerHTML = line.html;
      el.appendChild(div);
    });
    el.scrollTop = el.scrollHeight;
  });
}

function copyTerminalText() {
  const text = terminalLines.map(l => { const d = document.createElement('div'); d.innerHTML = l.html; return d.textContent; }).join('\n');
  navigator.clipboard.writeText(text).then(() => setStatus('📋 Terminal copiado al portapapeles', 'success')).catch(() => setStatus('❌ Error al copiar', 'error'));
}

async function runTerminalCommand(rawArgs) {
  const cmd = rawArgs.trim();
  if (!cmd) return;

  terminalLines.push({ cls: 't-divider', html: '' });
  terminalLines.push({ cls: 't-cmd', html: '<span style="color:var(--accent-purple)">$</span> wimlib-imagex ' + escapeHtml(cmd) });
  while (terminalLines.length > 1000) terminalLines.shift();
  renderTerminal();

  [els.terminalInput, els.btnRunTerminal, els.terminalInputModal, els.btnRunTerminalModal].forEach(e => e.disabled = true);
  els.terminalInput.value = '';
  els.terminalInputModal.value = '';

  try {
    const data = await api('/api/wimlib-cmd', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rawArgs: cmd }) });
    const newLines = [];
    if (data.stdout?.trim()) data.stdout.split('\n').forEach(l => newLines.push({ cls: 't-stdout', html: escapeHtml(l) }));
    if (data.stderr?.trim()) data.stderr.split('\n').forEach(l => newLines.push({ cls: 't-stderr', html: escapeHtml(l) }));
    if (!data.stdout?.trim() && !data.stderr?.trim()) newLines.push({ cls: 't-stdout', html: '(sin salida)' });
    if (data.exitCode !== 0) newLines.push({ cls: 't-error', html: `Código de salida: ${data.exitCode}` });
    newLines.forEach(l => terminalLines.push(l));
    while (terminalLines.length > 1000) terminalLines.shift();
    renderTerminal();
  } catch(e) {
    terminalLines.push({ cls: 't-error', html: escapeHtml('❌ Error: ' + e.message) });
    renderTerminal();
  }

  [els.terminalInput, els.btnRunTerminal, els.terminalInputModal, els.btnRunTerminalModal].forEach(e => e.disabled = false);
  els.terminalInput.focus();
}

// ─── 7-Zip status ─────────────────────────────────────────────────
async function check7zStatus() {
  els.sevenZipDot.className = 'status-dot checking';
  try {
    const data = await api('/api/7z-test', { method: 'POST' });
    if (data.available) { els.sevenZipDot.className = 'status-dot ok'; els.btn7zStatus.title = `7-Zip OK: ${data.path}`; setStatus(`✅ 7-Zip: ${data.version || data.path}`, 'success'); }
    else { els.sevenZipDot.className = 'status-dot fail'; els.btn7zStatus.title = `7-Zip: ${data.error || 'No disponible'}`; setStatus(`⚠️ 7z: ${data.error || 'No disponible'}`, 'error'); }
  } catch(e) { els.sevenZipDot.className = 'status-dot fail'; }
}
async function init7zStatus() {
  try { const data = await api('/api/7z-status'); els.sevenZipDot.className = data.available ? 'status-dot ok' : 'status-dot fail'; els.btn7zStatus.title = data.available ? `7-Zip OK: ${data.path}` : (data.error || 'No disponible'); } catch(e) { els.sevenZipDot.className = 'status-dot fail'; }
}

// ─── wimlib version ───────────────────────────────────────────────
async function initWimlibVersion() {
  try {
    const data = await api('/api/wimlib-version');
    els.wimlibVersionText.textContent = 'v' + data.version;
    els.wimlibVersionBadge.title = data.raw || `wimlib ${data.version}`;
  } catch(e) {
    els.wimlibVersionText.textContent = '?';
  }
}

// ─── 7-Zip requirement check ─────────────────────────────────────
async function check7zRequired() {
  try {
    const data = await api('/api/7z-status');
    if (data.available) {
      els.sevenZipDot.className = 'status-dot ok';
      els.btn7zStatus.title = `7-Zip OK: ${data.path}`;
      return true;
    }
  } catch(e) {}
  els.sevenZipDot.className = 'status-dot fail';
  show7zRequiredModal();
  return false;
}

function show7zRequiredModal() {
  els.sevenZipError.style.display = 'none';
  els.sevenZipProgress.style.display = 'none';
  showModal('modal7zRequired');
}

function hide7zError() { els.sevenZipError.style.display = 'none'; }

async function install7zViaWinget() {
  hide7zError();
  els.sevenZipProgress.style.display = 'block';
  els.sevenZipProgressLabel.textContent = 'Instalando 7-Zip via winget...';
  els.btn7zInstallWinget.disabled = true;
  els.btn7zBrowsePath.disabled = true;
  try {
    const data = await api('/api/7z-install', { method: 'POST' });
    if (data.available) {
      els.sevenZipProgressLabel.textContent = '✅ 7-Zip instalado correctamente';
      els.sevenZipProgressFill.style.animation = 'none';
      els.sevenZipProgressFill.style.width = '100%';
      els.sevenZipDot.className = 'status-dot ok';
      els.btn7zStatus.title = `7-Zip OK: ${data.path}`;
      setTimeout(() => hideModal('modal7zRequired'), 1500);
    } else {
      throw new Error(data.error || '7-Zip no detectado tras la instalación');
    }
  } catch(e) {
    els.sevenZipProgress.style.display = 'none';
    els.sevenZipError.style.display = 'block';
    els.sevenZipErrorText.textContent = `❌ ${e.message}`;
    els.btn7zInstallWinget.disabled = false;
    els.btn7zBrowsePath.disabled = false;
  }
}

async function browse7zPath() {
  hide7zError();
  try {
    const folderData = await api('/api/pick-folder');
    if (!folderData.path) return;
    els.sevenZipProgress.style.display = 'block';
    els.sevenZipProgressLabel.textContent = `Verificando ${folderData.path}...`;
    const data = await api('/api/7z-set-path', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dirPath: folderData.path })
    });
    if (data.available) {
      els.sevenZipProgressLabel.textContent = `✅ 7-Zip encontrado: ${data.path}`;
      els.sevenZipProgressFill.style.animation = 'none';
      els.sevenZipProgressFill.style.width = '100%';
      els.sevenZipDot.className = 'status-dot ok';
      els.btn7zStatus.title = `7-Zip OK: ${data.path}`;
      setTimeout(() => hideModal('modal7zRequired'), 1500);
    }
  } catch(e) {
    els.sevenZipProgress.style.display = 'none';
    els.sevenZipError.style.display = 'block';
    els.sevenZipErrorText.textContent = `❌ ${e.message}`;
  }
}

async function exit7zModal() {
  try { await api('/api/exit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ force: true }) }); } catch(e) {}
  try { window.close(); } catch(e) {}
}

// ─── File Picker ──────────────────────────────────────────────────
async function pickFile() {
  setStatus('Abriendo explorador de archivos...', 'info');
  try { const data = await api('/api/pick-file'); if (data.path) { els.wimPathInput.value = data.path; setStatus('Archivo seleccionado', 'success'); } else setStatus('Selección cancelada', 'info'); }
  catch(e) { setStatus(`Error: ${e.message}`, 'error'); }
}

// ─── Open WIM ─────────────────────────────────────────────────────
async function openWim() {
  const wimPath = els.wimPathInput.value.trim();
  if (!wimPath) { setStatus('⚠️ Ingresa la ruta al archivo .wim', 'error'); return; }
  showLoading('Abriendo archivo WIM...');
  try {
    const data = await api('/api/open', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ wimPath }) });
    state.wimPath = wimPath;
    state.images = data.images || [];
    els.imageSelect.innerHTML = '';
    state.images.forEach(img => {
      const opt = document.createElement('option');
      opt.value = img.index;
      opt.textContent = `${img.index} — ${img.name || 'Sin nombre'}${img.fileCount ? ` (${img.fileCount.toLocaleString()} archivos)` : ''}`;
      els.imageSelect.appendChild(opt);
    });
    els.imageSelectorContainer.style.display = state.images.length > 1 ? 'flex' : 'none';
    hideLoading();

    if (state.images.length > 1) {
      // Multi-image: show selection modal
      showImageSelectModal();
    } else {
      // Single image: load directly
      state.imageIndex = state.images.length > 0 ? state.images[0].index : 1;
      setStatus(`✅ Abierto: ${state.images.length} imagen(es)`, 'success');
      await browseWim();
    }
  } catch(e) { setStatus(`❌ ${e.message}`, 'error'); hideLoading(); }
}

// ─── Image Selection Modal ────────────────────────────────────────
function showImageSelectModal() {
  els.imageSelectList.innerHTML = '';
  state.images.forEach(img => {
    const card = document.createElement('div');
    card.className = 'image-select-card';
    const stats = [];
    if (img.fileCount) stats.push(`${img.fileCount.toLocaleString()} archivos`);
    if (img.dirCount) stats.push(`${img.dirCount.toLocaleString()} carpetas`);
    card.innerHTML = `
      <span class="img-idx">${img.index}</span>
      <div class="img-info">
        <div class="img-name">${escapeHtml(img.name || 'Sin nombre')}</div>
        ${img.description ? `<div class="img-desc">${escapeHtml(img.description)}</div>` : ''}
        ${stats.length ? `<div class="img-stats">${stats.join(' • ')}</div>` : ''}
      </div>`;
    card.addEventListener('click', () => {
      state.imageIndex = img.index;
      els.imageSelect.value = img.index;
      hideModal('modalImageSelect');
      setStatus(`✅ Imagen ${img.index} seleccionada`, 'success');
      browseWim();
    });
    els.imageSelectList.appendChild(card);
  });
  showModal('modalImageSelect');
}

// ─── Browse (preserves current directory) ─────────────────────────
let _pendingStatusOverride = null;
async function browseWim() {
  const previousPath = state.currentPath; // Save current directory
  showLoading('Cargando estructura...');
  els.loadingProgressBar.style.display = 'block';
  els.progressFill.style.width = '10%';
  try {
    els.progressFill.style.width = '30%';
    const tree = await api(`/api/browse?image=${state.imageIndex}`);
    els.progressFill.style.width = '80%';
    state.tree = tree;
    state.selectedItems.clear();
    state.flatTree = {};
    (function flatten(n) { state.flatTree[n.path] = n; if (n.children) n.children.forEach(flatten); })(tree);
    els.progressFill.style.width = '100%';
    await new Promise(r => setTimeout(r, 100));
    renderTree();

    // Restore directory: find the previous path or closest valid parent
    let restoredPath = '\\';
    if (previousPath && previousPath !== '\\') {
      if (state.flatTree[previousPath]) {
        restoredPath = previousPath;
      } else {
        // Walk up to find closest valid parent
        const parts = previousPath.split('\\').filter(p => p);
        let candidate = '\\';
        for (const p of parts) {
          const next = candidate === '\\' ? '\\' + p : candidate + '\\' + p;
          if (state.flatTree[next]) candidate = next; else break;
        }
        restoredPath = candidate;
      }
    }
    state.currentPath = restoredPath;
    const node = state.flatTree[restoredPath] || tree;
    renderContent(node);
    updateBreadcrumb();
    enableButtons(true);

    if (_pendingStatusOverride) {
      setStatus(_pendingStatusOverride.text, _pendingStatusOverride.type);
      _pendingStatusOverride = null;
    } else {
      const total = Object.keys(state.flatTree).length;
      setStatus(`✅ ${total.toLocaleString()} elementos cargados`, 'success');
    }
  } catch(e) { setStatus(`❌ ${e.message}`, 'error'); }
  finally { hideLoading(); }
}

// ─── Render Tree ──────────────────────────────────────────────────
function renderTree() {
  els.treeContainer.innerHTML = '';
  els.treeEmpty.style.display = 'none';
  if (!state.tree) { els.treeEmpty.style.display = 'flex'; return; }
  const frag = document.createDocumentFragment();
  renderTreeNode(state.tree, frag, 0);
  els.treeContainer.appendChild(frag);
}
function renderTreeNode(node, parent, depth) {
  if (node.path !== '\\' && node.type !== 'directory') return;
  const dirs = (node.children || []).filter(c => c.type === 'directory');
  const item = document.createElement('div');
  item.className = 'tree-item';
  if (state.currentPath === node.path) item.classList.add('active');
  item.style.paddingLeft = `${10 + depth * 14}px`;
  item.dataset.path = node.path;
  const hasKids = dirs.length > 0;
  item.innerHTML = `<span class="tree-toggle ${hasKids && depth < 1 ? 'expanded' : ''}" style="${hasKids ? '' : 'visibility:hidden'}">▶</span>
    <span class="tree-icon">${node.path === '\\' ? '📦' : '📁'}</span>
    <span class="tree-label">${node.path === '\\' ? '(raíz)' : node.name}</span>`;
  item.addEventListener('click', e => {
    e.stopPropagation();
    const toggle = item.querySelector('.tree-toggle');
    const childEl = item.nextElementSibling;
    if (hasKids && childEl?.classList.contains('tree-children')) {
      const collapsed = childEl.classList.contains('collapsed');
      if (collapsed) {
        childEl.classList.remove('collapsed');
        childEl.style.maxHeight = 'none';
        toggle.classList.add('expanded');
      } else {
        childEl.style.maxHeight = childEl.scrollHeight + 'px';
        childEl.offsetHeight; // force reflow so transition has a start value
        childEl.classList.add('collapsed');
        childEl.style.maxHeight = '0px';
        toggle.classList.remove('expanded');
      }
    }
    navigateTo(node.path);
  });
  parent.appendChild(item);
  if (hasKids) {
    const cont = document.createElement('div');
    cont.className = 'tree-children';
    if (depth >= 1) { cont.style.maxHeight = '0px'; cont.classList.add('collapsed'); }
    dirs.forEach(c => renderTreeNode(c, cont, depth + 1));
    parent.appendChild(cont);
  }
}

// ─── Navigate ─────────────────────────────────────────────────────
function navigateTo(path) {
  state.currentPath = path;
  state.selectedItems.clear();
  const node = state.flatTree[path];
  if (node) renderContent(node);
  updateBreadcrumb();
  updateToolbarState();
  $$('.tree-item').forEach(el => el.classList.toggle('active', el.dataset.path === path));
}

// ─── Content Panel ────────────────────────────────────────────────
function renderContent(node) {
  els.contentEmpty.style.display = 'none';
  els.fileTable.style.display = 'table';
  els.fileTableBody.innerHTML = '';
  els.selectAll.checked = false;
  const children = node.children || [];
  els.fileCount.textContent = `${children.length} elementos`;
  els.contentTitle.textContent = `📄 ${node.path === '\\' ? 'Raíz' : node.name}`;
  if (!children.length) {
    els.fileTable.style.display = 'none';
    els.contentEmpty.style.display = 'flex';
    els.contentEmpty.querySelector('p').textContent = 'Esta carpeta está vacía';
    return;
  }
  const batchSize = 200;
  let idx = 0;
  function renderBatch() {
    const frag = document.createDocumentFragment();
    const end = Math.min(idx + batchSize, children.length);
    for (let i = idx; i < end; i++) frag.appendChild(createFileRow(children[i]));
    els.fileTableBody.appendChild(frag);
    idx = end;
    if (idx < children.length) requestAnimationFrame(renderBatch);
  }
  renderBatch();
}
function createFileRow(child) {
  const tr = document.createElement('tr');
  tr.dataset.path = child.path;
  tr.dataset.type = child.type;
  const isDir = child.type === 'directory';
  const icon = isDir ? '📁' : getFileIcon(child.name);
  const cnt = isDir ? ` (${(child.children || []).length})` : '';
  const size = isDir ? '—' : formatSize(child.size || 0);
  const mod = child.modified || '';
  tr.innerHTML = `<td class="col-check"><input type="checkbox" class="row-check" data-path="${child.path}"></td>
    <td class="col-icon">${icon}</td>
    <td class="col-name">${escapeHtml(child.name)}${cnt}</td>
    <td class="col-size">${size}</td>
    <td class="col-modified">${mod}</td>
    <td class="col-type">${isDir ? 'Carpeta' : getFileExt(child.name)}</td>`;
  tr.addEventListener('click', e => { if (e.target.type !== 'checkbox') handleRowClick(tr, e); });
  tr.addEventListener('dblclick', () => { if (isDir) { expandTreeTo(child.path); navigateTo(child.path); } });
  tr.addEventListener('contextmenu', e => {
    e.preventDefault();
    if (!state.selectedItems.has(child.path)) { state.selectedItems.clear(); state.selectedItems.add(child.path); updateRowSelection(); }
    showContextMenu(e.clientX, e.clientY);
  });
  tr.querySelector('.row-check').addEventListener('change', e => {
    if (e.target.checked) state.selectedItems.add(child.path); else state.selectedItems.delete(child.path);
    tr.classList.toggle('selected', e.target.checked);
    updateToolbarState();
  });
  return tr;
}
function handleRowClick(tr, e) {
  const path = tr.dataset.path;
  if (e.ctrlKey) { if (state.selectedItems.has(path)) state.selectedItems.delete(path); else state.selectedItems.add(path); }
  else { state.selectedItems.clear(); state.selectedItems.add(path); }
  updateRowSelection(); updateToolbarState();
}
function updateRowSelection() {
  $$('#fileTableBody tr').forEach(tr => { const sel = state.selectedItems.has(tr.dataset.path); tr.classList.toggle('selected', sel); tr.querySelector('.row-check').checked = sel; });
}
function expandTreeTo(target) {
  const parts = target.split('\\').filter(p => p);
  let cur = '\\';
  for (const p of parts) {
    cur = cur === '\\' ? '\\' + p : cur + '\\' + p;
    const ti = $(`.tree-item[data-path="${CSS.escape(cur)}"]`);
    if (ti) { const ch = ti.nextElementSibling; if (ch?.classList.contains('tree-children') && ch.classList.contains('collapsed')) { ch.classList.remove('collapsed'); ch.style.maxHeight = ch.scrollHeight + 'px'; ti.querySelector('.tree-toggle').classList.add('expanded'); } }
  }
}

// ─── Breadcrumb ───────────────────────────────────────────────────
function updateBreadcrumb() {
  els.breadcrumbBar.innerHTML = '';
  const parts = state.currentPath.split('\\').filter(p => p);
  let cur = '\\';
  const rootItem = document.createElement('span');
  rootItem.className = `breadcrumb-item ${parts.length === 0 ? 'active' : ''}`;
  rootItem.textContent = '📁 \\';
  rootItem.addEventListener('click', () => navigateTo('\\'));
  els.breadcrumbBar.appendChild(rootItem);
  parts.forEach((part, i) => {
    cur = cur === '\\' ? '\\' + part : cur + '\\' + part;
    const sep = document.createElement('span');
    sep.className = 'breadcrumb-separator'; sep.textContent = '›';
    els.breadcrumbBar.appendChild(sep);
    const item = document.createElement('span');
    item.className = `breadcrumb-item ${i === parts.length - 1 ? 'active' : ''}`;
    item.textContent = part;
    const navP = cur;
    item.addEventListener('click', () => navigateTo(navP));
    els.breadcrumbBar.appendChild(item);
  });
}

// ─── Helpers ──────────────────────────────────────────────────────
function getFileIcon(n) {
  const ext = n.split('.').pop().toLowerCase();
  const m = { exe:'⚙️',dll:'🔧',sys:'🔩',bat:'📜',cmd:'📜',ps1:'📜',txt:'📝',md:'📝',log:'📝',cfg:'📝',ini:'📝',xml:'📝',json:'📝',jpg:'🖼️',jpeg:'🖼️',png:'🖼️',gif:'🖼️',bmp:'🖼️',ico:'🖼️',svg:'🖼️',zip:'📦',rar:'📦','7z':'📦',cab:'📦',msi:'📦',wim:'📦',doc:'📄',docx:'📄',pdf:'📄',xls:'📊',xlsx:'📊',mp3:'🎵',wav:'🎵',mp4:'🎬',avi:'🎬',reg:'🗝️',lnk:'🔗',html:'🌐',css:'🎨',js:'📜' };
  return m[ext] || '📄';
}
function getFileExt(n) { const p = n.split('.'); return p.length > 1 ? '.' + p.pop().toUpperCase() : 'Archivo'; }
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024, sizes = ['B','KB','MB','GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// ─── Toolbar ──────────────────────────────────────────────────────
function enableButtons(en) {
  [els.btnAdd, els.btnAddMenu, els.btnDelete, els.btnExtract, els.btnReplace].forEach(b => b.disabled = !en);
}
function updateToolbarState() {
  const hasSel = state.selectedItems.size > 0, hasWim = !!state.wimPath;
  els.btnDelete.disabled = !hasWim || !hasSel;
  els.btnExtract.disabled = !hasWim || !hasSel;
  els.btnReplace.disabled = !hasWim || state.selectedItems.size !== 1;
  els.btnAdd.disabled = !hasWim;
}

// ─── Extract ──────────────────────────────────────────────────────
function showExtractModal() {
  if (!state.selectedItems.size) return;
  els.extractList.innerHTML = '';
  state.selectedItems.forEach(p => { const li = document.createElement('li'); li.textContent = p; els.extractList.appendChild(li); });
  showModal('modalExtract');
}
async function doExtract() {
  const d = els.extractDestInput.value.trim();
  if (!d) { setStatus('⚠️ Ingresa el directorio de destino', 'error'); return; }
  hideModal('modalExtract'); showLoading('Extrayendo...');
  try { const r = await api('/api/extract', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ paths: [...state.selectedItems], destDir: d }) }); setStatus(`✅ ${r.message}`, 'success'); }
  catch(e) { setStatus(`❌ ${e.message}`, 'error'); }
  finally { hideLoading(); }
}
async function pickExtractFolder() {
  try {
    const data = await api('/api/pick-folder');
    if (data.path) els.extractDestInput.value = data.path;
  } catch(e) { setStatus(`Error: ${e.message}`, 'error'); }
}

// ═══════════════════════════════════════════════════════════════════
// UNIFIED IMPORT FLOW
// Both "Agregar" button and drag-drop go through the same pipeline:
//   1. Collect files (from <input> or DataTransfer)
//   2. Build metadata array [{name, relativePath}]
//   3. POST /api/check-conflicts (backend, case-insensitive, from cached Set)
//   4. If conflicts → show modal → user confirms or cancels
//   5. POST /api/batch-import with files + destPaths
// ═══════════════════════════════════════════════════════════════════
let pendingImport = null;

// --- Step 1: Read files recursively from DataTransfer (drag-drop) ---
async function readAllEntries(dataTransfer) {
  const items = [];
  const rawEntries = [];
  for (const item of dataTransfer.items) {
    const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
    if (entry) rawEntries.push(entry);
  }
  if (rawEntries.length === 0) {
    for (const f of dataTransfer.files) items.push({ file: f, relativePath: f.name });
    return items;
  }
  async function readEntry(entry, basePath) {
    if (entry.isFile) {
      const file = await new Promise((res, rej) => entry.file(res, rej));
      items.push({ file, relativePath: basePath + entry.name });
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();
      let allEntries = [], batch;
      do {
        batch = await new Promise((res, rej) => dirReader.readEntries(res, rej));
        allEntries = allEntries.concat(batch);
      } while (batch.length > 0);
      for (const child of allEntries) await readEntry(child, basePath + entry.name + '\\');
    }
  }
  for (const entry of rawEntries) await readEntry(entry, '');
  return items;
}

// --- Step 1b: Read files from <input type="file"> ---
function readFileInput(fileList) {
  const items = [];
  for (const f of fileList) {
    const relPath = f.webkitRelativePath || f.name;
    items.push({ file: f, relativePath: relPath.replace(/\//g, '\\') });
  }
  return items;
}

// --- Step 2+3: Check conflicts via backend ---
async function checkConflicts(fileItems) {
  const fileMeta = fileItems.map(it => ({ name: it.file.name, relativePath: it.relativePath }));
  return await api('/api/check-conflicts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ files: fileMeta, destPath: state.currentPath })
  });
}

// --- Step 4: Show conflict modal ---
function showConflictModal(result, fileItems) {
  pendingImport = { fileItems, newList: result.newList, conflictList: result.conflictList };
  const total = result.total;
  els.conflictSummary.textContent = `Se encontraron ${total} elemento(s): ${result.newCount} nuevo(s) y ${result.conflictCount} que ya existen en el WIM.`;
  els.conflictNewCount.textContent = result.newCount;
  els.conflictReplaceCount.textContent = result.conflictCount;

  els.conflictNewList.innerHTML = '';
  els.conflictReplaceList.innerHTML = '';
  const MAX_SHOW = 25;
  result.newList.slice(0, MAX_SHOW).forEach(f => { const li = document.createElement('li'); li.textContent = f.relativePath || f.name; els.conflictNewList.appendChild(li); });
  if (result.newList.length > MAX_SHOW) { const li = document.createElement('li'); li.textContent = `… y ${result.newList.length - MAX_SHOW} más`; li.style.fontStyle = 'italic'; els.conflictNewList.appendChild(li); }
  if (result.newList.length === 0) { const li = document.createElement('li'); li.textContent = '(ninguno)'; li.style.fontStyle = 'italic'; els.conflictNewList.appendChild(li); }

  result.conflictList.slice(0, MAX_SHOW).forEach(f => { const li = document.createElement('li'); li.textContent = f.relativePath || f.name; els.conflictReplaceList.appendChild(li); });
  if (result.conflictList.length > MAX_SHOW) { const li = document.createElement('li'); li.textContent = `… y ${result.conflictList.length - MAX_SHOW} más`; li.style.fontStyle = 'italic'; els.conflictReplaceList.appendChild(li); }

  showModal('modalConflict');
}

// --- Step 5: Execute batch import (backend revalidates conflicts) ---
async function executeBatchImport(fileItems) {
  showLoading(`Importando ${fileItems.length} archivo(s)…`);
  try {
    const fd = new FormData();
    const destPaths = [];

    for (const item of fileItems) {
      fd.append('files', item.file, item.relativePath.replace(/\\/g, '/'));
      const wimDest = (state.currentPath === '\\' ? '\\' : state.currentPath + '\\') + item.relativePath;
      destPaths.push(wimDest);
    }
    fd.append('destPaths', JSON.stringify(destPaths));

    const r = await api('/api/batch-import', { method: 'POST', body: fd });
    _pendingStatusOverride = { text: `✅ ${r.message}`, type: 'success' };
    await browseWim();
  } catch(e) {
    setStatus(`❌ ${e.message}`, 'error');
    hideLoading();
  }
}

// --- Unified entry point: importFiles ---
async function importFiles(fileItems) {
  if (!fileItems.length) return;
  setStatus(`Analizando ${fileItems.length} archivo(s)…`, 'info');
  try {
    const result = await checkConflicts(fileItems);
    if (result.conflictCount > 0) {
      showConflictModal(result, fileItems);
    } else {
      await executeBatchImport(fileItems);
    }
  } catch(e) {
    setStatus(`❌ ${e.message}`, 'error');
  }
}

// --- Confirm from conflict modal ---
function confirmConflictImport() {
  if (!pendingImport) return;
  const { fileItems } = pendingImport;
  pendingImport = null;
  hideModal('modalConflict');
  executeBatchImport(fileItems);
}

// --- Drag-drop handler ---
async function handleDrop(e) {
  e.preventDefault();
  els.contentContainer.classList.remove('drag-over');
  if (!state.wimPath) return;
  const fileItems = await readAllEntries(e.dataTransfer);
  if (fileItems.length) await importFiles(fileItems);
}

// --- Agregar button handler: files ---
function handleAddFileInput(e) {
  const fileItems = readFileInput(e.target.files);
  e.target.value = '';
  if (fileItems.length) importFiles(fileItems);
}

// --- Agregar button handler: folder ---
function handleAddFolderInput(e) {
  const fileItems = readFileInput(e.target.files);
  e.target.value = '';
  if (fileItems.length) importFiles(fileItems);
}

// ─── Delete ───────────────────────────────────────────────────────
function showDeleteModal() {
  if (!state.selectedItems.size) return;
  els.deleteList.innerHTML = '';
  state.selectedItems.forEach(p => { const li = document.createElement('li'); li.textContent = p; els.deleteList.appendChild(li); });
  showModal('modalDelete');
}
async function doDelete() {
  hideModal('modalDelete'); showLoading('Eliminando...');
  try {
    const r = await api('/api/delete', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ paths: [...state.selectedItems] }) });
    state.selectedItems.clear();
    _pendingStatusOverride = { text: `✅ ${r.message}`, type: 'success' };
    await browseWim();
  } catch(e) { setStatus(`❌ ${e.message}`, 'error'); hideLoading(); }
}

// ─── Replace ──────────────────────────────────────────────────────
function showReplaceModal() {
  if (state.selectedItems.size !== 1) return;
  els.replaceTarget.textContent = [...state.selectedItems][0];
  els.replaceFileInput.value = '';
  showModal('modalReplace');
}
async function doReplace() {
  const tp = els.replaceTarget.textContent, f = els.replaceFileInput.files[0];
  if (!f) { setStatus('⚠️ Selecciona un archivo', 'error'); return; }
  hideModal('modalReplace'); showLoading('Reemplazando...');
  try {
    const fd = new FormData(); fd.append('targetPath', tp); fd.append('file', f);
    const r = await api('/api/replace', { method:'POST', body: fd });
    state.selectedItems.clear();
    _pendingStatusOverride = { text: `✅ ${r.message}`, type: 'success' };
    await browseWim();
  } catch(e) { setStatus(`❌ ${e.message}`, 'error'); hideLoading(); }
}

// ─── Exit (with confirmation) ─────────────────────────────────────
async function doExit() {
  // Always show confirmation modal
  try {
    const status = await api('/api/status');
    if (status.activeOperations > 0) {
      els.exitOpsWarning.textContent = `⚠️ Hay ${status.activeOperations} operación(es) en curso. Forzar el cierre podría corromper datos.`;
      els.exitOpsWarning.style.display = 'block';
    } else {
      els.exitOpsWarning.style.display = 'none';
    }
  } catch(e) { els.exitOpsWarning.style.display = 'none'; }
  showModal('modalExit');
}
async function doConfirmExit() {
  hideModal('modalExit');
  setStatus('Cerrando WimExplorer...', 'info');
  try { await api('/api/exit', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ force: true }) }); } catch(e) {}
  try { window.close(); } catch(e) {}
}

// ─── Modals ───────────────────────────────────────────────────────
function showModal(id) { document.getElementById(id).style.display = 'flex'; }
function hideModal(id) { document.getElementById(id).style.display = 'none'; }
function showContextMenu(x, y) { els.contextMenu.style.display = 'block'; els.contextMenu.style.left = Math.min(x, innerWidth - 200) + 'px'; els.contextMenu.style.top = Math.min(y, innerHeight - 150) + 'px'; }
function hideContextMenu() { els.contextMenu.style.display = 'none'; }

// ─── Drag & Drop setup ───────────────────────────────────────────
function setupDragDrop() {
  els.contentContainer.addEventListener('dragover', e => { e.preventDefault(); els.contentContainer.classList.add('drag-over'); });
  els.contentContainer.addEventListener('dragleave', () => els.contentContainer.classList.remove('drag-over'));
  els.contentContainer.addEventListener('drop', handleDrop);
}

// ─── Resize ───────────────────────────────────────────────────────
function setupResize() {
  let resizing = false;
  els.resizeHandle.addEventListener('mousedown', () => { resizing = true; els.resizeHandle.classList.add('active'); document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none'; });
  document.addEventListener('mousemove', e => { if (resizing) els.treePanel.style.width = Math.max(180, Math.min(500, e.clientX)) + 'px'; });
  document.addEventListener('mouseup', () => { if (resizing) { resizing = false; els.resizeHandle.classList.remove('active'); document.body.style.cursor = ''; document.body.style.userSelect = ''; } });
}

// ─── Select All ───────────────────────────────────────────────────
function setupSelectAll() {
  els.selectAll.addEventListener('change', e => {
    $$('#fileTableBody tr').forEach(tr => {
      const p = tr.dataset.path;
      if (e.target.checked) state.selectedItems.add(p); else state.selectedItems.delete(p);
      tr.classList.toggle('selected', e.target.checked);
      tr.querySelector('.row-check').checked = e.target.checked;
    });
    updateToolbarState();
  });
}
function collapseAllTree() {
  $$('.tree-children').forEach(el => { el.classList.add('collapsed'); el.style.maxHeight = '0px'; });
  $$('.tree-toggle').forEach(el => el.classList.remove('expanded'));
}

// ─── Console Tab Switching ────────────────────────────────────────
let activeConsoleTab = 'logs';

function switchConsoleTab(tab) {
  activeConsoleTab = tab;
  els.tabLogs.classList.toggle('active', tab === 'logs');
  els.tabTerminal.classList.toggle('active', tab === 'terminal');
  els.paneLogsHeader.style.display = tab === 'logs' ? 'flex' : 'none';
  els.paneTerminalHeader.style.display = tab === 'terminal' ? 'flex' : 'none';
  if (tab === 'terminal') terminalWelcome();
}

// ─── Init ─────────────────────────────────────────────────────────
async function init() {
  connectSSE();
  loadLogHistory();
  await check7zRequired();
  initWimlibVersion();

  // 7z modal handlers
  els.btn7zInstallWinget.addEventListener('click', install7zViaWinget);
  els.btn7zBrowsePath.addEventListener('click', browse7zPath);
  els.btn7zExit.addEventListener('click', exit7zModal);

  els.btnOpen.addEventListener('click', openWim);
  els.wimPathInput.addEventListener('keydown', e => { if (e.key === 'Enter') openWim(); });
  els.btnBrowseFile.addEventListener('click', pickFile);
  els.imageSelect.addEventListener('change', () => { state.imageIndex = parseInt(els.imageSelect.value, 10); browseWim(); });

  // Agregar split-button: main button opens files, dropdown for files/folder
  els.btnAdd.addEventListener('click', () => els.addFileInput.click());
  els.addFileInput.addEventListener('change', handleAddFileInput);
  els.addFolderInput.addEventListener('change', handleAddFolderInput);

  // Split-button dropdown toggle
  els.btnAddMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    const dd = els.addDropdown;
    dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
  });
  els.optAddFiles.addEventListener('click', () => { els.addDropdown.style.display = 'none'; els.addFileInput.click(); });
  els.optAddFolder.addEventListener('click', () => {
    els.addDropdown.style.display = 'none';
    // Show folder warning modal instead of opening input directly
    showModal('modalFolderWarn');
  });
  els.btnConfirmFolderSelect.addEventListener('click', () => {
    hideModal('modalFolderWarn');
    els.addFolderInput.click();
  });
  document.addEventListener('click', () => els.addDropdown.style.display = 'none');

  els.btnDelete.addEventListener('click', showDeleteModal);
  els.btnExtract.addEventListener('click', showExtractModal);
  els.btnReplace.addEventListener('click', showReplaceModal);
  els.btnCollapseAll.addEventListener('click', collapseAllTree);

  els.btnConsole.addEventListener('click', () => toggleConsole());
  els.btnCloseConsole.addEventListener('click', () => toggleConsole(false));
  els.btnClearConsole.addEventListener('click', () => { els.consoleBody.innerHTML = ''; });
  els.btnCopyConsole.addEventListener('click', copyConsoleLogs);
  els.btnLogsFullscreen.addEventListener('click', () => {
    els.consoleBodyModal.innerHTML = els.consoleBody.innerHTML;
    els.consoleBodyModal.scrollTop = els.consoleBodyModal.scrollHeight;
    showModal('modalLogsFullscreen');
  });
  els.btnCopyLogsModal.addEventListener('click', () => {
    const lines = [];
    els.consoleBodyModal.querySelectorAll('.log-entry').forEach(el => lines.push(el.textContent));
    navigator.clipboard.writeText(lines.join('\n')).then(() => setStatus('📋 Log copiado al portapapeles', 'success')).catch(() => setStatus('❌ Error al copiar', 'error'));
  });
  els.btnClearLogsModal.addEventListener('click', () => { els.consoleBody.innerHTML = ''; els.consoleBodyModal.innerHTML = ''; });
  els.btnShowLoadingLogs.addEventListener('click', () => {
    toggleConsole(true, 'logs');
    els.consolePanel.style.zIndex = '3500';
  });

  // Terminal
  els.btnTerminal.addEventListener('click', () => toggleConsole(true, 'terminal'));
  els.tabLogs.addEventListener('click', () => switchConsoleTab('logs'));
  els.tabTerminal.addEventListener('click', () => switchConsoleTab('terminal'));
  els.btnRunTerminal.addEventListener('click', () => runTerminalCommand(els.terminalInput.value));
  els.terminalInput.addEventListener('keydown', e => { if (e.key === 'Enter') runTerminalCommand(els.terminalInput.value); });
  els.btnCloseTerminal.addEventListener('click', () => toggleConsole(false));
  els.btnCopyTerminal.addEventListener('click', copyTerminalText);
  els.btnCopyTerminalModal.addEventListener('click', copyTerminalText);
  els.btnTerminalFullscreen.addEventListener('click', () => { renderTerminal(); showModal('modalTerminal'); els.terminalInputModal.focus(); });
  els.btnRunTerminalModal.addEventListener('click', () => runTerminalCommand(els.terminalInputModal.value));
  els.terminalInputModal.addEventListener('keydown', e => { if (e.key === 'Enter') runTerminalCommand(els.terminalInputModal.value); });

  els.btn7zStatus.addEventListener('click', check7zStatus);
  els.btnCopyStatus.addEventListener('click', copyStatus);

  // Exit: always show confirmation
  els.btnExit.addEventListener('click', doExit);
  els.btnConfirmExit.addEventListener('click', doConfirmExit);

  els.btnConfirmDelete.addEventListener('click', doDelete);
  els.btnConfirmExtract.addEventListener('click', doExtract);
  els.btnBrowseExtractDest.addEventListener('click', pickExtractFolder);
  els.btnConfirmReplace.addEventListener('click', doReplace);
  els.btnConfirmConflict.addEventListener('click', confirmConflictImport);

  $$('.modal-close, .btn-secondary[data-modal], .btn-primary[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => { if (btn.dataset.modal) hideModal(btn.dataset.modal); });
  });
  $$('.modal-overlay').forEach(o => o.addEventListener('click', e => { if (e.target === o) o.style.display = 'none'; }));

  $$('.context-item').forEach(item => {
    item.addEventListener('click', () => { hideContextMenu(); const a = item.dataset.action; if (a === 'extract') showExtractModal(); else if (a === 'delete') showDeleteModal(); else if (a === 'replace') showReplaceModal(); });
  });
  document.addEventListener('click', hideContextMenu);

  setupDragDrop();
  setupResize();
  setupSelectAll();

  document.addEventListener('keydown', e => {
    if (e.key === 'Delete' && state.selectedItems.size && state.wimPath) showDeleteModal();
    if (e.key === 'Escape') { hideContextMenu(); $$('.modal-overlay').forEach(m => m.style.display = 'none'); }
    if (e.ctrlKey && e.key === 'a' && state.wimPath) { e.preventDefault(); els.selectAll.checked = true; els.selectAll.dispatchEvent(new Event('change')); }
  });
}

document.addEventListener('DOMContentLoaded', init);

/* ─── Theme Toggle ─────────────────────────────────────────────────── */
(function() {
  const btn = document.getElementById('btnThemeToggle');
  const root = document.documentElement;
  const saved = localStorage.getItem('wme-theme');
  if (saved === 'light') { root.setAttribute('data-theme', 'light'); btn.textContent = '🌙'; }
  btn.addEventListener('click', () => {
    const isLight = root.getAttribute('data-theme') === 'light';
    if (isLight) { root.removeAttribute('data-theme'); btn.textContent = '☀️'; localStorage.setItem('wme-theme', 'dark'); }
    else { root.setAttribute('data-theme', 'light'); btn.textContent = '🌙'; localStorage.setItem('wme-theme', 'light'); }
  });
})();
