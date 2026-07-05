# Changelog

All notable changes to ShowDeck will be documented in this file.

## [1.0.0] - 2026-07-05

### Added
- **Multiple Accent Themes**: Added Purple, Blue, Green, and Red themes in Settings, plus a Custom Hex Color picker.
- **User Onboarding**: Implemented a welcoming onboarding flow to set up user profile, themes, and API connection.
- **Export to CSV**: Added ability to export library data to CSV.
- **Share Library**: Generate a shareable, read-only link of your library stats (`#/share`).
- **Episode Notes**: Added auto-saving "My Notes" textareas to episode pages.
- **Keyboard Navigation**: Added `Esc` to go back, `s` to trigger manual sync, and `w` to toggle watched status on episodes.
- **Offline Indicator**: Added "Last synced" timestamps that become visible when offline to indicate data freshness.
- **Sync Overlay**: Added an invisible global loading overlay during database syncs to prevent concurrent state corruption.
- **XSS Protection**: All dynamic API data is now sanitized via `escapeHtml()` utility.
- **Security**: Added strict Content Security Policy (CSP) to `index.html`.
- **Search Debounce**: Implemented responsive debouncing (500ms on mobile, 300ms on desktop) to optimize API usage.

### Fixed
- Fixed critical Service Worker caching failure by ensuring all new assets are listed in `sw.js`.
- Fixed Service Worker registration path scoping (`./sw.js`).
- Fixed invalid `margin-left` CSS properties in movie and show list components.
- Fixed a boolean casting error in database stats calculations.
- Bundled Dexie.js locally to ensure the app boots without relying on a CDN.
- Fixed iOS PWA installation by strictly resizing `icon-192.png` and `icon-512.png` to true PNGs.
- Fixed a fatal crash in `syncShow` and `syncMovie` when TMDB returns null data (e.g., when offline).
- Fixed a CSP violation blocking `ipapi.co` geolocation lookups for local release dates.
- Fixed mobile search grid overflowing UI text and buttons.
- Fixed localStorage theme race conditions by refactoring `window.location.reload()` calls into seamless SPA `hashchange` events.

### Changed
- Refactored DOM utility functions into a centralized `utils/dom.js`.
- Made Star Rating component accessible to keyboard and screen-reader users (`tabindex`, `role="button"`, `aria-label`).
- "Wipe Data" functionality now thoroughly scans and removes all `showdeck_` localStorage keys along with the IndexedDB deletion.
