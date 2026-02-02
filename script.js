const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const statusEl = document.getElementById('status');
if (statusEl) {
  const online = navigator.onLine;
  statusEl.textContent = online ? 'Online — ready.' : 'Offline — cached page still works.';
}
