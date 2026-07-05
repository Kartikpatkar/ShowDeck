# Changelog

All notable changes to the ShowDeck project will be documented in this file.

## [Unreleased] - Initial Launch Version

### Added
- **TV Time Import Engine**: Users can now import their GDPR data export (`.zip`) from TV Time directly in the browser. Supports parsing TV Time CSVs and resolving TMDB IDs locally.
- **Offline Mode Support**: Integrated local caching for `Chart.js` and `JSZip` to ensure the entire app functions without an internet connection.
- **PWA Capabilities**: Added `manifest.json`, generated vector icons (`icon-192.png`, `icon-512.png`), and configured service workers (`sw.js`) for full PWA installation on mobile and desktop.
- **Open Graph SEO**: Added proper meta tags to `index.html` for rich link previews when sharing.
- **Search UI Enhancements**: Wrapped the search input in a form to handle mobile keyboard dismissal gracefully and added an instant "Clear Search" button.
- **Image Fallbacks**: Implemented a global image error handler (`app.js`) to elegantly hide broken images from APIs.
- **Settings & Data Management UI**: Cleaned up the settings page, introducing separated cards for Data Management (JSON backup/restore), TV Time Import, and a Danger Zone for data deletion.

### Fixed
- Handled 401 Unauthorized API responses in `tmdb.js` with clear user-facing toast notifications.
- Fixed sidebar brand icon styling and replaced SVG placeholder with actual PWA app icon.
- Improved Dexie database schema mapping for activity logs and statistics.

### Security & Privacy
- Confirmed strictly local architecture. All parsing, importing, and database storage happens client-side with zero telemetrics.
