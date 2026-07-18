/**
 * ShowDeck — Library Page
 * Personal collection with grid/list/compact views, filters, sorting.
 */

import { getAllShows, deleteShow, updateTrackingStatus } from '../database/shows.js';
import { getAllMovies, deleteMovie, updateMovieTrackingStatus } from '../database/movies.js';
import { getShowProgress } from '../database/episodes.js';
import { getPosterUrl } from '../api/tmdb.js';
import { formatYear, statusBadge, STATUS_MAP, debounce } from '../utils/dom.js';
import { toast } from '../components/toast.js';


let viewMode = localStorage.getItem('showdeck-library-view') || 'grid';
let filterStatus = sessionStorage.getItem('showdeck-library-status') || '';
let filterType = sessionStorage.getItem('showdeck-library-type') || 'all'; // 'all' | 'shows' | 'movies'
let sortBy = sessionStorage.getItem('showdeck-library-sortby') || 'addedAt';
let sortOrder = sessionStorage.getItem('showdeck-library-sortorder') || 'desc';
let searchTerm = sessionStorage.getItem('showdeck-library-search') || '';
let filterCollection = null;
let allItems = [];

let currentFilteredItems = [];
let currentRenderCount = 0;
const CHUNK_SIZE = 60;
let scrollObserver = null;

export function render() {
  return `
    <div class="page-container animate-fade-in">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Library</h1>
          <p class="page-subtitle" id="library-count">Loading...</p>
        </div>
        <div class="page-header-actions">
          <!-- View Toggle -->
          <div class="view-toggle" id="view-toggle" role="group" aria-label="View mode">
            <button class="btn btn-icon btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}" data-view="grid" id="view-grid" aria-label="Grid view" data-tooltip="Grid">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>
            </button>
            <button class="btn btn-icon btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}" data-view="list" id="view-list" aria-label="List view" data-tooltip="List">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
            </button>
            <button class="btn btn-icon btn-sm ${viewMode === 'compact' ? 'btn-primary' : 'btn-ghost'}" data-view="compact" id="view-compact" aria-label="Compact view" data-tooltip="Compact">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="4" x="3" y="4" rx="1"/><rect width="18" height="4" x="3" y="10" rx="1"/><rect width="18" height="4" x="3" y="16" rx="1"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="library-toolbar" style="display:flex;gap:var(--space-3);flex-wrap:wrap;margin-bottom:var(--space-6);align-items:center;">
        <!-- Search -->
        <div class="input-group" style="flex:1;min-width:200px;max-width:320px;">
          <span class="input-group-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </span>
          <input type="search" class="input" id="library-search" placeholder="Filter library..." aria-label="Filter library" value="${searchTerm ? searchTerm.replace(/"/g, '&quot;') : ''}">
        </div>

        <!-- Type Filter -->
        <select class="input" id="filter-type" style="width:auto;min-width:110px;" aria-label="Filter by type">
          <option value="all" ${filterType === 'all' ? 'selected' : ''}>All Types</option>
          <option value="shows" ${filterType === 'shows' ? 'selected' : ''}>TV Shows</option>
          <option value="movies" ${filterType === 'movies' ? 'selected' : ''}>Movies</option>
        </select>

        <!-- Status Filter -->
        <select class="input" id="filter-status" style="width:auto;min-width:140px;" aria-label="Filter by status">
          <option value="" ${filterStatus === '' ? 'selected' : ''}>All Status</option>
          <option value="watching" ${filterStatus === 'watching' ? 'selected' : ''}>Watching</option>
          <option value="upcoming" ${filterStatus === 'upcoming' ? 'selected' : ''}>Upcoming</option>
          <option value="completed" ${filterStatus === 'completed' ? 'selected' : ''}>Completed</option>
          <option value="paused" ${filterStatus === 'paused' ? 'selected' : ''}>Paused</option>
          <option value="dropped" ${filterStatus === 'dropped' ? 'selected' : ''}>Dropped</option>
          <option value="plan" ${filterStatus === 'plan' ? 'selected' : ''}>Plan to Watch</option>
          <option value="rewatching" ${filterStatus === 'rewatching' ? 'selected' : ''}>Rewatching</option>
        </select>

        <!-- Sort -->
        <select class="input" id="sort-by" style="width:auto;min-width:130px;" aria-label="Sort by">
          <option value="addedAt-desc" ${sortBy === 'addedAt' && sortOrder === 'desc' ? 'selected' : ''}>Recently Added</option>
          <option value="addedAt-asc" ${sortBy === 'addedAt' && sortOrder === 'asc' ? 'selected' : ''}>Oldest Added</option>
          <option value="title-asc" ${sortBy === 'title' && sortOrder === 'asc' ? 'selected' : ''}>Title A→Z</option>
          <option value="title-desc" ${sortBy === 'title' && sortOrder === 'desc' ? 'selected' : ''}>Title Z→A</option>
          <option value="rating-desc" ${sortBy === 'rating' && sortOrder === 'desc' ? 'selected' : ''}>Highest Rated</option>
          <option value="rating-asc" ${sortBy === 'rating' && sortOrder === 'asc' ? 'selected' : ''}>Lowest Rated</option>
          <option value="updatedAt-desc" ${sortBy === 'updatedAt' && sortOrder === 'desc' ? 'selected' : ''}>Recently Updated</option>
        </select>
      </div>

      <!-- Library Grid -->
      <div id="library-content"></div>
    </div>
  `;
}

export async function init() {
  // Read URL params
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.split('?')[1] || '');
  if (params.get('status')) {
    filterStatus = params.get('status');
    const statusSelect = document.getElementById('filter-status');
    if (statusSelect) statusSelect.value = filterStatus;
  }
  
  if (params.get('collection')) {
    filterCollection = parseInt(params.get('collection'), 10);
  } else {
    filterCollection = null;
  }

  await loadLibrary();
  bindEvents();
}

function bindEvents() {
  // View toggle
  document.getElementById('view-toggle')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-view]');
    if (!btn) return;
    viewMode = btn.dataset.view;
    localStorage.setItem('showdeck-library-view', viewMode);

    document.querySelectorAll('#view-toggle .btn').forEach(b => {
      b.classList.remove('btn-primary');
      b.classList.add('btn-ghost');
    });
    btn.classList.remove('btn-ghost');
    btn.classList.add('btn-primary');

    renderItems();
  });

  // Filters
  document.getElementById('filter-type')?.addEventListener('change', (e) => {
    filterType = e.target.value;
    sessionStorage.setItem('showdeck-library-type', filterType);
    renderItems();
  });

  document.getElementById('filter-status')?.addEventListener('change', (e) => {
    filterStatus = e.target.value;
    sessionStorage.setItem('showdeck-library-status', filterStatus);
    renderItems();
  });

  document.getElementById('sort-by')?.addEventListener('change', (e) => {
    const [field, order] = e.target.value.split('-');
    sortBy = field;
    sortOrder = order;
    sessionStorage.setItem('showdeck-library-sortby', sortBy);
    sessionStorage.setItem('showdeck-library-sortorder', sortOrder);
    renderItems();
  });

  // Search
  document.getElementById('library-search')?.addEventListener('input',
    debounce((e) => {
      searchTerm = e.target.value.trim().toLowerCase();
      sessionStorage.setItem('showdeck-library-search', searchTerm);
      renderItems();
    }, 200)
  );

  // Item actions (event delegation)
  document.getElementById('library-content')?.addEventListener('click', async (e) => {
    const statusBtn = e.target.closest('[data-action="status"]');
    const deleteBtn = e.target.closest('[data-action="delete"]');

    if (statusBtn) {
      e.preventDefault();
      e.stopPropagation();
      await handleStatusChange(statusBtn);
    }
    if (deleteBtn) {
      e.preventDefault();
      e.stopPropagation();
      await handleDelete(deleteBtn);
    }
  });
}

async function loadLibrary() {
  const [shows, movies] = await Promise.all([
    getAllShows(),
    getAllMovies(),
  ]);

  const { getShowProgress, getNextEpisode } = await import('../database/episodes.js');
  const showsWithProgress = await Promise.all(shows.map(async s => {
    const progress = await getShowProgress(s.id);
    const next = (s.trackingStatus === 'watching' || s.trackingStatus === 'paused') ? await getNextEpisode(s.id) : null;
    return { ...s, progress, nextEpisode: next, itemType: 'show' };
  }));

  allItems = [
    ...showsWithProgress,
    ...movies.map(m => ({ ...m, itemType: 'movie' })),
  ].filter(i => i.tmdbId !== null);
  
  if (filterCollection) {
    const { getCollection } = await import('../database/collections.js');
    const coll = await getCollection(filterCollection);
    if (coll && coll.itemIds) {
      allItems = allItems.filter(i => coll.itemIds.includes(`${i.itemType}:${i.id}`));
    }
  }

  renderItems();
}

function getFilteredItems() {
  let items = [...allItems];

  // Type filter
  if (filterType === 'shows') items = items.filter(i => i.itemType === 'show');
  if (filterType === 'movies') items = items.filter(i => i.itemType === 'movie');

  // Status filter
  if (filterStatus) {
    if (filterStatus === 'upcoming') {
      const now = new Date();
      items = items.filter(i => {
        const dateStr = i.firstAirDate || i.releaseDate;
        if (!dateStr) return false;
        return new Date(dateStr) > now;
      });
    } else {
      items = items.filter(i => i.trackingStatus === filterStatus);
    }
  }

  // Search
  if (searchTerm) {
    items = items.filter(i =>
      i.title.toLowerCase().includes(searchTerm) ||
      (i.genres || []).some(g => g.toLowerCase().includes(searchTerm)) ||
      (i.tags || []).some(t => t.toLowerCase().includes(searchTerm))
    );
  }

  // Sort
  items.sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];
    if (valA instanceof Date) valA = valA.getTime();
    if (valB instanceof Date) valB = valB.getTime();
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA == null) valA = sortOrder === 'asc' ? Infinity : -Infinity;
    if (valB == null) valB = sortOrder === 'asc' ? Infinity : -Infinity;
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return items;
}

function renderItems() {
  currentFilteredItems = getFilteredItems();
  const items = currentFilteredItems;
  const contentEl = document.getElementById('library-content');
  const countEl = document.getElementById('library-count');

  if (countEl) {
    const showCount = items.filter(i => i.itemType === 'show').length;
    const movieCount = items.filter(i => i.itemType === 'movie').length;
    countEl.textContent = `${items.length} items • ${showCount} shows • ${movieCount} movies`;
  }

  if (items.length === 0) {
    contentEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>
        </div>
        <h3 class="empty-state-title">${searchTerm || filterStatus || filterCollection ? 'No matches' : 'Library is empty'}</h3>
        <p class="empty-state-text">${searchTerm || filterStatus || filterCollection ? 'Try different filters.' : 'Search and add shows to get started.'}</p>
        ${!searchTerm && !filterStatus && !filterCollection ? '<a href="#/search" class="btn btn-primary">Search Content</a>' : ''}
      </div>
    `;
    return;
  }

  currentRenderCount = Math.min(CHUNK_SIZE, items.length);
  const initialItems = items.slice(0, currentRenderCount);

  let html = '';
  if (viewMode === 'grid') {
    html = `<div class="grid-posters stagger-children" id="library-list-container">${initialItems.map(renderGridCard).join('')}</div>`;
  } else if (viewMode === 'list') {
    html = `<div class="library-list stagger-children" id="library-list-container">${initialItems.map(renderListItem).join('')}</div>`;
  } else {
    html = `<div class="library-compact stagger-children" id="library-list-container">${initialItems.map(renderCompactItem).join('')}</div>`;
  }

  if (currentRenderCount < items.length) {
    html += `<div id="library-sentinel" style="height:20px; width:100%;"></div>`;
  }
  contentEl.innerHTML = html;

  bindEnrichTriggers(contentEl);
  setupObserver();
}

function bindEnrichTriggers(container) {
  container.querySelectorAll('.enrich-trigger').forEach(el => {
    // Prevent duplicate binding if called multiple times on the container, but since we append fresh DOM nodes, it's mostly fine.
    // However, to be perfectly safe, we can just bind to elements that don't have a specific data flag.
    if (el.dataset.bound) return;
    el.dataset.bound = "true";
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const id = parseInt(el.dataset.id);
      const type = el.dataset.type;
      const title = decodeURIComponent(el.dataset.title);
      import('../components/enrich-modal.js').then(m => {
        m.openEnrichModal(id, type, title, () => {
          loadLibrary();
        });
      });
    });
  });
}

function setupObserver() {
  if (scrollObserver) {
    scrollObserver.disconnect();
  }
  const sentinel = document.getElementById('library-sentinel');
  if (!sentinel) return;

  scrollObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      renderMoreItems();
    }
  }, { rootMargin: '200px' });
  scrollObserver.observe(sentinel);
}

function renderMoreItems() {
  const container = document.getElementById('library-list-container');
  if (!container) return;

  const nextCount = Math.min(currentRenderCount + CHUNK_SIZE, currentFilteredItems.length);
  const nextItems = currentFilteredItems.slice(currentRenderCount, nextCount);
  
  const tempDiv = document.createElement('div');
  if (viewMode === 'grid') {
    tempDiv.innerHTML = nextItems.map(renderGridCard).join('');
  } else if (viewMode === 'list') {
    tempDiv.innerHTML = nextItems.map(renderListItem).join('');
  } else {
    tempDiv.innerHTML = nextItems.map(renderCompactItem).join('');
  }

  const fragment = document.createDocumentFragment();
  while (tempDiv.firstChild) {
    fragment.appendChild(tempDiv.firstChild);
  }
  container.appendChild(fragment);
  
  bindEnrichTriggers(container);

  currentRenderCount = nextCount;

  if (currentRenderCount >= currentFilteredItems.length) {
    const sentinel = document.getElementById('library-sentinel');
    if (sentinel) sentinel.remove();
    if (scrollObserver) scrollObserver.disconnect();
  }
}

function renderGridCard(item) {
  const posterUrl = getPosterUrl(item.posterPath, 'posterMedium');
  const year = formatYear(item.itemType === 'show' ? item.firstAirDate : item.releaseDate);
  const status = STATUS_MAP[item.trackingStatus] || STATUS_MAP.plan;
  const isMissing = item.tmdbId === null;
  const route = isMissing ? '#' : (item.itemType === 'show' ? `#/show/${item.tmdbId}` : `#/movie/${item.tmdbId}`);
  const triggerClass = isMissing ? 'enrich-trigger' : '';
  const triggerAttrs = isMissing ? `data-id="${item.id}" data-type="${item.itemType}" data-title="${encodeURIComponent(item.title)}"` : '';
  const missingBadge = isMissing ? `<div style="position:absolute;top:4px;right:4px;background:var(--color-error);color:white;font-size:10px;padding:2px 6px;border-radius:10px;font-weight:bold;z-index:2;">Fix Match</div>` : '';

  let statusBadgeHtml = '';
  if (item.trackingStatus) {
    const badges = {
      'completed': { bg: 'var(--color-success)', icon: '<polyline points="20 6 9 17 4 12"/>' },
      'watching': { bg: 'var(--color-primary)', icon: '<polygon points="5 3 19 12 5 21 5 3"/>' },
      'paused': { bg: 'var(--color-warning)', icon: '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>' },
      'dropped': { bg: 'var(--color-error)', icon: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' },
      'plan': { bg: 'var(--text-secondary)', icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' }
    };
    const b = badges[item.trackingStatus];
    if (b) {
      statusBadgeHtml = `<div style="position:absolute;top:var(--space-2);left:var(--space-2);width:22px;height:22px;background:${b.bg};color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;z-index:10;box-shadow:0 2px 4px rgba(0,0,0,0.5);" title="${item.trackingStatus}"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${b.icon}</svg></div>`;
    }
  }

  let nextLabelHtml = '';
  if (item.itemType === 'show' && item.nextEpisode) {
    const n = item.nextEpisode;
    const label = `S${String(n.season).padStart(2, '0')}E${String(n.episode).padStart(2, '0')}${n.title && !n.title.toLowerCase().startsWith('episode') ? ` - ${n.title}` : ''}`;
    nextLabelHtml = `<div style="font-size:11px; color:hsla(0,0%,100%,0.8); margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-shadow:0 1px 2px rgba(0,0,0,0.8);">${label}</div>`;
  }

  return `
    <a href="${route}" class="poster-card ${triggerClass}" ${triggerAttrs} id="lib-${item.itemType}-${item.id}" style="position:relative;">
      ${statusBadgeHtml}
      ${missingBadge}
      ${posterUrl
        ? `<img class="poster-card-image" src="${posterUrl}" alt="${item.title}" loading="lazy">`
        : `<div class="poster-card-image" style="display:flex;align-items:center;justify-content:center;background:var(--surface-3);"><span style="font-size:var(--text-3xl);opacity:0.3;">🎬</span></div>`
      }
      ${item.progress && item.progress.percentage > 0 ? `<div style="position:absolute;bottom:0;left:0;height:4px;background:${item.trackingStatus === 'paused' ? 'var(--text-secondary)' : 'var(--color-primary)'};width:${item.progress.percentage}%;z-index:2;"></div>` : ''}
      <div class="poster-card-overlay">
        <div class="poster-card-title">${item.title}</div>
        <div class="poster-card-meta">${year} • ${item.itemType === 'show' ? 'TV' : 'Movie'}</div>
        ${nextLabelHtml}
      </div>
      ${item.rating ? `<div style="position:absolute;top:var(--space-2);right:var(--space-2);"><span class="badge badge-warning" style="font-size:10px;">★ ${item.rating}</span></div>` : ''}
    </a>
  `;
}

function renderListItem(item) {
  const posterUrl = getPosterUrl(item.posterPath, 'posterSmall');
  const year = formatYear(item.itemType === 'show' ? item.firstAirDate : item.releaseDate);
  const genres = (item.genres || []).slice(0, 3).join(', ');
  const isMissing = item.tmdbId === null;
  const route = isMissing ? '#' : (item.itemType === 'show' ? `#/show/${item.tmdbId}` : `#/movie/${item.tmdbId}`);
  const triggerClass = isMissing ? 'enrich-trigger' : '';
  const triggerAttrs = isMissing ? `data-id="${item.id}" data-type="${item.itemType}" data-title="${encodeURIComponent(item.title)}"` : '';
  const missingBadge = isMissing ? `<div style="position:absolute;top:4px;right:4px;background:var(--color-error);color:white;font-size:10px;padding:2px 6px;border-radius:10px;font-weight:bold;">Fix Match</div>` : '';

  return `
    <a href="${route}" class="library-list-item card ${triggerClass}" ${triggerAttrs} id="lib-list-${item.itemType}-${item.id}" style="display:flex;gap:var(--space-4);padding:var(--space-3);margin-bottom:var(--space-2);text-decoration:none;position:relative;">
      ${missingBadge}
      ${posterUrl
        ? `<img src="${posterUrl}" alt="${item.title}" style="width:56px;height:84px;object-fit:cover;border-radius:var(--radius-sm);flex-shrink:0;" loading="lazy">`
        : `<div style="width:56px;height:84px;background:var(--surface-3);border-radius:var(--radius-sm);flex-shrink:0;display:flex;align-items:center;justify-content:center;"><span style="opacity:0.3;">🎬</span></div>`
      }
      <div style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:var(--space-1);">
        <div style="font-weight:var(--weight-medium);color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${item.title}</div>
        <div style="font-size:var(--text-xs);color:var(--text-tertiary);">${year} • ${item.itemType === 'show' ? 'TV Show' : 'Movie'}${item.progress ? ` • ${item.progress.percentage}%` : ''}${genres ? ` • ${genres}` : ''}</div>
        ${item.itemType === 'movie' && item.overview ? `<div style="font-size:var(--text-xs);color:var(--text-secondary);margin-top:var(--space-1);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${item.overview}</div>` : ''}
        <div style="display:flex;gap:var(--space-2);align-items:center;margin-top:var(--space-2);">
          ${statusBadge(item.trackingStatus)}
          ${item.itemType === 'movie' && item.voteAverage ? `<span class="badge badge-secondary" style="font-size:10px;background:var(--surface-3);color:var(--text-secondary);">TMDB ★ ${item.voteAverage.toFixed(1)}</span>` : ''}
          ${item.rating ? `<span class="badge badge-warning">★ ${item.rating}</span>` : ''}
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:var(--space-1);flex-shrink:0;">
        <button class="btn btn-icon btn-sm btn-ghost" data-action="delete" data-id="${item.id}" data-type="${item.itemType}" data-title="${item.title.replace(/"/g, '&quot;')}" aria-label="Remove" data-tooltip="Remove">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      </div>
    </a>
  `;
}

function renderCompactItem(item) {
  const year = formatYear(item.itemType === 'show' ? item.firstAirDate : item.releaseDate);
  const status = STATUS_MAP[item.trackingStatus] || STATUS_MAP.plan;
  const isMissing = item.tmdbId === null;
  const route = isMissing ? '#' : (item.itemType === 'show' ? `#/show/${item.tmdbId}` : `#/movie/${item.tmdbId}`);
  const triggerClass = isMissing ? 'enrich-trigger' : '';
  const triggerAttrs = isMissing ? `data-id="${item.id}" data-type="${item.itemType}" data-title="${encodeURIComponent(item.title)}"` : '';

  return `
    <a href="${route}" class="library-compact-item hover-bg-2 ${triggerClass}" ${triggerAttrs} id="lib-compact-${item.itemType}-${item.id}"
      style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2) var(--space-3);border-bottom:1px solid var(--border-subtle);text-decoration:none;color:var(--text-primary);transition:background var(--duration-fast) var(--ease-out);">
      <span style="width:8px;height:8px;border-radius:var(--radius-full);background:var(--color-${status.color});flex-shrink:0;"></span>
      ${isMissing ? `<span style="font-size:10px;background:var(--color-error);color:white;padding:1px 4px;border-radius:4px;">Fix</span>` : ''}
      <span style="flex:1;font-size:var(--text-sm);font-weight:var(--weight-medium);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${item.title}</span>
      ${item.progress && item.progress.percentage > 0 ? `<span style="font-size:var(--text-xs);color:var(--color-primary);flex-shrink:0;">${item.progress.percentage}%</span>` : ''}
      <span style="font-size:var(--text-xs);color:var(--text-tertiary);flex-shrink:0;">${year}</span>
      <span style="font-size:var(--text-xs);color:var(--text-tertiary);flex-shrink:0;width:50px;">${item.itemType === 'show' ? 'TV' : 'Movie'}</span>
      ${item.rating ? `<span style="font-size:var(--text-xs);color:var(--color-warning);flex-shrink:0;">★ ${item.rating}</span>` : '<span style="width:30px;flex-shrink:0;"></span>'}
    </a>
  `;
}

async function handleStatusChange(btn) {
  // Future: status dropdown. For now handled on detail page.
}

async function handleDelete(btn) {
  const id = parseInt(btn.dataset.id);
  const type = btn.dataset.type;
  const title = btn.dataset.title;

  if (!confirm(`Remove "${title}" from your library?`)) return;

  try {
    if (type === 'show') {
      await deleteShow(id);
    } else {
      await deleteMovie(id);
    }
    toast(`${title} removed`, 'success');

    // Remove from local array and re-render
    allItems = allItems.filter(i => !(i.id === id && i.itemType === type));
    renderItems();
  } catch (err) {
    console.error('[Library] Delete failed:', err);
    toast('Failed to remove', 'error');
  }
}
