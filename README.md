# ShowDeck 🎬

ShowDeck is a fast, completely private, offline-first personal entertainment tracker for TV shows and movies. Built with Vanilla JavaScript, it runs entirely in your browser with no tracking, no accounts, and no data leaving your device (other than metadata fetches to TMDB).

## Features

- **Offline-First & PWA**: Install it on your phone or desktop. Works offline using a Service Worker and IndexedDB.
- **Privacy First**: Your data lives in your browser. There is no backend server.
- **BYOK (Bring Your Own Key)**: Connects to the TMDB API using your own API key.
- **TV Time Import**: Easily migrate your data from a TV Time GDPR export `.zip` file. Processes locally!
- **Library & Collections**: Track what you're watching, what you plan to watch, and build custom collections.
- **Statistics**: Visualize your watching habits with beautiful, locally-rendered charts.
- **Modern UI**: Smooth animations, dark mode, responsive design, and glassmorphism styling.

## Getting Started

Since ShowDeck is a static web app, you can run it with any basic web server, or simply host it on GitHub Pages, Vercel, Netlify, etc.

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/showdeck.git
   cd showdeck
   ```
2. Serve locally (using Node, Python, etc):
   ```bash
   npx serve .
   ```
3. Open `http://localhost:3000` in your browser.
4. Go to **Settings** and enter your TMDB API Key.

## Data Portability

Because ShowDeck doesn't use a cloud backend, you own your data.
Go to **Settings > Data Management** to:
- Export your entire library to a JSON file.
- Restore from a previous JSON backup.
- Delete everything instantly.

## Architecture & Tech Stack

- **Vanilla JS**: No React, Vue, or Angular.
- **CSS**: Pure custom CSS with variables and a modular architecture.
- **IndexedDB**: Handled elegantly via [Dexie.js](https://dexie.org/).
- **Service Workers**: Caches static assets, images, and API responses for full offline support.
- **Offline Dependencies**: Includes local versions of Chart.js and JSZip.

For more detailed architectural notes, see `docs/ARCHITECTURE.md`.

## License

MIT License. See `LICENSE` for details.