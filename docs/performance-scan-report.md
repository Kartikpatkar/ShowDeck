# Perf/A11y Report — ShowDeck (kartikpatkar.github.io/ShowDeck/)

Source: Lighthouse-style scan. Accessibility score: 91.

## Fix Priority

### 1. Render-blocking requests — save ~1,490ms
CSS/JS block initial render, delay LCP. Files, all 1st-party GH Pages:
- `lib/chart.umd.js` 69.2 KiB, 1200ms
- `lib/jszip.min.js` 28.7 KiB, 750ms
- `css/components.css` 3.9 KiB, 450ms
- `css/utilities.css` 1.6 KiB, 450ms
- `css/layout.css` 2.5 KiB, 450ms
- `css/reset.css` 1.5 KiB, 450ms
- `css/base.css` 1.8 KiB, 450ms
- `pages/pages.css` 2.2 KiB, 150ms
- `pages/onboarding.css` 1.7 KiB, 150ms
- `css/variables.css` 2.7 KiB, 150ms
- Google Fonts `Inter` CSS, 1.5 KiB, 750ms

Fix: defer/async non-critical JS (`chart.umd.js`, `jszip.min.js` — only needed later, not at load). Inline critical CSS, defer rest. Combine small CSS files (9 separate files = 9 requests, big overhead vs size).

### 2. Reduce unused JS — save ~84 KiB
- `chart.umd.js`: 68.4 KiB loaded, 60.9 KiB unused → lazy-load only when chart view needed.
- `jszip.min.js`: 27.9 KiB loaded, 22.7 KiB unused → lazy-load only when export/import triggered.

### 3. Cache lifetimes too short — save ~150 KiB on repeat visits
All assets cached only **10 min** TTL. Bump `Cache-Control` max-age way up (days/weeks) for static hashed assets: `chart.umd.js`, `jszip.min.js`, `app.js`, `onboarding.js`, `components.css`, `sidebar.js`, `dom.js`, `variables.css`, `layout.css`, `pages.css`, `router.js`, `base.css`, `onboarding.css`, `utilities.css`, `reset.css`, `icon-192.png`. Note: GitHub Pages sets cache headers itself, may need cache-busted filenames (hash in name) + long max-age instead of relying on GH Pages default.

### 4. LCP element render delay — 2,560ms
LCP element is the `<p class="sub">` text ("ShowDeck is your private, local-first media tracker..."). TTFB is fine (0ms) — all delay is render-blocking resources above. Fixing #1 fixes this.

### 5. Forced reflow in app.js
- `app.js:39:17` — 54ms reflow
- `app.js:79:30` — 63ms reflow

JS reads geometry (e.g. `offsetWidth`) right after DOM/style change. Fix: batch DOM reads before writes, or cache measured values, avoid read-after-write layout thrashing at those two lines.

### 6. Long main-thread task
`chart.umd.js` causes 71ms task at 1810ms mark. Ties back to #2 — lazy-load this lib so it's not blocking main thread on initial load.

### 7. [Accessibility] Low color contrast — 3 elements
Insufficient contrast ratio on:
- `#progressLabel` ("Step 1 of 4")
- Privacy Policy link (`<a href="privacy.html">`)
- Terms of Use link (`<a href="terms.html">`)
Fix: darken/lighten text or bg color on these to meet WCAG contrast ratio.

### 8. [Accessibility] Invalid ARIA role usage
`<aside class="sidebar" role="navigation">` — role possibly not valid/needed on `<aside>` per Lighthouse. Check: `<aside>` already implies `complementary` landmark; adding `role="navigation"` may conflict. Recommend either drop the role (if sidebar isn't primary nav) or use `<nav>` element instead.

## Passed
19 passed audits (not detailed in source — see full Lighthouse report for list).

## Network Chain Note
Critical path max latency: 1,703ms. Chain: `/ShowDeck/` → CSS/JS bundle → `manifest.json` (loaded twice — check for duplicate fetch of `manifest.json`, likely a bug/redundant request).

Preconnects already set for `fonts.googleapis.com` and `fonts.gstatic.com` — good, no action needed there.
