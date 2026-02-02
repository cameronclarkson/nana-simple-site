const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

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
  const nowEl = document.getElementById('now');
  const tzEl = document.getElementById('tz');
  if (nowEl) nowEl.textContent = fmtNow();
  if (tzEl) tzEl.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local time';

  const uptimeEl = document.getElementById('uptime');
  if (uptimeEl) {
    const s = Math.floor((Date.now() - start) / 1000);
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    uptimeEl.textContent = `Uptime: ${mm}:${ss}`;
  }

  const statusEl = document.getElementById('status');
  if (statusEl) {
    const online = navigator.onLine;
    statusEl.textContent = online ? 'Online' : 'Offline';
  }
}

setInterval(tick, 1000);
tick();

// Scratchpad (local-only)
const scratch = document.getElementById('scratch');
if (scratch) {
  const key = 'nana:scratch';
  scratch.value = localStorage.getItem(key) || '';
  scratch.addEventListener('input', () => localStorage.setItem(key, scratch.value));
}

// Tiny todo list (local-only)
const todoKey = 'nana:top3';
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
  const list = document.getElementById('todoList');
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

const form = document.getElementById('todoForm');
const input = document.getElementById('todoInput');
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
