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

import '../components/web/media-card.js';

let viewMode = localStorage.getItem('showdeck-home-view') || 'grid';

export async function init() {
  // Bind onboarding key save if it exists
  const homeSaveBtn = document.getElementById('home-save-key');
  const adultInput = document.getElementById('home-adult-content');
  
  if (adultInput) {
    adultInput.addEventListener('change', async (e) => {
      if (e.target.checked) {
        const { confirmModal } = await import('../components/modal.js');
        const approved = await confirmModal(
          'Adult Content Warning',
          'Only select this if you are of legal age in your region. Are you sure you want to enable adult content?',
          'Enable',
          true
        );
        if (!approved) {
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
      import('../components/enrich-modal.js').then(m => {
        m.openEnrichModal(id, type, title, () => {
          window.appRouter.renderPage();
        });
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
      const widgetRows = Array.from(document.querySelectorAll('.widget-row'));
      const selectedWidgets = [];
      widgetRows.forEach(row => {
        const cb = row.querySelector('input[type="checkbox"]');
        if (cb && cb.checked) selectedWidgets.push(cb.value);
      });
      localStorage.setItem('showdeck_home_widgets', JSON.stringify(selectedWidgets));
      import('../router.js').then(r => window.dispatchEvent(new Event('hashchange')));
    });

    document.getElementById('widget-checkboxes')?.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-move]');
      if (!btn) return;
      const row = btn.closest('.widget-row');
      const dir = btn.dataset.move;
      if (dir === 'up' && row.previousElementSibling) {
        row.parentNode.insertBefore(row, row.previousElementSibling);
      } else if (dir === 'down' && row.nextElementSibling) {
        row.parentNode.insertBefore(row.nextElementSibling, row);
      }
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

  const filterMissing = arr => arr.filter(i => i.tmdbId !== null);

  const filteredWatching = filterMissing(watchingShows).sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  const filteredPaused = filterMissing(pausedShows).sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  const filteredPlanToWatchShows = filterMissing(planToWatchShows);
  const filteredPlanToWatchMovies = filterMissing(planToWatchMovies);
  const filteredRecentShows = filterMissing(recentShows);
  const filteredRecentMovies = filterMissing(recentMovies);
  const filteredAllShows = filterMissing(allShows);
  const filteredAllMovies = filterMissing(allMovies);

  // Inject mediaType for routing
  filteredWatching.forEach(i => i.mediaType = 'show');
  filteredPaused.forEach(i => i.mediaType = 'show');
  filteredPlanToWatchShows.forEach(i => i.mediaType = 'show');
  filteredRecentShows.forEach(i => i.mediaType = 'show');
  filteredAllShows.forEach(i => i.mediaType = 'show');
  
  filteredPlanToWatchMovies.forEach(i => i.mediaType = 'movie');
  filteredRecentMovies.forEach(i => i.mediaType = 'movie');
  filteredAllMovies.forEach(i => i.mediaType = 'movie');

  // Build continue watching cards with progress
  let continueWatchingHTML = '';
  if (filteredWatching.length > 0) {
    const cards = [];
    for (const show of filteredWatching.slice(0, 6)) {
      const progress = await getShowProgress(show.id);
      const next = await getNextEpisode(show.id);
      const posterUrl = getPosterUrl(show.posterPath, 'posterMedium');
      const nextLabel = next
        ? `S${String(next.season).padStart(2, '0')}E${String(next.episode).padStart(2, '0')}${next.title && !next.title.toLowerCase().startsWith('episode') ? ` - ${next.title}` : ''}`
        : '';

      cards.push(`
        <a href="#/show/${show.tmdbId}" class="poster-card" id="cw-${show.id}">
          ${posterUrl 
            ? `<img class="poster-card-image" src="${posterUrl}" alt="${show.title}" loading="lazy">`
            : `<div class="poster-card-image skeleton"></div>`
          }
          <div class="poster-card-overlay always-visible">
            <div class="poster-card-title">${show.title}</div>
            ${nextLabel ? `<div class="poster-card-meta">${nextLabel}</div>` : ''}
          </div>
          <div class="card-progress">
            <div class="card-progress-bar" style="width:${progress.percentage}%;"></div>
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
  if (filteredPaused.length > 0) {
    const cards = [];
    for (const show of filteredPaused.slice(0, 8)) {
      const progress = await getShowProgress(show.id);
      const next = await getNextEpisode(show.id);
      const posterUrl = getPosterUrl(show.posterPath, 'posterMedium');
      const nextLabel = next
        ? `S${String(next.season).padStart(2, '0')}E${String(next.episode).padStart(2, '0')}${next.title && !next.title.toLowerCase().startsWith('episode') ? ` - ${next.title}` : ''}`
        : '';

      cards.push(`
        <a href="#/show/${show.tmdbId}" class="poster-card">
          ${posterUrl 
            ? `<img class="poster-card-image" src="${posterUrl}" alt="${show.title}" loading="lazy" style="filter: grayscale(80%); opacity: 0.7;">`
            : `<div class="poster-card-image skeleton" style="filter: grayscale(80%); opacity: 0.7;"></div>`
          }
          <div class="poster-card-overlay always-visible">
            <div class="poster-card-title">${show.title}</div>
            ${nextLabel ? `<div class="poster-card-meta">${nextLabel}</div>` : ''}
          </div>
          <div class="card-progress">
            <div class="card-progress-bar secondary" style="width:${progress.percentage}%;"></div>
          </div>
        </a>
      `);
    }
    pausedShowsHTML = `
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Paused</h2>
          ${filteredPaused.length > 0 ? '<a href="#/library?status=paused" class="section-action">View All</a>' : ''}
        </div>
        <div class="grid-posters stagger-children">${cards.join('')}</div>
      </div>
    `;
  }

  // Build Plan to Watch section
  const planItems = [...filteredPlanToWatchShows, ...filteredPlanToWatchMovies]
    .filter(item => {
      const dateStr = item.firstAirDate || item.releaseDate;
      if (!dateStr) return true;
      return new Date(dateStr) <= new Date();
    })
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
      
      return `<media-card variant="poster" custom-meta="${formattedDate}" data-item='${JSON.stringify(item).replace(/'/g, "&#039;")}'></media-card>`;
    });
    
    let containerClass = 'grid-posters stagger-children';

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
  const recentItems = [...filteredRecentShows, ...filteredRecentMovies]
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
    <div class="card mb-8 p-6" style="border: 2px solid var(--color-primary); background: color-mix(in srgb, var(--color-primary) 10%, transparent);">
      <h2 class="mb-2">Action Required: Missing API Key 🔌</h2>
      <p class="mb-4 text-secondary">
        ShowDeck connects directly to TMDB to fetch show metadata and posters. Please enter a free TMDB API key to unlock the app.
      </p>
      <div class="flex flex-col gap-3">
        ${!userName ? `<input type="text" id="home-user-name" class="input w-full max-w-[400px]" placeholder="What should we call you? (Optional)">` : ''}
        <label class="flex items-center gap-2 cursor-pointer text-sm text-secondary">
          <input type="checkbox" id="home-adult-content" class="w-4 h-4 accent-primary">
          <span>Include Adult Content (PG-18+ results)</span>
        </label>
        <div class="flex gap-2">
          <input type="text" autocomplete="off" spellcheck="false" id="home-api-key" class="input flex-1" placeholder="Enter TMDB API Key">
          <button class="btn btn-primary" id="home-save-key">Save & Unlock</button>
        </div>
      </div>
      <p class="mt-2 text-xs text-tertiary">
        <a href="https://developer.themoviedb.org/docs" target="_blank" class="text-accent underline">Get a free key here</a>. 
        Your key is stored locally on this device.
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
          ${filteredWatching.length > 0 ? '<a href="#/library?status=watching" class="section-action">View All</a>' : ''}
        </div>
        ${continueWatchingHTML}
      </div>
    `,
    'paused': pausedShowsHTML,
    'plan': planToWatchHTML,
    'recent': `
      <div class="section">
        <div class="section-header">
          <div class="flex items-center gap-4">
            <h2 class="section-title m-0">Recently Added</h2>
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
      <div class="page-header items-start">
        <div class="page-header-left">
          <h1 class="page-title">Welcome back${userName ? `, ${userName}` : ''} 👋</h1>
          <p class="page-subtitle">Here's what's happening with your entertainment.</p>
        </div>
        <button class="btn btn-secondary btn-sm flex items-center gap-2" id="customize-dashboard-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          <span class="hide-mobile">Customize</span>
        </button>
      </div>

      <div id="customize-modal" class="card hidden mb-6 p-6 bg-surface-2 border-primary">
        <h3 class="mt-0 mb-4">Customize Dashboard</h3>
        <p class="text-sm text-tertiary mb-4">Select and reorder the sections you want to see on your home screen.</p>
        <div class="flex flex-col gap-2" id="widget-checkboxes">
          ${(() => {
            const allWidgets = {
              'watching': 'Watching',
              'paused': 'Paused Shows',
              'plan': 'Plan to Watch',
              'recent': 'Recently Added',
              'upcoming': 'Upcoming Releases'
            };
            const orderedKeys = [...userWidgets, ...Object.keys(allWidgets).filter(k => !userWidgets.includes(k))];
            
            return orderedKeys.map(k => `
              <div class="widget-row card flex items-center justify-between py-2 px-3 bg-surface-1">
                <label class="flex items-center gap-3 cursor-pointer flex-1">
                  <input type="checkbox" value="${k}" ${userWidgets.includes(k) ? 'checked' : ''} class="w-[18px] h-[18px] accent-primary">
                  <span>${allWidgets[k]}</span>
                </label>
                <div class="flex gap-1">
                  <button class="btn btn-ghost btn-sm p-1 h-auto min-h-0" data-move="up">▲</button>
                  <button class="btn btn-ghost btn-sm p-1 h-auto min-h-0" data-move="down">▼</button>
                </div>
              </div>
            `).join('');
          })()}
        </div>
        <div class="flex justify-end gap-3 mt-4">
          <button class="btn btn-ghost" id="cancel-customize-btn">Cancel</button>
          <button class="btn btn-primary" id="save-customize-btn">Save Layout</button>
        </div>
      </div>

      ${onboardingHtml}

      ${dashboardContent}
    </div>
  `;
}
