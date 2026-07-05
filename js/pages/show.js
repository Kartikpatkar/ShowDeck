/**
 * ShowDeck — Show Detail Page
 * Full show information, season tabs, episode tracking, and cast.
 */

import * as provider from '../api/provider.js';
import { getShow, getShowByTmdbId, updateTrackingStatus, rateShow, addShow } from '../database/shows.js';
import { getEpisodes, markWatched, markUnwatched, markSeasonWatched, markSeasonUnwatched, addEpisodes } from '../database/episodes.js';
import { getPosterUrl, getBackdropUrl } from '../api/tmdb.js';
import { formatYear, formatDate, starRating, interactiveStarRating, statusBadge, STATUS_MAP, formatVoteCount, getRelativeTime, toggleGlobalLoading, timeAgo } from '../utils/dom.js';
import { toast } from '../components/toast.js';

let currentShowId = null; // Internal ID
let showData = null; // Data from DB or API
let episodesData = [];
let currentSeason = 1;
let isTracked = false;
let activeTab = 'episodes'; // 'episodes' | 'cast'

export function render() {
  return `
    <div class="page-container animate-fade-in" id="detail-container">
      <div style="padding:var(--space-12);text-align:center;">
        <div class="skeleton" style="width:100%;height:300px;border-radius:var(--radius-xl);margin-bottom:var(--space-6);"></div>
        <div class="skeleton" style="width:60%;height:40px;margin:0 auto var(--space-4);"></div>
        <div class="skeleton" style="width:40%;height:20px;margin:0 auto;"></div>
      </div>
    </div>
  `;
}

export async function init(params) {
  const tmdbId = parseInt(params.id);
  const container = document.getElementById('detail-container');

  if (isNaN(tmdbId)) {
    renderError(container, 'Invalid show ID in URL.');
    return;
  }

  try {
    // 1. Check if in DB
    const localShow = await getShowByTmdbId(tmdbId);
    
    // Always fetch rich data from API for cast, overview, watchProviders, etc.
    const { getShowDetails } = await import('../api/tmdb.js');
    const richData = await getShowDetails(tmdbId);
    if (!richData && !localShow) throw new Error('Show not found');
    
    if (localShow) {
      isTracked = true;
      currentShowId = localShow.id;
      showData = richData || localShow;
      // Preserve local tracking info
      showData.id = localShow.id;
      showData.trackingStatus = localShow.trackingStatus;
      showData.rating = localShow.rating;

      episodesData = await getEpisodes(currentShowId);
      
      // If we don't have episodes yet, fetch them
      if (episodesData.length === 0) {
        await fetchAndSaveEpisodes(tmdbId, showData.tvmazeId, showData.totalSeasons, currentShowId);
        episodesData = await getEpisodes(currentShowId);
      }
    } else {
      // 2. Not tracked, fetch from API
      isTracked = false;
      showData = richData;
      
      // Fetch episodes (in memory only, not saved to DB)
      const provider = await import('../api/provider.js');
      episodesData = await provider.getAllEpisodes(tmdbId, null, showData.totalSeasons);
    }
    
    // Set initial season if not set
    if (episodesData.length > 0) {
      const seasonsList = Array.from(new Set(episodesData.map(e => e.season))).sort((a,b) => a-b);
      if (!seasonsList.includes(currentSeason)) {
        currentSeason = seasonsList[0];
      }
    }

    renderContent(container);
    bindEvents();
    
    // Async enrich current season (fetches description/rating)
    enrichSeasonEpisodes(currentSeason).then(() => {
      renderContent(container);
      bindEvents();
    });
    
  } catch (err) {
    console.error('[ShowDetail] Error:', err);
    renderError(container, 'Check your internet connection or API key.');
  }
}

function renderError(container, text) {
  container.innerHTML = `
    <div class="empty-state" style="padding:var(--space-12) var(--space-4);">
      <h3 class="empty-state-title">Failed to load show</h3>
      <p class="empty-state-text">${text}</p>
      <button class="btn btn-primary" id="back-btn">Go Back</button>
    </div>
  `;
}

async function fetchAndSaveEpisodes(tmdbId, tvmazeId, totalSeasons, localId) {
  const eps = await provider.getAllEpisodes(tmdbId, tvmazeId, totalSeasons);
  if (eps.length === 0) return;

  const { db } = await import('../database/db.js');
  const existingEps = await db.episodes.where('showId').equals(localId).toArray();
  
  const toAdd = [];
  const toUpdate = [];

  for (const newEp of eps) {
    const existing = existingEps.find(e => e.season === newEp.season && e.episode === newEp.episode);
    if (existing) {
      toUpdate.push({
        ...existing,
        title: newEp.title || existing.title,
        overview: newEp.overview || existing.overview,
        airDate: newEp.airDate || existing.airDate,
        runtime: newEp.runtime || existing.runtime,
        stillPath: newEp.stillPath || existing.stillPath,
      });
    } else {
      toAdd.push({
        showId: localId,
        tmdbId: newEp.tmdbId || null,
        season: newEp.season,
        episode: newEp.episode,
        title: newEp.title || `Episode ${newEp.episode}`,
        overview: newEp.overview || '',
        airDate: newEp.airDate || null,
        runtime: newEp.runtime || null,
        stillPath: newEp.stillPath || null,
        watched: false,
        watchedAt: null,
        favorite: false,
        skipped: false,
      });
    }
  }

  await db.transaction('rw', db.episodes, async () => {
    if (toAdd.length > 0) await db.episodes.bulkAdd(toAdd);
    if (toUpdate.length > 0) await db.episodes.bulkPut(toUpdate);
  });
}

async function enrichSeasonEpisodes(season) {
  if (!showData || !showData.tmdbId) return;
  try {
    const { getSeasonEpisodes } = await import('../api/tmdb.js');
    const richEps = await getSeasonEpisodes(showData.tmdbId, season);
    
    let updated = false;
    let newEpisodesToInsert = [];
    richEps.forEach(rich => {
      const local = episodesData.find(e => e.season === season && e.episode === rich.episode);
      if (local) {
        let changed = false;
        if (!local.overview && rich.overview) {
          local.overview = rich.overview;
          local.voteAverage = rich.voteAverage;
          if (rich.stillPath) local.stillPath = rich.stillPath;
          if (rich.runtime && !local.runtime) local.runtime = rich.runtime;
          changed = true;
        }
        if ((!local.title || local.title.toLowerCase().startsWith('episode ')) && rich.title && (!rich.title.toLowerCase().startsWith('episode ') || !local.title)) {
          local.title = rich.title;
          changed = true;
        }
        if (changed) updated = true;
      } else {
        // Missing episode (e.g., from TVTime import), add it to DB
        newEpisodesToInsert.push({
          showId: currentShowId,
          tmdbId: rich.tmdbId || null,
          season: rich.season,
          episode: rich.episode,
          title: rich.title || `Episode ${rich.episode}`,
          overview: rich.overview || '',
          airDate: rich.airDate || null,
          runtime: rich.runtime || null,
          stillPath: rich.stillPath || null,
          voteAverage: rich.voteAverage || 0,
          watched: false,
          watchedAt: null,
          favorite: false,
          skipped: false,
        });
      }
    });
    
    const { db } = await import('../database/db.js');
    
    if (newEpisodesToInsert.length > 0 && currentShowId) {
      await db.episodes.bulkAdd(newEpisodesToInsert);
      const allSeasonEps = await db.episodes.where({showId: currentShowId, season: season}).toArray();
      episodesData = episodesData.filter(e => e.season !== season).concat(allSeasonEps);
      updated = true;
    }
    
    // If it's a tracked show and we updated data, let's persist the overview and rating so we don't have to fetch next time
    if (updated && currentShowId) {
      const epsToUpdate = episodesData.filter(e => e.season === season);
      await db.transaction('rw', db.episodes, async () => {
        for (const ep of epsToUpdate) {
          if (ep.id) {
            await db.episodes.update(ep.id, { overview: ep.overview, voteAverage: ep.voteAverage, stillPath: ep.stillPath, title: ep.title, runtime: ep.runtime });
          }
        }
      });
    }
  } catch(e) {
    console.warn('Failed to enrich season episodes', e);
  }
}

function renderContent(container) {
  const backdropUrl = getBackdropUrl(showData.backdropPath, 'backdropLarge');
  const posterUrl = getPosterUrl(showData.posterPath, 'posterLarge');
  const year = formatYear(showData.firstAirDate);
  
  const seasonsList = Array.from(new Set(episodesData.map(e => e.season))).sort((a,b) => a-b);
  if (!seasonsList.includes(currentSeason) && seasonsList.length > 0) {
    currentSeason = seasonsList[0];
  }

  const seasonEps = episodesData.filter(e => e.season === currentSeason).sort((a,b) => a.episode - b.episode);
  const watchedCount = seasonEps.filter(e => e.watched).length;
  const isSeasonComplete = seasonEps.length > 0 && watchedCount === seasonEps.length;

  const imdbUrl = showData.externalIds?.imdb_id ? `https://www.imdb.com/title/${showData.externalIds.imdb_id}/` : null;

  container.innerHTML = `
    <!-- Back Button -->
    <div style="padding:var(--space-4) var(--space-4) 0; position:relative; z-index:10; display:flex; justify-content:space-between; align-items:center;">
      <button class="btn btn-ghost" id="back-btn" style="padding:var(--space-2); margin-left:calc(-1 * var(--space-2)); font-weight:var(--weight-medium);">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="m15 18-6-6 6-6"/></svg>
        Back
      </button>
      <div style="display:flex;gap:var(--space-2);align-items:center;">
        ${isTracked ? `
          <span class="text-tertiary" style="font-size:var(--text-xs);margin-right:var(--space-2);display:none;" id="last-synced-text">Synced ${timeAgo(showData.updatedAt)}</span>
          <button class="btn btn-sm btn-ghost" id="sync-show-btn" style="color:var(--text-secondary);" aria-label="Sync with TMDB" data-tooltip="Sync">
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
          ? `<img src="${posterUrl}" alt="${showData.title}">` 
          : `<div style="width:100%;aspect-ratio:2/3;background:var(--surface-3);border-radius:var(--radius-lg);"></div>`}
      </div>
      
      <div class="detail-meta">
        <h1 class="detail-title">${showData.title}</h1>
        <div class="detail-subtitle">
          <span>${year}</span>
          <span>•</span>
          <span style="color:var(--text-primary);font-weight:var(--weight-medium);">${showData.status}</span>
          ${showData.network ? `<span>•</span><span>${showData.network}</span>` : ''}
          ${showData.genres && showData.genres.length > 0 ? `<span>•</span><span>${showData.genres.slice(0,3).join(', ')}</span>` : ''}
          ${showData.voteAverage ? `<span>•</span><span style="color:var(--color-warning);font-weight:var(--weight-semibold);">★ ${(showData.voteAverage).toFixed(1)} <span style="font-size:12px;color:var(--text-tertiary);font-weight:normal;">(${formatVoteCount(showData.voteCount)})</span></span>` : ''}
        </div>
        
        <!-- Controls -->
        <div class="detail-actions">
          ${isTracked ? `
            <select class="input" id="status-select" style="width:180px;">
              ${Object.entries(STATUS_MAP).map(([k,v]) => `
                <option value="${k}" ${showData.trackingStatus === k ? 'selected' : ''}>
                  ${v.icon} ${v.label}
                </option>
              `).join('')}
            </select>
            <button class="btn btn-ghost" id="remove-btn" style="color:var(--color-error);" title="Remove from Library">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
            <button class="btn btn-secondary btn-sm" id="mark-all-btn">Mark All ✓</button>
            <div class="rating-stars" id="rating-control" style="display:flex;align-items:center;gap:4px;font-size:24px;cursor:pointer;color:var(--color-warning);">
              ${interactiveStarRating(showData.rating || 0)}
            </div>
          ` : `
            <button class="btn btn-primary" id="track-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Add to Library
            </button>
          `}
        </div>
      </div>
    </div>

    <div style="margin-top:var(--space-8);">
      <h3 class="section-title">Overview</h3>
      <p class="detail-overview">${showData.overview || 'No overview available.'}</p>
    </div>

    ${showData.watchProviders && showData.watchProviders.flatrate ? `
      <div style="margin-top:var(--space-8);">
        <h3 class="section-title" style="font-size:var(--text-sm);color:var(--text-tertiary);margin-bottom:var(--space-2);">Stream On</h3>
        <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
          ${showData.watchProviders.flatrate.map(p => `
            <img src="${getPosterUrl(p.logo_path, 'posterSmall')}" alt="${p.provider_name}" title="${p.provider_name}" style="width:40px;height:40px;border-radius:var(--radius-sm);">
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Content Tabs -->
    <div style="margin-top:var(--space-8); border-bottom:1px solid var(--border-subtle); display:flex; gap:var(--space-6);">
      <button class="content-tab ${activeTab === 'episodes' ? 'active' : ''}" data-tab="episodes" style="background:none; border:none; padding:var(--space-2) 0; font-size:var(--text-md); font-weight:var(--weight-semibold); color:${activeTab === 'episodes' ? 'var(--color-primary)' : 'var(--text-tertiary)'}; border-bottom:${activeTab === 'episodes' ? '2px solid var(--color-primary)' : '2px solid transparent'}; cursor:pointer;">Episodes</button>
      ${showData.cast && showData.cast.length > 0 ? `
        <button class="content-tab ${activeTab === 'cast' ? 'active' : ''}" data-tab="cast" style="background:none; border:none; padding:var(--space-2) 0; font-size:var(--text-md); font-weight:var(--weight-semibold); color:${activeTab === 'cast' ? 'var(--color-primary)' : 'var(--text-tertiary)'}; border-bottom:${activeTab === 'cast' ? '2px solid var(--color-primary)' : '2px solid transparent'}; cursor:pointer;">Cast</button>
      ` : ''}
    </div>

    ${episodesData.length > 0 ? `
      <!-- Episodes Section -->
      <div style="margin-top:var(--space-6); display:${activeTab === 'episodes' ? 'block' : 'none'};">
        <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:var(--space-4);">
          <h3 class="section-title" style="margin:0;"></h3>
          ${isTracked ? `
            <button class="btn btn-sm ${isSeasonComplete ? 'btn-ghost' : 'btn-secondary'}" id="mark-season-btn">
              ${isSeasonComplete ? 'Unmark Season' : 'Mark Season Watched'}
            </button>
          ` : ''}
        </div>
        
        <!-- Season Tabs -->
        <div class="season-tabs" id="season-tabs">
          ${seasonsList.map(s => `
            <button class="season-tab ${s === currentSeason ? 'active' : ''}" data-season="${s}">
              Season ${s}
            </button>
          `).join('')}
        </div>

        ${(() => {
          const sData = showData.seasons?.find(s => s.seasonNumber === currentSeason);
          if (!sData || (!sData.overview && !sData.posterPath)) return '';
          const sPosterUrl = sData.posterPath ? getPosterUrl(sData.posterPath, 'posterMedium') : null;
          return `
            <div class="card" style="margin-bottom:var(--space-4); display:flex; gap:var(--space-4); align-items:flex-start;">
              ${sPosterUrl ? `<img src="${sPosterUrl}" style="width:80px; border-radius:var(--radius-sm);">` : ''}
              <div style="flex:1;">
                <h4 style="margin-bottom:var(--space-1);">${sData.name || `Season ${currentSeason}`}</h4>
                <p style="font-size:var(--text-sm); color:var(--text-secondary); margin:0;">${sData.overview || 'No overview available for this season.'}</p>
              </div>
            </div>
          `;
        })()}

        <!-- Episode List -->
        <div class="card" style="padding:0;">
          ${seasonEps.map(ep => {
            let imgHtml = '';
            if (ep.stillPath) {
              const src = ep.stillPath.startsWith('http') ? ep.stillPath : getPosterUrl(ep.stillPath, 'backdropSmall');
              imgHtml = `<img src="${src}" class="episode-image" loading="lazy" style="width:120px;height:68px;object-fit:cover;border-radius:var(--radius-sm);margin:0 var(--space-3);flex-shrink:0;">`;
            } else {
              imgHtml = `<div class="episode-image skeleton" style="width:120px;height:68px;border-radius:var(--radius-sm);margin:0 var(--space-3);flex-shrink:0;"></div>`;
            }
            
            const countdown = getRelativeTime(ep.airDate);

            return `
              <div class="episode-item ${ep.watched ? 'watched' : ''}" data-ep-id="${ep.id || ''}" data-ep-index="${ep.episode}" style="display:block;border-bottom:1px solid var(--border-subtle);">
                <div class="episode-row" style="align-items:flex-start;">
                  <div class="episode-checkbox ${ep.watched ? 'checked' : ''}" style="margin:0 var(--space-3);cursor:pointer;" data-action="toggle-watch">
                    ${ep.watched ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                  </div>
                  <a href="#/episode/${showData.tmdbId}/${ep.season}/${ep.episode}" class="episode-link">
                    ${imgHtml}
                    <div class="episode-info" style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;">
                      <div class="episode-number" style="font-size:var(--text-xs);color:var(--text-tertiary);">${ep.season}x${String(ep.episode).padStart(2, '0')}</div>
                      <div class="episode-title" style="font-weight:var(--weight-medium);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${ep.title}</div>
                      ${countdown ? `<div style="font-size:10px;font-weight:bold;color:var(--color-primary);margin-top:2px;">${countdown}</div>` : ''}
                    </div>
                  </a>
                  <div class="episode-actions-wrapper">
                    ${ep.watched ? `<button class="btn btn-secondary btn-sm add-watch-btn" data-ep-id="${ep.id}" data-action="add-watch" style="padding:0 var(--space-2);height:24px;min-height:24px;font-size:12px;" title="Add another watch">+1${ep.watchCount && ep.watchCount > 1 ? ` (${ep.watchCount})` : ''}</button>` : ''}
                    <div class="episode-date" style="font-size:var(--text-xs);color:var(--text-tertiary);text-align:right;">
                      <div>${formatDate(ep.airDate)}</div>
                      ${ep.runtime || ep.voteAverage ? `
                        <div style="margin-top:2px;">
                          ${ep.runtime ? `<span>${ep.runtime} min</span>` : ''}
                          ${ep.runtime && ep.voteAverage ? '<span> • </span>' : ''}
                          ${ep.voteAverage ? `<span style="color:var(--color-warning);">★ ${ep.voteAverage.toFixed(1)}</span>` : ''}
                        </div>
                      ` : ''}
                    </div>
                    <button class="btn btn-icon btn-sm" data-action="toggle-overview" style="color:var(--text-tertiary);margin-left:var(--space-2);" title="Expand overview">
                      <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition:transform 0.2s;"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                  </div>
                </div>
                <div class="episode-overview-inline" style="display:none;padding:0 var(--space-3) var(--space-3) 54px;font-size:var(--text-sm);color:var(--text-secondary);">
                  ${ep.overview || 'No overview available.'}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    ` : ''}

    ${showData.cast && showData.cast.length > 0 ? `
      <!-- Cast -->
      <div style="margin-top:var(--space-6); display:${activeTab === 'cast' ? 'block' : 'none'};">
        <div class="cast-grid stagger-children">
          ${showData.cast.map(c => `
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
  const container = document.getElementById('detail-container');
  if (!container) return;

  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.history.length > 1 ? window.history.back() : window.location.hash = '#/home';
    });
  }

  // Track button (if not in library)
  const trackBtn = document.getElementById('track-btn');
  if (trackBtn) {
    trackBtn.addEventListener('click', async () => {
      trackBtn.disabled = true;
      trackBtn.textContent = 'Adding...';
      try {
        currentShowId = await addShow({ ...showData, trackingStatus: 'watching' });
        await fetchAndSaveEpisodes(showData.tmdbId, showData.tvmazeId, showData.totalSeasons, currentShowId);
        toast('Added to library', 'success');
        // Reload page to switch to tracked state
        init({ id: showData.tmdbId });
      } catch (err) {
        console.error(err);
        toast('Failed to add', 'error');
        trackBtn.disabled = false;
        trackBtn.textContent = 'Add to Library';
      }
    });
  }

  // Status select
  const statusSelect = document.getElementById('status-select');
  if (statusSelect && isTracked) {
    statusSelect.addEventListener('change', async (e) => {
      const newStatus = e.target.value;
      const { updateTrackingStatus } = await import('../database/shows.js');
      await updateTrackingStatus(currentShowId, newStatus);
      showData.trackingStatus = newStatus;
      toast('Status updated');
      renderContent(container);
      bindEvents();
    });
  }

  // Remove button
  const removeBtn = document.getElementById('remove-btn');
  if (removeBtn && isTracked) {
    removeBtn.addEventListener('click', async () => {
      if (!confirm(`Are you sure you want to remove ${showData.title} from your library? All watch history will be lost.`)) return;
      try {
        const { deleteShow } = await import('../database/shows.js');
        await deleteShow(currentShowId);
        toast('Show removed from library');
        window.history.length > 1 ? window.history.back() : window.location.hash = '#/home';
      } catch (err) {
        console.error('Failed to remove show:', err);
        toast('Failed to remove show', 'error');
      }
    });
  }

  // Sync button
  const syncBtn = document.getElementById('sync-show-btn');
  const syncText = document.getElementById('last-synced-text');
  if (syncBtn && syncText) {
    if (!navigator.onLine) syncText.style.display = 'inline'; // Always show offline
    syncBtn.addEventListener('mouseenter', () => syncText.style.display = 'inline');
    syncBtn.addEventListener('mouseleave', () => { if (navigator.onLine) syncText.style.display = 'none'; });

    syncBtn.addEventListener('click', async () => {
      syncBtn.disabled = true;
      syncBtn.innerHTML = '<div class="spinner" style="width:14px;height:14px;border-width:2px;margin-right:4px;"></div> Syncing...';
      toggleGlobalLoading(true);
      try {
        const { syncShow } = await import('../database/shows.js');
        await syncShow(currentShowId);
        await fetchAndSaveEpisodes(showData.tmdbId, showData.tvmazeId, showData.totalSeasons, currentShowId);
        toast('Show synced successfully!', 'success');
        init({ id: showData.tmdbId });
      } catch (err) {
        console.error('Failed to sync show:', err);
        toast('Failed to sync', 'error');
        syncBtn.disabled = false;
        syncBtn.textContent = 'Sync';
      } finally {
        toggleGlobalLoading(false);
      }
    });
  }

  // Mark All Watched
  const markAllBtn = document.getElementById('mark-all-btn');
  if (markAllBtn) {
    markAllBtn.addEventListener('click', async () => {
      const { confirmModal } = await import('../components/modal.js');
      const ok = await confirmModal('Mark All Watched', 'Are you sure you want to mark all episodes in all seasons as watched?');
      if (!ok) return;

      markAllBtn.disabled = true;
      markAllBtn.textContent = 'Marking...';
      try {
        const { db } = await import('../database/db.js');
        const now = new Date();
        const epsToUpdate = episodesData.filter(e => !e.watched);
        
        await db.transaction('rw', db.episodes, async () => {
          for (const ep of epsToUpdate) {
            await db.episodes.update(ep.id, { watched: true, watchedAt: now, watchCount: (ep.watchCount || 0) + 1 });
            ep.watched = true;
          }
        });

        // Trigger auto-complete check
        const { updateTrackingStatus } = await import('../database/shows.js');
        await updateTrackingStatus(currentShowId, 'completed');
        showData.trackingStatus = 'completed';

        toast('All episodes marked as watched', 'success');
        renderContent(container);
        bindEvents();
      } catch (err) {
        console.error(err);
        toast('Failed to update episodes', 'error');
        markAllBtn.disabled = false;
        markAllBtn.textContent = 'Mark All ✓';
      }
    });
  }

  // Rating Control
  const ratingControl = document.getElementById('rating-control');
  if (ratingControl) {
    const handleRate = async (e) => {
      const star = e.target.closest('.star-interactive');
      if (!star) return;

      if (!isTracked) {
        toast('Add show to library first to rate it', 'warning');
        return;
      }
      
      const num = parseInt(star.dataset.val, 10);
      if (num >= 1 && num <= 5) {
        const { rateShow } = await import('../database/shows.js');
        await rateShow(currentShowId, num);
        showData.rating = num;
        
        // Update DOM inline
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

  // Season Tabs
  const seasonTabs = document.getElementById('season-tabs');
  if (seasonTabs) {
    seasonTabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.season-tab');
      if (!tab) return;
      currentSeason = parseInt(tab.dataset.season);
      renderContent(container);
      bindEvents(); // re-bind since we re-rendered innerHTML
      
      enrichSeasonEpisodes(currentSeason).then(() => {
        renderContent(container);
        bindEvents();
      });
    });
  }

  // Episode List Actions (+1 button, checkbox)
  const episodeListContainer = container.querySelector('.card[style="padding:0;"]');
  if (episodeListContainer) {
    episodeListContainer.addEventListener('click', async (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;
      
      e.preventDefault();
      e.stopPropagation();

      if (!isTracked) {
        toast('Add show to library first to track episodes', 'warning');
        return;
      }

      const item = target.closest('.episode-item');
      if (!item) return;

      const epId = parseInt(item.dataset.epId);
      if (!epId) return;
      
      const ep = episodesData.find(e => e.id === epId);
      if (!ep) return;

      const action = target.dataset.action;

      if (action === 'add-watch') {
        const { db } = await import('../database/db.js');
        ep.watchCount = (ep.watchCount || 1) + 1;
        ep.watchedAt = new Date();
        await db.episodes.update(epId, { watchCount: ep.watchCount, watchedAt: ep.watchedAt });
        toast('Added another watch', 'success');
        renderContent(container);
        bindEvents();
        return;
      }

      if (action === 'toggle-watch') {
        const isWatched = target.classList.contains('checked');
        
        if (isWatched) {
          await markUnwatched(epId);
          ep.watched = false;
          renderContent(container);
          bindEvents();
        } else {
          let bulkUpdated = false;
          const prevUnwatched = episodesData.filter(e => e.season === ep.season && e.episode < ep.episode && !e.watched);
          if (prevUnwatched.length > 0) {
            const { confirmModal } = await import('../components/modal.js');
            const ok = await confirmModal('Mark Previous?', `You're marking Episode ${ep.episode} watched, but ${prevUnwatched.length} previous episodes are unwatched. Mark them as watched too?`);
            if (ok) {
              const { db } = await import('../database/db.js');
              const now = new Date();
              await db.transaction('rw', db.episodes, async () => {
                for (const p of prevUnwatched) {
                  await db.episodes.update(p.id, { watched: true, watchedAt: now, watchCount: (p.watchCount || 0) + 1 });
                  p.watched = true;
                }
              });
              bulkUpdated = true;
            }
          }
          
          await markWatched(epId);
          ep.watched = true;

          // Auto-complete logic
          const allWatched = episodesData.every(e => e.watched);
          if (allWatched && showData.trackingStatus !== 'completed') {
            const { updateTrackingStatus } = await import('../database/shows.js');
            await updateTrackingStatus(currentShowId, 'completed');
            showData.trackingStatus = 'completed';
            toast('Show completed!', 'success');
            bulkUpdated = true; // force re-render for status dropdown
          }
          
          renderContent(container);
          bindEvents();
        }
      } else if (action === 'toggle-overview') {
        const item = target.closest('.episode-item');
        if (item) {
          const overviewEl = item.querySelector('.episode-overview-inline');
          const chevron = target.querySelector('.chevron-icon');
          if (overviewEl && chevron) {
            if (overviewEl.style.display === 'none') {
              overviewEl.style.display = 'block';
              chevron.style.transform = 'rotate(180deg)';
            } else {
              overviewEl.style.display = 'none';
              chevron.style.transform = 'rotate(0deg)';
            }
          }
        }
      }
    });
  }

  // Mark Season
  const markSeasonBtn = document.getElementById('mark-season-btn');
  if (markSeasonBtn) {
    markSeasonBtn.addEventListener('click', async () => {
      if (!isTracked) return;
      
      const isComplete = markSeasonBtn.textContent.includes('Unmark');
      if (isComplete) {
        await markSeasonUnwatched(currentShowId, currentSeason);
        episodesData.forEach(e => { if (e.season === currentSeason) e.watched = false; });
      } else {
        await markSeasonWatched(currentShowId, currentSeason);
        episodesData.forEach(e => { if (e.season === currentSeason) e.watched = true; });
      }
      const tabsContainer = document.getElementById('season-tabs');
      const scrollPos = tabsContainer ? tabsContainer.scrollLeft : 0;
      
      renderContent(container);
      bindEvents();

      const newTabs = document.getElementById('season-tabs');
      if (newTabs) newTabs.scrollLeft = scrollPos;
    });
  }

  // Content Tabs (Episodes / Cast)
  const detailContainer = document.getElementById('detail-container');
  if (detailContainer) {
    const contentTabs = detailContainer.querySelectorAll('.content-tab');
    contentTabs.forEach(tab => {
      // Use addEventListener directly, but we need to ensure we don't duplicate them
      // However since we re-render entirely in renderContent, they are fresh DOM nodes
      tab.addEventListener('click', (e) => {
        const newTab = e.target.dataset.tab;
        if (newTab !== activeTab) {
          activeTab = newTab;
          renderContent(container);
          bindEvents();
        }
      });
    });
  }
}
