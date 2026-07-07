/**
 * ShowDeck — Statistics & Analytics Page
 * Renders user watching statistics using Chart.js
 */

import { getFullStats } from '../database/stats.js';
import { getAchievements } from '../database/achievements.js';

let chartInstances = [];

export function render() {
  return `
    <div class="page-container animate-fade-in">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Statistics</h1>
          <p class="page-subtitle">Your entertainment watching habits.</p>
        </div>
      </div>

      <div id="stats-content">
        <div style="text-align:center;padding:var(--space-12);">
          <div class="skeleton" style="width:100%;height:100px;border-radius:var(--radius-lg);margin-bottom:var(--space-6);"></div>
          <div class="skeleton" style="width:100%;height:300px;border-radius:var(--radius-lg);"></div>
        </div>
      </div>
    </div>
  `;
}

export async function init() {
  const container = document.getElementById('stats-content');
  if (!container) return;

  try {
    const stats = await getFullStats();
    
    // Clear any existing charts
    chartInstances.forEach(c => c.destroy());
    chartInstances = [];

    const achievements = await getAchievements();

    // Calculate times
    const daysWatched = Math.floor(stats.totalHours / 24);
    const hoursLeft = stats.totalHours % 24;
    const timeString = daysWatched > 0 
      ? `${daysWatched}d ${hoursLeft}h`
      : `${stats.totalHours}h`;

    container.innerHTML = `
      <!-- Top Overview -->
      <div class="grid-stats stagger-children" style="margin-bottom:var(--space-8);">
        <div class="stat-card">
          <span class="stat-card-label">Time Watched</span>
          <span class="stat-card-value text-primary">${timeString}</span>
        </div>
        <div class="stat-card">
          <span class="stat-card-label">Shows Watched</span>
          <span class="stat-card-value">${stats.totalShows}</span>
        </div>
        <div class="stat-card">
          <span class="stat-card-label">Movies Watched</span>
          <span class="stat-card-value">${stats.totalMovies}</span>
        </div>
        <div class="stat-card">
          <span class="stat-card-label">Episodes Watched</span>
          <span class="stat-card-value">${stats.totalEpisodes}</span>
        </div>
      </div>

      <!-- Achievements -->
      <div class="card" style="margin-bottom:var(--space-8);padding:var(--space-6);">
        <h3 class="section-title">Achievements</h3>
        <div style="display:flex;gap:var(--space-4);flex-wrap:wrap;">
          ${achievements.map(ach => `
            <div style="display:flex;flex-direction:column;align-items:center;width:100px;text-align:center;opacity:${ach.unlocked ? 1 : 0.4};filter:${ach.unlocked ? 'none' : 'grayscale(100%)'};">
              <div style="width:64px;height:64px;border-radius:50%;background:${ach.color}20;color:${ach.color};display:flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:var(--space-2);border:2px solid ${ach.color};box-shadow:${ach.unlocked ? `0 0 10px ${ach.color}40` : 'none'};">
                ${ach.icon}
              </div>
              <div style="font-size:var(--text-sm);font-weight:var(--weight-bold);">${ach.title}</div>
              <div style="font-size:10px;color:var(--text-tertiary);margin-top:2px;line-height:1.2;" title="${ach.description}">${ach.description}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:var(--space-8);">
        <!-- Genre Chart -->
        <div class="card" style="display:flex;flex-direction:column;padding:var(--space-6);">
          <h3 class="section-title">Top Genres</h3>
          <div style="flex:1;position:relative;min-height:250px;">
            <canvas id="genreChart"></canvas>
          </div>
        </div>

        <!-- Rating Chart -->
        <div class="card" style="display:flex;flex-direction:column;padding:var(--space-6);">
          <h3 class="section-title">Rating Distribution</h3>
          <div style="flex:1;position:relative;min-height:250px;">
            <canvas id="ratingChart"></canvas>
          </div>
        </div>

        <!-- Day of Week Chart -->
        <div class="card" style="display:flex;flex-direction:column;padding:var(--space-6);">
          <h3 class="section-title">Activity by Day</h3>
          <div style="flex:1;position:relative;min-height:250px;">
            <canvas id="dayOfWeekChart"></canvas>
          </div>
        </div>
      </div>
      
      <!-- Activity Heatmap -->
      <div class="card" style="margin-top:var(--space-8);padding:var(--space-6);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-4);">
          <h3 class="section-title" style="margin:0;">Watch Activity</h3>
          <div style="display:flex;gap:var(--space-4);font-size:var(--text-sm);">
            <div><span class="text-tertiary">Current Streak:</span> <strong>${stats.currentStreak} days</strong></div>
            <div><span class="text-tertiary">Longest Streak:</span> <strong>${stats.longestStreak} days</strong></div>
          </div>
        </div>
        
        <div style="width:100%;overflow-x:auto;padding-bottom:var(--space-2);">
          ${renderHeatmap(stats.activityByDate)}
        </div>
      </div>
    `;

    renderCharts(stats);

  } catch (err) {
    console.error('Stats error:', err);
    container.innerHTML = `<div class="empty-state">Failed to load statistics.</div>`;
  }
}

function renderCharts(stats) {
  if (!window.Chart) {
    console.warn('Chart.js not loaded');
    return;
  }

  // Theme colors
  const root = getComputedStyle(document.documentElement);
  const colorPrimary = root.getPropertyValue('--color-primary').trim();
  const colorSurface3 = root.getPropertyValue('--surface-3').trim();
  const textColor = root.getPropertyValue('--text-primary').trim();

  // 1. Genre Chart (Doughnut)
  const genreCtx = document.getElementById('genreChart');
  if (genreCtx && stats.genres.length > 0) {
    const topGenres = stats.genres.slice(0, 5);
    const otherCount = stats.genres.slice(5).reduce((s, g) => s + g.count, 0);
    
    const labels = topGenres.map(g => g.name);
    const data = topGenres.map(g => g.count);
    
    if (otherCount > 0) {
      labels.push('Other');
      data.push(otherCount);
    }

    const chart = new Chart(genreCtx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: [
            colorPrimary,
            '#8b5cf6', // Violet
            '#ec4899', // Pink
            '#14b8a6', // Teal
            '#f59e0b', // Amber
            colorSurface3
          ],
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { color: textColor } }
        },
        cutout: '70%'
      }
    });
    chartInstances.push(chart);
  }

  // 2. Rating Chart (Bar)
  const ratingCtx = document.getElementById('ratingChart');
  if (ratingCtx && Object.keys(stats.ratingDistribution).length > 0) {
    const labels = ['1★', '2★', '3★', '4★', '5★'];
    const data = [
      stats.ratingDistribution[1] || 0,
      stats.ratingDistribution[2] || 0,
      stats.ratingDistribution[3] || 0,
      stats.ratingDistribution[4] || 0,
      stats.ratingDistribution[5] || 0,
    ];

    const chart = new Chart(ratingCtx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Ratings',
          data,
          backgroundColor: colorPrimary,
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { 
            beginAtZero: true, 
            ticks: { stepSize: 1, color: textColor },
            grid: { color: colorSurface3 }
          },
          x: {
            ticks: { color: textColor },
            grid: { display: false }
          }
        }
      }
    });
    chartInstances.push(chart);
  }

  // 3. Day of Week Chart (Polar Area or Bar)
  const dayCtx = document.getElementById('dayOfWeekChart');
  if (dayCtx && stats.activityByDayOfWeek) {
    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = stats.activityByDayOfWeek;
    
    const chart = new Chart(dayCtx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Activity',
          data,
          backgroundColor: '#10b981', // Emerald
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { 
            beginAtZero: true,
            ticks: { color: textColor },
            grid: { color: colorSurface3 }
          },
          x: {
            ticks: { color: textColor },
            grid: { display: false }
          }
        }
      }
    });
    chartInstances.push(chart);
  }
}

function renderHeatmap(activityData) {
  // Generate a simple CSS grid heatmap for the last 30 days
  const today = new Date();
  const days = [];
  
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }

  const cells = days.map(date => {
    const count = activityData[date] || 0;
    // Determine opacity/intensity based on count
    let intensity = 0;
    if (count > 0) intensity = 0.25;
    if (count > 2) intensity = 0.5;
    if (count > 5) intensity = 0.75;
    if (count > 8) intensity = 1;

    return `
      <div 
        style="
          width:16px;height:16px;
          border-radius:2px;
          background: ${count === 0 ? 'var(--surface-3)' : `color-mix(in srgb, var(--color-primary) ${intensity*100}%, transparent)`};
        "
        title="${date}: ${count} episodes watched"
      ></div>
    `;
  }).join('');

  return `
    <div style="display:flex;gap:4px;">
      ${cells}
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:var(--space-2);font-size:var(--text-xs);color:var(--text-tertiary);">
      <span>30 days ago</span>
      <span>Today</span>
    </div>
  `;
}
