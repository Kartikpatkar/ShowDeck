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
- [ ] Dexie.js integration
- [ ] IndexedDB schema (shows, movies, episodes, collections, tags, activity)
- [ ] TMDB API wrapper (`tmdb.js`)
- [ ] TVMaze API wrapper (`tvmaze.js`)
- [ ] Unified provider interface (`provider.js`)
- [ ] API response caching in IndexedDB

---

## Phase 2: Core Pages
- [ ] Home / Dashboard page
  - [ ] Continue Watching section
  - [ ] Recently Added section
  - [ ] Quick Statistics cards
  - [ ] Upcoming Episodes section
- [ ] Search page
  - [ ] Search bar with debounce
  - [ ] Results grid (shows & movies)
  - [ ] Add to library from search
- [ ] Library page
  - [ ] Grid view
  - [ ] List view
  - [ ] Compact view
  - [ ] Filters (status, genre, rating)
  - [ ] Sorting (title, date added, rating)
  - [ ] Grouping

---

## Phase 3: Detail Pages & Tracking
- [ ] Show detail page
  - [ ] Poster & backdrop
  - [ ] Overview, genres, status
  - [ ] Season/episode list
  - [ ] Cast & crew
  - [ ] Streaming platforms
  - [ ] Progress bar
- [ ] Movie detail page
  - [ ] Same layout as show (minus episodes)
- [ ] Episode tracking
  - [ ] Mark watched / unwatched
  - [ ] Skip / favorite / rewatch
  - [ ] Batch mark season
- [ ] Rating widget (5-star, 10-point, heart, thumbs)
- [ ] Notes editor (per show/movie)

---

## Phase 4: Organization
- [ ] Collections CRUD
  - [ ] Create / edit / delete collections
  - [ ] Add/remove shows & movies
  - [ ] Collection detail page
- [ ] Tags system
  - [ ] Create / assign / remove tags
  - [ ] Tag-based filtering
- [ ] Collection picker modal
- [ ] Tag input component

---

## Phase 5: Statistics & Analytics
- [ ] Statistics page
  - [ ] Total shows / movies / episodes
  - [ ] Hours watched
  - [ ] Genre distribution chart
  - [ ] Completion rate
  - [ ] Rating distribution
- [ ] GitHub-style activity heatmap
  - [ ] Daily watching history
  - [ ] Year view
  - [ ] Tooltips
- [ ] Current streak / longest streak
- [ ] Most active month / year

---

## Phase 6: Data Portability
- [ ] Export to JSON
- [ ] Export to CSV
- [ ] Import from JSON
- [ ] Full backup & restore
- [ ] Data validation on import

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

**Phase:** 0 ✅ Complete → Moving to Phase 1  
**Last Completed:** Full app shell — sidebar, router, theme toggle, CSS design system, home page  
**Next Up:** Phase 1 — Dexie.js + IndexedDB schema + TMDB/TVMaze API wrappers  
**Blockers:** None

---

## Notes

- TMDB API key: placeholder for now, user will swap
- Default theme: light with dark toggle
- Chart.js 4.x for statistics
- Dexie.js for IndexedDB ergonomics
- No build tools — vanilla ES modules loaded via `<script type="module">`
