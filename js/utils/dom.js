/**
 * ShowDeck — DOM Utility Helpers
 */

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
    html += `<span data-val="${i}" style="cursor:pointer;" class="star-interactive">${char}</span>`;
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
