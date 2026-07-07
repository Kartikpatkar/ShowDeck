# Changelog

All notable changes to ShowDeck will be documented in this file.

## [1.1.0] - 2026-07-07

### Added
- **PWA Architecture**: Officially added `manifest.json` and `sw.js` for full Progressive Web App installability and offline asset caching (Cache `v2`).
- **Adult Content Consent**: Added a secure custom modal to explicitly request user consent before enabling 18+ content in search results (available in Onboarding and Settings).
- **Web Components**: Migrated heavy DOM elements (like media cards) to native `<media-card>` Custom Elements, vastly improving render performance and lowering memory footprint.

### Fixed
- **Memory Leaks**: Implemented a `destroy()` router lifecycle method to systematically clean up global event listeners and `MutationObserver` instances (especially on the Stats page) when navigating between views.
- **Chart.js Race Conditions**: Added DOM safety checks to prevent `CanvasRenderingContext2D` errors if a user rapidly navigates away from the Stats page during chart initialization.
- **API Rate Limiting**: Enforced a strict `250ms` throttle during TV Time bulk imports to prevent TMDB IP bans (`429 Too Many Requests`).
- **iOS Safari Storage**: Added explicit warnings in Settings for iOS Safari users regarding potential volatile `IndexedDB` purges to encourage regular JSON backups.
- **Data Conflict Handlers**: Solidified episode tracking logic to natively prioritize TMDB's episode counts over TVMaze where data conflicts occur.

## [1.0.1] - Hotfix Release

### Fixed
- Fixed bug where marking a Movie as "Completed" did not successfully save to the database.
- Fixed an issue where the user's custom accent color reset to default upon reloading the app.
- Fixed native back-button routing loops specifically on the "Failed to load movie/show" error pages.
- Enforced strict "portrait" orientation lock in `manifest.json` to prevent unwanted device auto-rotation.
- Added native Pull-to-Refresh gesture support for mobile devices.
- Hardcoded `mediaType` injections into IndexedDB fetch cycles to permanently resolve UI routing collisions between movies and TV shows on the Home dashboard.

## [1.0.0] - 2026-07-05

### Added
- **Library "Upcoming" Filter**: Added a dedicated status filter for viewing unreleased library items, seamlessly linked from the Home Dashboard.
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
- Fixed critical Single Page App navigation bug where native browser `history.back()` trapped users in endless navigation loops. Replaced with custom internal router stack.
- Fixed UI padding and alignment for New Tag and New Collection forms in Settings.
- Fixed API mapping bug in `search.js` where clicking Trending TV Shows routed to Movie details due to missing `mediaType` payload bindings.
- Improved UX of Episode pages by replacing endless loading skeletons with graceful fallbacks to Show backdrops when individual episode stills are unavailable.

### Changed
- Refactored DOM utility functions into a centralized `utils/dom.js`.
- Made Star Rating component accessible to keyboard and screen-reader users (`tabindex`, `role="button"`, `aria-label`).
- "Wipe Data" functionality now thoroughly scans and removes all `showdeck_` localStorage keys along with the IndexedDB deletion.
