/**
 * ShowDeck — Tags Manager Page
 */
import { db } from '../database/db.js';
import { toast } from '../components/toast.js';

export function render() {
  return `
    <div class="page-container animate-fade-in">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Tags</h1>
          <p class="page-subtitle">Manage your library tags globally</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-primary" id="add-tag-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Tag
          </button>
        </div>
      </div>
      <div id="tags-content" class="stagger-children" style="display:flex; flex-direction:column; gap:var(--space-4);"></div>
    </div>
  `;
}

export async function init() {
  await loadTags();
  
  document.getElementById('add-tag-btn')?.addEventListener('click', async () => {
    const name = prompt('Enter new tag name:');
    if (!name || !name.trim()) return;
    try {
      await db.tags.add({ name: name.trim() });
      toast('Tag created', 'success');
      loadTags();
    } catch (err) {
      toast('Tag already exists or error occurred', 'error');
    }
  });
}

async function loadTags() {
  const container = document.getElementById('tags-content');
  if (!container) return;
  
  const tags = await db.tags.toArray();
  const shows = await db.shows.toArray();
  const movies = await db.movies.toArray();
  
  if (tags.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3 class="empty-state-title">No tags yet</h3>
        <p class="empty-state-text">Create tags to organize your library.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = tags.map(tag => {
    const count = shows.filter(s => s.tags?.includes(tag.name)).length + 
                  movies.filter(m => m.tags?.includes(tag.name)).length;
    return `
      <div class="card" style="display:flex; justify-content:space-between; align-items:center; padding:var(--space-4);">
        <div style="display:flex; align-items:center; gap:var(--space-3);">
          <div style="background:var(--surface-3); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
          </div>
          <div>
            <h3 style="margin:0; font-size:var(--text-lg); font-weight:var(--weight-semibold);">#${tag.name}</h3>
            <p style="margin:0; font-size:var(--text-sm); color:var(--text-secondary);">${count} items</p>
          </div>
        </div>
        <div style="display:flex; gap:var(--space-2);">
          <button class="btn btn-ghost btn-sm" data-action="rename" data-id="${tag.id}" data-name="${tag.name}">Rename</button>
          <button class="btn btn-ghost btn-sm" data-action="delete" data-id="${tag.id}" data-name="${tag.name}" style="color:var(--color-danger);">Delete</button>
        </div>
      </div>
    `;
  }).join('');
  
  container.querySelectorAll('[data-action="rename"]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = parseInt(e.target.dataset.id);
      const oldName = e.target.dataset.name;
      const newName = prompt('Enter new name for tag:', oldName);
      if (!newName || newName.trim() === '' || newName.trim() === oldName) return;
      
      try {
        await renameTag(id, oldName, newName.trim());
        toast('Tag renamed', 'success');
        loadTags();
      } catch(err) {
        toast('Error renaming tag', 'error');
      }
    });
  });

  container.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = parseInt(e.target.dataset.id);
      const name = e.target.dataset.name;
      if (!confirm(`Are you sure you want to delete the tag "${name}"? It will be removed from all items.`)) return;
      
      try {
        await deleteTag(id, name);
        toast('Tag deleted', 'success');
        loadTags();
      } catch(err) {
        toast('Error deleting tag', 'error');
      }
    });
  });
}

async function renameTag(tagId, oldName, newName) {
  await db.transaction('rw', db.tags, db.shows, db.movies, async () => {
    await db.tags.update(tagId, { name: newName });
    
    const shows = await db.shows.toArray();
    for (const show of shows) {
      if (show.tags && show.tags.includes(oldName)) {
        const newTags = show.tags.map(t => t === oldName ? newName : t);
        await db.shows.update(show.id, { tags: newTags });
      }
    }
    
    const movies = await db.movies.toArray();
    for (const movie of movies) {
      if (movie.tags && movie.tags.includes(oldName)) {
        const newTags = movie.tags.map(t => t === oldName ? newName : t);
        await db.movies.update(movie.id, { tags: newTags });
      }
    }
  });
}

async function deleteTag(tagId, tagName) {
  await db.transaction('rw', db.tags, db.shows, db.movies, async () => {
    await db.tags.delete(tagId);
    
    const shows = await db.shows.toArray();
    for (const show of shows) {
      if (show.tags && show.tags.includes(tagName)) {
        const newTags = show.tags.filter(t => t !== tagName);
        await db.shows.update(show.id, { tags: newTags });
      }
    }
    
    const movies = await db.movies.toArray();
    for (const movie of movies) {
      if (movie.tags && movie.tags.includes(tagName)) {
        const newTags = movie.tags.filter(t => t !== tagName);
        await db.movies.update(movie.id, { tags: newTags });
      }
    }
  });
}
