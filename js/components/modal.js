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
      width: 100%; max-width: 400px; padding: var(--space-6);
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

/**
 * Alert modal — info-only, single "OK" button.
 */
export function alertModal(title, message) {
  return new Promise((resolve) => {
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

    const modal = document.createElement('div');
    modal.className = 'card';
    modal.style.cssText = `
      width: 100%; max-width: 440px; padding: var(--space-6);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
      transform: scale(0.95);
      animation: modalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    `;

    if (!document.getElementById('modal-styles')) {
      const style = document.createElement('style');
      style.id = 'modal-styles';
      style.textContent = `@keyframes modalPop { to { transform: scale(1); } }`;
      document.head.appendChild(style);
    }

    modal.innerHTML = `
      <h3 style="margin-bottom:var(--space-2);">${title}</h3>
      <pre style="color:var(--text-secondary); margin-bottom:var(--space-6); line-height:1.6; white-space:pre-wrap; font-family:inherit; font-size:var(--text-sm);">${message}</pre>
      <div style="display:flex; justify-content:flex-end;">
        <button class="btn btn-primary" id="modal-ok">OK</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const cleanup = () => {
      overlay.style.opacity = '0';
      modal.style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (document.body.contains(overlay)) document.body.removeChild(overlay);
        resolve();
      }, 200);
    };

    modal.querySelector('#modal-ok').addEventListener('click', cleanup);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cleanup();
    });
  });
}

/**
 * Rating modal - 5 star selection
 */
export function ratingModal(title) {
  return new Promise((resolve) => {
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

    const modal = document.createElement('div');
    modal.className = 'card';
    modal.style.cssText = `
      width: 100%; max-width: 320px; padding: var(--space-6); text-align: center;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
      transform: scale(0.95);
      animation: modalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    `;

    if (!document.getElementById('modal-styles')) {
      const style = document.createElement('style');
      style.id = 'modal-styles';
      style.textContent = `@keyframes modalPop { to { transform: scale(1); } }`;
      document.head.appendChild(style);
    }

    modal.innerHTML = `
      <h3 style="margin-bottom:var(--space-2);">${title}</h3>
      <p style="color:var(--text-secondary); margin-bottom:var(--space-4); font-size:var(--text-sm);">How would you rate it?</p>
      <div id="star-container" style="display:flex; justify-content:center; gap:var(--space-2); font-size:32px; color:var(--surface-3); margin-bottom:var(--space-6); cursor:pointer;">
        <span data-val="1">★</span>
        <span data-val="2">★</span>
        <span data-val="3">★</span>
        <span data-val="4">★</span>
        <span data-val="5">★</span>
      </div>
      <div style="display:flex; justify-content:space-between; gap:var(--space-3);">
        <button class="btn btn-ghost" id="modal-skip" style="flex:1;">Skip</button>
        <button class="btn btn-primary" id="modal-save" style="flex:1;" disabled>Save</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    let selectedRating = 0;
    const stars = modal.querySelectorAll('#star-container span');
    const saveBtn = modal.querySelector('#modal-save');
    const skipBtn = modal.querySelector('#modal-skip');

    stars.forEach(s => {
      s.addEventListener('mouseover', (e) => {
        const val = parseInt(e.target.dataset.val, 10);
        stars.forEach(st => {
          st.style.color = parseInt(st.dataset.val, 10) <= val ? 'var(--color-warning)' : 'var(--surface-3)';
        });
      });
      s.addEventListener('mouseout', () => {
        stars.forEach(st => {
          st.style.color = parseInt(st.dataset.val, 10) <= selectedRating ? 'var(--color-warning)' : 'var(--surface-3)';
        });
      });
      s.addEventListener('click', (e) => {
        selectedRating = parseInt(e.target.dataset.val, 10);
        saveBtn.disabled = false;
        stars.forEach(st => {
          st.style.color = parseInt(st.dataset.val, 10) <= selectedRating ? 'var(--color-warning)' : 'var(--surface-3)';
        });
      });
    });

    const cleanup = (result) => {
      overlay.style.opacity = '0';
      modal.style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (document.body.contains(overlay)) document.body.removeChild(overlay);
        resolve(result);
      }, 200);
    };

    saveBtn.addEventListener('click', () => cleanup(selectedRating));
    skipBtn.addEventListener('click', () => cleanup(null));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cleanup(null);
    });
  });
}
