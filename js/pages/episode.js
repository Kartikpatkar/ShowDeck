/**
 * ShowDeck — Episode Detail Page
 */

import * as tmdb from '../api/tmdb.js';
import { getShowByTmdbId, addShow } from '../database/shows.js';
import { db } from '../database/db.js';
import { markWatched, markUnwatched } from '../database/episodes.js';
import { getPosterUrl, getBackdropUrl } from '../api/tmdb.js';
import { formatDate, interactiveStarRating, escapeHtml } from '../utils/dom.js';
import { toast } from '../components/toast.js';

let showTmdbId = null;
let seasonNum = null;
let episodeNum = null;

let localShow = null;
let localEp = null;
let showData = null;
let richEpData = null;

export function render() {
  return `
    <div class="page-container animate-fade-in" id="ep-container">
      <div style="padding:var(--space-12);text-align:center;">
        <div class="skeleton" style="width:100%;height:300px;border-radius:var(--radius-xl);margin-bottom:var(--space-6);"></div>
        <div class="skeleton" style="width:60%;height:40px;margin:0 auto var(--space-4);"></div>
      </div>
    </div>
  `;
}

export async function init(params) {
  showTmdbId = parseInt(params.showId);
  seasonNum = parseInt(params.season);
  episodeNum = parseInt(params.episode);
  
  const container = document.getElementById('ep-container');
  if (isNaN(showTmdbId) || isNaN(seasonNum) || isNaN(episodeNum)) {
    container.innerHTML = '<div class="empty-state"><h3>Invalid Episode</h3><a href="#/" class="btn btn-primary">Go Home</a></div>';
    return;
  }

  try {
    // 1. Check local DB
    localShow = await getShowByTmdbId(showTmdbId);
    if (localShow) {
      localEp = await db.episodes.where({
        showId: localShow.id,
        season: seasonNum,
        episode: episodeNum
      }).first();
    }

    // 2. Fetch TMDB data
    const [showResp, seasonResp] = await Promise.all([
      tmdb.getShowDetails(showTmdbId),
      tmdb.getSeasonEpisodes(showTmdbId, seasonNum)
    ]);
    
    showData = showResp;
    richEpData = seasonResp.find(e => e.episode === episodeNum) || null;
    
    if (!richEpData) {
      container.innerHTML = `<div class="empty-state"><h3>Episode Not Found</h3><a href="javascript:window.appRouter.goBack()" class="btn btn-primary">Go Back</a></div>`;
      return;
    }
    
    // Save enriched data if tracked
    if (localEp && localShow) {
      localEp.overview = richEpData.overview;
      localEp.voteAverage = richEpData.voteAverage;
      localEp.stillPath = richEpData.stillPath;
      await db.episodes.update(localEp.id, {
        overview: localEp.overview,
        voteAverage: localEp.voteAverage,
        stillPath: localEp.stillPath
      });
    }

    renderContent(container);
    bindEvents();
    
  } catch (err) {
    console.error('[Episode Detail] Error:', err);
    container.innerHTML = `<div class="empty-state"><h3>Failed to load</h3><a href="javascript:window.appRouter.goBack()" class="btn btn-primary">Go Back</a></div>`;
  }
}

function renderContent(container) {
  const backdropUrl = getBackdropUrl(richEpData.stillPath || showData.backdropPath, 'backdropLarge');
  const watched = localEp ? localEp.watched : false;
  
  container.innerHTML = `
    <!-- Back Button -->
    <div style="padding:var(--space-4) var(--space-4) 0; position:relative; z-index:10;">
      <button id="back-btn" class="btn btn-ghost" style="padding:var(--space-2); margin-left:-var(--space-2); font-weight:var(--weight-medium);text-decoration:none;display:inline-flex; border:none; background:none; cursor:pointer;">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="m15 18-6-6 6-6"/></svg>
        Back to ${showData.title}
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
    <div style="padding:var(--space-6) var(--space-6) 0;">
      <div class="detail-meta" style="padding-top:0;">
        <div class="detail-subtitle" style="margin-bottom:var(--space-2);color:var(--text-secondary);font-weight:var(--weight-medium);">
          <span style="color:var(--text-primary);">${showData.title}</span>
          <span>•</span>
          <span>Season ${seasonNum}, Episode ${episodeNum}</span>
          ${richEpData.airDate ? `<span>•</span><span>${formatDate(richEpData.airDate)}</span>` : ''}
          ${richEpData.runtime ? `<span>•</span><span>${richEpData.runtime} min</span>` : ''}
          ${richEpData.voteAverage ? `<span>•</span><span style="color:var(--color-warning);">★ ${(richEpData.voteAverage).toFixed(1)}</span>` : ''}
        </div>
        <h1 class="detail-title" style="font-size:2rem;line-height:1.2;color:var(--text-primary);">${richEpData.title}</h1>
        
        <!-- Controls -->
        <div class="detail-actions" style="margin-top:var(--space-6);">
          ${localShow ? `
            <button class="btn ${watched ? 'btn-secondary' : 'btn-primary'}" id="toggle-watch-btn">
              ${watched ? '✓ Watched' : 'Mark as Watched'}
            </button>
            ${watched && localEp.watchCount > 1 ? `<span style="font-size:var(--text-sm);color:var(--text-secondary);background:var(--surface-3);padding:var(--space-2) var(--space-4);border-radius:var(--radius-full);">Watched ${localEp.watchCount} times</span>` : ''}
          ` : `
            <button class="btn btn-primary" id="track-show-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Add Show to Library
            </button>
          `}
        </div>
      </div>
    </div>

    <div style="margin-top:var(--space-12);padding:0 var(--space-6) var(--space-12);">
      <h3 class="section-title">Overview</h3>
      <p class="detail-overview" style="font-size:1.1rem;line-height:1.6;color:var(--text-secondary);">
        ${richEpData.overview || 'No overview available for this episode.'}
      </p>

      ${localShow ? `
        <div style="margin-top:var(--space-8);">
          <h3 class="section-title">My Notes</h3>
          <textarea id="episode-notes" class="input" rows="4" placeholder="Add personal notes for this episode... (saves automatically)" style="width:100%;resize:vertical;">${escapeHtml(localEp?.notes || '')}</textarea>
        </div>
      ` : ''}
    </div>
  `;
}

function bindEvents() {
  const container = document.getElementById('ep-container');
  
  document.getElementById('back-btn')?.addEventListener('click', () => {
    window.appRouter.goBack();
  });

  const trackShowBtn = document.getElementById('track-show-btn');
  if (trackShowBtn) {
    trackShowBtn.addEventListener('click', async () => {
      trackShowBtn.disabled = true;
      trackShowBtn.textContent = 'Adding...';
      try {
        const newShowId = await addShow({ ...showData, trackingStatus: 'watching' });
        const provider = await import('../api/provider.js');
        const eps = await provider.getAllEpisodes(showData.tmdbId, null, showData.totalSeasons);
        if (eps.length > 0) {
          const { addEpisodes } = await import('../database/episodes.js');
          await addEpisodes(newShowId, eps);
        }
        toast('Show added to library', 'success');
        // Reload page to switch to tracked state
        init({ showId: showTmdbId, season: seasonNum, episode: episodeNum });
      } catch (err) {
        console.error(err);
        toast('Failed to add show', 'error');
        trackShowBtn.disabled = false;
        trackShowBtn.textContent = 'Add Show to Library';
      }
    });
  }

  const toggleWatchBtn = document.getElementById('toggle-watch-btn');
  if (toggleWatchBtn && localEp) {
    toggleWatchBtn.addEventListener('click', async () => {
      if (localEp.watched) {
        await markUnwatched(localEp.id);
        localEp.watched = false;
        toast('Episode marked as unwatched');
      } else {
        await markWatched(localEp.id);
        localEp.watched = true;
        toast('Episode marked as watched', 'success');
      }
      renderContent(container);
      bindEvents();
    });
  }

  // Notes
  const notesArea = document.getElementById('episode-notes');
  if (notesArea && localEp) {
    notesArea.addEventListener('blur', async (e) => {
      const val = e.target.value.trim();
      if (val !== localEp.notes) {
        await db.episodes.update(localEp.id, { notes: val });
        localEp.notes = val;
        toast('Notes saved', 'success');
      }
    });
  }
}
