# 🎬 ShowDeck – Personal Entertainment Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-1.6.2-blue.svg)](#)
[![Progressive Web App](https://img.shields.io/badge/PWA-Ready-green.svg)](#)
[![Vanilla JS](https://img.shields.io/badge/Tech-Vanilla%20JS-F7DF1E.svg)](#)

> **Tagline:** *Track, rate, and organize your favorite TV shows and movies with complete privacy.*

---

## ✨ Overview

**ShowDeck** is a modern, offline-first Progressive Web App (PWA) built specifically for entertainment enthusiasts who want to track their watch history without compromising their privacy.

Unlike traditional entertainment trackers (like Trakt, TV Time, or Letterboxd), ShowDeck focuses on:

* Local-first privacy (No mandated accounts, optional Google Drive syncing)
* Direct TMDB & TVMaze API connections
* Offline-first Progressive Web App (PWA) architecture
* High-performance, zero-framework Vanilla JS
* Fast, native-like mobile experience powered by modern Web Components
* 100% data ownership

Whether you're tracking currently airing shows, building a backlog of movies, or taking personal notes on individual episodes, ShowDeck helps you stay organized locally.

---

## 🚀 Key Features

### 🗂️ Unified Entertainment Library
Organize your media into standard lists:
* Watching
* Completed
* Plan to Watch
* On Hold
* Dropped

### 🔍 Direct API Integration
ShowDeck connects directly to TMDB (The Movie Database) and TVMaze from your device. You supply your own free TMDB API key, meaning there is no middleman server tracking your requests.

### 📝 Episode Notes & Ratings
* Rate shows and movies on a 5-star scale.
* Mark individual episodes as watched.
* Write private, auto-saving notes for any episode.

### 🛡️ Adult Content Control
By default, ShowDeck filters out adult (PG-18+) content from search results to provide a safe experience. You can explicitly opt-in to view adult content via the Settings or Onboarding flow. Opting in requires confirmation that you are of legal age.

### 🎨 Themes & Customization
Personalize your app experience with multiple accent colors:
* Purple, Blue, Green, Red
* Custom Hex Color Picker
* Native Dark/Light mode support

### 💾 Data Portability & Sharing
* Export your entire database to JSON or CSV.
* Import your existing watch history from TV Time (via ZIP export).
* Generate a read-only, encoded Share Link to show off your library stats to friends.

---

## 💻 Tech Stack

ShowDeck is built using vanilla web technologies to ensure maximum performance, zero dependencies, and long-term stability:

* **HTML5 & CSS3** (Vanilla CSS with custom properties)
* **Vanilla JavaScript** (ES Modules & Native Web Components)
* **Service Workers** (For offline caching and PWA installability)
* **Dexie.js** (IndexedDB wrapper for local storage)
* **Chart.js** (For rendering statistics)
* **JSZip** (For TV Time migrations)

---

## 🚀 Getting Started

Since ShowDeck is a Progressive Web App, you can run it entirely in your browser or install it locally.

### Installation & Onboarding
1. **iOS (Safari):** Tap the Share button, then select "Add to Home Screen".
2. **Android (Chrome):** Tap the menu button, then select "Install app".
3. **Desktop (Chrome/Edge):** Click the installation icon on the right side of the URL bar.
4. **Onboarding:** When you open the app for the first time, a streamlined setup flow will guide you through entering your name, choosing a theme, and securely linking your TMDB API Key.

### Setup
1. Open ShowDeck and navigate to **Settings**.
2. Under **API Providers**, enter a valid [TMDB API Key (v3 auth)](https://developer.themoviedb.org/docs).
3. Start searching for shows and movies!

---

## 👨‍💻 About the Author

Created by **Kartik Patkar**. 
* **GitHub:** [@Kartikpatkar](https://github.com/Kartikpatkar)
* **Issues:** [Report a Bug or Request a Feature](https://github.com/Kartikpatkar/ShowDeck/issues)

---

## 🤝 Contributing & Privacy

* See [CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute.
* See [PRIVACY.md](PRIVACY.md) to understand how your data is handled.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.