/**
 * ShowDeck — Share Page
 * Parses base64 JSON from URL and displays shared library stats.
 */

import { el, escapeHtml } from '../utils/dom.js';

export function render() {
  return `
    <div class="page-container animate-fade-in" style="max-width:600px;margin:0 auto;text-align:center;padding:var(--space-12) var(--space-4);">
      <div class="page-header" style="justify-content:center;margin-bottom:var(--space-8);">
        <h1 class="page-title">Shared Library</h1>
      </div>
      
      <div id="share-content">
        <div class="spinner" style="margin:0 auto;"></div>
      </div>
    </div>
  `;
}

export function init() {
  const container = document.getElementById('share-content');
  if (!container) return;

  try {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const data = urlParams.get('data');
    if (!data) throw new Error('No data provided in URL');

    const stats = JSON.parse(decodeURIComponent(atob(data)));
    
    container.innerHTML = `
      <div class="card" style="padding:var(--space-8);background:var(--surface-1);">
        <div class="grid-stats" style="grid-template-columns:repeat(3,1fr);gap:var(--space-4);margin-bottom:var(--space-8);">
          <div class="stat-card">
            <span class="stat-card-label">Shows</span>
            <span class="stat-card-value text-primary">${stats.sc || 0}</span>
          </div>
          <div class="stat-card">
            <span class="stat-card-label">Movies</span>
            <span class="stat-card-value text-primary">${stats.mc || 0}</span>
          </div>
          <div class="stat-card">
            <span class="stat-card-label">Episodes</span>
            <span class="stat-card-value text-primary">${stats.ec || 0}</span>
          </div>
        </div>
        
        ${stats.ts && stats.ts.length > 0 ? `
          <h3 style="margin-bottom:var(--space-4);color:var(--text-secondary);">Top Rated Shows</h3>
          <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:var(--space-2);">
            ${stats.ts.map(title => `
              <li style="padding:var(--space-3);background:var(--surface-2);border-radius:var(--radius-md);font-weight:var(--weight-medium);">
                ${escapeHtml(title)}
              </li>
            `).join('')}
          </ul>
        ` : ''}
        
        <div style="margin-top:var(--space-10);">
          <p class="text-tertiary" style="margin-bottom:var(--space-4);">Want to track your own entertainment?</p>
          <a href="#/home" class="btn btn-primary" style="justify-content:center;">Start using ShowDeck</a>
        </div>
      </div>
    `;
  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div class="card" style="padding:var(--space-8);border-color:var(--color-error);">
        <h3 class="text-error" style="margin-bottom:var(--space-2);">Invalid Share Link</h3>
        <p class="text-secondary">The link provided is broken or malformed.</p>
        <a href="#/home" class="btn btn-secondary" style="margin-top:var(--space-6);justify-content:center;">Go to Home</a>
      </div>
    `;
  }
}
