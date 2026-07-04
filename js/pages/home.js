/**
 * ShowDeck — Home / Dashboard Page
 * Live dashboard with stats from DB, continue watching, recently added.
 */

import { db } from '../database/db.js';
import { getRecentShows, getShowsByStatus } from '../database/shows.js';
import { getRecentMovies } from '../database/movies.js';
import { getShowProgress, getNextEpisode } from '../database/episodes.js';
import { getTotalWatchedEpisodes } from '../database/episodes.js';
import { getPosterUrl } from '../api/tmdb.js';
import { formatDate, formatYear, truncate, statusBadge } from '../utils/dom.js';

export async function init() {
  // Bind onboarding key save if it exists
  const homeSaveBtn = document.getElementById('home-save-key');
  if (homeSaveBtn) {
    homeSaveBtn.addEventListener('click', () => {
      const key = document.getElementById('home-api-key').value.trim();
      if (key) {
        localStorage.setItem('showdeck_tmdb_key', key);
        import('../components/toast.js').then(m => m.toast('API Key saved! Enjoy ShowDeck. 🎉', 'success'));
        setTimeout(() => window.location.reload(), 1000);
      }
    });
  }
}

export async function render() {
  // Fetch data
  const [
    showCount,
    movieCount,
    episodeCount,
    watchingShows,
    recentShows,
    recentMovies,
  ] = await Promise.all([
    db.shows.count(),
    db.movies.count(),
    getTotalWatchedEpisodes(),
    getShowsByStatus('watching'),
    getRecentShows(8),
    getRecentMovies(8),
  ]);

  // Calculate hours (rough estimate)
  const episodeHours = Math.round((episodeCount * 42) / 60);
  const watchedMovies = await db.movies.where('trackingStatus').equals('completed').toArray();
  const movieHours = Math.round(watchedMovies.reduce((s, m) => s + (m.runtime || 120), 0) / 60);
  const totalHours = episodeHours + movieHours;

  // Build continue watching cards with progress
  let continueWatchingHTML = '';
  if (watchingShows.length > 0) {
    const cards = [];
    for (const show of watchingShows.slice(0, 6)) {
      const progress = await getShowProgress(show.id);
      const next = await getNextEpisode(show.id);
      const posterUrl = getPosterUrl(show.posterPath, 'posterMedium');
      const nextLabel = next
        ? `S${String(next.season).padStart(2, '0')}E${String(next.episode).padStart(2, '0')}`
        : '';

      cards.push(`
        <a href="#/show/${show.id}" class="poster-card" id="cw-${show.id}">
          ${posterUrl
            ? `<img class="poster-card-image" src="${posterUrl}" alt="${show.title}" loading="lazy">`
            : `<div class="poster-card-image skeleton"></div>`
          }
          <div class="poster-card-overlay">
            <div class="poster-card-title">${show.title}</div>
            <div class="poster-card-meta">${nextLabel} • ${progress.percentage}%</div>
          </div>
          <div class="progress" style="position:absolute;bottom:0;left:0;right:0;border-radius:0;">
            <div class="progress-bar" style="width:${progress.percentage}%"></div>
          </div>
        </a>
      `);
    }
    continueWatchingHTML = `<div class="grid-posters stagger-children">${cards.join('')}</div>`;
  } else {
    continueWatchingHTML = `
      <div class="empty-state" style="padding:var(--space-8) var(--space-4);">
        <div class="empty-state-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>
        </div>
        <h3 class="empty-state-title">Nothing playing</h3>
        <p class="empty-state-text">Start tracking a show to see it here.</p>
        <a href="#/search" class="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          Search Shows
        </a>
      </div>
    `;
  }

  // Recently added
  const recentItems = [...recentShows, ...recentMovies]
    .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
    .slice(0, 8);

  let recentlyAddedHTML = '';
  if (recentItems.length > 0) {
    const cards = recentItems.map(item => {
      const posterUrl = getPosterUrl(item.posterPath, 'posterMedium');
      const isShow = item.totalSeasons !== undefined;
      const route = isShow ? `#/show/${item.id}` : `#/movie/${item.id}`;
      const year = formatYear(isShow ? item.firstAirDate : item.releaseDate);

      return `
        <a href="${route}" class="poster-card" id="recent-${isShow ? 'show' : 'movie'}-${item.id}">
          ${posterUrl
            ? `<img class="poster-card-image" src="${posterUrl}" alt="${item.title}" loading="lazy">`
            : `<div class="poster-card-image skeleton"></div>`
          }
          <div class="poster-card-info">
            <div class="poster-card-info-title">${item.title}</div>
            <div class="poster-card-info-sub">${year} • ${isShow ? 'TV Show' : 'Movie'}</div>
          </div>
        </a>
      `;
    });
    recentlyAddedHTML = `<div class="grid-posters stagger-children">${cards.join('')}</div>`;
  } else {
    recentlyAddedHTML = `
      <div class="empty-state" style="padding:var(--space-8) var(--space-4);">
        <div class="empty-state-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>
        </div>
        <h3 class="empty-state-title">Library is empty</h3>
        <p class="empty-state-text">Add shows and movies to start building your collection.</p>
        <a href="#/search" class="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Add Content
        </a>
      </div>
    `;
  }

  const apiKey = localStorage.getItem('showdeck_tmdb_key');
  const onboardingHtml = !apiKey ? `
    <div class="card" style="margin-bottom:var(--space-8); border: 2px solid var(--color-primary); background: color-mix(in srgb, var(--color-primary) 10%, transparent);">
      <h2 style="margin-bottom:var(--space-2);">Welcome to ShowDeck! 🎬</h2>
      <p style="margin-bottom:var(--space-4); color:var(--text-secondary);">
        ShowDeck is a free, local-first tracker. To enable search and rich movie metadata, you need to provide your own free TMDB API key.
      </p>
      <div style="display:flex; gap:var(--space-2);">
        <input type="password" id="home-api-key" class="input" placeholder="Enter TMDB API Key" style="flex:1;">
        <button class="btn btn-primary" id="home-save-key">Save Key & Start</button>
      </div>
      <p style="margin-top:var(--space-2); font-size:var(--text-xs); color:var(--text-tertiary);">
        <a href="https://developer.themoviedb.org/docs" target="_blank" style="color:var(--color-primary); text-decoration:underline;">Get a free key here</a>. Your key never leaves your device.
      </p>
    </div>
  ` : '';

  return `
    <div class="page-container animate-fade-in">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Welcome back 👋</h1>
          <p class="page-subtitle">Here's what's happening with your entertainment.</p>
        </div>
      </div>

      ${onboardingHtml}

      <!-- Quick Stats -->
      <div class="section">
        <div class="grid-stats stagger-children">
          <div class="stat-card">
            <span class="stat-card-label">Shows</span>
            <span class="stat-card-value" id="stat-shows">${showCount}</span>
          </div>
          <div class="stat-card">
            <span class="stat-card-label">Movies</span>
            <span class="stat-card-value" id="stat-movies">${movieCount}</span>
          </div>
          <div class="stat-card">
            <span class="stat-card-label">Episodes Watched</span>
            <span class="stat-card-value" id="stat-episodes">${episodeCount}</span>
          </div>
          <div class="stat-card">
            <span class="stat-card-label">Hours Watched</span>
            <span class="stat-card-value" id="stat-hours">${totalHours}</span>
          </div>
        </div>
      </div>

      <!-- Continue Watching -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Continue Watching</h2>
          ${watchingShows.length > 0 ? '<a href="#/library?status=watching" class="section-action">View All</a>' : ''}
        </div>
        ${continueWatchingHTML}
      </div>

      <!-- Recently Added -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Recently Added</h2>
          ${recentItems.length > 0 ? '<a href="#/library" class="section-action">View All</a>' : ''}
        </div>
        ${recentlyAddedHTML}
      </div>
    </div>
  `;
}
