/**
 * ShowDeck — Enrich Modal
 * UI component for manual TMDB searching and metadata linking.
 */

import { searchShows, searchMovies, getPosterUrl } from '../api/tmdb.js';
import { db } from '../database/db.js';
import { toast } from './toast.js';

export function openEnrichModal(id, type, initialQuery, onSuccess) {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay animate-fade-in';
  
  // Create modal container
  const modal = document.createElement('div');
  modal.className = 'modal animate-slide-up';
  modal.style.width = '100%';
  modal.style.maxWidth = '600px';
  modal.style.maxHeight = '90vh';
  modal.style.display = 'flex';
  modal.style.flexDirection = 'column';
  
  modal.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">Find Match for "${initialQuery}"</h3>
      <button class="btn btn-icon btn-sm btn-ghost close-modal-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
    
    <div class="modal-body" style="display:flex;flex-direction:column;flex:1;overflow:hidden;padding:var(--space-5);">
      <div style="display:flex;gap:var(--space-2);margin-bottom:var(--space-4);flex-shrink:0;">
        <input type="text" id="enrich-search-input" class="input" value="${initialQuery}" placeholder="Search ${type === 'show' ? 'TV Shows' : 'Movies'}..." style="flex:1;">
        <button class="btn btn-primary" id="enrich-search-btn">Search</button>
      </div>
      
      <div id="enrich-results" class="stagger-children" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:var(--space-3);padding-right:var(--space-2);">
        <div class="text-tertiary" style="text-align:center;padding:var(--space-4);">Loading results...</div>
      </div>
    </div>
  `;
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Close logic
  const closeModal = () => {
    overlay.classList.remove('animate-fade-in');
    modal.classList.remove('animate-slide-up');
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 200);
  };
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  modal.querySelector('.close-modal-btn').addEventListener('click', closeModal);

  // Search logic
  const searchInput = modal.querySelector('#enrich-search-input');
  const searchBtn = modal.querySelector('#enrich-search-btn');
  const resultsContainer = modal.querySelector('#enrich-results');

  const performSearch = async () => {
    const query = searchInput.value.trim();
    if (!query) return;

    resultsContainer.innerHTML = '<div class="text-tertiary" style="text-align:center;padding:var(--space-4);">Searching TMDB...</div>';
    
    try {
      let results;
      if (type === 'show') {
        results = await searchShows(query, 1);
      } else {
        results = await searchMovies(query, 1);
      }

      if (!results || !results.results || results.results.length === 0) {
        resultsContainer.innerHTML = '<div class="text-tertiary" style="text-align:center;padding:var(--space-4);">No results found.</div>';
        return;
      }

      resultsContainer.innerHTML = results.results.map(match => {
        const posterUrl = getPosterUrl(match.posterPath, 'posterMedium');
        const year = type === 'show' ? (match.firstAirDate ? match.firstAirDate.substring(0, 4) : '') : (match.releaseDate ? match.releaseDate.substring(0, 4) : '');
        
        return `
          <div class="library-list-item card" style="display:flex;gap:var(--space-4);padding:var(--space-3);margin-bottom:var(--space-2);cursor:pointer;text-decoration:none;flex-shrink:0;">
            ${posterUrl
              ? `<img src="${posterUrl}" alt="${match.title || match.name}" style="width:56px;height:84px;object-fit:cover;border-radius:var(--radius-sm);flex-shrink:0;" loading="lazy">`
              : `<div style="width:56px;height:84px;background:var(--surface-3);border-radius:var(--radius-sm);flex-shrink:0;display:flex;align-items:center;justify-content:center;"><span style="opacity:0.3;">🎬</span></div>`
            }
            <div style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:var(--space-1);">
              <div style="font-weight:var(--weight-medium);color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${match.title || match.name}</div>
              <div style="font-size:var(--text-xs);color:var(--text-tertiary);">${year} • ${type === 'show' ? 'TV Show' : 'Movie'}</div>
            </div>
            <div style="display:flex;align-items:center;flex-shrink:0;">
              <button class="btn btn-secondary btn-sm enrich-link-btn" data-tmdb='${JSON.stringify(match).replace(/'/g, "&#39;")}'>Link</button>
            </div>
          </div>
        `;
      }).join('');

      // Bind link buttons
      resultsContainer.querySelectorAll('.enrich-link-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const matchData = JSON.parse(btn.dataset.tmdb);
          btn.textContent = 'Linking...';
          btn.disabled = true;

          try {
            if (type === 'show') {
              await db.shows.update(id, {
                tmdbId: matchData.tmdbId || matchData.id,
                posterPath: matchData.posterPath,
                backdropPath: matchData.backdropPath,
                overview: matchData.overview,
                genres: matchData.genres || matchData.genreIds || [],
              });
            } else {
              await db.movies.update(id, {
                tmdbId: matchData.tmdbId || matchData.id,
                posterPath: matchData.posterPath,
                backdropPath: matchData.backdropPath,
                overview: matchData.overview,
                genres: matchData.genres || matchData.genreIds || [],
              });
            }
            
            toast('Successfully matched!', 'success');
            closeModal();
            if (onSuccess) onSuccess();
          } catch (err) {
            console.error('Error updating match:', err);
            toast('Failed to update item', 'error');
            btn.textContent = 'Link';
            btn.disabled = false;
          }
        });
      });

    } catch (err) {
      console.error('Search error:', err);
      resultsContainer.innerHTML = '<div class="text-error" style="text-align:center;padding:var(--space-4);">Network error or invalid API key.</div>';
    }
  };

  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') performSearch();
  });

  // Auto-trigger search on open
  performSearch();
}
