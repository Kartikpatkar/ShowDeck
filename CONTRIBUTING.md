# 🤝 Contributing to ShowDeck

Thank you for your interest in contributing to **ShowDeck**!

ShowDeck is a **privacy-first, offline-first personal entertainment tracker** built as a Progressive Web App (PWA).

The project focuses on:

* Local-first data ownership (IndexedDB)
* Zero backend dependencies
* High performance (Vanilla JS / CSS)
* PWA best practices (Offline support, caching)
* Clean, native-like UI/UX

We welcome contributions related to:

* Bug fixes
* New features
* Performance improvements
* UI / UX enhancements
* Accessibility improvements
* Documentation updates

---

# 🧩 Ways to Contribute

## 🐞 Report Bugs

Found an issue? Please [create an issue on GitHub](https://github.com/Kartikpatkar/ShowDeck/issues) and include:

* Clear description of the problem
* Steps to reproduce
* Expected behavior vs Actual behavior
* Browser & OS version
* Console errors (if any)

## 💡 Suggest Features

Have an idea? Please create a feature request and include:

* Problem being solved
* Expected user experience
* Mockups or screenshots (optional)

We especially welcome ideas around:
* Data visualization (Stats)
* Backup/Restore mechanisms
* UI animations
* Performance optimization

---

## 💻 Submit Code

Pull requests are welcome for bug fixes, new functionality, refactoring, and UI improvements. Please keep pull requests focused and avoid unrelated changes.

### Clone the Repository

```bash
git clone https://github.com/Kartikpatkar/ShowDeck.git
cd ShowDeck
```

### Running Locally

ShowDeck uses vanilla JS modules and requires a local HTTP server to run properly (to avoid CORS issues with ES Modules).

```bash
# Using Node (serve)
npx serve .

# Using Python
python3 -m http.server 3000
```

Open `http://localhost:3000` in your browser.

---

# ✅ Before Submitting a Pull Request

## 1. Create a Feature Branch

```bash
git checkout -b feature/my-feature
```

## 2. Keep Changes Focused

Good: `feat: Add CSV export functionality`
Avoid: `Feature + Refactor + UI Redesign` in a single PR.

## 3. Test Thoroughly

Verify:
* No console errors
* IndexedDB transactions complete successfully
* PWA loads correctly while offline
* UI responds well on mobile dimensions

Thank you for contributing!
