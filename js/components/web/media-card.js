import { getPosterUrl } from '../../api/tmdb.js';
import { formatYear } from '../../utils/dom.js';

function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export class MediaCard extends HTMLElement {
  constructor() {
    super();
    this.handleAddClick = this.handleAddClick.bind(this);
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    const btn = this.querySelector('[data-action="add"]');
    if (btn) btn.removeEventListener('click', this.handleAddClick);
  }

  handleAddClick(e) {
    // Dispatch custom event to parent
    const item = JSON.parse(this.getAttribute('data-item'));
    this.dispatchEvent(new CustomEvent('add-to-library', {
      bubbles: true,
      detail: item
    }));
  }

  render() {
    const itemStr = this.getAttribute('data-item');
    if (!itemStr) return;
    
    let item;
    try {
      item = JSON.parse(itemStr);
    } catch(e) {
      console.error('Failed to parse media-card data', e);
      return;
    }

    const viewMode = this.getAttribute('view-mode') || 'grid';
    
    const posterUrl = getPosterUrl(item.posterPath, 'posterMedium');
    const year = formatYear(item.mediaType === 'show' ? item.firstAirDate : item.releaseDate);
    const typeLabel = item.mediaType === 'show' ? 'TV Show' : 'Movie';
    const rating = item.voteAverage ? `★ ${item.voteAverage.toFixed(1)}` : '';
    const route = item.mediaType === 'show' ? `#/show/${item.tmdbId}` : `#/movie/${item.tmdbId}`;

    const variant = this.getAttribute('variant') || 'default';
    const customTitle = this.getAttribute('custom-title') || escapeHtml(item.title);
    const customMeta = this.getAttribute('custom-meta') || `${year} • ${typeLabel}`;

    const isMissing = item.tmdbId === null;
    const missingBadge = isMissing ? `<div style="position:absolute;top:0;right:0;background:var(--color-warning);color:var(--surface-0);font-size:10px;padding:2px 4px;font-weight:bold;z-index:10;border-bottom-left-radius:var(--radius-sm);">MISSING ID</div>` : '';

    const isCompleted = item.trackingStatus === 'completed';
    const completedBadge = isCompleted ? `<div style="position:absolute;top:var(--space-2);left:var(--space-2);width:22px;height:22px;background:var(--color-success);color:var(--surface-0);border-radius:50%;display:flex;align-items:center;justify-content:center;z-index:10;box-shadow:0 2px 4px rgba(0,0,0,0.5);"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>` : '';

    if (variant === 'poster') {
      this.innerHTML = `
        <a href="${route}" class="poster-card" style="position:relative;display:block;">
          ${missingBadge}
          ${completedBadge}
          ${posterUrl
            ? `<img class="poster-card-image" src="${posterUrl}" alt="${customTitle}" loading="lazy">`
            : `<div class="poster-card-image skeleton"></div>`
          }
          <div class="poster-card-overlay">
            <div class="poster-card-title">${customTitle}</div>
            <div class="poster-card-meta">${customMeta}</div>
          </div>
        </a>
      `;
      return;
    }

    if (viewMode === 'list') {
      const genres = (item.genres || []).slice(0, 3).join(', ');
      const subMeta = this.hasAttribute('custom-meta') ? customMeta : `${year} • ${typeLabel}${genres ? ` • ${genres}` : ''}`;
      
      this.innerHTML = `
        <div class="library-list-item card" style="display:flex;gap:var(--space-4);padding:var(--space-3);margin-bottom:var(--space-2);text-decoration:none;">
          <a href="${route}" style="flex-shrink:0;position:relative;display:block;">
            ${completedBadge}
            ${posterUrl
              ? `<img src="${posterUrl}" alt="${customTitle}" style="width:64px;height:96px;object-fit:cover;border-radius:var(--radius-sm);" loading="lazy">`
              : `<div style="width:64px;height:96px;background:var(--surface-3);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;"><span style="opacity:0.3;">🎬</span></div>`
            }
          </a>
          <div style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:var(--space-1);">
            <a href="${route}" style="text-decoration:none;">
              <div style="font-weight:var(--weight-medium);color:var(--text-primary);font-size:var(--text-lg);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${customTitle}</div>
              <div style="font-size:var(--text-sm);color:var(--text-secondary);margin-top:2px;">${subMeta}</div>
            </a>
            <div style="display:flex;gap:var(--space-2);align-items:center;margin-top:var(--space-2);">
              ${item.inLibrary
                ? `<span class="badge badge-success">✓ In Library</span>`
                : `<button class="btn btn-primary btn-sm" data-action="add">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    Add
                  </button>`
              }
              ${rating ? `<span style="font-size:var(--text-sm);color:var(--color-warning);">★ ${item.voteAverage.toFixed(1)}</span>` : ''}
            </div>
          </div>
        </div>
      `;
    } else {
      const subMeta = this.hasAttribute('custom-meta') ? customMeta : `${year} • ${typeLabel}`;
      this.innerHTML = `
        <div class="poster-card search-result-card">
          <a href="${route}" style="position:relative;display:block;">
            ${completedBadge}
            ${posterUrl
              ? `<img class="poster-card-image" src="${posterUrl}" alt="${customTitle}" loading="lazy">`
              : `<div class="poster-card-image" style="display:flex;align-items:center;justify-content:center;background:var(--surface-3);aspect-ratio:var(--card-poster-ratio);"><span style="font-size:var(--text-3xl);opacity:0.3;">🎬</span></div>`
            }
          </a>
          <div class="poster-card-info" style="display:flex;flex-direction:column;gap:var(--space-1);">
            <div class="poster-card-info-title">${customTitle}</div>
            <div class="poster-card-info-sub" style="display:flex;align-items:center;justify-content:space-between;">
              <span>${subMeta}</span>
              ${rating ? `<span style="color:var(--color-warning);font-size:var(--text-xs);">${rating}</span>` : ''}
            </div>
            ${item.inLibrary
              ? `<span class="badge badge-success" style="width:fit-content;margin-top:var(--space-1);">✓ In Library</span>`
              : `<button class="btn btn-primary btn-sm" style="width:100%;justify-content:center;margin-top:var(--space-1);" data-action="add">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  Add
                </button>`
            }
          </div>
        </div>
      `;
    }

    // Bind Add Button
    const btn = this.querySelector('[data-action="add"]');
    if (btn) btn.addEventListener('click', this.handleAddClick);
  }
}

customElements.define('media-card', MediaCard);
