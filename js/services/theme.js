/**
 * ShowDeck — Theme Service
 * Handles light/dark theme toggle with localStorage persistence.
 */

const THEME_KEY = 'showdeck-theme';

export class ThemeService {
  constructor() {
    this._theme = this._loadTheme();
    this._apply(this._theme);
  }

  /** @returns {'light' | 'dark'} */
  get current() {
    return this._theme;
  }

  /** Toggle between light and dark. */
  toggle() {
    this._theme = this._theme === 'light' ? 'dark' : 'light';
    this._apply(this._theme);
    this._save(this._theme);
    return this._theme;
  }

  /** Set theme explicitly. */
  set(theme) {
    if (theme !== 'light' && theme !== 'dark') return;
    this._theme = theme;
    this._apply(theme);
    this._save(theme);
  }

  /** @private */
  _loadTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;

    // Respect system preference on first visit, default light
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /** @private */
  _apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  /** @private */
  _save(theme) {
    localStorage.setItem(THEME_KEY, theme);
  }
}

/** Singleton instance */
export const theme = new ThemeService();
