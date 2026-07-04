# 🎬 ShowDeck — Build Tracker

**Last Updated:** 2026-07-05

---

## Legend
- `[ ]` Not started
- `[/]` In progress
- `[x]` Done
- `[~]` Skipped / deferred

---

## Phase 0: Project Foundation
- [x] Project vision & spec (`PROJECT_IDEA.md`)
- [x] Technical architecture (`ARCHITECTURE.md`)
- [x] Build tracker (`TRACKER.md`)
- [x] Directory structure scaffold
- [x] `index.html` — app shell
- [x] `manifest.json` — PWA manifest
- [x] CSS design system (`variables.css`, `reset.css`, `base.css`, `layout.css`, `components.css`, `utilities.css`)
- [x] Theme toggle (light/dark) with CSS custom properties
- [x] `app.js` — entry point
- [x] `router.js` — hash-based SPA router
- [x] Sidebar navigation component
- [x] Toast notification component

---

## Phase 1: Database & API Layer
- [x] Dexie.js integration
- [x] IndexedDB schema (shows, movies, episodes, collections, tags, activity)
- [x] TMDB API wrapper (`tmdb.js`)
- [x] TVMaze API wrapper (`tvmaze.js`)
- [x] Unified provider interface (`provider.js`)
- [x] API response caching in IndexedDB

---

## Phase 2: Core Pages
- [x] Home / Dashboard page
  - [x] Continue Watching section
  - [x] Recently Added section
  - [x] Quick Statistics cards
  - [x] Upcoming Episodes section
- [x] Search page
  - [x] Search bar with debounce
  - [x] Results grid (shows & movies)
  - [x] Add to library from search
- [x] Library page
  - [x] Grid view
  - [x] List view
  - [x] Compact view
  - [x] Filters (status, genre, rating)
  - [x] Sorting (title, date added, rating)
  - [x] Grouping

---

## Phase 3: Detail Pages & Tracking
- [x] Show detail page
  - [x] Hero section (backdrop + poster)
  - [x] Info & metadata (genres, status, runtime)
  - [x] Status tracking controls (Watching, Completed, etc.)
  - [x] Season/Episode list with bulk mark-as-watched
  - [x] Cast & crew
- [x] Movie detail page
  - [x] Hero section
  - [x] Status tracking
  - [x] Cast & crew
- [x] Episode tracking
  - [x] Mark watched / unwatched
  - [x] Skip / favorite / rewatch
  - [x] Batch mark season
- [x] Rating widget (5-star, 10-point, heart, thumbs)
- [x] Notes editor (per show/movie)

---

## Phase 4: Organization
- [x] Collections CRUD
  - [x] Create / edit / delete collections
  - [x] Add/remove shows & movies
  - [x] Collection detail page
- [x] Tags system
  - [x] Create / assign / remove tags
  - [x] Tag-based filtering
- [x] Collection picker modal
- [x] Tag input component

---

## Phase 5: Statistics & Analytics
- [x] Statistics page
  - [x] Total shows / movies / episodes
  - [x] Hours watched
  - [x] Genre distribution chart
  - [x] Rating distribution chart
- [x] Activity heatmap
  - [x] 30-day activity tracking
  - [x] Tooltips
- [x] Current streak / longest streak

---

## Phase 6: Data Portability
- [x] Export to JSON (Full DB Backup)
- [x] Import from JSON (Merge & Restore)
- [x] Clear all data (Danger zone)
- [x] Settings UI for API keys (BYOA config)

---

## Phase 7: PWA & Offline
- [ ] Service Worker
  - [ ] Cache static assets
  - [ ] Cache API responses
  - [ ] Offline fallback page
- [ ] PWA manifest (icons, theme, display)
- [ ] Install prompt handling
- [ ] Offline indicator in UI

---

## Phase 8: Polish
- [ ] Keyboard shortcuts
- [ ] Toast notifications
- [ ] Loading states / skeletons
- [ ] Empty states
- [ ] Error handling & retry
- [ ] Accessibility audit
- [ ] Responsive design audit (mobile, tablet, desktop)
- [ ] Performance optimization
- [ ] Calendar view (upcoming episodes)

---

## Current Status

**Phase:** 6 ✅ Complete → Moving to Phase 7  
**Last Completed:** Settings page with TMDB BYOA config, full DB JSON export/import, and data wiping.  
**Next Up:** Phase 7 — PWA & Offline (Service Workers)  
**Blockers:** None

---

## Notes

- TMDB API key: placeholder for now, user will swap
- Default theme: light with dark toggle
- Chart.js 4.x for statistics
- Dexie.js for IndexedDB ergonomics
- No build tools — vanilla ES modules loaded via `<script type="module">`
