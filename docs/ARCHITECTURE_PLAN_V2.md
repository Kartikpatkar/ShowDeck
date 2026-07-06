# ShowDeck v2+ Architecture & Feasibility Tracker

This document breaks down the **VERSION_02.md** roadmap, analyzing the technical feasibility of each feature within our current Vanilla JS / Dexie.js / Offline-First architecture. 

A primary focus is placed on **Zero Data Corruption** — ensuring that when we launch these updates, the existing user base's IndexedDB data remains intact and flawlessly migrates to the new schemas.

---

## 🏗️ Data Migration Strategy (The Golden Rule)
To guarantee we do not corrupt user data during the v2 rollout, we will utilize **Dexie.js Schema Upgrades**. 
Currently, the app runs on schema version `1`. When v2 launches, we will bump the version:
```javascript
db.version(2).stores({
  // Existing tables remain untouched
  shows: '++id, tmdbId, tvmazeId, trackingStatus, addedAt, updatedAt',
  movies: '++id, tmdbId, trackingStatus, addedAt, updatedAt',
  episodes: '++id, showId, season, episode, watchedAt',
  // New v2 tables
  goals: '++id, type, target, progress',
  backups: '++id, date, type',
  smartCollections: '++id, name'
}).upgrade(tx => {
  // Safe data transformations go here if needed
});
```
**Rule 1:** Never delete existing columns.
**Rule 2:** New features must gracefully handle `null` or `undefined` for older data.
**Rule 3:** Automated background backups will trigger *before* a schema migration executes.

---

## 🟢 Highly Feasible (Low Risk, High Impact)
These features fit perfectly into our current data models and require mostly UI/UX additions.

### Feature 1 & 10: Activity Timeline & Watch History
- **Current State:** We already log every action into the `db.activity` table (added, watched, rated).
- **Implementation:** Query `db.activity`, sort by `date`, and render via infinite scrolling.
- **Data Risk:** None. The data already exists.

### Feature 2, 14 & 16: Continue Watching 2.0 & Progress Visualization
- **Current State:** We already calculate watched vs total episodes in `getShowProgress()`.
- **Implementation:** Mostly CSS/HTML updates (progress bars, calculating remaining counts).
- **Data Risk:** None.

### Feature 17: Premium Theme Collection
- **Current State:** We have a robust CSS variable system (`[data-theme]`).
- **Implementation:** Simply add new color palettes to `variables.css`.
- **Data Risk:** None.

---

## 🟡 Moderately Challenging (Requires Schema Updates or UI Complexity)
These features require careful planning, new IndexedDB tables, or complex DOM manipulation.

### Feature 3 & 7: Modular Dashboard & Widgets
- **Challenge:** Building a drag-and-drop sorting system in pure Vanilla JS without heavy libraries is tricky. 
- **Implementation:** Store widget order as an array in `localStorage` (e.g., `['continue', 'upcoming', 'stats']`). Render the DOM in that loop order.
- **Data Risk:** Low. Just localStorage additions.

### Feature 4 & 8: Calendar & Watching Heatmap
- **Challenge:** Creating a responsive, grid-based monthly calendar and a 365-day GitHub-style heatmap requires significant DOM generation.
- **Implementation:** Query `db.episodes` for air dates (Calendar) and `db.activity` for watch dates (Heatmap). Group by day.
- **Data Risk:** Low, but performance could dip if we generate 365 DOM nodes inefficiently.

### Feature 11: Advanced Statistics
- **Challenge:** Aggregating data across thousands of shows/movies (e.g., "Favorite Network" or "Longest Streak") takes time.
- **Implementation:** Compute these stats in a non-blocking `setTimeout` or Web Worker, and cache the result in IndexedDB so the Stats page loads instantly.
- **Data Risk:** None, it's read-only analysis.

### Feature 12: Versioned Backups
- **Challenge:** IndexedDB size limits. Storing full daily JSON dumps of a massive library could crash the browser storage quota.
- **Implementation:** Limit to 3 rolling backups (1 Daily, 1 Weekly, 1 Monthly). Compress the JSON before storing.
- **Data Risk:** High if the backup fails mid-write. Requires strict `try/catch` atomic transactions.

### Feature 15: Smart Collections
- **Challenge:** Translating user-defined rules (e.g., "Genre = Crime + Rating > 8") into Dexie queries on the fly.
- **Implementation:** Save the rules as JSON in a new `smartCollections` table. Evaluate the rules by pulling all library items and applying a JavaScript `.filter()`.

---

## 🔴 Highly Challenging (Technical Hurdles)
These features conflict with our core principles or API constraints.

### Feature 9: Rich Search (with Runtimes & Episode Counts)
- **The Problem:** The TMDB `/search/multi` API does *not* return `number_of_episodes` or exact `runtime`. To get that data, we would have to make a separate API call for *every single search result*.
- **Why it's bad:** If you search "Batman" and get 20 results, making 20 parallel API calls will immediately hit TMDB's rate limit (429 errors) and slow the search to a crawl.
- **Verdict:** We must stick to the data provided by the search endpoint (Title, Year, Poster, Rating). Rich data will only load when the user clicks into the Detail page.

### Feature 18: Plugin Architecture
- **The Problem:** True plugins require executing external, third-party JavaScript. We recently hardened our `Content-Security-Policy (CSP)` to completely block `unsafe-eval` and third-party scripts to protect user data from XSS attacks.
- **Why it's bad:** Allowing plugins breaks our "Privacy First" and "Secure" guarantees. A malicious plugin could steal the user's TMDB API key or library data.
- **Verdict:** True plugins cannot be supported safely. Instead, we can build *Opt-In Integrations* (e.g., an official Trakt sync) directly into the core code.

### Feature 13: Intelligent Import (Merge UI)
- **The Problem:** Building a UI that asks the user to manually resolve merge conflicts for 500 duplicated shows during a TV Time import would be a nightmare UX.
- **Verdict:** We should handle this under the hood. "Upsert" logic: If `tmdbId` exists, quietly update the `trackingStatus` and merge episodes, rather than bothering the user.

---

## 📝 Next Steps for V2 Execution
1. **Approval:** Review this feasibility report.
2. **Phase 1 (UI/UX):** Begin with the zero-risk UI updates (Themes, Continue Watching redesign, Heatmaps).
3. **Phase 2 (Data):** Bump IndexedDB to Version 2, add the `backups` table, and implement automated safe-guard backups.
4. **Phase 3 (Logic):** Implement Smart Collections, Advanced Stats, and the Activity Timeline.
