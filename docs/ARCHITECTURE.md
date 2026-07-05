# 🎬 ShowDeck — Technical Architecture

**Version:** 1.0
**Last Updated:** 2026-07-05

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Structure | HTML5 | Semantic, accessible |
| Styling | CSS3 (Vanilla) | Custom properties, no frameworks |
| Logic | ES Modules (Vanilla JS) | No React/Vue/Angular |
| Storage | IndexedDB (primary) | Dexie.js wrapper for ergonomics |
| Settings | LocalStorage | Theme, preferences only |
| Charts | Chart.js 4.x | Statistics & heatmap |
| Icons | Lucide Icons | SVG icon set |
| API | TMDB + TVMaze | Dual provider, fallback chain |
| Offline | Service Worker + Cache API | PWA |
| Fonts | Inter (Google Fonts) | Modern, clean typography |

---

## Routing

**Hash-based SPA router** (`#/home`, `#/search`, `#/library`, etc.)

Reasons:
- GitHub Pages compatible (no server config)
- Works on all static hosts
- No 404 issues on refresh/direct navigation
- Simple custom implementation

### Route Map

| Route | Page | Description |
|-------|------|-------------|
| `#/` or `#/home` | Home | Dashboard — continue watching, recent, stats |
| `#/search` | Search | Search TMDB/TVMaze for shows & movies |
| `#/library` | Library | User's personal collection |
| `#/show/:id` | Show Detail | Full show info, seasons, episodes |
| `#/movie/:id` | Movie Detail | Full movie info |
| `#/collections` | Collections | User collections & tags |
| `#/stats` | Statistics | Charts, heatmap, insights |
| `#/settings` | Settings | Theme, export/import, preferences |

---

## Directory Structure

```
ShowDeck/
├── index.html                  # Single entry point
├── manifest.json               # PWA manifest
├── service-worker.js           # Offline support
├── css/
│   ├── variables.css           # Design tokens (colors, spacing, fonts)
│   ├── reset.css               # CSS reset / normalize
│   ├── base.css                # Global styles, typography
│   ├── layout.css              # App shell, sidebar, content area
│   ├── components.css          # Reusable component styles
│   ├── pages/
│   │   ├── home.css
│   │   ├── search.css
│   │   ├── library.css
│   │   ├── detail.css
│   │   ├── collections.css
│   │   ├── stats.css
│   │   └── settings.css
│   └── utilities.css           # Utility classes
├── js/
│   ├── app.js                  # App entry, router init
│   ├── router.js               # Hash-based SPA router
│   ├── database/
│   │   ├── db.js               # Dexie.js setup, schema
│   │   ├── shows.js            # Show CRUD operations
│   │   ├── movies.js           # Movie CRUD operations
│   │   ├── episodes.js         # Episode tracking operations
│   │   ├── collections.js      # Collection CRUD
│   │   ├── tags.js             # Tag operations
│   │   ├── notes.js            # Notes CRUD
│   │   └── stats.js            # Statistics queries
│   ├── api/
│   │   ├── tmdb.js             # TMDB API wrapper
│   │   ├── tvmaze.js           # TVMaze API wrapper
│   │   └── provider.js         # Unified provider interface
│   ├── services/
│   │   ├── library.js          # Library business logic
│   │   ├── tracking.js         # Watch tracking logic
│   │   ├── export.js           # Export (JSON/CSV)
│   │   ├── import.js           # Import & restore
│   │   ├── search.js           # Search orchestration
│   │   └── theme.js            # Theme toggle (light/dark)
│   ├── components/
│   │   ├── sidebar.js          # Navigation sidebar
│   │   ├── card.js             # Show/movie card
│   │   ├── modal.js            # Modal dialog
│   │   ├── toast.js            # Toast notifications
│   │   ├── rating.js           # Rating widget
│   │   ├── heatmap.js          # GitHub-style heatmap
│   │   ├── search-bar.js       # Global search bar
│   │   ├── episode-list.js     # Episode checklist
│   │   ├── collection-picker.js # Add to collection
│   │   └── tag-input.js        # Tag input component
│   ├── pages/
│   │   ├── home.js             # Home/Dashboard page
│   │   ├── search.js           # Search page
│   │   ├── library.js          # Library page
│   │   ├── show-detail.js      # Show detail page
│   │   ├── movie-detail.js     # Movie detail page
│   │   ├── collections.js      # Collections page
│   │   ├── stats.js            # Statistics page
│   │   └── settings.js         # Settings page
│   └── utils/
│       ├── dom.js              # DOM helpers
│       ├── date.js             # Date formatting
│       ├── debounce.js         # Debounce/throttle
│       ├── cache.js            # Poster/metadata cache
│       └── constants.js        # App constants
├── assets/
│   ├── icons/                  # App icons (PWA)
│   ├── images/                 # Static images
│   └── screenshots/            # PWA screenshots
└── docs/
    ├── PROJECT_IDEA.md
    ├── ARCHITECTURE.md
    └── TRACKER.md
```

---

## Database Schema (IndexedDB via Dexie.js)

### `shows`
| Field | Type | Description |
|-------|------|-------------|
| id | number (auto) | Internal ID |
| tmdbId | number | TMDB ID |
| tvmazeId | number | TVMaze ID |
| title | string | Show title |
| posterPath | string | Poster URL |
| backdropPath | string | Backdrop URL |
| overview | string | Description |
| genres | string[] | Genre list |
| status | string | Airing status |
| firstAirDate | string | First air date |
| totalSeasons | number | Season count |
| totalEpisodes | number | Episode count |
| trackingStatus | string | watching/completed/paused/dropped/plan/rewatching |
| rating | number | User rating |
| ratingType | string | star5/point10/heart/thumbs |
| notes | string | User notes |
| tags | string[] | User tags |
| collections | string[] | Collection IDs |
| addedAt | Date | When added to library |
| updatedAt | Date | Last updated |
| cachedAt | Date | Last metadata refresh |

### `movies`
Same structure minus `totalSeasons`, `totalEpisodes`, `episodes`. Adds `runtime`, `releaseDate`.

### `episodes`
| Field | Type | Description |
|-------|------|-------------|
| id | number (auto) | Internal ID |
| showId | number | FK to shows |
| tmdbId | number | TMDB episode ID |
| season | number | Season number |
| episode | number | Episode number |
| title | string | Episode title |
| airDate | string | Air date |
| watched | boolean | Watch status |
| watchedAt | Date | When marked watched |
| favorite | boolean | Favorited |
| skipped | boolean | Skipped |

### `collections`
| Field | Type | Description |
|-------|------|-------------|
| id | number (auto) | Internal ID |
| name | string | Collection name |
| description | string | Description |
| icon | string | Emoji or icon |
| color | string | Accent color |
| itemIds | string[] | Show/movie IDs |
| createdAt | Date | Created date |

### `tags`
| Field | Type | Description |
|-------|------|-------------|
| id | number (auto) | Internal ID |
| name | string | Tag name |
| color | string | Tag color |

### `activity`
| Field | Type | Description |
|-------|------|-------------|
| id | number (auto) | Internal ID |
| type | string | watched/rated/added/etc |
| itemId | number | Show/movie ID |
| itemType | string | show/movie |
| detail | string | Extra info |
| date | Date | Activity date |

---

## API Strategy

### TMDB (Primary)
- Rich metadata, posters, backdrops, cast, crew
- Requires API key (placeholder for now)
- Rate limited — implement request queue + cache

### TVMaze (Fallback)
- No API key required
- Episode schedules, episode-level detail
- Used for episode air dates, schedule calendar

### Unified Provider
- `provider.js` abstracts both APIs behind single interface
- Search → TMDB first, fallback TVMaze
- Episode data → TVMaze primary (better granularity)
- Poster/backdrop → TMDB only

---

## Theme System

- Default: **Light theme**
- Toggle: Light ↔ Dark
- Implementation: CSS custom properties on `:root`
- Persisted in `LocalStorage`
- Respects `prefers-color-scheme` on first visit

---

## PWA Features

- `manifest.json` — installable, standalone display
- Service Worker — cache-first for static assets, network-first for API
- Offline — full library/tracking works offline
- Background sync — queue API calls when offline (future)

---

## Performance Strategy

- Lazy-load pages (dynamic `import()`)
- Virtual scroll for large lists
- Image lazy loading (`loading="lazy"`)
- Debounced search input
- IndexedDB indexed queries
- Minimal DOM manipulation (template-based rendering)
- Cache API responses in IndexedDB
