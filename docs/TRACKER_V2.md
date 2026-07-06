# ShowDeck V2 Task Tracker

## Phase 1: UI Polish & Core Enhancements (Low Risk)
- `[x]` **Feature 17: Premium Theme Collection**
  - `[x]` Add new CSS variable palettes (OLED Black, Dracula, Nord, Catppuccin, Tokyo Night).
  - `[x]` Update Settings UI to support the expanded list of themes.
- `[x]` **Feature 16: Better Progress Visualization**
  - `[x]` Replace text-only progress (e.g., "10/13") with visual CSS progress bars.
  - `[x]` Calculate and display percentage completion on show detail pages.
- `[x]` **Feature 2 & 14: Continue Watching 2.0 (Netflix-Style)**
  - `[x]` Update `home.js` Continue Watching cards to show progress bars.
  - `[x]` Add "Remaining Episodes" counter to cards.
  - `[x]` Display "Next Episode" title/number if data is available.

## Phase 2: History & Calendar (Read-Only Data Presentation)
- `[x]` **Feature 1 & 10: Activity Timeline & Watch History**
  - `[x]` Build a new `history.js` page to act as the central activity diary.
  - `[x]` Query `db.activity`, group chronologically by date (Today, Yesterday, etc.).
  - `[x]` Add simple filters (TV vs. Movies) to the history view.
- `[x]` **Feature 8: Watching Heatmap**
  - `[x]` Implement a month-wise heatmap component on the Stats or History page.
  - `[x]` Filter logic: Only track data for items that exist in the user's library.
- `[x]` **Feature 4: Calendar**
  - `[x]` Build a new `calendar.js` view.
  - `[x]` Query `db.episodes` for future air dates of tracked shows and plot them in a monthly/timeline view.

## Phase 3: Architecture Upgrades & Storage (Dexie v2 Schema)
- `[x]` **Database Migration Engine**
  - `[x]` Implement `db.version(2)` in `db.js`.
  - `[x]` Pre-define new schemas for `goals`, `backups`, and `smartCollections`.
- `[x]` **Feature 12: Versioned Backups (Robust & Fail-Safe)**
  - `[x]` Create backup worker logic with strict `try/catch` and IndexedDB transactions to prevent mid-write corruption.
  - `[x]` Implement a 3-tier rolling backup strategy (Daily, Weekly, Monthly) to manage storage limits.
  - `[x]` Build Restore UI in Settings with fallback warnings.
- `[x]` **Feature 6: Personal Goals**
  - `[x]` Build UI to define goals (e.g., "Watch 100 Movies").
  - `[x]` Link progress engine to `db.activity` to auto-update progress bars.
- `[x]` **Feature 15: Smart Collections**
  - `[x]` Build rule-engine logic (e.g., `Genre = Crime + Rating > 8`).
  - `[x]` Dynamically filter library contents based on saved rules.

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
