/**
 * ShowDeck — Settings & Data Portability Page
 * Handle TMDB API Key, Export, Import, and Data clearing.
 */

import { db, clearAllData } from '../database/db.js';
import { toast } from '../components/toast.js';
import { el } from '../utils/dom.js';
import { getApiUsage } from '../utils/apiTracker.js';
import { APP_VERSION } from '../app.js';

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

          <div style="display:flex;flex-direction:column;gap:var(--space-3);margin-top:var(--space-4);padding-top:var(--space-4);border-top:1px solid var(--border-color);">
            <label style="font-weight:var(--weight-medium);">Accent Color</label>
            <div style="display:flex;gap:var(--space-3);align-items:center;" id="theme-color-picker">
              <button class="btn btn-ghost color-preset" data-theme="purple" style="width:40px;height:40px;border-radius:50%;background:hsl(245, 58%, 51%);border:2px solid transparent;" aria-label="Purple"></button>
              <button class="btn btn-ghost color-preset" data-theme="blue" style="width:40px;height:40px;border-radius:50%;background:hsl(210, 100%, 50%);border:2px solid transparent;" aria-label="Blue"></button>
              <button class="btn btn-ghost color-preset" data-theme="green" style="width:40px;height:40px;border-radius:50%;background:hsl(152, 55%, 42%);border:2px solid transparent;" aria-label="Green"></button>
              <button class="btn btn-ghost color-preset" data-theme="red" style="width:40px;height:40px;border-radius:50%;background:hsl(0, 72%, 51%);border:2px solid transparent;" aria-label="Red"></button>
              <div style="position: relative; width: 40px; height: 40px;">
                <input type="color" id="settings-custom-color" value="${localStorage.getItem('showdeck_custom_color') || '#ffffff'}" style="opacity: 0; position: absolute; inset: 0; width: 100%; height: 100%; cursor: pointer; z-index: 2;" />
                <div class="color-preset" id="settings-custom-color-preview" data-theme="custom" style="width: 40px; height: 40px; border-radius: 50%; background: ${localStorage.getItem('showdeck_custom_color') || 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)'}; border: 2px solid transparent; pointer-events: none; position: absolute; inset: 0;"></div>
              </div>
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
          
          <div style="display:flex;flex-direction:column;gap:var(--space-3);">
            <button class="btn btn-secondary" id="export-json-btn" style="width:100%;justify-content:center;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Export Backup (JSON)
            </button>
            
            <button class="btn btn-secondary" id="import-json-btn" style="width:100%;justify-content:center;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              Restore Backup
            </button>
            <input type="file" id="import-file" accept=".json" style="display:none;">

            <button class="btn btn-secondary" id="export-csv-btn" style="width:100%;justify-content:center;margin-top:var(--space-2);">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              Export to CSV
            </button>
            
            <button class="btn btn-primary" id="share-library-btn" style="width:100%;justify-content:center;margin-top:var(--space-2);">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              Share Library Link
            </button>
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

      <div style="text-align:center;padding:var(--space-4) 0;">
        <p class="text-tertiary" style="font-size:var(--text-xs);">ShowDeck v${APP_VERSION} • Privacy-first, offline-first entertainment tracker.</p>
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
    const nameInput = document.getElementById('user-name-input');
    localStorage.setItem('showdeck_user_name', nameInput.value.trim());
    toast('Name saved successfully', 'success');
  });

  // Setup theme picker
  const currentTheme = localStorage.getItem('showdeck_accent_theme') || 'purple';
  const themeButtons = document.querySelectorAll('#theme-color-picker .color-preset');
  
  const updateThemeVisuals = (theme) => {
    themeButtons.forEach(b => b.style.borderColor = 'transparent');
    const activeBtn = document.querySelector(`#theme-color-picker [data-theme="${theme}"]`);
    if (activeBtn) activeBtn.style.borderColor = 'var(--text-primary)';
  };
  
  updateThemeVisuals(currentTheme);

  themeButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const theme = btn.dataset.theme;
      if (theme !== 'custom') {
        document.body.dataset.theme = theme;
        localStorage.setItem('showdeck_accent_theme', theme);
        localStorage.removeItem('showdeck_custom_color');
        const { applyCustomTheme } = await import('../utils/dom.js');
        applyCustomTheme(null);
        updateThemeVisuals(theme);
      }
    });
  });

  const customColorInput = document.getElementById('settings-custom-color');
  const customColorPreview = document.getElementById('settings-custom-color-preview');
  
  if (customColorInput) {
    customColorInput.addEventListener('input', async (e) => {
      const hex = e.target.value;
      customColorPreview.style.background = hex;
      document.body.dataset.theme = 'custom';
      localStorage.setItem('showdeck_accent_theme', 'custom');
      localStorage.setItem('showdeck_custom_color', hex);
      const { applyCustomTheme } = await import('../utils/dom.js');
      applyCustomTheme(hex);
      updateThemeVisuals('custom');
    });
  }

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

  // Export CSV
  const exportCsvBtn = document.getElementById('export-csv-btn');
  exportCsvBtn?.addEventListener('click', async () => {
    try {
      exportCsvBtn.disabled = true;
      exportCsvBtn.innerHTML = '<div class="spinner" style="width:14px;height:14px;border-width:2px;margin-right:4px;"></div> Exporting...';
      
      const { db } = await import('../database/db.js');
      const shows = await db.shows.toArray();
      const movies = await db.movies.toArray();
      const episodes = await db.episodes.where('watched').equals(1).toArray();
      
      let csvContent = 'Type,Title,Status,Rating,WatchedEpisodes\n';
      
      shows.forEach(s => {
        const epCount = episodes.filter(e => e.showId === s.id).length;
        csvContent += `Show,"${s.title.replace(/"/g, '""')}",${s.trackingStatus},${s.rating || ''},${epCount}\n`;
      });
      
      movies.forEach(m => {
        csvContent += `Movie,"${m.title.replace(/"/g, '""')}",${m.trackingStatus},${m.rating || ''},N/A\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `showdeck_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast('CSV exported successfully', 'success');
    } catch (err) {
      console.error(err);
      toast('CSV Export failed', 'error');
    } finally {
      exportCsvBtn.disabled = false;
      exportCsvBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> Export to CSV';
    }
  });

  // Share Library
  const shareBtn = document.getElementById('share-library-btn');
  shareBtn?.addEventListener('click', async () => {
    try {
      shareBtn.disabled = true;
      shareBtn.innerHTML = '<div class="spinner" style="width:14px;height:14px;border-width:2px;margin-right:4px;"></div> Generating...';
      
      const { db } = await import('../database/db.js');
      const shows = await db.shows.filter(s => s.trackingStatus !== 'Plan to Watch').toArray();
      const movies = await db.movies.filter(m => m.trackingStatus !== 'Plan to Watch').toArray();
      const episodes = await db.episodes.filter(e => e.watched).toArray();
      
      const stats = {
        sc: shows.length, // show count
        mc: movies.length, // movie count
        ec: episodes.length, // episode count
        ts: shows.sort((a,b)=> (b.rating||0) - (a.rating||0)).slice(0,3).map(s=>s.title) // top 3 shows
      };
      
      const base64 = btoa(encodeURIComponent(JSON.stringify(stats)));
      const shareUrl = `${window.location.origin}${window.location.pathname}#/share?data=${base64}`;
      
      await navigator.clipboard.writeText(shareUrl);
      toast('Share link copied to clipboard!', 'success');
    } catch (err) {
      console.error(err);
      toast('Failed to generate share link', 'error');
    } finally {
      shareBtn.disabled = false;
      shareBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> Share Library Link';
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

      // Basic schema validation (M-5)
      const requiredShowFields = ['title'];
      const requiredMovieFields = ['title'];
      if (shows?.length && !requiredShowFields.every(f => f in shows[0])) {
        throw new Error('Invalid backup: shows data is malformed');
      }
      if (movies?.length && !requiredMovieFields.every(f => f in movies[0])) {
        throw new Error('Invalid backup: movies data is malformed');
      }

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
      
      // Clear all ShowDeck localStorage keys (S-4)
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('showdeck')) keysToRemove.push(key);
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      
      toast('All data has been deleted.', 'success');
      setTimeout(() => window.location.hash = '#/home', 1500);
      setTimeout(() => window.location.reload(), 1600);
    } catch (err) {
      console.error(err);
      toast('Failed to clear data', 'error');
    }
  });
}
