/**
 * ShowDeck — History Page
 * Activity timeline and Watch Heatmap.
 */

import { db } from '../database/db.js';
import { getPosterUrl } from '../api/tmdb.js';
import { formatDate, getRelativeTime, escapeHtml, formatYear } from '../utils/dom.js';

let allActivities = [];
let filteredActivities = [];
let filterMode = 'all'; // 'all', 'shows', 'movies'

export function render() {
  return `
    <div class="page-container animate-fade-in">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">History</h1>
          <p class="page-subtitle">Your watch activity and heatmap.</p>
        </div>
      </div>
      
      <!-- Heatmap Section -->
      <div class="card heatmap-card" style="margin-bottom:var(--space-6); padding:var(--space-6); overflow-x:auto; -webkit-overflow-scrolling:touch;">
        <h3 class="section-title" style="margin-top:0; position:sticky; left:0;">Activity Heatmap</h3>
        <div id="heatmap-container" style="display:flex; justify-content:flex-start; min-width:max-content; padding-bottom:var(--space-2);">
          <div class="spinner"></div>
        </div>
      </div>

      <!-- Filters -->
      <div style="display:flex;gap:var(--space-2);margin-bottom:var(--space-4);">
        <button class="btn btn-sm btn-primary filter-btn" data-filter="all">All</button>
        <button class="btn btn-sm btn-ghost filter-btn" data-filter="shows">TV Shows</button>
        <button class="btn btn-sm btn-ghost filter-btn" data-filter="movies">Movies</button>
      </div>

      <!-- Activity Timeline -->
      <div id="history-timeline" style="display:flex; flex-direction:column; gap:var(--space-6);">
        <div class="spinner"></div>
      </div>
    </div>
  `;
}

export async function init() {
  await loadActivity();
  
  // Bind filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-ghost');
      });
      e.target.classList.remove('btn-ghost');
      e.target.classList.add('btn-primary');
      filterMode = e.target.dataset.filter;
      applyFilter();
    });
  });
}

async function loadActivity() {
  try {
    // 1. Fetch raw activity (V2 tracked events)
    const rawActivity = await db.activity.orderBy('date').reverse().toArray();
    
    // 2. Fetch library items
    const [shows, movies, episodes] = await Promise.all([
      db.shows.toArray(),
      db.movies.toArray(),
      db.episodes.toArray()
    ]);
    
    const showMap = new Map(shows.map(s => [s.id, s]));
    const movieMap = new Map(movies.map(m => [m.id, m]));
    const epMap = new Map(episodes.map(e => [e.id, e]));

    // 3. Process activity log
    const enriched = [];
    const processedIds = new Set(); // To avoid duplicates if activity & legacy overlap
    
    for (const act of rawActivity) {
      if (act.type !== 'watch') continue; // Only care about watches
      
      let itemMeta = null;
      let uniqueKey = '';
      if (act.itemType === 'show') {
        const ep = epMap.get(act.itemId);
        if (ep) {
          const show = showMap.get(ep.showId);
          if (show) {
            itemMeta = {
              title: show.title,
              subtext: `Season ${ep.season} Episode ${ep.episode} - ${ep.title}`,
              posterPath: show.posterPath,
              route: `#/episode/${show.tmdbId}/${ep.season}/${ep.episode}`,
              type: 'show'
            };
            uniqueKey = `ep_${ep.id}`;
          }
        }
      } else if (act.itemType === 'movie') {
        const movie = movieMap.get(act.itemId);
        if (movie) {
          itemMeta = {
            title: movie.title,
            subtext: formatYear(movie.releaseDate),
            posterPath: movie.posterPath,
            route: `#/movie/${movie.tmdbId}`,
            type: 'movie'
          };
          uniqueKey = `mv_${movie.id}`;
        }
      }
      
      if (itemMeta) {
        processedIds.add(uniqueKey);
        enriched.push({
          ...act,
          meta: itemMeta
        });
      }
    }
    
    // 4. Fallback: Include legacy watched items from db.episodes and db.movies
    // If they have watchedAt but aren't in activity log
    for (const ep of episodes) {
      if (ep.watched && ep.watchedAt && !processedIds.has(`ep_${ep.id}`)) {
        const show = showMap.get(ep.showId);
        if (show) {
          enriched.push({
            id: `legacy_ep_${ep.id}`,
            type: 'watch',
            itemId: ep.id,
            itemType: 'show',
            date: new Date(ep.watchedAt).toISOString(),
            meta: {
              title: show.title,
              subtext: `Season ${ep.season} Episode ${ep.episode} - ${ep.title}`,
              posterPath: show.posterPath,
              route: `#/episode/${show.tmdbId}/${ep.season}/${ep.episode}`,
              type: 'show'
            }
          });
        }
      }
    }
    
    for (const movie of movies) {
      if (movie.trackingStatus === 'Watched' && movie.updatedAt && !processedIds.has(`mv_${movie.id}`)) {
        enriched.push({
          id: `legacy_mv_${movie.id}`,
          type: 'watch',
          itemId: movie.id,
          itemType: 'movie',
          date: new Date(movie.updatedAt).toISOString(),
          meta: {
            title: movie.title,
            subtext: formatYear(movie.releaseDate),
            posterPath: movie.posterPath,
            route: `#/movie/${movie.tmdbId}`,
            type: 'movie'
          }
        });
      }
    }
    
    // 5. Sort all by date descending
    enriched.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    allActivities = enriched;
    renderHeatmap();
    applyFilter();
  } catch (e) {
    console.error('Failed to load activity', e);
    document.getElementById('history-timeline').innerHTML = '<div class="empty-state">Failed to load history.</div>';
  }
}

function applyFilter() {
  if (filterMode === 'all') {
    filteredActivities = allActivities;
  } else {
    // filterMode is 'shows' or 'movies'
    const type = filterMode === 'shows' ? 'show' : 'movie';
    filteredActivities = allActivities.filter(a => a.meta.type === type);
  }
  
  renderTimeline();
}

function renderTimeline() {
  const container = document.getElementById('history-timeline');
  if (!filteredActivities || filteredActivities.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3 class="empty-state-title">No watch history found</h3>
        <p class="empty-state-text">Your activity will appear here once you start marking items as watched.</p>
      </div>
    `;
    return;
  }

  // Group by date string (e.g. "Jul 6, 2026")
  const groups = new Map();
  filteredActivities.forEach(act => {
    const d = new Date(act.date);
    const dateStr = d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (!groups.has(dateStr)) groups.set(dateStr, []);
    groups.get(dateStr).push(act);
  });

  let html = '';
  for (const [dateStr, acts] of groups.entries()) {
    html += `
      <div class="history-group">
        <h4 style="margin-bottom:var(--space-3); color:var(--text-secondary); font-size:var(--text-sm); font-weight:var(--weight-semibold); text-transform:uppercase; letter-spacing:0.05em; border-bottom:1px solid var(--border-subtle); padding-bottom:var(--space-2);">${dateStr}</h4>
        <div class="history-items" style="display:flex; flex-direction:column; gap:var(--space-2);">
          ${acts.map(act => {
            const posterUrl = getPosterUrl(act.meta.posterPath, 'posterSmall');
            return `
              <a href="${act.meta.route}" class="card" style="display:flex; gap:var(--space-4); padding:var(--space-2); align-items:center; text-decoration:none; background:var(--surface-1);">
                ${posterUrl 
                  ? `<img src="${posterUrl}" style="width:40px; height:60px; border-radius:var(--radius-sm); object-fit:cover; flex-shrink:0;">`
                  : `<div style="width:40px; height:60px; border-radius:var(--radius-sm); background:var(--surface-3); flex-shrink:0;"></div>`
                }
                <div style="flex:1; min-width:0;">
                  <div style="font-weight:var(--weight-semibold); color:var(--text-primary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(act.meta.title)}</div>
                  <div style="font-size:var(--text-xs); color:var(--text-tertiary); margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(act.meta.subtext)}</div>
                </div>
                <div style="font-size:var(--text-xs); color:var(--text-disabled); padding-right:var(--space-2); flex-shrink:0;">
                  ${new Date(act.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </div>
              </a>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }
  container.innerHTML = html;
}

function renderHeatmap() {
  const container = document.getElementById('heatmap-container');
  
  // Calculate date range: last 6 months (26 weeks)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - (26 * 7));

  // Count activity per day
  const counts = new Map();
  let maxCount = 1;
  allActivities.forEach(act => {
    const d = new Date(act.date);
    if (d >= startDate && d <= endDate) {
      const key = d.toISOString().split('T')[0];
      const count = (counts.get(key) || 0) + 1;
      counts.set(key, count);
      if (count > maxCount) maxCount = count;
    }
  });

  // Generate grid
  let gridHtml = '<div style="display:flex; gap:4px; align-items:flex-end;">';
  
  // Weeks loop
  for (let w = 0; w < 26; w++) {
    gridHtml += '<div style="display:flex; flex-direction:column; gap:4px;">';
    // Days loop (0 = Sunday)
    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + (w * 7) + d);
      
      if (cellDate > endDate) {
        gridHtml += `<div style="width:12px; height:12px;"></div>`;
        continue;
      }
      
      const key = cellDate.toISOString().split('T')[0];
      const count = counts.get(key) || 0;
      
      let opacity = 1;
      if (count > 0) {
        const ratio = count / maxCount;
        if (ratio <= 0.25) opacity = 0.4;
        else if (ratio <= 0.5) opacity = 0.6;
        else if (ratio <= 0.75) opacity = 0.8;
        else opacity = 1.0;
      }
      
      const bg = count > 0 ? `hsla(245, 58%, 51%, ${opacity})` : `var(--surface-3)`;
      const tooltipDate = cellDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      const tooltip = count === 0 ? `No activity on ${tooltipDate}` : `${count} item${count > 1 ? 's' : ''} watched on ${tooltipDate}`;
      
      gridHtml += `<div style="width:12px; height:12px; border-radius:2px; background:${bg};" title="${tooltip}"></div>`;
    }
    gridHtml += '</div>';
  }
  
  gridHtml += '</div>';
  container.innerHTML = gridHtml;
  
  // Scroll to the end on mobile
  setTimeout(() => {
    const parent = container.parentElement;
    if (parent) parent.scrollLeft = parent.scrollWidth;
  }, 50);
}
