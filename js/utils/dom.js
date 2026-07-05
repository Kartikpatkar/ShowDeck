/**
 * ShowDeck — DOM Utility Helpers
 */

/**
 * Escape HTML entities to prevent XSS.
 */
export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Create an element with attributes and children.
 */
export function el(tag, attrs = {}, ...children) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'dataset' && typeof value === 'object') {
      Object.entries(value).forEach(([dk, dv]) => { element.dataset[dk] = dv; });
    } else if (key === 'html') {
      element.innerHTML = value;
    } else {
      element.setAttribute(key, value);
    }
  }
  for (const child of children) {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      element.appendChild(child);
    }
  }
  return element;
}

/**
 * Toggle a global invisible overlay to prevent clicks during sync.
 */
export function toggleGlobalLoading(isLoading) {
  let overlay = document.getElementById('global-loading-overlay');
  if (isLoading) {
    if (!overlay) {
      overlay = el('div', {
        id: 'global-loading-overlay',
        style: {
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 9999,
          cursor: 'wait',
          backgroundColor: 'rgba(0,0,0,0.1)'
        }
      });
      document.body.appendChild(overlay);
    }
    overlay.style.display = 'block';
  } else if (overlay) {
    overlay.style.display = 'none';
  }
}

/**
 * Query selector shorthand.
 */
export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

export function $$(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

/**
 * Debounce a function.
 */
export function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Format date string.
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format year from date string.
 */
export function formatYear(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).getFullYear().toString();
}

/**
 * Truncate text.
 */
export function truncate(text, maxLength = 150) {
  if (!text || text.length <= maxLength) return text || '';
  return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Format vote count (e.g. 1.2k)
 */
export function formatVoteCount(count) {
  if (!count) return '0';
  if (count < 1000) return count.toString();
  return (count / 1000).toFixed(1) + 'k';
}

/**
 * Get relative time (e.g. "Releases in 5 days")
 */
export function getRelativeTime(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  
  if (date <= now) return null;
  
  const diff = date - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days > 365) return `Releases in ${Math.floor(days / 365)} years`;
  if (days > 30) return `Releases in ${Math.floor(days / 30)} months`;
  if (days > 1) return `Releases in ${days} days`;
  if (days === 1) return `Releases tomorrow`;
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) return `Releases in ${hours} hours`;
  
  return `Releases very soon`;
}

/**
 * Get relative time in the past (e.g. "2 hours ago")
 */
export function timeAgo(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'Just now';
  
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(diff / 86400000);
  if (days < 30) return `${days}d ago`;
  
  return formatDate(dateStr);
}

/**
 * Get star rating display.
 */
export function starRating(rating, max = 5) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = max - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

/**
 * Get interactive star rating HTML (clickable spans).
 */
export function interactiveStarRating(rating, max = 5) {
  let html = '';
  const full = Math.floor(rating);
  for (let i = 1; i <= max; i++) {
    const char = i <= full ? '★' : (i - 1 < rating ? '½' : '☆');
    html += `<span data-val="${i}" style="cursor:pointer;" class="star-interactive" role="button" tabindex="0" aria-label="Rate ${i} stars">${char}</span>`;
  }
  return html;
}

/**
 * Tracking status labels and colors.
 */
export const STATUS_MAP = {
  watching: { label: 'Watching', color: 'primary', icon: '▶' },
  completed: { label: 'Completed', color: 'success', icon: '✓' },
  paused: { label: 'Paused', color: 'warning', icon: '⏸' },
  dropped: { label: 'Dropped', color: 'error', icon: '✕' },
  plan: { label: 'Plan to Watch', color: 'neutral', icon: '📋' },
  rewatching: { label: 'Rewatching', color: 'accent', icon: '🔄' },
};

/**
 * Get status badge HTML.
 */
export function statusBadge(status) {
  const s = STATUS_MAP[status] || STATUS_MAP.plan;
  return `<span class="badge badge-${s.color}">${s.icon} ${s.label}</span>`;
}

/** Convert HEX color to HSL object */
export function hexToHsl(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
  const r = parseInt(hex.substring(0,2), 16) / 255;
  const g = parseInt(hex.substring(2,4), 16) / 255;
  const b = parseInt(hex.substring(4,6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/** Apply a custom HSL theme by injecting a style tag */
export function applyCustomTheme(hex) {
  let styleTag = document.getElementById('custom-theme-style');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'custom-theme-style';
    document.head.appendChild(styleTag);
  }
  
  if (!hex || hex === 'default') {
    styleTag.innerHTML = '';
    return;
  }

  const { h, s, l } = hexToHsl(hex);
  
  const l_light = Math.min(l + 15, 85);
  const l_dark = Math.max(l - 20, 20);
  
  styleTag.innerHTML = `
    :root, [data-theme="custom"] {
      --color-primary: hsl(${h}, ${s}%, ${l}%);
      --color-primary-light: hsl(${h}, ${s}%, ${l_light}%);
      --color-primary-dark: hsl(${h}, ${s}%, ${l_dark}%);
      --color-primary-subtle: hsl(${h}, ${s}%, 95%);
      --color-primary-ghost: hsl(${h}, ${s}%, 97%);
    }
    .dark-mode [data-theme="custom"] {
      --color-primary-subtle: hsl(${h}, ${s}%, 15%);
      --color-primary-ghost: hsl(${h}, ${s}%, 12%);
    }
  `;
}
