# Changelog

All notable changes to ShowDeck will be documented in this file.

## [1.6.2] - 2026-07-17

### Added
- **Performance & Lazy Loading:** Modals and specific components are now lazy-loaded, drastically reducing the initial JavaScript payload size and speeding up the initial page load.
- **Rendering Optimizations:** Implemented `DocumentFragment` updates for infinite scrolling lists, preventing layout thrashing on lower-end devices.

### Fixed
- **Settings Modularization:** Decoupled settings components. Google Drive Sync and Local Backup operations have been fully modularized into separate, dedicated services.
- **Show Page Refactor:** Extracted the complex HTML generation for seasons and episodes into an `episode-list` component.
- **Tracking Logic:** Extracted core logic (toggling episodes, bulk-marking, auto-completing) into a centralized `tracking-service.js` to guarantee consistent data integrity across the app.
- **Syntax Error Fix:** Fixed an uncaught SyntaxError in `settings.js` caused during previous modularization work.

## [1.6.1] - 2026-07-14

### Fixed
- **Mobile Navigation Overlap**: Fixed an issue on iOS and Safari where the fixed bottom navigation bar on mobile devices would overlap and hide the very bottom content of scrollable pages (like the bottom of Settings or Library lists).

## [1.6.0] - 2026-07-13

### Added
- **Google Drive Sync Improvements**: Significantly improved Google Drive synchronization. The app now caches the OAuth token locally for 1 hour, meaning you only see the Google "Choose an account" popup once per hour instead of on every action.
- **Manual Backups Management**: You can now manually delete individual local backups directly from the Settings page.
- **Onboarding Enhancements**: The onboarding flow now enforces providing a name before continuing, and successfully hides the global navigation bar while in the flow.

### Fixed
- **CSS Bleeding**: Scoped onboarding CSS classes to prevent them from bleeding into and breaking other pages.
- **Empty Drive Deletion**: Gracefully handles the "Delete Cloud Backup" action when no backup actually exists on Google Drive, displaying a clear message instead of a generic error.
- **Drive Button Colors**: Fixed button styling for Drive actions (Delete/Sign Out) across different color themes.

## [1.5.0] - 2026-07-12

### Fixed
- **Modal Syntax Error**: Fixed an issue where the Tags and Collections Modals failed to open on the detail page due to improperly formatted template strings.
- **Custom Delete Confirmations**: Replaced the native browser alert prompts with beautifully styled custom Modals when removing shows and movies from your library.
- **Recently Added Logic**: Removed the strict 7-day age filter from the Home dashboard. The "Recently Added" section will now predictably show the last 8 items you added to your library, regardless of how long ago they were added.
- **Dashboard View Toggle Isolation**: Toggling the view mode (Grid vs List) in the "Recently Added" section no longer accidentally overrides the layout of the "Upcoming" section, which now properly maintains a consistent poster grid.

## [1.4.0] - 2026-07-11

### Added
- **Mobile Bottom Navigation Bar**: Completely overhauled the mobile navigation experience. On screens under 768px, a native app-style bottom navigation bar now provides instant access to Home, Search, Library, and the Menu.
- **Active Navigation States**: The bottom navigation bar features clear, Material-style active states with a background pill and filled icons, making it obvious which section of the app you are currently viewing.

### Removed
- **Mobile Floating Home Button**: Removed the floating action button on mobile devices in favor of the new permanent bottom navigation bar.

## [1.3.0] - 2026-07-09

### Added
- **Library Grid Virtualization (Infinite Scroll)**: The library now handles thousands of items seamlessly without freezing the browser during the initial render by using an infinite scroll mechanism.
- **Global Tag Manager**: A new dedicated interface to view, rename, delete, and customize tags globally under the "Organize" section.

### Fixed
- **Status Badges Performance**: Refactored status badges dictionary allocation out of the render loop to prevent unnecessary memory use and GC pauses during library scroll.
- **Progress Lazy Loading**: Progress bars and Next Episode data now correctly defer fetching until cards enter the viewport using IntersectionObserver.
- **Library Filters Persistence**: The library search bar now correctly visually populates with the active search term if it was restored from a previous session, preventing missing items confusion.
- **Status Badges (Global UI)**: Replicated the completed checkmark badge style across all tracking statuses (Watching, Paused, Dropped, Plan to Watch) to unify the design language.

## [1.2.0] - 2026-07-08

### Added
- **Movies in Calendar**: Calendar now tracks upcoming movie release dates alongside TV episodes.
- **Auto-Complete Rating Prompt**: Automatically prompts the user to rate a show/movie when its status naturally switches to 'Completed' (e.g., when marking the last episode watched).
- **Recalculate Watch Status Tool**: Added a dedicated tool in Settings to automatically sync and fix 'Watching' / 'Paused' statuses based on your recent activity (14-day unwatched threshold).
- **Dashboard Reordering**: You can now reorder the widget layout on the Home page (Watching, Paused, Plan to Watch, Recently Added, Upcoming).
- **Completion Badges**: Added a green checkmark badge over posters and list items for titles marked as 'Completed'.
- **Theme Previews**: Real-time theme previews during the onboarding flow.

### Fixed
- **Missing TMDB IDs**: Ensured custom/offline imported entries missing a TMDB ID are cleanly filtered from the Home dashboard, Calendar, and Stats page to prevent UI errors.
- **Recently Added Strict Filtering**: Hardened the 'Recently Added' section on the Home dashboard to strictly display items added within the last 7 days.
- **Dark Mode Chart Sync**: Fixed a race condition where the Stats page charts loaded invisible axes and legends when first opening the app in Dark Mode.
- **Adult Content UI Animation**: Fixed a bug where the 'Include Adult Content' toggle failed to smoothly animate when toggled due to event listener conflicts.
- **TV Time Imports**: Massively improved TV Time status conversion. Shows that have officially ended but are fully watched are now correctly marked 'Completed'.



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
