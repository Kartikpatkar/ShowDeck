/**
 * ShowDeck — Calendar Page
 * Upcoming and recent episodes timeline.
 */

import { db } from '../database/db.js';
import { getPosterUrl } from '../api/tmdb.js';
import { formatDate, escapeHtml, getRelativeTime } from '../utils/dom.js';

let episodesCache = [];
let showMap = new Map();

export function render() {
  return `
    <div class="page-container animate-fade-in">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Calendar</h1>
          <p class="page-subtitle">Upcoming episodes for your tracked shows.</p>
        </div>
      </div>
      
      <div id="calendar-timeline" style="display:flex; flex-direction:column; gap:var(--space-6);">
        <div class="spinner"></div>
      </div>
    </div>
  `;
}

export async function init() {
  await loadCalendar();
}

async function loadCalendar() {
  try {
    const [shows, episodes] = await Promise.all([
      db.shows.toArray(),
      db.episodes.toArray()
    ]);
    
    // Only care about shows we are actually tracking (not Plan to Watch maybe? Actually all tracked is fine)
    showMap = new Map(shows.map(s => [s.id, s]));
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const upcoming = [];
    
    for (const ep of episodes) {
      if (!ep.airDate) continue;
      
      // Parse airDate YYYY-MM-DD
      const parts = ep.airDate.split('-');
      if (parts.length !== 3) continue;
      
      const epDate = new Date(parts[0], parts[1] - 1, parts[2]);
      epDate.setHours(0, 0, 0, 0);
      
      // Keep episodes from the last 7 days and all future episodes
      const diffTime = epDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= -7) {
        const show = showMap.get(ep.showId);
        if (show) {
          upcoming.push({
            ...ep,
            epDate,
            diffDays,
            show
          });
        }
      }
    }
    
    // Sort by airDate ascending (closest to today first)
    upcoming.sort((a, b) => a.epDate.getTime() - b.epDate.getTime());
    
    episodesCache = upcoming;
    renderCalendar();
  } catch (e) {
    console.error('Failed to load calendar', e);
    document.getElementById('calendar-timeline').innerHTML = '<div class="empty-state">Failed to load calendar.</div>';
  }
}

function renderCalendar() {
  const container = document.getElementById('calendar-timeline');
  if (!episodesCache || episodesCache.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3 class="empty-state-title">No upcoming episodes</h3>
        <p class="empty-state-text">Track more shows to see their upcoming release dates here.</p>
      </div>
    `;
    return;
  }

  // Group by date string
  const groups = new Map();
  episodesCache.forEach(ep => {
    const dateStr = ep.epDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (!groups.has(dateStr)) groups.set(dateStr, []);
    groups.get(dateStr).push(ep);
  });

  let html = '';
  for (const [dateStr, eps] of groups.entries()) {
    // Check if it's today
    const firstEp = eps[0];
    let headerColor = 'var(--text-secondary)';
    if (firstEp.diffDays === 0) {
      headerColor = 'var(--color-primary)'; // Highlight Today
    } else if (firstEp.diffDays < 0) {
      headerColor = 'var(--text-tertiary)'; // Past
    }

    let headerText = dateStr;
    if (firstEp.diffDays === 0) headerText = 'Today — ' + dateStr;
    else if (firstEp.diffDays === 1) headerText = 'Tomorrow — ' + dateStr;
    else if (firstEp.diffDays === -1) headerText = 'Yesterday — ' + dateStr;

    html += `
      <div class="calendar-group">
        <h4 style="margin-bottom:var(--space-3); color:${headerColor}; font-size:var(--text-sm); font-weight:var(--weight-bold); text-transform:uppercase; letter-spacing:0.05em; border-bottom:1px solid var(--border-subtle); padding-bottom:var(--space-2);">
          ${headerText}
        </h4>
        <div class="calendar-items grid-posters" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:var(--space-4);">
          ${eps.map(ep => {
            const posterUrl = getPosterUrl(ep.show.posterPath, 'posterMedium');
            const route = `#/episode/${ep.show.tmdbId}/${ep.season}/${ep.episode}`;
            return `
              <a href="${route}" class="card" style="display:flex; flex-direction:column; text-decoration:none; background:var(--surface-1); overflow:hidden; border: 1px solid var(--border-subtle); border-radius:var(--radius-md); transition:transform 0.2s, border-color 0.2s;">
                <div style="display:flex; padding:var(--space-3); gap:var(--space-3); align-items:center;">
                  ${posterUrl 
                    ? `<img src="${posterUrl}" style="width:48px; height:72px; border-radius:var(--radius-sm); object-fit:cover; flex-shrink:0;">`
                    : `<div style="width:48px; height:72px; border-radius:var(--radius-sm); background:var(--surface-3); flex-shrink:0;"></div>`
                  }
                  <div style="flex:1; min-width:0; display:flex; flex-direction:column; justify-content:center;">
                    <div style="font-weight:var(--weight-bold); color:var(--text-primary); font-size:var(--text-md); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(ep.show.title)}</div>
                    <div style="font-size:var(--text-sm); color:var(--text-secondary); margin-top:2px; font-variant-numeric: tabular-nums;">S${String(ep.season).padStart(2, '0')}E${String(ep.episode).padStart(2, '0')}</div>
                  </div>
                </div>
                ${ep.title ? `<div style="padding:var(--space-2) var(--space-3); background:var(--surface-2); border-top:1px solid var(--border-subtle); font-size:var(--text-xs); color:var(--text-tertiary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(ep.title)}</div>` : ''}
              </a>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }
  container.innerHTML = html;
}
