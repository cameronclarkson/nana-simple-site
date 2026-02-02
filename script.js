const $ = (id) => document.getElementById(id);

const yearEl = $('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Theme toggle (local-only)
const themeKey = 'nana:theme';
function applyTheme(theme) {
  if (!theme) {
    document.documentElement.removeAttribute('data-theme');
    return;
  }
  document.documentElement.setAttribute('data-theme', theme);
}
applyTheme(localStorage.getItem(themeKey) || '');
const themeBtn = $('themeBtn');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'light' ? '' : 'light';
    if (next) localStorage.setItem(themeKey, next);
    else localStorage.removeItem(themeKey);
    applyTheme(next);
  });
}

// Clock + status
const start = Date.now();

function fmtNow() {
  const d = new Date();
  return d.toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function tick() {
  const nowEl = $('now');
  const tzEl = $('tz');
  if (nowEl) nowEl.textContent = fmtNow();
  if (tzEl) tzEl.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local time';

  const uptimeEl = $('uptime');
  if (uptimeEl) {
    const s = Math.floor((Date.now() - start) / 1000);
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    uptimeEl.textContent = `Uptime: ${mm}:${ss}`;
  }

  const statusEl = $('status');
  if (statusEl) {
    const online = navigator.onLine;
    statusEl.textContent = online ? 'Online' : 'Offline';
  }
}

setInterval(tick, 1000);
tick();

// Copy email
const copyEmail = $('copyEmail');
const emailLink = $('emailLink');
if (copyEmail && emailLink) {
  copyEmail.addEventListener('click', async () => {
    const email = (emailLink.textContent || '').trim();
    try {
      await navigator.clipboard.writeText(email);
      copyEmail.textContent = 'Copied';
      setTimeout(() => (copyEmail.textContent = 'Copy'), 900);
    } catch {
      // fallback
      window.prompt('Copy email:', email);
    }
  });
}

// Scratchpad + todos (local-only)
const scratchKey = 'nana:scratch';
const todoKey = 'nana:top3';

const scratch = $('scratch');
if (scratch) {
  scratch.value = localStorage.getItem(scratchKey) || '';
  scratch.addEventListener('input', () => localStorage.setItem(scratchKey, scratch.value));
}

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(todoKey) || '[]');
  } catch {
    return [];
  }
}
function saveTodos(items) {
  localStorage.setItem(todoKey, JSON.stringify(items.slice(0, 3)));
}
function renderTodos() {
  const list = $('todoList');
  if (!list) return;
  list.innerHTML = '';
  const items = loadTodos();
  items.forEach((t, idx) => {
    const li = document.createElement('li');
    const text = document.createElement('span');
    text.textContent = t;
    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = 'Done';
    del.addEventListener('click', () => {
      const next = loadTodos().filter((_, i) => i !== idx);
      saveTodos(next);
      renderTodos();
    });
    li.appendChild(text);
    li.appendChild(del);
    list.appendChild(li);
  });
}

const form = $('todoForm');
const input = $('todoInput');
if (form && input) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = (input.value || '').trim();
    if (!v) return;
    const next = [v, ...loadTodos()].slice(0, 3);
    saveTodos(next);
    input.value = '';
    renderTodos();
  });
}
renderTodos();

// Export / import / clear
function exportData() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    scratch: localStorage.getItem(scratchKey) || '',
    top3: loadTodos(),
    theme: localStorage.getItem(themeKey) || '',
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'nana-dashboard.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result || '{}'));
      if (typeof data.scratch === 'string') localStorage.setItem(scratchKey, data.scratch);
      if (Array.isArray(data.top3)) saveTodos(data.top3.map(String));
      if (typeof data.theme === 'string') {
        if (data.theme) localStorage.setItem(themeKey, data.theme);
        else localStorage.removeItem(themeKey);
        applyTheme(data.theme);
      }
      if (scratch) scratch.value = localStorage.getItem(scratchKey) || '';
      renderTodos();
    } catch {
      alert('Could not import: invalid JSON');
    }
  };
  reader.readAsText(file);
}

const exportBtn = $('exportBtn');
if (exportBtn) exportBtn.addEventListener('click', exportData);

const importBtn = $('importBtn');
const importFile = $('importFile');
if (importBtn && importFile) {
  importBtn.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', () => {
    const f = importFile.files && importFile.files[0];
    if (f) importData(f);
    importFile.value = '';
  });
}

const clearBtn = $('clearBtn');
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    const ok = confirm('Clear scratchpad + Top 3 in this browser?');
    if (!ok) return;
    localStorage.removeItem(scratchKey);
    localStorage.removeItem(todoKey);
    if (scratch) scratch.value = '';
    renderTodos();
  });
}
