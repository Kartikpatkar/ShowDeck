/**
 * ShowDeck — Sidebar Component
 * Renders the navigation sidebar with collapse, mobile toggle, and active state management.
 */

/**
 * Lucide icon SVGs (inline for no-dependency approach).
 * Only icons we need for nav.
 */
const icons = {
  home: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  library: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>`,
  collections: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 17a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3.9a2 2 0 0 1-1.69-.9l-.81-1.2a2 2 0 0 0-1.67-.9H8a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2Z"/><path d="M2 8v11a2 2 0 0 0 2 2h14"/></svg>`,
  stats: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/></svg>`,
  history: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>`,
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
  settings: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
  chevronLeft: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`,
  sun: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
  moon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
  menu: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`,
  x: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  clapperboard: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"/><path d="m6.2 5.3 3.1 3.9"/><path d="m12.4 3.4 3.1 4"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>`,
  info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
};

const SIDEBAR_KEY = 'showdeck-sidebar-collapsed';

const navItems = [
  { section: 'Menu', items: [
    { id: 'home', label: 'Home', icon: 'home', route: '/' },
    { id: 'search', label: 'Search', icon: 'search', route: '/search' },
    { id: 'library', label: 'Library', icon: 'library', route: '/library' },
  ]},
  { section: 'Organize', items: [
    { id: 'collections', label: 'Collections', icon: 'collections', route: '/collections' },
    { id: 'history', label: 'History', icon: 'history', route: '/history' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar', route: '/calendar' },
    { id: 'stats', label: 'Statistics', icon: 'stats', route: '/stats' },
  ]},
  { section: 'System', items: [
    { id: 'help', label: 'Help & Guides', icon: 'info', route: '/help' },
  ]},
];

export class Sidebar {
  /**
   * @param {HTMLElement} container
   * @param {import('../router.js').Router} router
   */
  constructor(container, router) {
    this.container = container;
    this.router = router;
    this.collapsed = localStorage.getItem(SIDEBAR_KEY) === 'true';
    this.mobileOpen = false;

    this.render();
    this.bindEvents();
  }

  render() {
    const sidebar = document.createElement('aside');
    sidebar.className = `sidebar${this.collapsed ? ' collapsed' : ''}`;
    sidebar.id = 'sidebar';
    sidebar.setAttribute('role', 'navigation');
    sidebar.setAttribute('aria-label', 'Main navigation');

    sidebar.innerHTML = `
      <div class="sidebar-header">
        <a href="#/" class="sidebar-brand" aria-label="ShowDeck Home">
          <div class="sidebar-brand-icon"><img src="assets/icon-192.png" alt="ShowDeck Logo" style="width:100%; height:100%; object-fit:contain; border-radius:4px;"></div>
          <span class="sidebar-brand-name">ShowDeck</span>
        </a>
        <button class="sidebar-toggle" id="sidebar-toggle" aria-label="Toggle sidebar" data-tooltip="Collapse">
          ${icons.chevronLeft}
        </button>
      </div>

      <nav class="sidebar-nav" id="sidebar-nav">
        ${navItems.map(section => `
          <div class="nav-section">
            <div class="nav-section-title">${section.section}</div>
            ${section.items.map(item => `
              <a href="#${item.route}" class="nav-item" data-route="${item.route}" id="nav-${item.id}" aria-label="${item.label}">
                <span class="nav-item-icon">${icons[item.icon]}</span>
                <span class="nav-item-label">${item.label}</span>
              </a>
            `).join('')}
          </div>
        `).join('')}
      </nav>

      <div class="sidebar-footer">
        <a href="#/settings" class="nav-item" data-route="/settings" id="nav-settings" aria-label="Settings">
          <span class="nav-item-icon">${icons.settings}</span>
          <span class="nav-item-label">Settings</span>
        </a>
      </div>
    `;

    // Mobile menu button
    const mobileBtn = document.createElement('button');
    mobileBtn.className = 'mobile-menu-toggle';
    mobileBtn.id = 'mobile-menu-toggle';
    mobileBtn.setAttribute('aria-label', 'Open menu');
    mobileBtn.innerHTML = icons.menu;

    // Overlay
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.id = 'sidebar-overlay';

    this.container.prepend(overlay);
    this.container.prepend(sidebar);
    this.container.prepend(mobileBtn);

    this.sidebarEl = sidebar;
    this.overlayEl = overlay;
    this.mobileBtnEl = mobileBtn;
  }

  bindEvents() {
    // Toggle collapse
    const toggleBtn = document.getElementById('sidebar-toggle');
    toggleBtn?.addEventListener('click', () => this.toggleCollapse());

    // Mobile menu
    this.mobileBtnEl.addEventListener('click', () => this.toggleMobile());
    this.overlayEl.addEventListener('click', () => this.closeMobile());

    // Close mobile on nav click
    this.sidebarEl.querySelectorAll('.nav-item[data-route]').forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          this.closeMobile();
        }
      });
    });

    // Listen for escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.mobileOpen) {
        this.closeMobile();
      }
    });
  }

  /**
   * Update active nav item based on current route.
   * @param {string} route
   */
  setActive(route) {
    this.sidebarEl.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });

    // Normalize: /home and / both map to home
    const normalizedRoute = route === '/' || route === '/home' ? '/' : route;

    // Find matching nav item
    const activeItem = this.sidebarEl.querySelector(`.nav-item[data-route="${normalizedRoute}"]`);
    if (activeItem) {
      activeItem.classList.add('active');
    }
  }

  toggleCollapse() {
    this.collapsed = !this.collapsed;
    this.sidebarEl.classList.toggle('collapsed', this.collapsed);
    localStorage.setItem(SIDEBAR_KEY, this.collapsed);
  }

  toggleMobile() {
    this.mobileOpen = !this.mobileOpen;
    this.sidebarEl.classList.toggle('open', this.mobileOpen);
    this.overlayEl.classList.toggle('visible', this.mobileOpen);
    this.mobileBtnEl.innerHTML = this.mobileOpen ? icons.x : icons.menu;
  }

  closeMobile() {
    this.mobileOpen = false;
    this.sidebarEl.classList.remove('open');
    this.overlayEl.classList.remove('visible');
    this.mobileBtnEl.innerHTML = icons.menu;
  }
}
