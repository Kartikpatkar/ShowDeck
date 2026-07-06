# ShowDeck V2 Task Tracker

## Phase 1: UI Polish & Core Enhancements (Low Risk)
- `[ ]` **Feature 17: Premium Theme Collection**
  - `[ ]` Add new CSS variable palettes (OLED Black, Dracula, Nord, Catppuccin, Tokyo Night).
  - `[ ]` Update Settings UI to support the expanded list of themes.
- `[ ]` **Feature 16: Better Progress Visualization**
  - `[ ]` Replace text-only progress (e.g., "10/13") with visual CSS progress bars.
  - `[ ]` Calculate and display percentage completion on show detail pages.
- `[ ]` **Feature 2 & 14: Continue Watching 2.0 (Netflix-Style)**
  - `[ ]` Update `home.js` Continue Watching cards to show progress bars.
  - `[ ]` Add "Remaining Episodes" counter to cards.
  - `[ ]` Display "Next Episode" title/number if data is available.

## Phase 2: History & Calendar (Read-Only Data Presentation)
- `[ ]` **Feature 1 & 10: Activity Timeline & Watch History**
  - `[ ]` Build a new `history.js` page to act as the central activity diary.
  - `[ ]` Query `db.activity`, group chronologically by date (Today, Yesterday, etc.).
  - `[ ]` Add simple filters (TV vs. Movies) to the history view.
- `[ ]` **Feature 8: Watching Heatmap**
  - `[ ]` Implement a month-wise heatmap component on the Stats or History page.
  - `[ ]` Filter logic: Only track data for items that exist in the user's library.
- `[ ]` **Feature 4: Calendar**
  - `[ ]` Build a new `calendar.js` view.
  - `[ ]` Query `db.episodes` for future air dates of tracked shows and plot them in a monthly/timeline view.

## Phase 3: Architecture Upgrades & Storage (Dexie v2 Schema)
- `[ ]` **Database Migration Engine**
  - `[ ]` Implement `db.version(2)` in `db.js`.
  - `[ ]` Pre-define new schemas for `goals`, `backups`, and `smartCollections`.
- `[ ]` **Feature 12: Versioned Backups (Robust & Fail-Safe)**
  - `[ ]` Create backup worker logic with strict `try/catch` and IndexedDB transactions to prevent mid-write corruption.
  - `[ ]` Implement a 3-tier rolling backup strategy (Daily, Weekly, Monthly) to manage storage limits.
  - `[ ]` Build Restore UI in Settings with fallback warnings.
- `[ ]` **Feature 6: Personal Goals**
  - `[ ]` Build UI to define goals (e.g., "Watch 100 Movies").
  - `[ ]` Link progress engine to `db.activity` to auto-update progress bars.
- `[ ]` **Feature 15: Smart Collections**
  - `[ ]` Build rule-engine logic (e.g., `Genre = Crime + Rating > 8`).
  - `[ ]` Dynamically filter library contents based on saved rules.

## Phase 4: Analytics & Gamification
- `[ ]` **Feature 11: Advanced Statistics**
  - `[ ]` Expand `stats.js` with complex queries (Longest Streak, Favorite Genre).
  - `[ ]` Add asynchronous caching for heavy queries to maintain UI speed.
  - `[ ]` Add new visualization charts.
- `[ ]` **Feature 5: Achievement System**
  - `[ ]` Define baseline local achievements (Night Owl, Binge Master).
  - `[ ]` Create background evaluation logic to trigger achievement popups on milestones.
- `[ ]` **Feature 3 & 7: Dashboard Modularity**
  - `[ ]` Refactor `home.js` to render dynamic widget arrays based on `localStorage` preferences.
  - `[ ]` Build a widget manager modal for users to toggle/reorder dashboard sections.

---

### 🛑 Parked Features (Deferred for later evaluation)
- *Feature 9: Rich Search (Deferred to avoid TMDB API rate-limiting constraints).*
- *Feature 13: Intelligent Import Merge UI (Deferred due to UX complexity; fallback to silent upserts).*
- *Feature 18: Plugin Architecture (Deferred due to CSP security conflicts).*
