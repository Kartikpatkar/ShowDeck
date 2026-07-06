/**
 * ShowDeck — Smart Collections
 * Rule-engine based dynamic collections.
 */

import { db } from '../database/db.js';
import { toast } from '../components/toast.js';
import { getPosterUrl } from '../api/tmdb.js';
import { escapeHtml } from '../utils/dom.js';

let collections = [];

export function render() {
  return `
    <div class="page-container animate-fade-in">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Smart Collections</h1>
          <p class="page-subtitle">Auto-updating lists based on your rules.</p>
        </div>
        <button class="btn btn-primary" id="new-smart-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Rule
        </button>
      </div>

      <!-- New Smart Collection Form -->
      <div id="new-smart-form" class="card hidden" style="margin-bottom:var(--space-6); padding:var(--space-6); background:var(--surface-2); border-color:var(--color-primary);">
        <h3 style="margin-top:0; margin-bottom:var(--space-4);">New Smart Collection</h3>
        <div style="display:flex; flex-direction:column; gap:var(--space-4);">
          <div>
            <label style="font-weight:var(--weight-medium); display:block; margin-bottom:var(--space-1);">Collection Name</label>
            <input type="text" id="smart-name" class="input" placeholder="e.g. Highly Rated Crime" style="width:100%;">
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:var(--space-4);">
            <div>
              <label style="font-weight:var(--weight-medium); display:block; margin-bottom:var(--space-1);">Type</label>
              <select id="smart-type" class="input" style="width:100%;">
                <option value="both">Both</option>
                <option value="shows">TV Shows</option>
                <option value="movies">Movies</option>
              </select>
            </div>
            <div>
              <label style="font-weight:var(--weight-medium); display:block; margin-bottom:var(--space-1);">Minimum Rating</label>
              <input type="number" id="smart-min-rating" class="input" placeholder="e.g. 8" min="0" max="10" step="0.5" style="width:100%;">
            </div>
            <div>
              <label style="font-weight:var(--weight-medium); display:block; margin-bottom:var(--space-1);">Genre (contains)</label>
              <input type="text" id="smart-genre" class="input" placeholder="e.g. Crime" style="width:100%;">
            </div>
            <div>
              <label style="font-weight:var(--weight-medium); display:block; margin-bottom:var(--space-1);">Status</label>
              <select id="smart-status" class="input" style="width:100%;">
                <option value="any">Any Status</option>
                <option value="completed">Watched / Completed</option>
                <option value="plan_to_watch">Plan to Watch</option>
              </select>
            </div>
          </div>
          <div style="display:flex; justify-content:flex-end; gap:var(--space-3); margin-top:var(--space-2);">
            <button class="btn btn-ghost" id="cancel-smart-btn">Cancel</button>
            <button class="btn btn-primary" id="save-smart-btn">Save Collection</button>
          </div>
        </div>
      </div>

      <div id="smart-grid" style="display:flex; flex-direction:column; gap:var(--space-8);">
        <div class="spinner"></div>
      </div>
    </div>
  `;
}

export async function init() {
  await loadCollections();
  bindEvents();
}

async function loadCollections() {
  const container = document.getElementById('smart-grid');
  if (!container) return;

  try {
    collections = await db.smartCollections.reverse().sortBy('createdAt');
    
    if (collections.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3 class="empty-state-title">No Smart Collections</h3>
          <p class="empty-state-text">Create rules to dynamically group your library.</p>
        </div>
      `;
      return;
    }

    // Evaluate rules for each collection
    const [allShows, allMovies] = await Promise.all([
      db.shows.toArray(),
      db.movies.toArray()
    ]);

    let html = '';

    for (const coll of collections) {
      const rules = coll.rules || {};
      const { type = 'both', minRating, genre, status } = rules;
      
      let matches = [];

      if (type === 'both' || type === 'shows') {
        const sMatches = allShows.filter(s => {
          if (minRating && (s.voteAverage || 0) < parseFloat(minRating)) return false;
          if (status && status !== 'any' && s.trackingStatus !== status) return false;
          if (genre && genre.trim() !== '') {
            const hasGenre = s.genres && s.genres.some(g => g.toLowerCase().includes(genre.trim().toLowerCase()));
            if (!hasGenre) return false;
          }
          return true;
        }).map(s => ({ ...s, mediaType: 'show' }));
        matches = matches.concat(sMatches);
      }

      if (type === 'both' || type === 'movies') {
        const mMatches = allMovies.filter(m => {
          if (minRating && (m.voteAverage || 0) < parseFloat(minRating)) return false;
          if (status && status !== 'any' && m.trackingStatus !== status) return false;
          if (genre && genre.trim() !== '') {
            const hasGenre = m.genres && m.genres.some(g => g.toLowerCase().includes(genre.trim().toLowerCase()));
            if (!hasGenre) return false;
          }
          return true;
        }).map(m => ({ ...m, mediaType: 'movie' }));
        matches = matches.concat(mMatches);
      }

      // Sort by addedAt or voteAverage descending
      matches.sort((a, b) => (b.voteAverage || 0) - (a.voteAverage || 0));
      
      // Limit to first 20 for preview
      const preview = matches.slice(0, 20);

      let previewHtml = '';
      if (preview.length > 0) {
        previewHtml = '<div class="grid-posters">';
        previewHtml += preview.map(item => {
          const route = item.mediaType === 'show' ? '#/show/' + item.tmdbId : '#/movie/' + item.tmdbId;
          const posterUrl = getPosterUrl(item.posterPath, 'posterMedium');
          const imgHtml = posterUrl 
            ? '<img src="' + posterUrl + '" style="width:100%; aspect-ratio:2/3; object-fit:cover; border-radius:var(--radius-md) var(--radius-md) 0 0;">'
            : '<div style="width:100%; aspect-ratio:2/3; background:var(--surface-3); border-radius:var(--radius-md) var(--radius-md) 0 0;"></div>';
          
          const starHtml = item.voteAverage ? '<span style="color:var(--color-warning);">★ ' + item.voteAverage.toFixed(1) + '</span>' : '';
          const typeLabel = item.mediaType === 'show' ? 'TV' : 'Movie';

          return `
            <a href="${route}" class="card" style="text-decoration:none; position:relative;">
              ${imgHtml}
              <div style="padding:var(--space-2);">
                <div style="font-weight:var(--weight-medium); font-size:var(--text-sm); color:var(--text-primary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(item.title)}</div>
                <div style="font-size:var(--text-xs); color:var(--text-tertiary); margin-top:2px; display:flex; justify-content:space-between;">
                  <span>${typeLabel}</span>
                  ${starHtml}
                </div>
              </div>
            </a>
          `;
        }).join('');
        previewHtml += '</div>';
      } else {
        previewHtml = `
          <div class="empty-state" style="padding:var(--space-6);">
            <p class="empty-state-text">No items match your rules yet.</p>
          </div>
        `;
      }

      html += `
        <div class="smart-collection-section">
          <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:var(--space-4); border-bottom:1px solid var(--border-subtle); padding-bottom:var(--space-2);">
            <div>
              <h2 style="margin:0; font-size:var(--text-xl);">${escapeHtml(coll.name)}</h2>
              <div style="font-size:var(--text-sm); color:var(--text-tertiary); margin-top:2px;">
                ${matches.length} items match these rules
              </div>
            </div>
            <button class="btn btn-sm btn-ghost delete-smart-btn text-error" data-id="${coll.id}">
              Delete Rule
            </button>
          </div>
          ${previewHtml}
        </div>
      `;
    }

    container.innerHTML = html;

    container.querySelectorAll('.delete-smart-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = parseInt(e.currentTarget.dataset.id);
        if (confirm('Delete this smart collection?')) {
          await db.smartCollections.delete(id);
          toast('Collection deleted');
          loadCollections();
        }
      });
    });

  } catch (e) {
    console.error('Failed to load smart collections:', e);
    container.innerHTML = '<div class="text-error">Failed to load smart collections.</div>';
  }
}

function bindEvents() {
  const form = document.getElementById('new-smart-form');
  const addBtn = document.getElementById('new-smart-btn');
  const cancelBtn = document.getElementById('cancel-smart-btn');
  const saveBtn = document.getElementById('save-smart-btn');

  addBtn?.addEventListener('click', () => {
    form.classList.remove('hidden');
    document.getElementById('smart-name').focus();
  });

  cancelBtn?.addEventListener('click', () => {
    form.classList.add('hidden');
  });

  saveBtn?.addEventListener('click', async () => {
    const name = document.getElementById('smart-name').value.trim();
    const type = document.getElementById('smart-type').value;
    const minRating = document.getElementById('smart-min-rating').value;
    const genre = document.getElementById('smart-genre').value;
    const status = document.getElementById('smart-status').value;

    if (!name) {
      toast('Please enter a collection name', 'warning');
      return;
    }

    try {
      await db.smartCollections.add({
        name,
        rules: {
          type,
          minRating,
          genre,
          status
        },
        createdAt: new Date().toISOString()
      });
      
      form.classList.add('hidden');
      document.getElementById('smart-name').value = '';
      document.getElementById('smart-genre').value = '';
      document.getElementById('smart-min-rating').value = '';
      toast('Smart Collection created!', 'success');
      
      loadCollections();
    } catch (e) {
      console.error(e);
      toast('Failed to create smart collection', 'error');
    }
  });
}
