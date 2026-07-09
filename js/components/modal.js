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
 * Prompt modal — input, Cancel/OK buttons.
 */
export function promptModal(title, message, placeholder = '') {
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
      width: 100%; max-width: 320px; padding: var(--space-6);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
      transform: scale(0.95);
      animation: modalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    `;

    modal.innerHTML = `
      <h3 style="margin-bottom:var(--space-2);">${title}</h3>
      <p style="color:var(--text-secondary); margin-bottom:var(--space-4); font-size:var(--text-sm);">${message}</p>
      <input type="text" class="input" id="prompt-input" placeholder="${placeholder}" style="width:100%; margin-bottom:var(--space-4);">
      <div style="display:flex; justify-content:flex-end; gap:var(--space-3);">
        <button class="btn btn-ghost" id="modal-cancel">Cancel</button>
        <button class="btn btn-primary" id="modal-ok">OK</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const input = modal.querySelector('#prompt-input');
    input.focus();

    const cleanup = () => {
      overlay.style.opacity = '0';
      modal.style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (document.body.contains(overlay)) document.body.removeChild(overlay);
      }, 200);
    };

    modal.querySelector('#modal-cancel').addEventListener('click', () => {
      cleanup();
      resolve(null);
    });

    modal.querySelector('#modal-ok').addEventListener('click', () => {
      const val = input.value.trim();
      cleanup();
      resolve(val || null);
    });
    
    input.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        const val = input.value.trim();
        cleanup();
        resolve(val || null);
      }
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        cleanup();
        resolve(null);
      }
    });
  });
}

/**
 * Add To Collection modal
 */
export async function addToCollectionModal(itemId, itemType) {
  const { db } = await import('../database/db.js');
  const collections = await db.collections.toArray();
  const itemKey = `${itemType}:${itemId}`;

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
      width: 100%; max-width: 320px; padding: var(--space-6);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
      transform: scale(0.95);
      animation: modalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
    `;

    const colListHtml = collections.length > 0 ? collections.map(c => {
      const inCol = c.itemIds && c.itemIds.includes(itemKey);
      return `
        <label style="display:flex; align-items:center; gap:var(--space-3); padding:var(--space-2); cursor:pointer; border-radius:var(--radius-sm); transition:background 0.2s;" onmouseover="this.style.background='var(--surface-3)'" onmouseout="this.style.background='transparent'">
          <input type="checkbox" class="col-checkbox" data-id="${c.id}" ${inCol ? 'checked' : ''} style="accent-color:var(--text-primary);width:18px;height:18px;">
          <span style="font-size:var(--text-md);">${c.icon || '📁'} ${c.name}</span>
        </label>
      `;
    }).join('') : `<div style="color:var(--text-tertiary);font-size:var(--text-sm);text-align:center;padding:var(--space-2);">No collections found</div>`;

    modal.innerHTML = `
      <h3 style="margin-bottom:var(--space-4); text-align:center;">Add to Collection</h3>
      <div style="flex:1; overflow-y:auto; margin-bottom:var(--space-4); display:flex; flex-direction:column; gap:4px; border:1px solid var(--border); padding:var(--space-2); border-radius:var(--radius-md);">
        ${colListHtml}
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <button class="btn btn-ghost btn-sm" id="modal-new-col">+ New</button>
        <div style="display:flex; gap:var(--space-2);">
          <button class="btn btn-ghost btn-sm" id="modal-cancel">Cancel</button>
          <button class="btn btn-primary btn-sm" id="modal-save">Done</button>
        </div>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const cleanup = () => {
      overlay.style.opacity = '0';
      modal.style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (document.body.contains(overlay)) document.body.removeChild(overlay);
      }, 200);
    };

    modal.querySelector('#modal-cancel').addEventListener('click', () => {
      cleanup();
      resolve(false);
    });
    
    modal.querySelector('#modal-new-col').addEventListener('click', async () => {
      overlay.style.display = 'none'; // hide temp
      const newName = await promptModal('New Collection', 'Enter a name for the new collection:', 'Favorites');
      if (newName) {
        const { addCollection } = await import('../database/collections.js');
        const id = await addCollection({ name: newName, icon: '📁', itemIds: [itemKey] });
        cleanup();
        resolve(true); // created and added
      } else {
        overlay.style.display = 'flex'; // show again
      }
    });

    modal.querySelector('#modal-save').addEventListener('click', async () => {
      const checkboxes = modal.querySelectorAll('.col-checkbox');
      const { addToCollection, removeFromCollection } = await import('../database/collections.js');
      
      for (const cb of checkboxes) {
        const id = parseInt(cb.dataset.id, 10);
        if (cb.checked) {
          await addToCollection(id, itemId, itemType);
        } else {
          await removeFromCollection(id, itemId, itemType);
        }
      }
      
      cleanup();
      resolve(true);
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        cleanup();
        resolve(false);
      }
    });
  });
}

/**
 * Manage Tags modal
 */
export async function manageTagsModal(itemId, itemType) {
  const { db } = await import('../database/db.js');
  const tags = await db.tags.toArray();
  const store = itemType === 'show' ? db.shows : db.movies;
  const item = await store.get(itemId);
  if (!item) return false;
  
  const currentTags = item.tags || [];

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
      width: 100%; max-width: 320px; padding: var(--space-6);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
      transform: scale(0.95);
      animation: modalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
    `;

    const tagListHtml = tags.length > 0 ? tags.map(t => {
      const hasTag = currentTags.includes(t.name);
      return \`
        <label style="display:flex; align-items:center; gap:var(--space-3); padding:var(--space-2); cursor:pointer; border-radius:var(--radius-sm); transition:background 0.2s;" onmouseover="this.style.background='var(--surface-3)'" onmouseout="this.style.background='transparent'">
          <input type="checkbox" class="tag-checkbox" data-name="\${t.name}" \${hasTag ? 'checked' : ''} style="accent-color:var(--text-primary);width:18px;height:18px;">
          <span style="font-size:var(--text-md);">#\${t.name}</span>
        </label>
      \`;
    }).join('') : \`<p style="color:var(--text-tertiary); font-size:var(--text-sm); text-align:center;">No tags created yet. Go to Settings > Collections to create tags.</p>\`;

    modal.innerHTML = \`
      <h3 style="margin-bottom:var(--space-4); display:flex; align-items:center; gap:var(--space-2);">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
        Manage Tags
      </h3>
      <div style="flex:1; overflow-y:auto; margin-bottom:var(--space-4); display:flex; flex-direction:column; gap:2px;">
        \${tagListHtml}
      </div>
      <div style="display:flex; justify-content:flex-end; gap:var(--space-3); margin-top:auto;">
        <button class="btn btn-ghost" id="modal-cancel">Cancel</button>
        <button class="btn btn-primary" id="modal-save">Save</button>
      </div>
    \`;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const cleanup = () => {
      overlay.style.opacity = '0';
      modal.style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (document.body.contains(overlay)) document.body.removeChild(overlay);
      }, 200);
    };

    modal.querySelector('#modal-cancel').addEventListener('click', () => {
      cleanup();
      resolve(false);
    });

    modal.querySelector('#modal-save').addEventListener('click', async () => {
      const selected = Array.from(modal.querySelectorAll('.tag-checkbox:checked')).map(cb => cb.dataset.name);
      await store.update(itemId, { tags: selected });
      cleanup();
      resolve(true);
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        cleanup();
        resolve(false);
      }
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
