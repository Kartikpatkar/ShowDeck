# Security Scan Report — kartikpatkar.github.io

Source: Web Security Scanner (security-skener.gradovi.rs), scanned 12.08.2026
Overall grade: **F (39/100)** — Critical | 61 checks, 11 issues (1 High, 4 Medium, 6 Low)
Site is static, hosted on GitHub Pages.

## Fix Priority List

### 1. [HIGH] Missing Content-Security-Policy header
Add CSP header to prevent XSS. Since GitHub Pages can't set HTTP headers directly, add via `<meta>` tag in HTML `<head>`:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'">
```
Adjust `default-src` if site loads external fonts/scripts/styles (e.g. add `script-src`, `style-src` as needed).

### 2. [MEDIUM] Missing X-Frame-Options (clickjacking protection)
GitHub Pages doesn't support custom HTTP headers. Workaround: add frame-busting JS or rely on CSP `frame-ancestors` directive instead:
```html
<meta http-equiv="Content-Security-Policy" content="frame-ancestors 'none'">
```

### 3. [MEDIUM] Missing X-Content-Type-Options
Same limitation — no custom headers on GitHub Pages. If this matters, consider moving to a host that allows custom headers (Netlify, Vercel, Cloudflare Pages) via a `_headers` file, e.g.:
```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Cross-Origin-Opener-Policy: same-origin
```

### 4. [MEDIUM] No privacy policy page
Add a privacy policy page, link it in the footer.

### 5. [MEDIUM] No cookie consent mechanism
Only relevant if site sets non-essential cookies. Scan found **no cookies present** on homepage — check if any tracking/analytics script is added later; if so add a consent banner (e.g. CookieConsent, Cookiebot).

### 6. [LOW] Referrer-Policy missing
Add via meta tag (headers unavailable on GH Pages):
```html
<meta name="referrer" content="strict-origin-when-cross-origin">
```

### 7. [LOW] Permissions-Policy missing
Requires HTTP header — not settable via meta tag. Needs alt host or reverse proxy/CDN in front of GitHub Pages (e.g. Cloudflare) to add.

### 8. [LOW] Cross-Origin-Opener-Policy missing
Same limitation as above — requires HTTP header, needs CDN/proxy in front of GH Pages.

### 9. [LOW] Domain not in HSTS preload list
HSTS header is already active (`max-age=31556952`). To preload: submit domain at https://hstspreload.org/ (needs `includeSubDomains` + `preload` directives, which again require header-level control — check if GitHub Pages custom domain config supports this, or front with Cloudflare).

### 10. [LOW] No security.txt
Add file at `/.well-known/security.txt`:
```
Contact: mailto:your-email@example.com
Expires: 2026-12-31T23:59:00Z
```

### 11. [LOW] Terms of use page not found
Add a terms-of-use page, link in footer (same pattern as privacy policy).

## Already Good (no action needed)
- SSL/TLS: valid cert (expires in 80 days), TLS 1.3, HSTS active
- CAA DNS record present (6 rules)
- robots.txt present, no sensitive paths exposed
- No inline API keys or dangerous JS patterns
- No known vulnerable JS libraries
- No cookies on homepage
- HTTP→HTTPS redirect works
- SEO: 100% (title, meta description, canonical, OG tags, Twitter cards, sitemap.xml, structured data/JSON-LD all present)
- Performance/Accessibility: 100% (fast TTFB 38ms, page size 22KB, gzip, cache headers, HTTP/2, proper ARIA landmarks, heading hierarchy, labeled form fields)
- GDPR: no third-party trackers, no tracking cookies, forms use HTTPS

## Key Constraint
Site is on **GitHub Pages**, which does not allow setting custom HTTP response headers. Any fix requiring a real header (X-Frame-Options, X-Content-Type-Options, Permissions-Policy, COOP, full HSTS preload) needs either:
- A meta-tag equivalent where one exists (CSP, Referrer-Policy), or
- Fronting the site with a CDN/proxy that supports custom headers (Cloudflare Pages, Netlify, Vercel), or
- Migrating hosting.
