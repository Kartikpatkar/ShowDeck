/**
 * ShowDeck — Toast Notification Component
 * Lightweight toast system for success/error/warning/info messages.
 */

let container = null;

function ensureContainer() {
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.id = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success' | 'error' | 'warning' | 'info'} type
 * @param {number} duration - ms before auto-dismiss (default 3500)
 */
export function toast(message, type = 'info', duration = 3500) {
  const c = ensureContainer();

  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.setAttribute('role', 'status');

  el.innerHTML = `
    <span class="toast-message">${message}</span>
    <button class="toast-close" aria-label="Dismiss">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    </button>
  `;

  el.querySelector('.toast-close').addEventListener('click', () => dismiss(el));

  c.appendChild(el);

  if (duration > 0) {
    setTimeout(() => dismiss(el), duration);
  }

  return el;
}

function dismiss(el) {
  el.style.animation = 'fadeOut 200ms ease forwards';
  el.addEventListener('animationend', () => el.remove(), { once: true });
  // Fallback
  setTimeout(() => { if (el.parentNode) el.remove(); }, 250);
}
