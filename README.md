# ShowDeck

A privacy-first, offline-first, local-first personal entertainment tracker built as a Progressive Web App (PWA).

ShowDeck allows you to track your favorite TV shows and movies, rate episodes, take personal notes, and view your watch statistics—all without creating an account or sending your data to a third-party server.

## Features

- **Local-First Architecture:** All your data is stored locally on your device using IndexedDB (Dexie.js).
- **Offline Support:** The app caches itself using a Service Worker, allowing you to view your library even without an internet connection.
- **Direct API Connections:** ShowDeck connects directly to TMDB (The Movie Database) and TVMaze from your browser. You provide your own TMDB API key.
- **Privacy Guaranteed:** No analytics, no tracking pixels, no backend servers. Your data never leaves your device unless you export it.
- **Rich Organization:** Track status (Watching, Completed, Plan to Watch, etc.), rate shows out of 5 stars, and write personal notes for specific episodes.
- **Customization:** Choose between Light and Dark mode, or customize the app's accent color (Purple, Blue, Green, Red).
- **Data Portability:** Export your entire library to JSON or CSV for use in spreadsheets or to back up to another device. You can also generate a shareable link of your library stats.
- **Import from TV Time:** Easily migrate your data from TV Time via a ZIP export.

## Installation

Since ShowDeck is a Progressive Web App (PWA), you can install it directly to your home screen or desktop:

1. **iOS (Safari):** Tap the Share button, then select "Add to Home Screen".
2. **Android (Chrome):** Tap the menu button, then select "Install app" or "Add to Home Screen".
3. **Desktop (Chrome/Edge):** Click the installation icon on the right side of the URL bar.

## Getting Started

1. Open ShowDeck and navigate to **Settings**.
2. Under **API Providers**, enter a valid [TMDB API Key (v3 auth)](https://developer.themoviedb.org/docs). This key is stored securely on your device.
3. Start searching for shows and movies!

## Tech Stack

ShowDeck is built using vanilla web technologies to ensure maximum performance, zero dependencies, and long-term stability:

- **HTML5 & CSS3** (Vanilla CSS with custom properties for theming)
- **Vanilla JavaScript** (ES Modules)
- **Dexie.js** (IndexedDB wrapper for local storage)
- **Chart.js** (For rendering statistics)
- **JSZip** (For TV Time migrations)

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to ShowDeck.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.