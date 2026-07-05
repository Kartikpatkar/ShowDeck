/**
 * ShowDeck — Show Detail Page
 * Full show information, season tabs, episode tracking, and cast.
 */

import * as provider from '../api/provider.js';
import { getShow, getShowByTmdbId, updateTrackingStatus, rateShow, addShow } from '../database/shows.js';
import { getEpisodes, markWatched, markUnwatched, markSeasonWatched, markSeasonUnwatched, addEpisodes } from '../database/episodes.js';
import { getPosterUrl, getBackdropUrl } from '../api/tmdb.js';
import { formatYear, formatDate, starRating, interactiveStarRating, statusBadge, STATUS_MAP } from '../utils/dom.js';
import { toast } from '../components/toast.js';

let currentShowId = null; // Internal ID
let showData = null; // Data from DB or API
let episodesData = [];
let currentSeason = 1;
let isTracked = false;

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
    
    if (localShow) {
      isTracked = true;
      currentShowId = localShow.id;
      showData = localShow;
      episodesData = await getEpisodes(currentShowId);
      
      // If we don't have episodes yet, fetch them
      if (episodesData.length === 0) {
        await fetchAndSaveEpisodes(tmdbId, showData.tvmazeId, showData.totalSeasons, currentShowId);
        episodesData = await getEpisodes(currentShowId);
      }
    } else {
      // 2. Not tracked, fetch from API
      isTracked = false;
      showData = await provider.getShowDetails(tmdbId);
      if (!showData) throw new Error('Show not found');
      
      // Fetch episodes (in memory only, not saved to DB)
      episodesData = await provider.getAllEpisodes(tmdbId, null, showData.totalSeasons);
    }

    renderContent(container);
    bindEvents();
    
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
      <button class="btn btn-primary" onclick="history.back()">Go Back</button>
    </div>
  `;
}

async function fetchAndSaveEpisodes(tmdbId, tvmazeId, totalSeasons, localId) {
  const eps = await provider.getAllEpisodes(tmdbId, tvmazeId, totalSeasons);
  if (eps.length > 0) {
    await addEpisodes(localId, eps);
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
          ? `<img src="${posterUrl}" alt="${showData.title}">` 
          : `<div style="width:100%;aspect-ratio:2/3;background:var(--surface-3);border-radius:var(--radius-lg);"></div>`}
      </div>
      
      <div class="detail-meta">
        <h1 class="detail-title">${showData.title}</h1>
        <div class="detail-subtitle">
          <span>${year}</span>
          <span>•</span>
          <span>${showData.status}</span>
          ${showData.network ? `<span>•</span><span>${showData.network}</span>` : ''}
          ${showData.genres && showData.genres.length > 0 ? `<span>•</span><span>${showData.genres.slice(0,3).join(', ')}</span>` : ''}
        </div>
        
        <!-- Controls -->
        <div class="detail-actions">
          ${isTracked ? `
            <select class="input" id="status-select" style="width:180px;">
              ${Object.entries(STATUS_MAP).map(([val, {label}]) => `
                <option value="${val}" ${showData.trackingStatus === val ? 'selected' : ''}>${label}</option>
              `).join('')}
            </select>
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

    ${episodesData.length > 0 ? `
      <!-- Episodes Section -->
      <div style="margin-top:var(--space-12);">
        <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:var(--space-4);">
          <h3 class="section-title" style="margin:0;">Episodes</h3>
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

            return `
              <div class="episode-item ${ep.watched ? 'watched' : ''}" data-ep-id="${ep.id || ''}" data-ep-index="${ep.episode}" style="display:flex;align-items:center;">
                <div class="episode-checkbox ${ep.watched ? 'checked' : ''}">
                  ${ep.watched ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                </div>
                ${imgHtml}
                <div class="episode-info" style="flex:1;">
                  <div class="episode-number">${ep.season}x${String(ep.episode).padStart(2, '0')}</div>
                  <div class="episode-title">${ep.title}</div>
                </div>
                <div class="episode-actions" style="display:flex;align-items:center;gap:var(--space-2);">
                  ${ep.watched ? `<button class="btn btn-secondary btn-sm add-watch-btn" data-ep-id="${ep.id}" style="padding:0 var(--space-2);height:24px;min-height:24px;font-size:12px;" title="Add another watch">+1${ep.watchCount && ep.watchCount > 1 ? ` (${ep.watchCount})` : ''}</button>` : ''}
                  <div class="episode-date">${formatDate(ep.airDate)}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    ` : ''}

    ${showData.cast && showData.cast.length > 0 ? `
      <!-- Cast -->
      <div style="margin-top:var(--space-12);">
        <h3 class="section-title">Cast</h3>
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
  if (statusSelect) {
    statusSelect.addEventListener('change', async (e) => {
      await updateTrackingStatus(currentShowId, e.target.value);
      showData.trackingStatus = e.target.value;
      toast('Status updated');
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
    ratingControl.addEventListener('click', async (e) => {
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
    });
  }

  // Episode Checkboxes
  const episodeItems = container.querySelectorAll('.episode-item');
  episodeItems.forEach(item => {
    item.addEventListener('click', async () => {
      if (!isTracked) {
        toast('Add show to library first to track episodes', 'warning');
        return;
      }
      
      const epId = parseInt(item.dataset.epId);
      if (!epId) return;

      const checkbox = item.querySelector('.episode-checkbox');
      const isWatched = checkbox.classList.contains('checked');

      if (isWatched) {
        await markUnwatched(epId);
        checkbox.classList.remove('checked');
        checkbox.innerHTML = '';
        item.classList.remove('watched');
        
        // update local state
        const ep = episodesData.find(e => e.id === epId);
        if (ep) ep.watched = false;
      } else {
        const ep = episodesData.find(e => e.id === epId);
        let bulkUpdated = false;

        if (ep) {
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
        }
        
        await markWatched(epId);
        checkbox.classList.add('checked');
        checkbox.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
        item.classList.add('watched');
        if (ep) ep.watched = true;

        // Auto-complete logic
        const allWatched = episodesData.every(e => e.watched);
        if (allWatched && showData.trackingStatus !== 'completed') {
          const { updateTrackingStatus } = await import('../database/shows.js');
          await updateTrackingStatus(currentShowId, 'completed');
          showData.trackingStatus = 'completed';
          toast('Show completed!', 'success');
          bulkUpdated = true; // force re-render for status dropdown
        }

        if (bulkUpdated) {
          const tabsContainer = document.getElementById('season-tabs');
          const scrollPos = tabsContainer ? tabsContainer.scrollLeft : 0;
          renderContent(container);
          bindEvents();
          const newTabs = document.getElementById('season-tabs');
          if (newTabs) newTabs.scrollLeft = scrollPos;
        }
      }
    });
  });

  // +1 Watch Count Buttons
  const addWatchBtns = container.querySelectorAll('.add-watch-btn');
  addWatchBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation(); // prevent triggering the episode row click
      const epId = parseInt(btn.dataset.epId);
      if (!epId) return;

      const ep = episodesData.find(e => e.id === epId);
      if (ep) {
        const { db } = await import('../database/db.js');
        const now = new Date();
        const newCount = (ep.watchCount || 1) + 1;
        await db.episodes.update(epId, { watchCount: newCount, watchedAt: now });
        ep.watchCount = newCount;
        
        btn.textContent = `+1 (${newCount})`;
        toast(`Marked as watched again! (x${newCount})`, 'success');
      }
    });
  });

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
}
