/**
 * ShowDeck — Episode List Component
 * Generates the HTML for the season tabs and episode list.
 */
import { getPosterUrl } from '../api/tmdb.js';
import { escapeHtml, formatDate, getRelativeTime } from '../utils/dom.js';

export function renderEpisodeList(showData, episodesData, currentSeason, seasonsList, isTracked, isSeasonComplete) {
  let html = `
    <!-- Season Tabs -->
    <div class="season-tabs" id="season-tabs">
      ${seasonsList.map(s => `
        <button class="season-tab ${s === currentSeason ? 'active' : ''}" data-season="${s}">
          Season ${s}
        </button>
      `).join('')}
    </div>
  `;

  // Season Overview Card
  const sData = showData.seasons?.find(s => s.seasonNumber === currentSeason);
  if (sData && (sData.overview || sData.posterPath)) {
    const sPosterUrl = sData.posterPath ? getPosterUrl(sData.posterPath, 'posterMedium') : null;
    html += `
      <div class="card" style="margin-bottom:var(--space-4); padding:var(--space-4); display:flex; gap:var(--space-4); align-items:flex-start;">
        ${sPosterUrl ? `<img src="${sPosterUrl}" style="width:80px; border-radius:var(--radius-sm); flex-shrink:0;">` : ''}
        <div style="flex:1; min-width:0;">
          <h4 style="margin-bottom:var(--space-1);">${escapeHtml(sData.name || `Season ${currentSeason}`)}</h4>
          <div class="season-overview-container" style="position:relative;">
            <p class="season-overview-text" style="font-size:var(--text-sm); color:var(--text-secondary); margin:0; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">
              ${escapeHtml(sData.overview || 'No overview available for this season.')}
            </p>
            ${sData.overview && sData.overview.length > 150 ? `
              <button class="btn btn-ghost btn-sm" data-action="read-more" style="padding:0; height:auto; min-height:0; color:var(--color-primary); font-size:var(--text-xs); margin-top:var(--space-1);">Read More</button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // Episodes List
  const seasonEps = episodesData.filter(e => e.season === currentSeason).sort((a,b) => a.episode - b.episode);
  
  html += `<div class="card" style="padding:0;">`;
  
  if (seasonEps.length === 0) {
    html += `<div style="padding:var(--space-6); text-align:center; color:var(--text-tertiary);">No episodes available for this season yet.</div>`;
  }

  html += seasonEps.map(ep => {
    let imgHtml = '';
    if (ep.stillPath) {
      const src = ep.stillPath.startsWith('http') ? ep.stillPath : getPosterUrl(ep.stillPath, 'backdropSmall');
      imgHtml = `<img src="${src}" class="episode-image" loading="lazy" style="width:120px;height:68px;object-fit:cover;border-radius:var(--radius-sm);margin:0 var(--space-3);flex-shrink:0;">`;
    } else if (showData.backdropPath) {
      const src = getPosterUrl(showData.backdropPath, 'backdropSmall');
      imgHtml = `<img src="${src}" class="episode-image" loading="lazy" style="width:120px;height:68px;object-fit:cover;border-radius:var(--radius-sm);margin:0 var(--space-3);flex-shrink:0;">`;
    } else {
      imgHtml = `<div class="episode-image" style="width:120px;height:68px;border-radius:var(--radius-sm);margin:0 var(--space-3);flex-shrink:0;background:var(--surface-3);display:flex;align-items:center;justify-content:center;"><span style="opacity:0.3;font-size:24px;">📺</span></div>`;
    }
    
    const epDate = ep.airDate ? new Date(ep.airDate) : null;
    const isUnreleased = epDate ? epDate.getTime() > Date.now() : false;
    const countdown = getRelativeTime(ep.airDate);

    return `
      <div class="episode-item ${ep.watched ? 'watched' : ''}" data-ep-id="${ep.id || ''}" data-ep-index="${ep.episode}" style="display:block;border-bottom:1px solid var(--border-subtle);">
        <div class="episode-row" style="align-items:flex-start;">
          <div class="episode-checkbox ${ep.watched ? 'checked' : ''}" style="margin:0 var(--space-3);cursor:${isUnreleased ? 'not-allowed' : 'pointer'};opacity:${isUnreleased ? '0.3' : '1'};" ${!isUnreleased ? 'data-action="toggle-watch"' : 'title="Not released yet"'}>
            ${ep.watched ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : (isUnreleased ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' : '')}
          </div>
          <a href="#/episode/${showData.tmdbId}/${ep.season}/${ep.episode}" class="episode-link">
            ${imgHtml}
            <div class="episode-info" style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;padding-right:var(--space-2);">
              <div class="episode-number" style="font-size:var(--text-xs);color:var(--text-tertiary);">${ep.season}x${String(ep.episode).padStart(2, '0')}</div>
              <div class="episode-title" style="font-weight:var(--weight-medium);overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${escapeHtml(ep.title || `Episode ${ep.episode}`)}</div>
              
              <!-- Meta row -->
              <div class="episode-meta" style="font-size:11px;color:var(--text-tertiary);margin-top:2px;display:flex;gap:4px;flex-wrap:wrap;">
                ${ep.airDate ? `<span>${formatDate(ep.airDate)}</span>` : ''}
                ${ep.airDate && (ep.runtime || ep.voteAverage) ? '<span>•</span>' : ''}
                ${ep.runtime ? `<span>${ep.runtime}m</span>` : ''}
                ${ep.runtime && ep.voteAverage ? '<span>•</span>' : ''}
                ${ep.voteAverage ? `<span style="color:var(--color-warning);">★ ${ep.voteAverage.toFixed(1)}</span>` : ''}
              </div>
              ${countdown ? `<div style="font-size:10px;font-weight:bold;color:var(--color-primary);margin-top:2px;">${countdown}</div>` : ''}
            </div>
          </a>
          <div class="episode-actions-wrapper" style="display:flex;align-items:center;gap:var(--space-1);margin-right:var(--space-2);">
            ${ep.watched && !isUnreleased ? `<button class="btn btn-secondary btn-sm add-watch-btn" data-ep-id="${ep.id}" data-action="add-watch" style="padding:0 var(--space-2);height:28px;min-height:28px;font-size:12px;border-radius:14px;" title="Add another watch">+1${ep.watchCount && ep.watchCount > 1 ? ` (${ep.watchCount})` : ''}</button>` : ''}
            <button class="btn btn-icon btn-sm" data-action="toggle-overview" style="color:var(--text-tertiary);padding:var(--space-1);" title="Expand overview">
              <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition:transform 0.2s;"><path d="m6 9 6 6 6-6"/></svg>
            </button>
          </div>
        </div>
        <div class="episode-overview-inline" style="display:none;padding:var(--space-3) var(--space-4) var(--space-3) 54px;font-size:var(--text-sm);color:var(--text-secondary);border-top:1px dashed var(--border-subtle);background:var(--surface-1);">
          ${escapeHtml(ep.overview || 'No overview available.')}
        </div>
      </div>
    `;
  }).join('');

  html += `</div>`;
  
  return html;
}
