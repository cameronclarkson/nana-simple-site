const $ = (id) => document.getElementById(id);

const yearEl = $('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

function fmtNow() {
  return new Date().toLocaleString(undefined, {
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
  const statusEl = $('status');

  if (nowEl) nowEl.textContent = fmtNow();
  if (tzEl) tzEl.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local time';
  if (statusEl) statusEl.textContent = navigator.onLine ? 'Online' : 'Offline';
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
      window.prompt('Copy email:', email);
    }
  });
}

// Scratchpad (local-only)
const scratchKey = 'nana:scratch';
const scratch = $('scratch');
if (scratch) {
  scratch.value = localStorage.getItem(scratchKey) || '';
  scratch.addEventListener('input', () => localStorage.setItem(scratchKey, scratch.value));
}
