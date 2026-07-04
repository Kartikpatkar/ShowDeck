/**
 * ShowDeck — Settings & Data Portability Page
 * Handle TMDB API Key, Export, Import, and Data clearing.
 */

import { db, clearAllData } from '../database/db.js';
import { toast } from '../components/toast.js';
import { el } from '../utils/dom.js';

export function render() {
  const currentKey = localStorage.getItem('showdeck_tmdb_key') || '';

  return `
    <div class="page-container animate-fade-in">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Settings</h1>
          <p class="page-subtitle">Configure providers and manage your data.</p>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:var(--space-8);">
        
        <!-- Metadata Provider -->
        <div class="card" style="display:flex;flex-direction:column;gap:var(--space-4);">
          <div>
            <h3 class="section-title" style="margin:0;">Metadata Provider</h3>
            <p class="text-tertiary" style="font-size:var(--text-sm);margin-top:var(--space-1);">Configure where ShowDeck fetches information.</p>
          </div>
          
          <div style="display:flex;flex-direction:column;gap:var(--space-3);">
            <label style="font-weight:var(--weight-medium);display:flex;justify-content:space-between;">
              <span>TMDB API Key</span>
              <span class="badge badge-primary">Required for Movies</span>
            </label>
            <input type="password" id="tmdb-key-input" class="input" placeholder="Enter your TMDB API Key (v3 auth)" value="${currentKey}">
            <p class="text-tertiary" style="font-size:var(--text-xs);">
              Your key is stored locally on this device and never sent to our servers. <a href="https://developer.themoviedb.org/docs" target="_blank" style="color:var(--color-primary);">Get a free key here.</a>
            </p>
            <button class="btn btn-primary" id="save-key-btn">Save Key</button>
          </div>
        </div>

        <!-- Data Portability -->
        <div class="card" style="display:flex;flex-direction:column;gap:var(--space-4);">
          <div>
            <h3 class="section-title" style="margin:0;">Data Management</h3>
            <p class="text-tertiary" style="font-size:var(--text-sm);margin-top:var(--space-1);">Backup or restore your library.</p>
          </div>
          
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);">
            <button class="btn btn-secondary" id="export-json-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Export Backup (JSON)
            </button>
            
            <button class="btn btn-secondary" id="import-json-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              Restore Backup
            </button>
            <input type="file" id="import-file" accept=".json" style="display:none;">
          </div>
          
          <hr style="border:none;border-top:1px solid var(--border-subtle);margin:var(--space-2) 0;">
          
          <div>
            <h4 style="color:var(--color-error);margin-bottom:var(--space-2);">Danger Zone</h4>
            <button class="btn btn-ghost text-error" id="clear-data-btn" style="width:100%;justify-content:center;border:1px solid var(--color-error);">
              Delete All Data
            </button>
          </div>
        </div>

      </div>
    </div>
  `;
}

export function init() {
  bindEvents();
}

function bindEvents() {
  // TMDB Key
  const saveKeyBtn = document.getElementById('save-key-btn');
  saveKeyBtn?.addEventListener('click', () => {
    const key = document.getElementById('tmdb-key-input').value.trim();
    if (key) {
      localStorage.setItem('showdeck_tmdb_key', key);
      toast('API Key saved successfully', 'success');
    } else {
      localStorage.removeItem('showdeck_tmdb_key');
      toast('API Key removed', 'warning');
    }
  });

  // Export JSON
  const exportBtn = document.getElementById('export-json-btn');
  exportBtn?.addEventListener('click', async () => {
    try {
      exportBtn.disabled = true;
      exportBtn.textContent = 'Exporting...';
      
      const backup = {
        version: 1,
        timestamp: new Date().toISOString(),
        data: {
          shows: await db.shows.toArray(),
          movies: await db.movies.toArray(),
          episodes: await db.episodes.toArray(),
          collections: await db.collections.toArray(),
          tags: await db.tags.toArray(),
          activity: await db.activity.toArray(),
        }
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `showdeck_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      toast('Backup exported successfully', 'success');
    } catch (err) {
      console.error(err);
      toast('Export failed', 'error');
    } finally {
      exportBtn.disabled = false;
      exportBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg> Export Backup (JSON)';
    }
  });

  // Import JSON
  const importBtn = document.getElementById('import-json-btn');
  const fileInput = document.getElementById('import-file');
  
  importBtn?.addEventListener('click', () => fileInput.click());
  
  fileInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const { confirmModal } = await import('../components/modal.js');
    const isConfirmed = await confirmModal(
      'Restore Backup',
      'This will MERGE the imported backup with your current data. Duplicate IDs will be overwritten. Continue?',
      'Restore'
    );

    if (!isConfirmed) {
      fileInput.value = '';
      return;
    }

    try {
      const text = await file.text();
      const backup = JSON.parse(text);

      if (!backup.data || !backup.version) {
        throw new Error('Invalid backup file format');
      }

      const { shows, movies, episodes, collections, tags, activity } = backup.data;

      // Use Dexie bulkPut to merge (insert or update)
      await db.transaction('rw', db.shows, db.movies, db.episodes, db.collections, db.tags, db.activity, async () => {
        if (shows?.length) await db.shows.bulkPut(shows);
        if (movies?.length) await db.movies.bulkPut(movies);
        if (episodes?.length) await db.episodes.bulkPut(episodes);
        if (collections?.length) await db.collections.bulkPut(collections);
        if (tags?.length) await db.tags.bulkPut(tags);
        if (activity?.length) await db.activity.bulkPut(activity);
      });

      toast('Backup restored successfully!', 'success');
    } catch (err) {
      console.error(err);
      toast(err.message === 'Invalid backup file format' ? err.message : 'Import failed', 'error');
    } finally {
      fileInput.value = '';
    }
  });

  // Clear Data
  const clearBtn = document.getElementById('clear-data-btn');
  clearBtn?.addEventListener('click', async () => {
    const { confirmModal } = await import('../components/modal.js');
    
    const confirm1 = await confirmModal(
      'Delete All Data',
      'WARNING: This will permanently delete your entire library, history, collections, and API keys. This action cannot be undone. Are you sure?',
      'Yes, Delete Everything',
      true
    );
    if (!confirm1) return;

    try {
      // Clear DB
      await clearAllData();
      
      // Clear LocalStorage settings (including TMDB key)
      localStorage.removeItem('showdeck_tmdb_key');
      localStorage.removeItem('showdeck_theme');
      
      toast('All data has been deleted.', 'success');
      setTimeout(() => window.location.hash = '#/home', 1500);
      setTimeout(() => window.location.reload(), 1600);
    } catch (err) {
      console.error(err);
      toast('Failed to clear data', 'error');
    }
  });
}
