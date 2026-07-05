/**
 * ShowDeck — Search Page
 * Search TMDB/TVMaze for shows & movies, add to library.
 */

import * as provider from '../api/provider.js';
import { getPosterUrl } from '../api/tmdb.js';
import { showExists, addShow } from '../database/shows.js';
import { movieExists, addMovie } from '../database/movies.js';
import { debounce, formatYear, truncate, STATUS_MAP } from '../utils/dom.js';
import { toast } from '../components/toast.js';

let currentQuery = '';
let currentPage = 1;
let totalPages = 0;
let searchType = 'multi'; // 'multi' | 'shows' | 'movies'
let viewMode = localStorage.getItem('showdeck-search-view') || 'grid';

export function render() {
  return `
    <div class="page-container animate-fade-in">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Search</h1>
          <p class="page-subtitle">Find TV shows and movies to track.</p>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="section">
        <div class="search-container">
          <form onsubmit="event.preventDefault(); document.getElementById('search-input').blur();" class="input-group" style="position:relative;">
            <span class="input-group-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </span>
            <input
              type="search"
              class="input input-lg"
              id="search-input"
              placeholder="Search for shows, movies..."
              autocomplete="off"
              autofocus
              aria-label="Search shows and movies"
              style="padding-right: 40px;"
            >
            <button type="button" id="search-clear-btn" class="hidden" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-tertiary);padding:4px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </form>

          <!-- Type Filters -->
          <div class="search-type-filters" id="search-type-filters" style="display:flex;align-items:center;gap:var(--space-2);width:100%;">
            <button class="btn btn-sm ${searchType === 'multi' ? 'btn-primary' : 'btn-ghost'}" data-type="multi" id="filter-all">All</button>
            <button class="btn btn-sm ${searchType === 'shows' ? 'btn-primary' : 'btn-ghost'}" data-type="shows" id="filter-shows">TV Shows</button>
            <button class="btn btn-sm ${searchType === 'movies' ? 'btn-primary' : 'btn-ghost'}" data-type="movies" id="filter-movies">Movies</button>
            
            <div class="view-toggle" id="search-view-toggle" role="group" style="margin-left:auto;">
              <button class="btn btn-icon btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}" data-view="grid" aria-label="Grid view" data-tooltip="Grid">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>
              </button>
              <button class="btn btn-icon btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}" data-view="list" aria-label="List view" data-tooltip="List">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div id="search-results"></div>

      <!-- Load More -->
      <div id="search-load-more" class="hidden" style="text-align:center;padding:var(--space-6) 0;">
        <button class="btn btn-secondary" id="load-more-btn">Load More</button>
      </div>
    </div>
  `;
}

export function init() {
  const input = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear-btn');
  const filtersEl = document.getElementById('search-type-filters');

  const doSearch = debounce((query) => {
    currentQuery = query.trim();
    
    // Toggle clear button
    if (currentQuery) {
      clearBtn?.classList.remove('hidden');
    } else {
      clearBtn?.classList.add('hidden');
    }
    
    // If empty, clear results
    if (!currentQuery) {
      document.getElementById('search-results').innerHTML = '';
      document.getElementById('search-load-more').classList.add('hidden');
      return;
    }
    
    currentPage = 1;
    performSearch();
  }, 350);

  input?.addEventListener('input', (e) => doSearch(e.target.value));

  clearBtn?.addEventListener('click', () => {
    if (input) {
      input.value = '';
      input.focus();
      doSearch('');
    }
  });

  // Type filter buttons
  filtersEl?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-type]');
    if (!btn) return;
    searchType = btn.dataset.type;
    
    // Update active button
    document.querySelectorAll('#search-type-filters .btn').forEach(btn => {
      if (btn.hasAttribute('data-type')) {
        btn.classList.toggle('btn-primary', btn.dataset.type === searchType);
        btn.classList.toggle('btn-ghost', btn.dataset.type !== searchType);
      }
    });

    if (currentQuery) {
      currentPage = 1;
      performSearch();
    }
  });

  document.getElementById('search-view-toggle')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-view]');
    if (!btn) return;
    
    viewMode = btn.dataset.view;
    localStorage.setItem('showdeck-search-view', viewMode);

    // Update active buttons
    document.querySelectorAll('#search-view-toggle .btn').forEach(b => {
      b.classList.remove('btn-primary');
      b.classList.add('btn-ghost');
      if (b.dataset.view === viewMode) {
        b.classList.remove('btn-ghost');
        b.classList.add('btn-primary');
      }
    });

    // Re-render results if any
    if (currentQuery) {
      document.getElementById('search-results').innerHTML = '';
      currentPage = 1;
      performSearch();
    }
  });

  // Load more
  document.getElementById('load-more-btn')?.addEventListener('click', async () => {
    currentPage++;
    await performSearch(true);
  });

  // Result clicks (event delegation)
  document.getElementById('search-results')?.addEventListener('click', async (e) => {
    const addBtn = e.target.closest('[data-action="add"]');
    if (addBtn) {
      e.preventDefault();
      e.stopPropagation();
      await handleAdd(addBtn);
    }
  });
}

async function performSearch(append = false) {
  const resultsEl = document.getElementById('search-results');
  const loadMoreEl = document.getElementById('search-load-more');

  if (!append) {
    resultsEl.innerHTML = `
      <div class="grid-posters">
        ${Array(8).fill('<div class="poster-card"><div class="poster-card-image skeleton" style="aspect-ratio:var(--card-poster-ratio);"></div><div class="poster-card-info"><div class="skeleton" style="height:14px;width:70%;margin-bottom:6px;"></div><div class="skeleton" style="height:10px;width:40%;"></div></div></div>').join('')}
      </div>
    `;
  }

  try {
    let data;
    if (searchType === 'shows') {
      data = await provider.searchShows(currentQuery, currentPage);
      data.results = data.results.map(r => ({ ...r, mediaType: 'show' }));
    } else if (searchType === 'movies') {
      data = await provider.searchMovies(currentQuery, currentPage);
      data.results = data.results.map(r => ({ ...r, mediaType: 'movie' }));
    } else {
      data = await provider.search(currentQuery, currentPage);
    }

    totalPages = data.totalPages || 1;

    // Check which items are already in library
    const results = [];
    for (const item of data.results) {
      if (!item.tmdbId) continue;
      let inLibrary = false;
      if (item.mediaType === 'show') {
        inLibrary = await showExists(item.tmdbId);
      } else if (item.mediaType === 'movie') {
        inLibrary = await movieExists(item.tmdbId);
      }
      results.push({ ...item, inLibrary });
    }

    if (results.length === 0 && !append) {
      resultsEl.innerHTML = `
        <div class="empty-state" style="padding:var(--space-12) var(--space-4);">
          <div class="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <h3 class="empty-state-title">No results found</h3>
          <p class="empty-state-text">Try a different search term.</p>
        </div>
      `;
      loadMoreEl.classList.add('hidden');
      return;
    }

    // Render
    let cardsHTML = results.map(renderResultCard).join('');
    
    const wrapperClass = viewMode === 'list' ? 'library-list stagger-children' : 'grid-posters stagger-children';
    
    if (append) {
      let grid = resultsEl.querySelector(`.${wrapperClass.split(' ')[0]}`);
      if (grid) {
        grid.insertAdjacentHTML('beforeend', cardsHTML);
      }
    } else {
      resultsEl.innerHTML = `<div class="${wrapperClass}">${cardsHTML}</div>`;
    }

    // Show/hide load more
    loadMoreEl.classList.toggle('hidden', currentPage >= totalPages);

  } catch (err) {
    console.error('[Search] Error:', err);
    if (!append) {
      resultsEl.innerHTML = `
        <div class="empty-state" style="padding:var(--space-12) var(--space-4);">
          <div class="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
          </div>
          <h3 class="empty-state-title">Search failed</h3>
          <p class="empty-state-text">Check your API key or internet connection.</p>
        </div>
      `;
    }
  }
}

function renderResultCard(item) {
  const posterUrl = getPosterUrl(item.posterPath, 'posterMedium');
  const year = formatYear(item.mediaType === 'show' ? item.firstAirDate : item.releaseDate);
  const typeLabel = item.mediaType === 'show' ? 'TV Show' : 'Movie';
  const rating = item.voteAverage ? `★ ${item.voteAverage.toFixed(1)}` : '';
  const route = item.mediaType === 'show' ? `#/show/${item.tmdbId}` : `#/movie/${item.tmdbId}`;

  if (viewMode === 'list') {
    const genres = (item.genres || []).slice(0, 3).join(', ');
    return `
      <div class="library-list-item card" id="result-${item.mediaType}-${item.tmdbId}" style="display:flex;gap:var(--space-4);padding:var(--space-3);margin-bottom:var(--space-2);text-decoration:none;">
        <a href="${route}" style="flex-shrink:0;">
          ${posterUrl
            ? `<img src="${posterUrl}" alt="${item.title}" style="width:64px;height:96px;object-fit:cover;border-radius:var(--radius-sm);" loading="lazy">`
            : `<div style="width:64px;height:96px;background:var(--surface-3);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;"><span style="opacity:0.3;">🎬</span></div>`
          }
        </a>
        <div style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:var(--space-1);">
          <a href="${route}" style="text-decoration:none;">
            <div style="font-weight:var(--weight-medium);color:var(--text-primary);font-size:var(--text-lg);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${item.title}</div>
            <div style="font-size:var(--text-sm);color:var(--text-secondary);margin-top:2px;">${year} • ${typeLabel}${genres ? ` • ${genres}` : ''}</div>
          </a>
          <div style="display:flex;gap:var(--space-2);align-items:center;margin-top:var(--space-2);">
            ${item.inLibrary
              ? `<span class="badge badge-success">✓ In Library</span>`
              : `<button class="btn btn-primary btn-sm"
                  data-action="add"
                  data-media-type="${item.mediaType}"
                  data-tmdb-id="${item.tmdbId}"
                  data-title="${item.title.replace(/"/g, '&quot;')}"
                  id="add-${item.mediaType}-${item.tmdbId}">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  Add
                </button>`
            }
            ${rating ? `<span style="font-size:var(--text-sm);color:var(--color-warning);">★ ${item.voteAverage.toFixed(1)}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="poster-card search-result-card" id="result-${item.mediaType}-${item.tmdbId}">
      <a href="${route}">
        ${posterUrl
          ? `<img class="poster-card-image" src="${posterUrl}" alt="${item.title}" loading="lazy">`
          : `<div class="poster-card-image" style="display:flex;align-items:center;justify-content:center;background:var(--surface-3);aspect-ratio:var(--card-poster-ratio);"><span style="font-size:var(--text-3xl);opacity:0.3;">🎬</span></div>`
        }
      </a>
      <div class="poster-card-info" style="display:flex;flex-direction:column;gap:var(--space-1);">
        <div class="poster-card-info-title">${item.title}</div>
        <div class="poster-card-info-sub" style="display:flex;align-items:center;justify-content:space-between;">
          <span>${year} • ${typeLabel}</span>
          ${rating ? `<span style="color:var(--color-warning);font-size:var(--text-xs);">${rating}</span>` : ''}
        </div>
        ${item.inLibrary
          ? `<span class="badge badge-success" style="width:fit-content;margin-top:var(--space-1);">✓ In Library</span>`
          : `<button class="btn btn-primary btn-sm" style="width:100%;margin-top:var(--space-1);"
              data-action="add"
              data-tmdb-id="${item.tmdbId}"
              data-media-type="${item.mediaType}"
              data-title="${item.title.replace(/"/g, '&quot;')}"
              id="add-${item.mediaType}-${item.tmdbId}">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Add to Library
            </button>`
        }
      </div>
    </div>
  `;
}

async function handleAdd(btn) {
  const tmdbId = parseInt(btn.dataset.tmdbId);
  const mediaType = btn.dataset.mediaType;
  const title = btn.dataset.title;

  btn.disabled = true;
  btn.textContent = 'Adding...';

  try {
    if (mediaType === 'show') {
      // Get full details from provider
      const details = await provider.getShowDetails(tmdbId);
      if (details) {
        await addShow({
          tmdbId: details.tmdbId,
          title: details.title,
          originalTitle: details.originalTitle,
          posterPath: details.posterPath,
          backdropPath: details.backdropPath,
          overview: details.overview,
          genres: details.genres,
          status: details.status,
          firstAirDate: details.firstAirDate,
          lastAirDate: details.lastAirDate,
          totalSeasons: details.totalSeasons,
          totalEpisodes: details.totalEpisodes,
          network: details.network,
          runtime: details.runtime,
          trackingStatus: 'plan',
        });
      } else {
        // Fallback — add with minimal data
        await addShow({ tmdbId, title, trackingStatus: 'plan' });
      }
    } else {
      const details = await provider.getMovieDetails(tmdbId);
      if (details) {
        await addMovie({
          tmdbId: details.tmdbId,
          title: details.title,
          originalTitle: details.originalTitle,
          posterPath: details.posterPath,
          backdropPath: details.backdropPath,
          overview: details.overview,
          genres: details.genres,
          releaseDate: details.releaseDate,
          runtime: details.runtime,
          status: details.status,
          trackingStatus: 'plan',
        });
      } else {
        await addMovie({ tmdbId, title, trackingStatus: 'plan' });
      }
    }

    toast(`${title} added to library`, 'success');

    // Replace button with "In Library" badge
    const card = btn.closest('.search-result-card');
    if (card) {
      btn.replaceWith(Object.assign(document.createElement('span'), {
        className: 'badge badge-success',
        style: 'width:fit-content;margin-top:var(--space-1);',
        textContent: '✓ In Library',
      }));
    }

  } catch (err) {
    console.error('[Search] Add failed:', err);
    toast(`Failed to add ${title}`, 'error');
    btn.disabled = false;
    btn.textContent = '+ Add to Library';
  }
}
