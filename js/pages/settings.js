/**
 * ShowDeck — Settings & Data Portability Page
 * Handle TMDB API Key, Export, Import, and Data clearing.
 */

import { db, clearAllData } from '../database/db.js';
import { toast } from '../components/toast.js';
import { el } from '../utils/dom.js';
import { getApiUsage } from '../utils/apiTracker.js';

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
        
        <!-- Personalization -->
        <div class="card" style="display:flex;flex-direction:column;gap:var(--space-4);padding:var(--space-6);">
          <div>
            <h3 class="section-title" style="margin:0;">Personalization</h3>
            <p class="text-tertiary" style="font-size:var(--text-sm);margin-top:var(--space-1);">Customize your ShowDeck experience.</p>
          </div>
          <div style="display:flex;flex-direction:column;gap:var(--space-3);">
            <label style="font-weight:var(--weight-medium);">Your Name</label>
            <div style="display:flex;gap:var(--space-2);">
              <input type="text" id="user-name-input" class="input" placeholder="What should we call you?" value="${localStorage.getItem('showdeck_user_name') || ''}" style="flex:1;">
              <button class="btn btn-secondary" id="save-name-btn">Save</button>
            </div>
          </div>
        </div>
        
        <!-- API Keys -->
        <div class="card" style="display:flex;flex-direction:column;gap:var(--space-4);padding:var(--space-6);">
          <div>
            <h3 class="section-title" style="margin:0;">API Providers</h3>
            <p class="text-tertiary" style="font-size:var(--text-sm);margin-top:var(--space-1);">ShowDeck connects directly to these services.</p>
          </div>
          
          <div style="display:flex;flex-direction:column;gap:var(--space-3);">
            <label style="font-weight:var(--weight-medium);display:flex;justify-content:space-between;align-items:center;">
              <span>TMDB API Key</span>
              <div style="display:flex;gap:var(--space-2);align-items:center;">
                <span id="api-status-badge" class="badge" style="display:none;"></span>
                <span class="badge badge-primary">Required for Movies</span>
              </div>
            </label>
            <input type="password" id="tmdb-key-input" class="input" placeholder="Enter your TMDB API Key (v3 auth)" value="${currentKey}">
            <p class="text-tertiary" style="font-size:var(--text-xs);">
              Your key is stored locally on this device and never sent to our servers. <a href="https://developer.themoviedb.org/docs" target="_blank" style="color:var(--color-primary);">Get a free key here.</a>
            </p>
            <button class="btn btn-primary" id="save-key-btn">Save Key</button>

            <hr style="border:0;border-top:1px solid var(--border-subtle);margin:var(--space-4) 0;">
            <label style="font-weight:var(--weight-medium);">Daily API Usage (Local Tracker)</label>
            <div style="display:flex;flex-direction:column;gap:var(--space-2);">
              <div style="display:flex;justify-content:space-between;font-size:var(--text-sm);">
                <span>TMDB Requests</span>
                <span class="text-tertiary">${getApiUsage().tmdb} / ~20,000</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:var(--text-sm);">
                <span>TVMaze Requests</span>
                <span class="text-tertiary">${getApiUsage().tvmaze} / ~2,000</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Portability -->
        <div class="card" style="display:flex;flex-direction:column;gap:var(--space-4);padding:var(--space-6);">
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
        </div>

        <!-- TV Time Import -->
        <div class="card" style="display:flex;flex-direction:column;gap:var(--space-4);padding:var(--space-6);border-color:var(--color-primary);">
          <div>
            <h3 class="section-title" style="margin:0;">
              <span style="margin-right:var(--space-2);">📺</span>Import from TV Time
            </h3>
            <p class="text-tertiary" style="font-size:var(--text-sm);margin-top:var(--space-1);">
              Import your watch history from a TV Time GDPR data export (.zip).
            </p>
          </div>
          
          <div style="display:flex;flex-direction:column;gap:var(--space-3);">
            <button class="btn btn-primary" id="tvtime-import-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              Select TV Time ZIP File
            </button>
            <input type="file" id="tvtime-file" accept=".zip" style="display:none;">
            
            <div id="tvtime-progress" class="hidden" style="display:flex;flex-direction:column;gap:var(--space-2);">
              <div style="height:6px;background:var(--surface-3);border-radius:var(--radius-full);overflow:hidden;">
                <div id="tvtime-progress-bar" style="height:100%;width:0%;background:var(--color-primary);border-radius:var(--radius-full);transition:width 0.3s ease;"></div>
              </div>
              <p id="tvtime-progress-text" class="text-tertiary" style="font-size:var(--text-xs);"></p>
            </div>
          </div>

          <div style="border-top:1px solid var(--border-color);padding-top:var(--space-4);margin-top:var(--space-2);">
            <h4 style="margin-bottom:var(--space-2);">Fix Missing Matches</h4>
            <p class="text-tertiary" style="font-size:var(--text-xs);margin-bottom:var(--space-3);">Manually match imported items that couldn't be found on TMDB automatically.</p>
            <a href="#/enrich" class="btn btn-secondary" style="width:100%;justify-content:center;">Find Missing Matches</a>
          </div>

          <p class="text-tertiary" style="font-size:var(--text-xs);margin-top:var(--space-2);">
            Request your data from TV Time via Settings → Privacy → Download my data. Your file is processed entirely on this device.
          </p>
        </div>

        <!-- Danger Zone -->
        <div class="card" style="display:flex;flex-direction:column;gap:var(--space-4);border-color:var(--color-error);padding:var(--space-6);">
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
  checkApiStatus();
}

async function checkApiStatus() {
  const badge = document.getElementById('api-status-badge');
  if (!badge) return;
  const key = localStorage.getItem('showdeck_tmdb_key');
  if (!key) {
    badge.style.display = 'none';
    return;
  }
  
  badge.style.display = 'inline-flex';
  badge.className = 'badge badge-warning';
  badge.textContent = 'Checking...';
  
  try {
    const res = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${key}`);
    if (res.ok) {
      badge.className = 'badge badge-success';
      badge.textContent = 'Active (Green)';
    } else {
      badge.className = 'badge badge-error';
      badge.textContent = 'Invalid (Red)';
    }
  } catch (err) {
    badge.className = 'badge badge-error';
    badge.textContent = 'Network Error (Red)';
  }
}

function bindEvents() {
  // User Name
  const saveNameBtn = document.getElementById('save-name-btn');
  saveNameBtn?.addEventListener('click', () => {
    const name = document.getElementById('user-name-input').value.trim();
    if (name) {
      localStorage.setItem('showdeck_user_name', name);
      toast('Name saved', 'success');
    } else {
      localStorage.removeItem('showdeck_user_name');
      toast('Name removed', 'success');
    }
  });

  const saveKeyBtn = document.getElementById('save-key-btn');
  saveKeyBtn?.addEventListener('click', () => {
    const key = document.getElementById('tmdb-key-input').value.trim();
    if (key) {
      localStorage.setItem('showdeck_tmdb_key', key);
      toast('API Key saved successfully', 'success');
      checkApiStatus();
    } else {
      localStorage.removeItem('showdeck_tmdb_key');
      toast('API Key removed', 'warning');
      checkApiStatus();
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

  // TV Time Import
  const tvtimeBtn = document.getElementById('tvtime-import-btn');
  const tvtimeFile = document.getElementById('tvtime-file');
  const tvtimeProgress = document.getElementById('tvtime-progress');
  const tvtimeBar = document.getElementById('tvtime-progress-bar');
  const tvtimeText = document.getElementById('tvtime-progress-text');

  tvtimeBtn?.addEventListener('click', () => tvtimeFile.click());

  tvtimeFile?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check it's a ZIP
    if (!file.name.endsWith('.zip')) {
      toast('Please select a .zip file from TV Time', 'error');
      tvtimeFile.value = '';
      return;
    }

    // Check TMDB API key exists
    if (!localStorage.getItem('showdeck_tmdb_key')) {
      toast('Please set your TMDB API Key first — it is needed to resolve show metadata.', 'error');
      tvtimeFile.value = '';
      return;
    }

    tvtimeBtn.disabled = true;
    tvtimeBtn.textContent = 'Importing...';
    tvtimeProgress.classList.remove('hidden');
    tvtimeProgress.style.display = 'flex';

    try {
      const { importTVTimeData } = await import('../services/tvtime-import.js');

      const summary = await importTVTimeData(file, (stage, current, total, detail) => {
        const pct = total > 0 ? Math.round((current / total) * 100) : 0;
        tvtimeBar.style.width = `${pct}%`;
        
        if (stage === 'importing') {
          tvtimeText.textContent = `[${current}/${total}] Importing: ${detail}`;
        } else if (stage === 'movies') {
          tvtimeText.textContent = `[${current}/${total}] Movies: ${detail}`;
        } else {
          tvtimeText.textContent = detail;
        }
      });

      // Show summary
      const { alertModal } = await import('../components/modal.js');
      const lines = [
        `✅ Shows imported: ${summary.showsImported}`,
        `⏭️ Shows skipped (already exist): ${summary.showsSkipped}`,
        `❌ Shows not found on TMDB: ${summary.showsNotFound}`,
        `📺 Episodes marked as watched: ${summary.episodesImported}`,
        `🎬 Movies imported: ${summary.moviesImported}`,
        `⏭️ Movies skipped: ${summary.moviesSkipped}`,
      ];
      if (summary.errors.length > 0) {
        lines.push(`\n⚠️ Errors: ${summary.errors.length}`);
      }
      if (summary.notFoundShows.length > 0) {
        lines.push(`\nShows not found:\n• ${summary.notFoundShows.slice(0, 10).join('\n• ')}`);
        if (summary.notFoundShows.length > 10) lines.push(`...and ${summary.notFoundShows.length - 10} more`);
      }

      await alertModal('TV Time Import Complete', lines.join('\n'));
      toast('Import complete!', 'success');

    } catch (err) {
      console.error('[TV Time Import]', err);
      toast(`Import failed: ${err.message}`, 'error');
    } finally {
      tvtimeBtn.disabled = false;
      tvtimeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg> Select TV Time ZIP File';
      tvtimeProgress.classList.add('hidden');
      tvtimeFile.value = '';
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
