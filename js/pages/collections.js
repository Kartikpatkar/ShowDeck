/**
 * ShowDeck — Collections & Tags Page
 * Manage custom collections and tags.
 */

import { getAllCollections, addCollection, deleteCollection } from '../database/collections.js';
import { getAllTags, addTag, deleteTag, renameTag } from '../database/tags.js';
import { toast } from '../components/toast.js';

export function render() {
  return `
    <div class="page-container animate-fade-in">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Organization</h1>
          <p class="page-subtitle">Manage your collections and tags.</p>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:var(--space-8);">
        
        <!-- Collections Column -->
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-4);">
            <h2 class="section-title" style="margin:0;">Collections</h2>
            <button class="btn btn-primary btn-sm" id="new-collection-btn">+ New Collection</button>
          </div>
          
          <!-- New Collection Form (Hidden by default) -->
          <div id="new-collection-form" class="card hidden" style="margin-bottom:var(--space-4); padding:var(--space-4);">
            <div style="display:flex;gap:var(--space-2);margin-bottom:var(--space-3);">
              <input type="text" id="col-name" class="input" placeholder="Collection Name" style="flex:1;">
              <input type="text" id="col-icon" class="input" placeholder="Icon (e.g. 🍿)" style="width:100px;">
            </div>
            <div style="display:flex;justify-content:flex-end;gap:var(--space-2);">
              <button class="btn btn-ghost btn-sm" id="cancel-col-btn">Cancel</button>
              <button class="btn btn-primary btn-sm" id="save-col-btn">Save</button>
            </div>
          </div>

          <div id="collections-list" class="stagger-children" style="display:flex;flex-direction:column;gap:var(--space-2);">
            <!-- Populated by JS -->
          </div>
        </div>

        <!-- Tags Column -->
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-4);">
            <h2 class="section-title" style="margin:0;">Tags</h2>
            <button class="btn btn-primary btn-sm" id="new-tag-btn">+ New Tag</button>
          </div>
          
          <!-- New Tag Form (Hidden by default) -->
          <div id="new-tag-form" class="card hidden" style="margin-bottom:var(--space-4); padding:var(--space-4);">
            <div style="display:flex;gap:var(--space-2);margin-bottom:var(--space-3);">
              <input type="text" id="tag-name" class="input" placeholder="Tag Name" style="flex:1;">
            </div>
            <div style="display:flex;justify-content:flex-end;gap:var(--space-2);">
              <button class="btn btn-ghost btn-sm" id="cancel-tag-btn">Cancel</button>
              <button class="btn btn-primary btn-sm" id="save-tag-btn">Save</button>
            </div>
          </div>

          <div id="tags-list" style="display:flex;flex-wrap:wrap;gap:var(--space-2);">
            <!-- Populated by JS -->
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function init() {
  await renderLists();
  bindEvents();
}

async function renderLists() {
  const [collections, tags] = await Promise.all([
    getAllCollections(),
    getAllTags()
  ]);

  const colList = document.getElementById('collections-list');
  const tagList = document.getElementById('tags-list');

  // Render Collections
  if (collections.length === 0) {
    colList.innerHTML = `<div class="empty-state" style="padding:var(--space-6) var(--space-4);"><p class="empty-state-text">No collections yet.</p></div>`;
  } else {
    colList.innerHTML = collections.map(c => `
      <div class="card" style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);position:relative;">
        <a href="#/library?collection=${c.id}" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;"></a>
        <div style="font-size:24px;width:40px;height:40px;background:var(--surface-3);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;position:relative;z-index:2;">${c.icon || '📁'}</div>
        <div style="flex:1;position:relative;z-index:2;pointer-events:none;">
          <div style="font-weight:var(--weight-medium);">${c.name}</div>
          <div style="font-size:var(--text-xs);color:var(--text-tertiary);">${c.itemIds?.length || 0} items</div>
        </div>
        <button class="btn btn-icon btn-sm btn-ghost text-error" style="position:relative;z-index:2;" data-action="delete-col" data-id="${c.id}" data-name="${c.name}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      </div>
    `).join('');
  }

  // Render Tags
  if (tags.length === 0) {
    tagList.innerHTML = `<div class="empty-state" style="padding:var(--space-6) var(--space-4);width:100%;"><p class="empty-state-text">No tags yet.</p></div>`;
  } else {
    tagList.innerHTML = tags.map(t => `
      <div class="badge" style="background:var(--surface-3);font-size:var(--text-sm);padding:var(--space-1) var(--space-2) var(--space-1) var(--space-3);display:flex;align-items:center;gap:var(--space-2);">
        #${t.name}
        <button class="btn btn-icon btn-ghost" style="width:16px;height:16px;padding:0;min-height:0;" data-action="delete-tag" data-id="${t.id}" data-name="${t.name}">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    `).join('');
  }
}

function bindEvents() {
  // Collections Form
  const newColBtn = document.getElementById('new-collection-btn');
  const colForm = document.getElementById('new-collection-form');
  const cancelCol = document.getElementById('cancel-col-btn');
  const saveCol = document.getElementById('save-col-btn');
  const colNameInput = document.getElementById('col-name');
  const colIconInput = document.getElementById('col-icon');

  newColBtn?.addEventListener('click', () => { colForm.classList.remove('hidden'); colNameInput.focus(); });
  cancelCol?.addEventListener('click', () => { colForm.classList.add('hidden'); colNameInput.value = ''; colIconInput.value = ''; });
  
  saveCol?.addEventListener('click', async () => {
    const name = colNameInput.value.trim();
    const icon = colIconInput.value.trim() || '📁';
    if (!name) return toast('Name is required', 'error');
    
    await addCollection({ name, icon });
    toast(`Collection "${name}" created`, 'success');
    colForm.classList.add('hidden');
    colNameInput.value = ''; colIconInput.value = '';
    renderLists();
  });

  // Tags Form
  const newTagBtn = document.getElementById('new-tag-btn');
  const tagForm = document.getElementById('new-tag-form');
  const cancelTag = document.getElementById('cancel-tag-btn');
  const saveTag = document.getElementById('save-tag-btn');
  const tagNameInput = document.getElementById('tag-name');

  newTagBtn?.addEventListener('click', () => { tagForm.classList.remove('hidden'); tagNameInput.focus(); });
  cancelTag?.addEventListener('click', () => { tagForm.classList.add('hidden'); tagNameInput.value = ''; });
  
  saveTag?.addEventListener('click', async () => {
    const name = tagNameInput.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!name) return toast('Valid tag name required (a-z, 0-9, -)', 'error');
    
    await addTag(name);
    toast(`Tag "#${name}" created`, 'success');
    tagForm.classList.add('hidden');
    tagNameInput.value = '';
    renderLists();
  });

  // Delegated Deletes
  document.addEventListener('click', async (e) => {
    const delColBtn = e.target.closest('[data-action="delete-col"]');
    if (delColBtn) {
      const { confirmModal } = await import('../components/modal.js');
      const isConfirmed = await confirmModal(
        'Delete Collection',
        `Are you sure you want to delete the collection "${delColBtn.dataset.name}"? This won't delete the shows inside it.`,
        'Delete',
        true
      );
      if (!isConfirmed) return;
      
      await deleteCollection(parseInt(delColBtn.dataset.id));
      toast('Collection deleted');
      renderLists();
    }

    const delTagBtn = e.target.closest('[data-action="delete-tag"]');
    if (delTagBtn) {
      const { confirmModal } = await import('../components/modal.js');
      const isConfirmed = await confirmModal(
        'Delete Tag',
        `Are you sure you want to delete the tag "#${delTagBtn.dataset.name}"?`,
        'Delete',
        true
      );
      if (!isConfirmed) return;
      
      await deleteTag(parseInt(delTagBtn.dataset.id));
      toast('Tag deleted');
      renderLists();
    }
  });
}
