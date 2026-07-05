/**
 * ShowDeck — Fix Missing Matches Page
 * Allows users to manually search TMDB for items imported with null tmdbIds.
 */

import { db } from '../database/db.js';
import { formatYear } from '../utils/dom.js';
import { openEnrichModal } from '../components/enrich-modal.js';

export async function render() {
  return `
    <div class="page-container animate-fade-in">
      <div class="page-header" style="margin-bottom:var(--space-6);">
        <div class="page-header-left">
          <a href="#/settings" class="btn btn-ghost btn-sm" style="margin-bottom:var(--space-2);margin-left:-8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to Settings
          </a>
          <h1 class="page-title">Fix Missing Matches</h1>
          <p class="page-subtitle">Manually match items that couldn't be found automatically.</p>
        </div>
      </div>
      
      <div id="enrich-list" style="display:flex;flex-direction:column;gap:var(--space-4);">
        <div class="skeleton" style="height:80px;border-radius:var(--radius-md);"></div>
        <div class="skeleton" style="height:80px;border-radius:var(--radius-md);"></div>
      </div>
    </div>
  `;
}

export async function init() {
  await loadItems();
}

async function loadItems() {
  const container = document.getElementById('enrich-list');
  if (!container) return;

  try {
    const missingShows = await db.shows.filter(s => s.tmdbId === null).toArray();
    const missingMovies = await db.movies.filter(m => m.tmdbId === null).toArray();
    const allMissing = [
      ...missingShows.map(s => ({ ...s, type: 'show' })),
      ...missingMovies.map(m => ({ ...m, type: 'movie' }))
    ];

    if (allMissing.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding:var(--space-12) var(--space-4);">
          <div class="empty-state-icon text-success">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
          </div>
          <h3 class="empty-state-title">All Caught Up!</h3>
          <p class="empty-state-text">Everything in your library has a valid TMDB match.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = allMissing.map(item => `
      <div class="card" style="display:flex;align-items:center;padding:var(--space-4);gap:var(--space-4);">
        <div style="width:48px;height:72px;background:var(--surface-3);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <span style="opacity:0.3;font-size:20px;">${item.type === 'show' ? '📺' : '🎬'}</span>
        </div>
        <div style="flex:1;min-width:0;">
          <h4 style="margin:0;font-size:var(--text-base);font-weight:var(--weight-medium);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${item.title}</h4>
          <p class="text-tertiary" style="margin:var(--space-1) 0 0 0;font-size:var(--text-sm);">
            ${item.type === 'show' ? 'TV Show' : 'Movie'} • Added ${new Date(item.addedAt).toLocaleDateString()}
          </p>
        </div>
        <button class="btn btn-primary btn-sm enrich-match-btn" data-id="${item.id}" data-type="${item.type}" data-title="${encodeURIComponent(item.title)}">
          Search Match
        </button>
      </div>
    `).join('');

    // Bind buttons
    container.querySelectorAll('.enrich-match-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const type = btn.dataset.type;
        const title = decodeURIComponent(btn.dataset.title);
        openEnrichModal(id, type, title, () => {
          // Callback after successful match
          loadItems();
        });
      });
    });

  } catch (err) {
    console.error('Error loading unmatched items:', err);
    container.innerHTML = `<div class="empty-state text-error">Failed to load missing items.</div>`;
  }
}
