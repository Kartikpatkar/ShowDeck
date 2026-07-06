/**
 * ShowDeck — Application Entry Point
 * Initializes router, sidebar, and page loading.
 */

import { Router } from './router.js';
import { Sidebar } from './components/sidebar.js';

export const APP_VERSION = '1.0.1';

const router = new Router();
let sidebar = null;

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
  .on('/settings', (params) => {
    loadPage(() => import('./pages/settings.js'), params);
  })
  .on('/enrich', (params) => {
    loadPage(() => import('./pages/enrich.js'), params);
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
    sidebar.setActive(navRoute);
  }

  // Scroll content to top
  const content = document.querySelector('.main-content');
  if (content) content.scrollTop = 0;
};

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

document.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
  touchStartX = e.touches[0].clientX;
  const content = document.querySelector('.main-content');
  initialScrollTop = content ? content.scrollTop : 0;
}, { passive: true });

document.addEventListener('touchend', (e) => {
  const touchEndY = e.changedTouches[0].clientY;
  const touchEndX = e.changedTouches[0].clientX;
  const content = document.querySelector('.main-content');
  
  if (content && initialScrollTop === 0 && content.scrollTop === 0) {
    const yDiff = touchEndY - touchStartY;
    const xDiff = Math.abs(touchEndX - touchStartX);
    
    // Trigger if pulled down > 150px and mostly vertical (prevent horizontal swipe trigger)
    if (yDiff > 150 && xDiff < 100) {
      window.location.reload();
    }
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

function initTheme() {
  const theme = localStorage.getItem('showdeck_theme') || 'dark';
  const accent = localStorage.getItem('showdeck_accent_theme') || 'purple';
  const customColor = localStorage.getItem('showdeck_custom_color');
  
  if (theme === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(isDark ? 'theme-dark' : 'theme-light');
  } else {
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(`theme-${theme}`);
  }
  
  if (accent === 'custom' && customColor) {
    import('./utils/dom.js').then(module => {
      module.applyCustomTheme(customColor);
    });
  }
  document.body.dataset.theme = accent;
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
