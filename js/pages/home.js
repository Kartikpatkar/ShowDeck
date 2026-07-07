/**
 * ShowDeck — Home / Dashboard Page
 * Live dashboard with stats from DB, continue watching, recently added.
 */

import { db } from '../database/db.js';
import { getRecentShows, getShowsByStatus } from '../database/shows.js';
import { getRecentMovies, getAllMovies } from '../database/movies.js';
import { getShowProgress, getNextEpisode } from '../database/episodes.js';
import { getPosterUrl } from '../api/tmdb.js';
import { formatDate, formatYear, truncate, statusBadge } from '../utils/dom.js';
import { openEnrichModal } from '../components/enrich-modal.js';
import '../components/web/media-card.js';

let viewMode = localStorage.getItem('showdeck-home-view') || 'grid';

export async function init() {
  // Bind onboarding key save if it exists
  const homeSaveBtn = document.getElementById('home-save-key');
  const adultInput = document.getElementById('home-adult-content');
  
  if (adultInput) {
    adultInput.addEventListener('change', (e) => {
      if (e.target.checked) {
        if (!confirm("Adult Content Warning:\n\nOnly select this if you are of legal age in your region. Are you sure you want to enable adult content?")) {
          e.target.checked = false;
        }
      }
    });
  }

  if (homeSaveBtn) {
    homeSaveBtn.addEventListener('click', () => {
      const key = document.getElementById('home-api-key').value.trim();
      const nameInput = document.getElementById('home-user-name');
      const adultInput = document.getElementById('home-adult-content');
      const name = nameInput ? nameInput.value.trim() : null;
      if (key) {
        localStorage.setItem('showdeck_tmdb_key', key);
        if (name) localStorage.setItem('showdeck_user_name', name);
        if (adultInput) localStorage.setItem('showdeck_include_adult', adultInput.checked ? 'true' : 'false');
        import('../components/toast.js').then(m => m.toast('Settings saved! Enjoy ShowDeck. 🎉', 'success'));
        setTimeout(() => {
          import('../router.js').then(r => window.dispatchEvent(new Event('hashchange')));
        }, 1000);
      }
    });
  }

  // View toggle
  document.getElementById('home-view-toggle')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-view]');
    if (!btn) return;
    viewMode = btn.dataset.view;
    localStorage.setItem('showdeck-home-view', viewMode);
    // Reload to apply view mode quickly
    import('../router.js').then(r => window.dispatchEvent(new Event('hashchange')));
  });

  // Enrich Modal Triggers
  document.querySelectorAll('.enrich-trigger').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const id = parseInt(el.dataset.id);
      const type = el.dataset.type;
      const title = decodeURIComponent(el.dataset.title);
      openEnrichModal(id, type, title, () => {
        import('../router.js').then(r => window.dispatchEvent(new Event('hashchange')));
      });
    });
  });

  // Customize Dashboard logic
  const customizeBtn = document.getElementById('customize-dashboard-btn');
  const customizeModal = document.getElementById('customize-modal');
  const cancelCustomizeBtn = document.getElementById('cancel-customize-btn');
  const saveCustomizeBtn = document.getElementById('save-customize-btn');

  if (customizeBtn && customizeModal) {
    customizeBtn.addEventListener('click', () => {
      customizeModal.classList.toggle('hidden');
    });
    cancelCustomizeBtn.addEventListener('click', () => {
      customizeModal.classList.add('hidden');
    });
    saveCustomizeBtn.addEventListener('click', () => {
      const checkedBoxes = Array.from(document.querySelectorAll('#widget-checkboxes input:checked'));
      const selectedWidgets = checkedBoxes.map(cb => cb.value);
      localStorage.setItem('showdeck_home_widgets', JSON.stringify(selectedWidgets));
      import('../router.js').then(r => window.dispatchEvent(new Event('hashchange')));
    });
  }
}

export async function render() {
  // Fetch data
  const [
    watchingShows,
    pausedShows,
    planToWatchShows,
    planToWatchMovies,
    recentShows,
    recentMovies,
    allShows,
    allMovies
  ] = await Promise.all([
    getShowsByStatus('watching'),
    getShowsByStatus('paused'),
    getShowsByStatus('plan'),
    getAllMovies({ trackingStatus: 'plan' }),
    getRecentShows(8),
    getRecentMovies(8),
    db.shows.toArray(),
    db.movies.toArray()
  ]);

  // Inject mediaType for routing
  watchingShows.forEach(i => i.mediaType = 'show');
  pausedShows.forEach(i => i.mediaType = 'show');
  planToWatchShows.forEach(i => i.mediaType = 'show');
  recentShows.forEach(i => i.mediaType = 'show');
  allShows.forEach(i => i.mediaType = 'show');
  
  planToWatchMovies.forEach(i => i.mediaType = 'movie');
  recentMovies.forEach(i => i.mediaType = 'movie');
  allMovies.forEach(i => i.mediaType = 'movie');

  // Build continue watching cards with progress
  let continueWatchingHTML = '';
  if (watchingShows.length > 0) {
    const cards = [];
    for (const show of watchingShows.slice(0, 6)) {
      const progress = await getShowProgress(show.id);
      const next = await getNextEpisode(show.id);
      const posterUrl = getPosterUrl(show.posterPath, 'posterMedium');
      const nextLabel = next
        ? `S${String(next.season).padStart(2, '0')}E${String(next.episode).padStart(2, '0')}${next.title && !next.title.toLowerCase().startsWith('episode') ? ` - ${next.title}` : ''}`
        : '';

      cards.push(`
        <a href="#/show/${show.tmdbId}" class="poster-card" id="cw-${show.id}" style="position:relative;overflow:hidden;border-radius:var(--radius-md);">
          ${posterUrl
            ? `<img class="poster-card-image" src="${posterUrl}" alt="${show.title}" loading="lazy">`
            : `<div class="poster-card-image skeleton"></div>`
          }
          <div class="poster-card-overlay" style="background:linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%); opacity:1; padding:var(--space-2); padding-bottom:12px; display:flex; flex-direction:column; justify-content:flex-end;">
            <div style="font-weight:var(--weight-bold); color:white; font-size:var(--text-sm); line-height:1.2; text-shadow:0 1px 2px rgba(0,0,0,0.8);">${show.title}</div>
            ${nextLabel ? `<div style="font-size:11px; color:hsla(0,0%,100%,0.8); margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-shadow:0 1px 2px rgba(0,0,0,0.8);">${nextLabel}</div>` : ''}
          </div>
          <div class="progress-bar-container" style="position:absolute; bottom:0; left:0; width:100%; height:4px; margin:0; border-radius:0; background:rgba(255,255,255,0.25); z-index:3;">
            <div class="progress-bar-fill" style="width:${progress.percentage}%; border-radius:0;"></div>
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

  // Build Paused section
  let pausedShowsHTML = '';
  if (pausedShows.length > 0) {
    const cards = pausedShows.slice(0, 8).map(item => {
      const year = formatYear(item.firstAirDate);
      return `<media-card variant="poster" custom-meta="${year} • Paused" data-item='${JSON.stringify(item).replace(/'/g, "&#039;")}'></media-card>`;
    });
    pausedShowsHTML = `
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Paused Shows</h2>
          <a href="#/library?status=paused" class="section-action">View All</a>
        </div>
        <div class="grid-posters stagger-children">${cards.join('')}</div>
      </div>
    `;
  }

  // Build Plan to Watch section
  const planItems = [...planToWatchShows, ...planToWatchMovies]
    .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
    .slice(0, 8);
    
  let planToWatchHTML = '';
  if (planItems.length > 0) {
    const cards = planItems.map(item => {
      const isShow = item.mediaType === 'show';
      const year = formatYear(isShow ? item.firstAirDate : item.releaseDate);
      return `<media-card variant="poster" custom-meta="${year} • ${isShow ? 'TV Show' : 'Movie'}" data-item='${JSON.stringify(item).replace(/'/g, "&#039;")}'></media-card>`;
    });
    planToWatchHTML = `
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Plan to Watch</h2>
          <a href="#/library?status=plan" class="section-action">View All</a>
        </div>
        <div class="grid-posters stagger-children">${cards.join('')}</div>
      </div>
    `;
  }

  // Build Upcoming section
  const now = new Date();
  const upcomingItems = [...allShows, ...allMovies]
    .filter(item => {
      const dateStr = item.firstAirDate || item.releaseDate;
      if (!dateStr) return false;
      const date = new Date(dateStr);
      return date > now;
    })
    .sort((a, b) => {
      const dateA = new Date(a.firstAirDate || a.releaseDate);
      const dateB = new Date(b.firstAirDate || b.releaseDate);
      return dateA - dateB; // Sort nearest upcoming first
    })
    .slice(0, 8);
    
  let upcomingHTML = '';
  if (upcomingItems.length > 0) {
    const cards = upcomingItems.map(item => {
      const posterUrl = getPosterUrl(item.posterPath, 'posterMedium');
      const isShow = item.mediaType === 'show';
      const route = isShow ? `#/show/${item.tmdbId}` : `#/movie/${item.tmdbId}`;
      const dateStr = item.firstAirDate || item.releaseDate;
      const dateObj = new Date(dateStr);
      // Format as Month DD, YYYY
      const formattedDate = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      
      if (viewMode === 'list') {
        return `<media-card view-mode="list" data-item='${JSON.stringify(item).replace(/'/g, "&#039;")}'></media-card>`;
      }

      return `<media-card variant="poster" custom-meta="${formattedDate}" data-item='${JSON.stringify(item).replace(/'/g, "&#039;")}'></media-card>`;
    });
    
    let containerClass = viewMode === 'list' ? 'library-list stagger-children' : 'grid-posters stagger-children';

    upcomingHTML = `
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Upcoming</h2>
          <a href="#/library?status=upcoming" class="section-action">View All</a>
        </div>
        <div class="${containerClass}">${cards.join('')}</div>
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
      const isShow = item.mediaType === 'show';
      const typeStr = isShow ? 'show' : 'movie';
      const isMissing = item.tmdbId === null;
      const triggerClass = isMissing ? 'open-enrich' : '';
      const triggerAttrs = isMissing ? `data-id="${item.id}" data-type="${typeStr}"` : '';
      const year = formatYear(isShow ? item.firstAirDate : item.releaseDate);
      
      if (viewMode === 'list') {
        return `<media-card view-mode="list" class="${triggerClass}" ${triggerAttrs} data-item='${JSON.stringify(item).replace(/'/g, "&#039;")}'></media-card>`;
      }

      return `<media-card variant="poster" class="${triggerClass}" ${triggerAttrs} custom-meta="${year} • ${isShow ? 'TV Show' : 'Movie'}" data-item='${JSON.stringify(item).replace(/'/g, "&#039;")}'></media-card>`;
    });
    
    if (viewMode === 'list') {
      recentlyAddedHTML = `<div class="library-list stagger-children">${cards.join('')}</div>`;
    } else {
      recentlyAddedHTML = `<div class="grid-posters stagger-children">${cards.join('')}</div>`;
    }
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
  const userName = localStorage.getItem('showdeck_user_name') || '';
  
  const onboardingHtml = !apiKey ? `
    <div class="card" style="margin-bottom:var(--space-8); border: 2px solid var(--color-primary); background: color-mix(in srgb, var(--color-primary) 10%, transparent); padding: var(--space-6);">
      <h2 style="margin-bottom:var(--space-2);">Action Required: Missing API Key 🔌</h2>
      <p style="margin-bottom:var(--space-4); color:var(--text-secondary);">
        ShowDeck requires a free TMDB API key to search for and track shows. Your key is stored securely on your device.
      </p>
      <div style="display:flex; flex-direction:column; gap:var(--space-3);">
        ${!userName ? `<input type="text" id="home-user-name" class="input" placeholder="What should we call you? (Optional)" style="width:100%; max-width:400px;">` : ''}
        <label style="display:flex; align-items:center; gap:var(--space-2); cursor:pointer; font-size:var(--text-sm); color:var(--text-secondary);">
          <input type="checkbox" id="home-adult-content" style="width:16px;height:16px;accent-color:var(--color-primary);">
          <span>Include Adult Content (PG-18+ results)</span>
        </label>
        <div style="display:flex; gap:var(--space-2);">
          <input type="text" autocomplete="off" spellcheck="false" id="home-api-key" class="input" placeholder="Enter TMDB API Key" style="flex:1;">
          <button class="btn btn-primary" id="home-save-key">Save & Connect</button>
        </div>
      </div>
      <p style="margin-top:var(--space-2); font-size:var(--text-xs); color:var(--text-tertiary);">
        <a href="https://developer.themoviedb.org/docs" target="_blank" style="color:var(--color-primary); text-decoration:underline;">Get a free key here</a>. 
      </p>
    </div>
  ` : '';

  const defaultWidgets = ['watching', 'paused', 'plan', 'recent', 'upcoming'];
  let userWidgets = null;
  try {
    userWidgets = JSON.parse(localStorage.getItem('showdeck_home_widgets'));
  } catch (e) {}
  if (!Array.isArray(userWidgets)) userWidgets = defaultWidgets;

  const widgetHTMLs = {
    'watching': `
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Watching</h2>
          ${watchingShows.length > 0 ? '<a href="#/library?status=watching" class="section-action">View All</a>' : ''}
        </div>
        ${continueWatchingHTML}
      </div>
    `,
    'paused': pausedShowsHTML,
    'plan': planToWatchHTML,
    'recent': `
      <div class="section">
        <div class="section-header">
          <div style="display:flex;align-items:center;gap:var(--space-4);">
            <h2 class="section-title" style="margin:0;">Recently Added</h2>
            <div class="view-toggle" id="home-view-toggle" role="group">
              <button class="btn btn-icon btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}" data-view="grid">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>
              </button>
              <button class="btn btn-icon btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}" data-view="list">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
              </button>
            </div>
          </div>
          ${recentItems.length > 0 ? '<a href="#/library" class="section-action">View All</a>' : ''}
        </div>
        ${recentlyAddedHTML}
      </div>
    `,
    'upcoming': upcomingHTML
  };

  const dashboardContent = userWidgets.map(w => widgetHTMLs[w] || '').join('');

  return `
    <div class="page-container animate-fade-in">
      <div class="page-header" style="align-items:flex-start;">
        <div class="page-header-left">
          <h1 class="page-title">Welcome back${userName ? `, ${userName}` : ''} 👋</h1>
          <p class="page-subtitle">Here's what's happening with your entertainment.</p>
        </div>
        <button class="btn btn-secondary btn-sm" id="customize-dashboard-btn" style="display:flex;align-items:center;gap:var(--space-2);">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          <span class="hide-mobile">Customize</span>
        </button>
      </div>

      <div id="customize-modal" class="card hidden" style="margin-bottom:var(--space-6); padding:var(--space-6); background:var(--surface-2); border-color:var(--color-primary);">
        <h3 style="margin-top:0; margin-bottom:var(--space-4);">Customize Dashboard</h3>
        <p style="font-size:var(--text-sm); color:var(--text-tertiary); margin-bottom:var(--space-4);">Select the sections you want to see on your home screen.</p>
        <div style="display:flex; flex-direction:column; gap:var(--space-3);" id="widget-checkboxes">
          <label style="display:flex; align-items:center; gap:var(--space-3); cursor:pointer;">
            <input type="checkbox" value="watching" ${userWidgets.includes('watching') ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--color-primary);">
            <span>Watching</span>
          </label>
          <label style="display:flex; align-items:center; gap:var(--space-3); cursor:pointer;">
            <input type="checkbox" value="paused" ${userWidgets.includes('paused') ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--color-primary);">
            <span>Paused Shows</span>
          </label>
          <label style="display:flex; align-items:center; gap:var(--space-3); cursor:pointer;">
            <input type="checkbox" value="plan" ${userWidgets.includes('plan') ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--color-primary);">
            <span>Plan to Watch</span>
          </label>
          <label style="display:flex; align-items:center; gap:var(--space-3); cursor:pointer;">
            <input type="checkbox" value="recent" ${userWidgets.includes('recent') ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--color-primary);">
            <span>Recently Added</span>
          </label>
          <label style="display:flex; align-items:center; gap:var(--space-3); cursor:pointer;">
            <input type="checkbox" value="upcoming" ${userWidgets.includes('upcoming') ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--color-primary);">
            <span>Upcoming Releases</span>
          </label>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:var(--space-3); margin-top:var(--space-4);">
          <button class="btn btn-ghost" id="cancel-customize-btn">Cancel</button>
          <button class="btn btn-primary" id="save-customize-btn">Save Layout</button>
        </div>
      </div>

      ${onboardingHtml}

      ${dashboardContent}
    </div>
  `;
}
