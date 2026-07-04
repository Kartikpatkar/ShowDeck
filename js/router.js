/**
 * ShowDeck — Hash-based SPA Router
 * Lightweight client-side routing using hash fragments.
 */

export class Router {
  constructor() {
    /** @type {Map<string, { handler: Function, pattern: RegExp, paramNames: string[] }>} */
    this.routes = new Map();
    this.notFoundHandler = null;
    this.beforeEach = null;
    this.afterEach = null;
    this._currentRoute = null;
    this._currentParams = {};

    this._onHashChange = this._onHashChange.bind(this);
  }

  /**
   * Register a route.
   * Supports dynamic segments: '/show/:id' -> { id: '123' }
   * @param {string} path - Route pattern (e.g., '/home', '/show/:id')
   * @param {Function} handler - Handler function(params)
   */
  on(path, handler) {
    const paramNames = [];
    const pattern = path.replace(/:(\w+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });
    const regex = new RegExp(`^${pattern}$`);
    this.routes.set(path, { handler, pattern: regex, paramNames });
    return this;
  }

  /**
   * Set 404 handler.
   * @param {Function} handler
   */
  onNotFound(handler) {
    this.notFoundHandler = handler;
    return this;
  }

  /**
   * Start listening for hash changes.
   */
  start() {
    window.addEventListener('hashchange', this._onHashChange);
    // Handle initial route
    this._onHashChange();
    return this;
  }

  /**
   * Stop listening.
   */
  stop() {
    window.removeEventListener('hashchange', this._onHashChange);
  }

  /**
   * Navigate to a path programmatically.
   * @param {string} path
   */
  navigate(path) {
    window.location.hash = path;
  }

  /**
   * Get current route info.
   */
  get current() {
    return {
      path: this._currentRoute,
      params: { ...this._currentParams }
    };
  }

  /**
   * @private
   */
  _onHashChange() {
    const hash = window.location.hash.slice(1) || '/';
    const path = hash.startsWith('/') ? hash : `/${hash}`;

    for (const [routePath, route] of this.routes) {
      const match = path.match(route.pattern);
      if (match) {
        const params = {};
        route.paramNames.forEach((name, i) => {
          params[name] = decodeURIComponent(match[i + 1]);
        });

        const prevRoute = this._currentRoute;
        this._currentRoute = routePath;
        this._currentParams = params;

        if (this.beforeEach) {
          this.beforeEach(routePath, params, prevRoute);
        }

        route.handler(params);

        if (this.afterEach) {
          this.afterEach(routePath, params, prevRoute);
        }
        return;
      }
    }

    // No match — 404
    this._currentRoute = null;
    this._currentParams = {};
    if (this.notFoundHandler) {
      this.notFoundHandler(path);
    }
  }
}
