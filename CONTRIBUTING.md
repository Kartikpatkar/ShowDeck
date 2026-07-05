# Contributing to ShowDeck

First off, thank you for considering contributing to ShowDeck! It's people like you that make open-source tools great.

## Core Philosophy

ShowDeck is built on a few core principles:
1. **Vanilla over Frameworks**: We do not use React, Vue, Angular, or bundlers like Webpack/Vite in production. The goal is a clean, readable, static HTML/JS/CSS stack.
2. **Local First**: All data must remain on the user's device. Features requiring a backend database or user authentication will be rejected.
3. **Privacy First**: No tracking scripts, no analytics.
4. **Performance**: Animations and UI elements should be buttery smooth (targeting 60fps). Avoid main-thread blocking operations.

## How to Contribute

### 1. Reporting Bugs
- Use the GitHub Issue Tracker.
- Describe the bug clearly. Include steps to reproduce, expected behavior, and actual behavior.
- Include your browser version and OS.

### 2. Suggesting Enhancements
- Open an issue outlining the feature.
- Explain *why* this enhancement would be useful to most users.
- Keep the core philosophy in mind (e.g., if the feature requires a server, it's not a fit for ShowDeck).

### 3. Submitting Pull Requests
1. Fork the repository.
2. Create a new branch for your feature or bugfix (`git checkout -b feature-name`).
3. Make your changes. Ensure you follow the existing code style (see below).
4. Test your changes locally. Ensure offline support (`sw.js`) and PWA features are not broken.
5. Commit your changes with descriptive commit messages.
6. Push to your branch and open a Pull Request.

## Code Style Guide

### JavaScript
- Use ES6 Modules (`import`/`export`).
- Use `async`/`await` for asynchronous operations.
- Variables and functions should be `camelCase`.
- Classes should be `PascalCase`.
- We use the utility functions provided in `js/utils/dom.js` (like `el()` and `$()`) instead of generic DOM manipulation where possible to keep code concise.

### CSS
- Use custom properties (CSS variables) defined in `css/variables.css` for colors, spacing, and typography.
- Avoid inline styles.
- Avoid using `!important`.
- Keep CSS modularized by component or page.

## Testing Your Changes
To run the app locally during development:
1. Ensure you have Node.js installed.
2. Run `npx serve .` in the root directory.
3. Open `http://localhost:3000`.
4. Check the DevTools console for errors and use the "Network" tab to simulate offline mode.

Thank you for contributing! 🎬
