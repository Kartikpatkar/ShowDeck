/**
 * ShowDeck — Movie Detail Page
 * Movie information, tracking, and cast.
 */

import * as provider from '../api/provider.js';
import { getMovieByTmdbId, updateMovieTrackingStatus, rateMovie, addMovie } from '../database/movies.js';
import { getPosterUrl, getBackdropUrl } from '../api/tmdb.js';
import { formatYear, starRating, interactiveStarRating, STATUS_MAP } from '../utils/dom.js';
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
    
    if (localMovie) {
      isTracked = true;
      currentMovieId = localMovie.id;
      movieData = localMovie;
    } else {
      isTracked = false;
      movieData = await provider.getMovieDetails(tmdbId);
      if (!movieData) throw new Error('Movie not found');
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
      <button class="btn btn-primary" onclick="history.back()">Go Back</button>
    </div>
  `;
}

function renderContent(container) {
  const backdropUrl = getBackdropUrl(movieData.backdropPath, 'backdropLarge');
  const posterUrl = getPosterUrl(movieData.posterPath, 'posterLarge');
  const year = formatYear(movieData.releaseDate);

  container.innerHTML = `
    <!-- Back Button -->
    <div style="padding:var(--space-4) var(--space-4) 0; position:relative; z-index:10;">
      <button class="btn btn-ghost" onclick="window.history.length > 1 ? window.history.back() : window.location.hash='#/home'" style="padding:var(--space-2); margin-left:-var(--space-2); font-weight:var(--weight-medium);">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="m15 18-6-6 6-6"/></svg>
        Back
      </button>
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
        <h1 class="detail-title">${movieData.title}</h1>
        <div class="detail-subtitle">
          <span>${year}</span>
          <span>•</span>
          <span>${movieData.runtime ? `${Math.floor(movieData.runtime/60)}h ${movieData.runtime%60}m` : 'Unknown runtime'}</span>
          ${movieData.genres && movieData.genres.length > 0 ? `<span>•</span><span>${movieData.genres.slice(0,3).join(', ')}</span>` : ''}
          ${movieData.voteAverage ? `<span>•</span><span style="color:var(--color-warning);font-weight:var(--weight-semibold);">★ ${(movieData.voteAverage).toFixed(1)}</span>` : ''}
        </div>
        
        <!-- Controls -->
        <div class="detail-actions">
          ${isTracked ? `
            <select class="input" id="movie-status-select" style="width:180px;">
              ${Object.entries(STATUS_MAP).map(([val, {label}]) => `
                <option value="${val}" ${movieData.trackingStatus === val ? 'selected' : ''}>${label}</option>
              `).join('')}
            </select>
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
      <p class="detail-overview">${movieData.overview || 'No overview available.'}</p>
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

  const trackBtn = document.getElementById('movie-track-btn');
  if (trackBtn) {
    trackBtn.addEventListener('click', async () => {
      trackBtn.disabled = true;
      trackBtn.textContent = 'Adding...';
      try {
        currentMovieId = await addMovie({ ...movieData, trackingStatus: 'completed' });
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
  if (statusSelect) {
    statusSelect.addEventListener('change', async (e) => {
      await updateMovieTrackingStatus(currentMovieId, e.target.value);
      movieData.trackingStatus = e.target.value;
      toast('Status updated');
    });
  }

  const ratingControl = document.getElementById('movie-rating');
  if (ratingControl) {
    ratingControl.addEventListener('click', async (e) => {
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
    });
  }
}
