/**
 * ShowDeck — Application Entry Point
 * Initializes router, sidebar, and page loading.
 */

import { Router } from './router.js';
import { Sidebar } from './components/sidebar.js';

export const APP_VERSION = '1.0.1';

const router = new Router();
let sidebar = null;
const scrollPositions = new Map();

window.addEventListener('scroll', () => {
  const hash = window.location.hash || '#/';
  scrollPositions.set(hash, window.scrollY);
}, { passive: true });

// Page container reference
const getPageContainer = () => document.getElementById('page-content');

/**
 * Render a page module into the content area.
 * @param {Function} loader - Dynamic import function
 * @param {object} params - Route params
 */
async function loadPage(loader, params = {}) {
  const container = getPageContainer();
  if (!container) return;

  // Add transition
  container.classList.remove('page-enter');
  void container.offsetWidth; // Force reflow
  container.classList.add('page-enter');

  try {
    const module = await loader();
    if (module.render) {
      container.innerHTML = '';
      const content = await module.render(params);
      if (typeof content === 'string') {
        container.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        container.appendChild(content);
      }
    }
    if (module.init) {
      await module.init(params);
    }
    
    // Restore scroll position
    const hash = window.location.hash || '#/';
    if (scrollPositions.has(hash)) {
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPositions.get(hash));
      });
    } else {
      window.scrollTo(0, 0);
    }
  } catch (err) {
    console.error('[ShowDeck] Page load error:', err);
    container.innerHTML = renderErrorPage();
  }
}

function renderErrorPage() {
  return `
    <div class="page-container">
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
        </div>
        <h3 class="empty-state-title">Something went wrong</h3>
        <p class="empty-state-text">The page couldn't be loaded. Try refreshing.</p>
        <a href="#/" class="btn btn-primary">Go Home</a>
      </div>
    </div>
  `;
}

function renderNotFound() {
  return `
    <div class="page-container">
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v.01"/><path d="M12 8v4"/></svg>
        </div>
        <h3 class="empty-state-title">Page not found</h3>
        <p class="empty-state-text">This page doesn't exist yet.</p>
        <a href="#/" class="btn btn-primary">Go Home</a>
      </div>
    </div>
  `;
}

/**
 * Placeholder page renderer for pages not yet built.
 */
function placeholderPage(title, description) {
  return {
    render: () => `
      <div class="page-container animate-fade-in">
        <div class="page-header">
          <div class="page-header-left">
            <h1 class="page-title">${title}</h1>
            <p class="page-subtitle">${description}</p>
          </div>
        </div>
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>
          </div>
          <h3 class="empty-state-title">Coming Soon</h3>
          <p class="empty-state-text">This page is under construction. Check back soon!</p>
        </div>
      </div>
    `
  };
}

// ── Register Routes ──

router
  .on('/', (params) => {
    loadPage(() => import('./pages/home.js'), params);
  })
  .on('/home', (params) => {
    loadPage(() => import('./pages/home.js'), params);
  })
  .on('/search', (params) => {
    loadPage(() => import('./pages/search.js'), params);
  })
  .on('/library', (params) => {
    loadPage(() => import('./pages/library.js'), params);
  })
  .on('/show/:id', (params) => {
    loadPage(() => import('./pages/show.js'), params);
  })
  .on('/movie/:id', (params) => {
    loadPage(() => import('./pages/movie.js'), params);
  })
  .on('/episode/:showId/:season/:episode', (params) => {
    loadPage(() => import('./pages/episode.js'), params);
  })
  .on('/collections', (params) => {
    loadPage(() => import('./pages/collections.js'), params);
  })
  .on('/stats', (params) => {
    loadPage(() => import('./pages/stats.js'), params);
  })
  .on('/history', (params) => {
    loadPage(() => import('./pages/history.js'), params);
  })
  .on('/calendar', (params) => {
    loadPage(() => import('./pages/calendar.js'), params);
  })
  .on('/settings', (params) => {
    loadPage(() => import('./pages/settings.js'), params);
  })
  .on('/enrich', (params) => {
    loadPage(() => import('./pages/enrich.js'), params);
  })
  .on('/goals', (params) => {
    loadPage(() => import('./pages/goals.js'), params);
  })
  .on('/smart-collections', (params) => {
    loadPage(() => import('./pages/smart_collections.js'), params);
  })
  .on('/share', (params) => {
    loadPage(() => import('./pages/share.js'), params);
  })
  .on('/help', (params) => {
    loadPage(() => import('./pages/help.js'), params);
  })
  .on('/onboarding', (params) => {
    loadPage(() => import('./pages/onboarding.js'), params);
  });

router.onNotFound(() => {
  const container = getPageContainer();
  if (container) {
    container.innerHTML = renderNotFound();
  }
});

  // Check onboarding on initial load
  const onboarded = localStorage.getItem('showdeck_onboarded');
  if (!onboarded && window.location.hash !== '#/onboarding') {
    window.location.hash = '#/onboarding';
  } else if (!window.location.hash) {
    window.location.hash = '#/home';
  }

router.start();

// ── Update sidebar active state on route change ──
router.afterEach = (route) => {
  if (sidebar) {
    // Map route patterns to nav routes
    let navRoute = route;
    if (route === '/home') navRoute = '/';
    if (route.startsWith('/show/') || route.startsWith('/movie/') || route.startsWith('/episode/')) navRoute = '/library';
    if (route === '/enrich') navRoute = '/settings';
    if (route === '/history') navRoute = '/history';
    if (route === '/calendar') navRoute = '/calendar';
    sidebar.setActive(navRoute);
  }

  // Scroll content to saved position or top
  const content = document.querySelector('.main-content');
  if (content) {
    const savedScroll = window.appScrollPositions?.get(window.location.hash) || 0;
    // Delay slightly to let content render before scrolling
    setTimeout(() => {
      if (content) content.scrollTop = savedScroll;
    }, 150);
  }
};

// ── Track Scroll Positions ──
window.appScrollPositions = new Map();
document.addEventListener('scroll', (e) => {
  if (e.target && e.target.classList && e.target.classList.contains('main-content')) {
    window.appScrollPositions.set(window.location.hash, e.target.scrollTop);
  }
}, true);

// ── Initialize App ──
function init() {
  const app = document.getElementById('app');
  if (!app) return;

  // Create sidebar
  sidebar = new Sidebar(app, router);

  // Apply saved theme
  initTheme();

  // Start router
  router.start();

  // Default route
  if (!window.location.hash || window.location.hash === '#') {
    router.navigate('/');
  }

  console.log('[ShowDeck] App initialized');
}

// ── Global image error handler ──
window.addEventListener('error', function(e) {
  if (e.target && e.target.tagName === 'IMG') {
    e.target.style.display = 'none'; // Hide broken images globally
  }
}, true);

// ── Pull to Refresh ──
let touchStartY = 0;
let touchStartX = 0;
let initialScrollTop = 0;
let ptrIndicator = null;
let ptrIcon = null;

document.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
  touchStartX = e.touches[0].clientX;
  const content = document.querySelector('.main-content');
  initialScrollTop = content ? content.scrollTop : 0;
  
  if (!ptrIndicator) {
    ptrIndicator = document.getElementById('ptr-indicator');
    ptrIcon = document.getElementById('ptr-icon');
  }
}, { passive: true });

document.addEventListener('touchmove', (e) => {
  const content = document.querySelector('.main-content');
  if (content && initialScrollTop === 0 && content.scrollTop <= 0 && ptrIndicator) {
    const yDiff = e.touches[0].clientY - touchStartY;
    const xDiff = Math.abs(e.touches[0].clientX - touchStartX);
    
    if (yDiff > 0 && yDiff > xDiff) {
      // Pulling down
      const pullDist = Math.min(yDiff * 0.5, 100); // dampen pull
      ptrIndicator.style.transition = 'none';
      ptrIndicator.style.opacity = Math.min(pullDist / 60, 1);
      ptrIndicator.style.transform = `translateY(${pullDist - 50}px)`;
      
      if (ptrIcon) {
        ptrIcon.style.transition = 'none';
        ptrIcon.style.transform = `rotate(${pullDist * 4}deg)`;
      }
    }
  }
}, { passive: true });

document.addEventListener('touchend', (e) => {
  const touchEndY = e.changedTouches[0].clientY;
  const touchEndX = e.changedTouches[0].clientX;
  const content = document.querySelector('.main-content');
  
  if (ptrIndicator) {
    ptrIndicator.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    if (ptrIcon) ptrIcon.style.transition = 'transform 0.3s ease-out';
  }
  
  if (content && initialScrollTop === 0 && content.scrollTop <= 0) {
    const yDiff = touchEndY - touchStartY;
    const xDiff = Math.abs(touchEndX - touchStartX);
    
    if (yDiff > 120 && xDiff < 100) {
      if (ptrIcon) {
        ptrIcon.style.transition = 'transform 1s linear infinite';
        ptrIcon.style.transform = 'rotate(360deg)';
      }
      setTimeout(() => window.location.reload(), 300);
    } else if (ptrIndicator) {
      ptrIndicator.style.transform = 'translateY(-150%)';
      ptrIndicator.style.opacity = '0';
    }
  } else if (ptrIndicator) {
    ptrIndicator.style.transform = 'translateY(-150%)';
    ptrIndicator.style.opacity = '0';
  }
}, { passive: true });

// ── Global Keyboard Shortcuts ──
window.addEventListener('keydown', (e) => {
  // Ignore if typing in input
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

  if (e.key === '/') {
    e.preventDefault();
    router.navigate('/search');
  } else if (e.key.toLowerCase() === 'h') {
    router.navigate('/home');
  } else if (e.key.toLowerCase() === 'l') {
    router.navigate('/library');
  }
});

// ── PWA & Offline Support ──

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then((registration) => {
      console.log('ServiceWorker registration successful:', registration.scope);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            import('./components/toast.js').then(({ toast }) => {
              toast('Update available! Refresh to apply.', 'warning', 10000);
            });
          }
        });
      });
    }).catch(err => {
      console.error('ServiceWorker registration failed:', err);
    });
  });
}

export function initTheme() {
  const theme = localStorage.getItem('showdeck_theme') || 'dark';
  const accent = localStorage.getItem('showdeck_accent_theme') || 'purple';
  const customColor = localStorage.getItem('showdeck_custom_color');
  
  const allBaseThemes = ['theme-light', 'theme-dark', 'theme-oled', 'theme-dracula', 'theme-nord', 'theme-catppuccin', 'theme-tokyo'];
  
  if (theme === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.remove(...allBaseThemes);
    document.body.classList.add(isDark ? 'theme-dark' : 'theme-light');
  } else {
    document.body.classList.remove(...allBaseThemes);
    document.body.classList.add(`theme-${theme}`);
  }
  
  if (accent === 'custom' && customColor) {
    import('./utils/dom.js').then(module => {
      module.applyCustomTheme(customColor);
    });
  }
  document.body.dataset.theme = accent;
  
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    if (accent === 'custom' && customColor) {
      metaTheme.setAttribute('content', customColor);
    } else {
      const colors = { purple: '#5b4dc7', blue: '#0080ff', green: '#30a66d', red: '#de2323' };
      metaTheme.setAttribute('content', colors[accent] || '#5b4dc7');
    }
  }
}

function updateOnlineStatus() {
  const banner = document.getElementById('offline-banner');
  if (banner) {
    if (navigator.onLine) {
      banner.classList.add('hidden');
    } else {
      banner.classList.remove('hidden');
    }
  }

  // Keyboard Navigation
  window.addEventListener('keydown', (e) => {
    // Ignore if typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

    switch (e.key) {
      case 'Escape':
        if (document.getElementById('enrich-modal')) return; // handled by modal
        window.appRouter.goBack();
        break;
      case 's':
      case 'S':
        document.getElementById('sync-show-btn')?.click();
        document.getElementById('sync-movie-btn')?.click();
        break;
      case 'w':
      case 'W':
        document.getElementById('toggle-watch-btn')?.click();
        break;
    }
  });
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus(); // Check on init

// Boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => console.log('SW registered:', registration.scope))
      .catch(err => console.log('SW registration failed:', err));
  });
}
