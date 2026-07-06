# 🚀 ShowDeck v2+ Roadmap

## Product Enhancement Plan

**Document Version:** 1.0

**Purpose**

This document defines the next major evolution of ShowDeck after the current MVP. These are **planned product improvements**, not bug fixes. The goal is to transform ShowDeck from a media tracker into a **Personal Entertainment Operating System**.

These features should be evaluated, prioritized, and implemented incrementally while preserving ShowDeck's existing architecture:

* Privacy First
* Offline First
* Local First
* Progressive Web App
* No Backend
* High Performance

---

# New Product Positioning

The current messaging focuses on privacy.

While privacy remains one of our core principles, it should no longer be the primary marketing message.

Instead, ShowDeck should become:

> **Your Personal Entertainment OS**

or

> **Your Entertainment Life, Organized**

The application should become the central place where users:

* Track
* Organize
* Discover
* Remember
* Analyze
* Plan

their entertainment journey.

---

# Feature 1 — Activity Timeline

## Goal

Create a chronological history of everything the user watches.

The timeline becomes a personal entertainment diary.

---

## User Story

"As a user, I want to see exactly what I watched and when."

---

## Example

```
Today

✓ The Bear
Season 4 Episode 3

2 hours ago

-------------------

Yesterday

✓ Breaking Bad

Season 3 Episode 10

-------------------

Monday

✓ Interstellar

-------------------

Sunday

✓ Andor

Season 2 Episode 6
```

---

## Features

* Daily grouping
* Monthly grouping
* Search history
* Filter by:

  * TV
  * Movies
  * Collections
  * Rating
* Timeline statistics

---

# Feature 2 — Continue Watching 2.0

Current Continue Watching should become significantly richer.

Each card should display:

* Poster
* Progress bar
* Current season
* Current episode
* Remaining episodes
* Estimated remaining watch time

Example

```
Breaking Bad

Season 3

██████████░░░░

Episode 10 / 13

3 Episodes Remaining

Continue Watching
```

---

# Feature 3 — Redesigned Dashboard

The dashboard should become modular.

Suggested sections:

* Continue Watching
* Recently Watched
* Upcoming Episodes
* Trending
* Activity Timeline
* Calendar
* Statistics
* Goals
* Collections
* Smart Lists
* Pinned Shows

Users should be able to reorder or hide sections.

---

# Feature 4 — Calendar

Create a full calendar experience.

Views

* Monthly
* Weekly
* Timeline

Show

* Episode releases
* Season premieres
* Finales
* Upcoming movies

Future:

Optional notifications.

---

# Feature 5 — Achievement System

Gamify progress.

Example achievements

* Night Owl
* Weekend Warrior
* Binge Master
* Anime Fan
* Movie Buff
* 100 Episodes
* 100 Movies
* First Review
* 365 Day Streak

Achievements remain completely local.

No online leaderboard.

---

# Feature 6 — Personal Goals

Allow users to define entertainment goals.

Examples

Finish Breaking Bad

Watch 100 Movies This Year

Watch Every Marvel Movie

Finish Current Season

Watch Every Oscar Winner

Progress bars should update automatically.

---

# Feature 7 — Dashboard Widgets

The dashboard becomes customizable.

Possible widgets

* Calendar
* Continue Watching
* Statistics
* Goals
* Collections
* Heatmap
* Timeline
* Recent Ratings
* Upcoming Episodes

Users can:

* Reorder
* Resize
* Hide

Dashboard layout should be stored locally.

---

# Feature 8 — Watching Heatmap

Inspired by GitHub.

Every day the user watches something, the calendar becomes more active.

Example

```
■■■■■■■■■

■■□■■■■■■

■■■■■■■■■
```

Clicking a day opens watched content.

---

# Feature 9 — Rich Search

Current search should become information-rich.

Every search result should include

* Poster
* Release Year
* Genres
* Runtime
* Community Rating
* Status
* Episode Count
* Provider

Search should feel modern and instant.

---

# Feature 10 — Watch History

Separate from Activity Timeline.

Timeline

"What happened?"

History

"Everything I've ever watched."

Allow

* Search
* Filter
* Sort
* Export

---

# Feature 11 — Advanced Statistics

Expand statistics dramatically.

New metrics

General

* Total Watch Time
* Total Movies
* Total Shows
* Total Episodes

Behavior

* Average Episodes Per Day
* Average Movies Per Month
* Longest Binge Session
* Longest Streak

Favorites

* Favorite Genre
* Favorite Network
* Favorite Country
* Favorite Language
* Favorite Streaming Service

Time

* Most Active Day
* Most Active Month
* Most Active Year

Charts

* Pie Charts
* Bar Charts
* Timeline Graphs
* Heatmaps

---

# Feature 12 — Versioned Backups

Current backup system should evolve.

Instead of one backup

Store

* Daily
* Weekly
* Monthly

Allow

Restore Previous Versions

Delete Versions

Automatic Cleanup

Everything remains local.

---

# Feature 13 — Intelligent Import

When importing data

Detect

Duplicate Shows

Duplicate Movies

Duplicate Episodes

Allow

* Merge
* Skip
* Replace

Prevent accidental duplication.

---

# Feature 14 — Netflix-style Continue Watching

Create a premium Continue Watching experience.

Display

* Remaining runtime
* Remaining episodes
* Last watched date
* Next episode
* Estimated completion time

Everything should be accessible in one click.

---

# Feature 15 — Smart Collections

Collections become dynamic.

Example

Crime Shows

Rules

Genre = Crime

Rating > 8

Watching

Automatically updates.

Users can create unlimited Smart Collections.

---

# Feature 16 — Better Progress Visualization

Replace text-only progress.

Instead of

Episode 10 / 13

Show

```
████████░░

76%

10 / 13
```

Also display

Season progress

Series progress

Overall library completion.

---

# Feature 17 — Premium Theme Collection

Current themes

* Purple
* Blue
* Green
* Red

Future themes

* OLED Black
* Dracula
* Nord
* Catppuccin
* Tokyo Night
* Gruvbox
* Solarized
* Monochrome

Every theme updates

* Charts
* Buttons
* Progress Bars
* Cards
* Icons

---

# Feature 18 — Plugin Architecture

Design ShowDeck to support optional plugins.

Potential plugins

* Calendar Integration
* Discord Rich Presence
* Custom CSS
* Additional Metadata Providers
* AI Recommendation Engine
* Export Extensions
* Statistics Extensions

Plugins must be sandboxed.

Core functionality should never depend on plugins.

---

# UI & UX Improvements

Throughout every feature

Focus on

* Smooth animations
* Skeleton loading
* Keyboard shortcuts
* Mobile-first layouts
* Responsive design
* Accessible components
* Beautiful empty states
* Rich micro-interactions

The application should feel polished and premium.

---

# Product Principles

Every new feature must satisfy these principles:

* Works offline whenever possible.
* Stores user data locally.
* Does not require a backend.
* Does not reduce application performance.
* Integrates naturally into the existing design.
* Solves a real user problem.
* Avoids unnecessary complexity.

---

# Long-Term Vision

The goal is not to build another TV tracker.

The goal is to build the best personal entertainment dashboard available.

When users open ShowDeck, they should immediately understand:

* What they're watching.
* What to watch next.
* How their entertainment habits are evolving.
* How close they are to their personal goals.
* What they enjoyed most over time.

ShowDeck should become the single source of truth for every user's entertainment journey while remaining private, offline-capable, lightweight, and completely under the user's control.
