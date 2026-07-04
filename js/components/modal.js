/**
 * ShowDeck — Modal Component
 * Renders custom confirmation modals.
 */

export function confirmModal(title, message, confirmText = 'Confirm', isDanger = false) {
  return new Promise((resolve) => {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay animate-fade-in';
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      z-index: 9999;
      display: flex; align-items: center; justify-content: center;
      padding: var(--space-4);
    `;

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'card';
    modal.style.cssText = `
      width: 100%; max-width: 400px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
      transform: scale(0.95);
      animation: modalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    `;

    // Add keyframes if not exists
    if (!document.getElementById('modal-styles')) {
      const style = document.createElement('style');
      style.id = 'modal-styles';
      style.textContent = `
        @keyframes modalPop {
          to { transform: scale(1); }
        }
      `;
      document.head.appendChild(style);
    }

    modal.innerHTML = `
      <h3 style="margin-bottom:var(--space-2); color: ${isDanger ? 'var(--color-error)' : 'inherit'};">${title}</h3>
      <p style="color:var(--text-secondary); margin-bottom:var(--space-6); line-height:1.5;">${message}</p>
      <div style="display:flex; justify-content:flex-end; gap:var(--space-3);">
        <button class="btn btn-ghost" id="modal-cancel">Cancel</button>
        <button class="btn ${isDanger ? 'btn-primary' : 'btn-primary'}" id="modal-confirm" style="${isDanger ? 'background:var(--color-error);' : ''}">${confirmText}</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Event Listeners
    const cancelBtn = modal.querySelector('#modal-cancel');
    const confirmBtn = modal.querySelector('#modal-confirm');

    const cleanup = (result) => {
      overlay.style.opacity = '0';
      modal.style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
        resolve(result);
      }, 200);
    };

    cancelBtn.addEventListener('click', () => cleanup(false));
    confirmBtn.addEventListener('click', () => cleanup(true));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cleanup(false);
    });
  });
}
