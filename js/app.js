/**
 * ShowDeck — Application Entry Point
 * Initializes router, sidebar, and page loading.
 */

import { Router } from './router.js';
import { Sidebar } from './components/sidebar.js';

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
    loadPage(() => Promise.resolve(placeholderPage('Show Details', `Show #${params.id}`)), params);
  })
  .on('/movie/:id', (params) => {
    loadPage(() => Promise.resolve(placeholderPage('Movie Details', `Movie #${params.id}`)), params);
  })
  .on('/collections', (params) => {
    loadPage(() => Promise.resolve(placeholderPage('Collections', 'Organize your entertainment')), params);
  })
  .on('/stats', (params) => {
    loadPage(() => Promise.resolve(placeholderPage('Statistics', 'Your watching insights')), params);
  })
  .on('/settings', (params) => {
    loadPage(() => Promise.resolve(placeholderPage('Settings', 'Customize your experience')), params);
  })
  .onNotFound(() => {
    const container = getPageContainer();
    if (container) {
      container.innerHTML = renderNotFound();
    }
  });

// ── Update sidebar active state on route change ──
router.afterEach = (route) => {
  if (sidebar) {
    // Map route patterns to nav routes
    let navRoute = route;
    if (route === '/home') navRoute = '/';
    if (route.startsWith('/show/') || route.startsWith('/movie/')) navRoute = '/library';
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

  // Start router
  router.start();

  // Default route
  if (!window.location.hash || window.location.hash === '#') {
    router.navigate('/');
  }

  console.log('[ShowDeck] App initialized');
}

// Boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
