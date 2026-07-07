/**
 * ShowDeck — Movie Detail Page
 * Movie information, tracking, and cast.
 */

import * as provider from '../api/provider.js';
import { getMovieByTmdbId, updateMovieTrackingStatus, rateMovie, addMovie } from '../database/movies.js';
import { getPosterUrl, getBackdropUrl } from '../api/tmdb.js';
import { formatDate, formatYear, interactiveStarRating, formatVoteCount, getRelativeTime, STATUS_MAP, toggleGlobalLoading, timeAgo, escapeHtml } from '../utils/dom.js';
import { toast } from '../components/toast.js';

let currentMovieId = null; 
let movieData = null; 
let isTracked = false;

export function render() {
  return `
    <div class="page-container animate-fade-in" id="movie-detail-container">
      <div style="padding:var(--space-12);text-align:center;">
        <div class="skeleton" style="width:100%;height:300px;border-radius:var(--radius-xl);margin-bottom:var(--space-6);"></div>
      </div>
    </div>
  `;
}

export async function init(params) {
  const tmdbId = parseInt(params.id);
  const container = document.getElementById('movie-detail-container');

  if (isNaN(tmdbId)) {
    renderError(container, 'Invalid movie ID in URL.');
    return;
  }

  try {
    const localMovie = await getMovieByTmdbId(tmdbId);
    
    // Always fetch rich data from API for cast, overview, watchProviders, etc.
    const { getMovieDetails } = await import('../api/tmdb.js');
    const richData = await getMovieDetails(tmdbId);
    if (!richData && !localMovie) throw new Error('Movie not found');

    if (localMovie) {
      isTracked = true;
      currentMovieId = localMovie.id;
      movieData = richData || localMovie;
      // Preserve local tracking info
      movieData.id = localMovie.id;
      movieData.trackingStatus = localMovie.trackingStatus;
      movieData.rating = localMovie.rating;
    } else {
      isTracked = false;
      movieData = richData;
    }

    renderContent(container);
    bindEvents();
    
  } catch (err) {
    console.error('[MovieDetail] Error:', err);
    renderError(container, 'Check your internet connection or API key.');
  }
}

function renderError(container, text) {
  container.innerHTML = `
    <div class="empty-state" style="padding:var(--space-12) var(--space-4);">
      <h3 class="empty-state-title">Failed to load movie</h3>
      <p class="empty-state-text">${text}</p>
      <button class="btn btn-primary" id="back-btn-error">Go Back</button>
    </div>
  `;
  document.getElementById('back-btn-error')?.addEventListener('click', () => {
    window.appRouter.goBack();
  });
}

function renderContent(container) {
  const backdropUrl = getBackdropUrl(movieData.backdropPath, 'backdropLarge');
  const posterUrl = getPosterUrl(movieData.posterPath, 'posterLarge');
  const year = formatYear(movieData.releaseDate);
  const director = movieData.crew?.find(c => c.job === 'Director')?.name;
  const countdown = getRelativeTime(movieData.releaseDate);
  const imdbUrl = movieData.externalIds?.imdb_id ? `https://www.imdb.com/title/${movieData.externalIds.imdb_id}/` : null;

  container.innerHTML = `
    <!-- Back Button -->
    <div style="padding:var(--space-4) var(--space-4) 0; position:relative; z-index:10; display:flex; justify-content:space-between; align-items:center;">
      <button class="btn btn-ghost" id="back-btn" style="padding:var(--space-2); margin-left:calc(-1 * var(--space-2)); font-weight:var(--weight-medium);">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="m15 18-6-6 6-6"/></svg>
        Back
      </button>
      <div style="display:flex;gap:var(--space-2);align-items:center;">
        ${isTracked ? `
          <span class="text-tertiary" style="font-size:var(--text-xs);margin-right:var(--space-2);display:none;" id="last-synced-text">Synced ${timeAgo(movieData.updatedAt)}</span>
          <button class="btn btn-sm btn-ghost" id="sync-movie-btn" style="color:var(--text-secondary);" aria-label="Sync with TMDB" data-tooltip="Sync">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg>
            Sync
          </button>
        ` : ''}
        ${imdbUrl ? `
          <a href="${imdbUrl}" target="_blank" class="btn btn-sm btn-ghost" style="color:var(--color-warning);">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            IMDb
          </a>
        ` : ''}
      </div>
    </div>
    <!-- Hero -->
    <div class="detail-hero">
      ${backdropUrl 
        ? `<img src="${backdropUrl}" alt="Backdrop" class="detail-backdrop">` 
        : `<div class="detail-backdrop" style="background:var(--surface-3);"></div>`}
      <div class="detail-backdrop-overlay"></div>
    </div>

    <!-- Info -->
    <div class="detail-info">
      <div class="detail-poster">
        ${posterUrl 
          ? `<img src="${posterUrl}" alt="${movieData.title}">` 
          : `<div style="width:100%;aspect-ratio:2/3;background:var(--surface-3);border-radius:var(--radius-lg);"></div>`}
      </div>
      
      <div class="detail-meta">
        ${countdown ? `<div style="display:inline-block;background:var(--color-primary);color:white;padding:2px 8px;border-radius:12px;font-size:12px;font-weight:bold;margin-bottom:var(--space-2);">${countdown}</div>` : ''}
        <h1 class="detail-title">${movieData.title}</h1>
        ${director ? `<div style="font-size:var(--text-md);color:var(--text-secondary);margin-bottom:var(--space-2);">Directed by <span style="color:var(--text-primary);font-weight:var(--weight-medium);">${director}</span></div>` : ''}
        <div class="detail-subtitle">
          <span>${year}</span>
          <span>•</span>
          <span>${movieData.runtime ? `${Math.floor(movieData.runtime/60)}h ${movieData.runtime%60}m` : 'Unknown runtime'}</span>
          ${movieData.genres && movieData.genres.length > 0 ? `<span>•</span><span>${movieData.genres.slice(0,3).join(', ')}</span>` : ''}
          ${movieData.voteAverage ? `<span>•</span><span style="color:var(--color-warning);font-weight:var(--weight-semibold);">★ ${(movieData.voteAverage).toFixed(1)} <span style="font-size:12px;color:var(--text-tertiary);font-weight:normal;">(${formatVoteCount(movieData.voteCount)})</span></span>` : ''}
        </div>
        
        <!-- Controls -->
        <div class="detail-actions">
          ${isTracked ? `
            <select class="input" id="movie-status-select" style="width:180px;">
              ${Object.entries(STATUS_MAP).map(([val, {label}]) => {
                const releaseDate = movieData.releaseDate ? new Date(movieData.releaseDate) : null;
                const isUnreleased = releaseDate ? releaseDate.getTime() > Date.now() : false;
                const isDisabled = isUnreleased && val !== 'plan_to_watch';
                return `<option value="${val}" ${movieData.trackingStatus === val ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}>${label}</option>`;
              }).join('')}
            </select>
            <button class="btn btn-ghost" id="remove-btn" style="color:var(--color-error);" title="Remove from Library">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
            <div class="rating-stars" id="movie-rating" style="display:flex;align-items:center;gap:4px;font-size:24px;cursor:pointer;color:var(--color-warning);">
              ${interactiveStarRating(movieData.rating || 0)}
            </div>
          ` : `
            <button class="btn btn-primary" id="movie-track-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Add to Library
            </button>
          `}
        </div>
      </div>
    </div>

    <div style="margin-top:var(--space-8);">
      <h3 class="section-title">Overview</h3>
      <div style="position:relative;">
        <p class="detail-overview season-overview-text" style="margin:0; display:-webkit-box; -webkit-line-clamp:4; -webkit-box-orient:vertical; overflow:hidden;">${escapeHtml(movieData.overview || 'No overview available.')}</p>
        ${movieData.overview && movieData.overview.length > 200 ? `
          <button class="btn btn-ghost btn-sm" data-action="read-more" style="padding:0; height:auto; min-height:0; color:var(--color-primary); font-size:var(--text-sm); margin-top:var(--space-2);">Read More</button>
        ` : ''}
      </div>
    </div>

    ${movieData.watchProviders && movieData.watchProviders.flatrate ? `
      <div style="margin-top:var(--space-8);">
        <h3 class="section-title" style="font-size:var(--text-sm);color:var(--text-tertiary);margin-bottom:var(--space-2);">Stream On</h3>
        <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
          ${movieData.watchProviders.flatrate.map(p => `
            <img src="${getPosterUrl(p.logo_path, 'posterSmall')}" alt="${p.provider_name}" title="${p.provider_name}" style="width:40px;height:40px;border-radius:var(--radius-sm);">
          `).join('')}
        </div>
      </div>
    ` : ''}

    ${movieData.cast && movieData.cast.length > 0 ? `
      <!-- Cast -->
      <div style="margin-top:var(--space-12);">
        <h3 class="section-title">Cast</h3>
        <div class="cast-grid stagger-children">
          ${movieData.cast.map(c => `
            <div class="cast-card">
              ${c.profilePath 
                ? `<img src="${getPosterUrl(c.profilePath, 'profileMedium')}" class="cast-photo" alt="${c.name}" loading="lazy">` 
                : `<div class="cast-photo" style="display:flex;align-items:center;justify-content:center;font-size:24px;">👤</div>`}
              <div>
                <div class="cast-name">${c.name}</div>
                <div class="cast-character">${c.character}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;
}

function bindEvents() {
  const container = document.getElementById('movie-detail-container');
  if (!container) return;

  document.getElementById('back-btn')?.addEventListener('click', () => {
    window.appRouter.goBack();
  });

  const trackBtn = document.getElementById('movie-track-btn');
  if (trackBtn) {
    trackBtn.addEventListener('click', async () => {
      trackBtn.disabled = true;
      trackBtn.textContent = 'Adding...';
      try {
        const releaseDate = movieData.releaseDate ? new Date(movieData.releaseDate) : null;
        const isUnreleased = releaseDate ? releaseDate.getTime() > Date.now() : false;
        const defaultStatus = isUnreleased ? 'plan_to_watch' : 'completed';
        
        currentMovieId = await addMovie({ ...movieData, trackingStatus: defaultStatus });
        toast('Added to library', 'success');
        init({ id: movieData.tmdbId });
      } catch (err) {
        console.error(err);
        toast('Failed to add', 'error');
        trackBtn.disabled = false;
        trackBtn.textContent = 'Add to Library';
      }
    });
  }

  const statusSelect = document.getElementById('movie-status-select');
  if (statusSelect && isTracked) {
    statusSelect.addEventListener('change', async (e) => {
      const newStatus = e.target.value;
      const { updateMovieTrackingStatus } = await import('../database/movies.js');
      await updateMovieTrackingStatus(currentMovieId, newStatus);
      movieData.trackingStatus = newStatus;
      toast('Status updated');
      renderContent(container);
      bindEvents();
    });
  }

  // Remove button
  const removeBtn = document.getElementById('remove-btn');
  if (removeBtn && isTracked) {
    removeBtn.addEventListener('click', async () => {
      if (!confirm(`Are you sure you want to remove ${movieData.title} from your library?`)) return;
      try {
        const { deleteMovie } = await import('../database/movies.js');
        await deleteMovie(currentMovieId);
        toast('Movie removed from library');
        window.history.length > 1 ? window.history.back() : window.location.hash = '#/home';
      } catch (err) {
        console.error('Failed to remove movie:', err);
        toast('Failed to remove movie', 'error');
      }
    });
  }

  // Read More button for main overview
  if (!container.dataset.readMoreBound) {
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="read-more"]');
      if (btn) {
        const textNode = btn.previousElementSibling;
        if (textNode && textNode.classList.contains('season-overview-text')) {
          if (textNode.style.display === 'block') {
            textNode.style.display = '-webkit-box';
            btn.textContent = 'Read More';
          } else {
            textNode.style.display = 'block';
            btn.textContent = 'Show Less';
          }
        }
      }
    });
    container.dataset.readMoreBound = 'true';
  }

  // Sync button
  const syncBtn = document.getElementById('sync-movie-btn');
  const syncText = document.getElementById('last-synced-text');
  if (syncBtn && syncText) {
    if (!navigator.onLine) syncText.style.display = 'inline';
    syncBtn.addEventListener('mouseenter', () => syncText.style.display = 'inline');
    syncBtn.addEventListener('mouseleave', () => { if (navigator.onLine) syncText.style.display = 'none'; });

    syncBtn.addEventListener('click', async () => {
      syncBtn.disabled = true;
      syncBtn.innerHTML = '<div class="spinner" style="width:14px;height:14px;border-width:2px;margin-right:4px;"></div> Syncing...';
      toggleGlobalLoading(true);
      try {
        const { syncMovie } = await import('../database/movies.js');
        await syncMovie(currentMovieId);
        toast('Movie synced successfully!', 'success');
        init({ id: movieData.tmdbId });
      } catch (err) {
        console.error('Failed to sync movie:', err);
        toast('Failed to sync', 'error');
        syncBtn.disabled = false;
        syncBtn.textContent = 'Sync';
      } finally {
        toggleGlobalLoading(false);
      }
    });
  }
  const ratingControl = document.getElementById('movie-rating');
  if (ratingControl) {
    const handleRate = async (e) => {
      const star = e.target.closest('.star-interactive');
      if (!star) return;

      if (!isTracked) {
        toast('Add movie to library first to rate it', 'warning');
        return;
      }
      
      const num = parseInt(star.dataset.val, 10);
      if (num >= 1 && num <= 5) {
        const { rateMovie } = await import('../database/movies.js');
        await rateMovie(currentMovieId, num);
        movieData.rating = num;
        
        const { interactiveStarRating } = await import('../utils/dom.js');
        ratingControl.innerHTML = interactiveStarRating(num);
        toast('Rating saved', 'success');
      }
    };
    
    ratingControl.addEventListener('click', handleRate);
    ratingControl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleRate(e);
      }
    });
  }
}
