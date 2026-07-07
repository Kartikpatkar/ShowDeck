# Privacy Policy for ShowDeck

**Last Updated:** July 5, 2026

Your privacy and the security of your data are of paramount importance. This Privacy Policy details how **ShowDeck** handles data, what information is stored, and your controls over your personal data.

---

## 1. What Data We Collect

To provide its core functionality (entertainment tracking), ShowDeck stores the following information locally on your device:

* **Authentication Information**: Your personal TMDB API Key.
* **Library Metadata**: Show and movie titles, IDs, posters, overviews, ratings, watch status, and personal notes.
* **User Preferences**: UI configuration settings, such as your theme preference (light/dark mode, accent colors), your display name, and adult content toggle preference.

---

## 2. Adult Content & Filtering

By default, ShowDeck enforces a "safe" search environment by automatically filtering out adult (PG-18+) content when making requests to the TMDB API. 

If you choose to enable the **Include Adult Content** toggle in the onboarding or settings screen, you must confirm that you are of legal age. Your preference is stored purely locally (`localStorage`) and simply instructs your browser to include the `include_adult=true` flag when talking directly to TMDB. We do not report, track, or monitor your adult content preference or viewing history.

## 3. How Data Is Stored and Transmitted

ShowDeck is designed with an **offline-first, zero-tracking architecture**:

* **Local Storage**: All your data is stored locally on your physical device using the browser's IndexedDB (`Dexie.js`) and `localStorage`.
* **No Cloud Syncing**: The application does **not** use any cloud services for storage. Your data never leaves your device unless you manually export it.
* **No Backend Servers**: ShowDeck does **not** transmit any usage data, analytics, or library data to any ShowDeck-owned servers. We do not run a backend database.
* **Direct API Calls**: When searching for shows or syncing data, your browser makes requests directly to `api.themoviedb.org` and `api.tvmaze.com`. These third-party services may collect standard connection logs (like IP addresses) subject to their own privacy policies.

---

## 4. Data Portability & Deletion

You have complete control over your data:

* **Export**: You can export your entire library at any time to a JSON or CSV file via the Settings page.
* **Deletion**: You can instantly and permanently delete all your data using the "Wipe All Data" button in Settings. This clears IndexedDB and all local storage keys, leaving no trace behind.

---

## 5. Analytics and Tracking

**We do not track you.**
ShowDeck contains:
* Zero analytics scripts (no Google Analytics, Mixpanel, etc.)
* Zero tracking pixels
* Zero advertising networks

---

## 6. Changes to This Policy

We may update our Privacy Policy from time to time. Any changes will be documented in this repository. 

If you have any questions regarding this Privacy Policy, please open an issue on the [GitHub repository](https://github.com/Kartikpatkar/ShowDeck/issues).
