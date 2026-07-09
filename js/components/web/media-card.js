import { getPosterUrl } from '../../api/tmdb.js';
import { formatYear } from '../../utils/dom.js';
import { getShowProgress, getNextEpisode } from '../../database/episodes.js';

const STATUS_BADGES = {
  'completed': { bg: 'var(--color-success)', icon: '<polyline points="20 6 9 17 4 12"/>' },
  'watching': { bg: 'var(--color-primary)', icon: '<polygon points="5 3 19 12 5 21 5 3"/>' },
  'paused': { bg: 'var(--color-warning)', icon: '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>' },
  'dropped': { bg: 'var(--color-error)', icon: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' },
  'plan': { bg: 'var(--text-secondary)', icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' }
};

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

    let statusBadge = '';
    if (item.trackingStatus) {
      const b = STATUS_BADGES[item.trackingStatus];
      if (b) {
        statusBadge = `<div style="position:absolute;top:var(--space-2);left:var(--space-2);width:22px;height:22px;background:${b.bg};color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;z-index:10;box-shadow:0 2px 4px rgba(0,0,0,0.5);" title="${item.trackingStatus}"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${b.icon}</svg></div>`;
      }
    }

    const showProgress = item.mediaType === 'show' && (item.trackingStatus === 'watching' || item.trackingStatus === 'paused');
    let progressHtml = '';
    if (showProgress) {
       const color = item.trackingStatus === 'paused' ? 'var(--text-secondary)' : 'var(--color-primary)';
       progressHtml = `
          <div class="progress-bar-container" style="position:absolute; bottom:0; left:0; width:100%; height:4px; margin:0; border-radius:0; background:rgba(255,255,255,0.25); z-index:3;">
            <div class="progress-bar-fill progress-dynamic" style="width:0%; border-radius:0; background:${color}; transition:width 0.3s ease;"></div>
          </div>
       `;
    }

    if (variant === 'poster') {
      this.innerHTML = `
        <a href="${route}" class="poster-card" style="position:relative;display:block;">
          ${missingBadge}
          ${statusBadge}
          ${posterUrl
            ? `<img class="poster-card-image" src="${posterUrl}" alt="${customTitle}" loading="lazy">`
            : `<div class="poster-card-image skeleton"></div>`
          }
          <div class="poster-card-overlay">
            <div class="poster-card-title">${customTitle}</div>
            <div class="poster-card-meta">${customMeta}</div>
            <div class="next-episode-dynamic" style="font-size:11px; color:hsla(0,0%,100%,0.8); margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-shadow:0 1px 2px rgba(0,0,0,0.8); display:none;"></div>
          </div>
          ${progressHtml}
        </a>
      `;
      this.loadProgress(item, showProgress);
      return;
    }

    if (viewMode === 'list') {
      const genres = (item.genres || []).slice(0, 3).join(', ');
      const subMeta = this.hasAttribute('custom-meta') ? customMeta : `${year} • ${typeLabel}${genres ? ` • ${genres}` : ''}`;
      
      this.innerHTML = `
        <div class="library-list-item card" style="display:flex;gap:var(--space-4);padding:var(--space-3);margin-bottom:var(--space-2);text-decoration:none;">
          <a href="${route}" style="flex-shrink:0;position:relative;display:block;border-radius:var(--radius-sm);overflow:hidden;">
            ${statusBadge}
            ${posterUrl
              ? `<img src="${posterUrl}" alt="${customTitle}" style="width:64px;height:96px;object-fit:cover;" loading="lazy">`
              : `<div style="width:64px;height:96px;background:var(--surface-3);display:flex;align-items:center;justify-content:center;"><span style="opacity:0.3;">🎬</span></div>`
            }
            ${progressHtml}
          </a>
          <div style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:var(--space-1);">
            <a href="${route}" style="text-decoration:none;">
              <div style="font-weight:var(--weight-medium);color:var(--text-primary);font-size:var(--text-lg);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${customTitle}</div>
              <div style="font-size:var(--text-sm);color:var(--text-secondary);margin-top:2px;">${subMeta}</div>
              <div class="next-episode-dynamic" style="font-size:var(--text-sm);color:var(--text-secondary);margin-top:2px;display:none;"></div>
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
          <a href="${route}" style="position:relative;display:block;border-top-left-radius:var(--radius-md);border-top-right-radius:var(--radius-md);overflow:hidden;">
            ${statusBadge}
            ${posterUrl
              ? `<img class="poster-card-image" src="${posterUrl}" alt="${customTitle}" loading="lazy">`
              : `<div class="poster-card-image" style="display:flex;align-items:center;justify-content:center;background:var(--surface-3);aspect-ratio:var(--card-poster-ratio);"><span style="font-size:var(--text-3xl);opacity:0.3;">🎬</span></div>`
            }
            ${progressHtml}
          </a>
          <div class="poster-card-info" style="display:flex;flex-direction:column;gap:var(--space-1);">
            <div class="poster-card-info-title">${customTitle}</div>
            <div class="poster-card-info-sub" style="display:flex;align-items:center;justify-content:space-between;">
              <span>${subMeta}</span>
              ${rating ? `<span style="color:var(--color-warning);font-size:var(--text-xs);">${rating}</span>` : ''}
            </div>
            <div class="next-episode-dynamic" style="color:var(--text-secondary); font-size:var(--text-xs); display:none;"></div>
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
    
    this.loadProgress(item, showProgress);
  }

  loadProgress(item, showProgress) {
    if (showProgress && item.id) {
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this._fetchProgress(item);
              obs.disconnect();
            }
          });
        }, { rootMargin: '100px' });
        observer.observe(this);
      } else {
        this._fetchProgress(item);
      }
    }
  }

  _fetchProgress(item) {
    Promise.all([
      getShowProgress(item.id),
      getNextEpisode(item.id)
    ]).then(([progress, next]) => {
      const fill = this.querySelector('.progress-dynamic');
      if (fill) fill.style.width = `${progress.percentage}%`;
      
      const nextContainer = this.querySelector('.next-episode-dynamic');
      if (nextContainer && next) {
        const nextLabel = `S${String(next.season).padStart(2, '0')}E${String(next.episode).padStart(2, '0')}${next.title && !next.title.toLowerCase().startsWith('episode') ? ` - ${next.title}` : ''}`;
        nextContainer.textContent = nextLabel;
        nextContainer.style.display = 'block';
      }
    }).catch(console.error);
  }
}

customElements.define('media-card', MediaCard);
