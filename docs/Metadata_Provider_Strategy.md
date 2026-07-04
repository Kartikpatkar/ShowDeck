# 📌 Architecture Update – Metadata Provider Strategy

## Decision

After evaluating multiple metadata providers, we have decided **not** to build ShowDeck around a single hardcoded provider.

Instead, ShowDeck will implement a **pluggable metadata provider architecture**.

This allows us to:

* Keep the application free to maintain.
* Avoid vendor lock-in.
* Respect user privacy.
* Give users complete control over which metadata service they want to use.

---

# Metadata Philosophy

ShowDeck is a **local-first** application.

Metadata providers are used **only** to fetch public entertainment information.

User data is **never** uploaded to any metadata provider.

Metadata providers only supply information such as:

* TV Shows
* Movies
* Episodes
* Seasons
* Posters
* Cast
* Crew
* Genres
* Air Dates
* Networks
* Descriptions

Everything related to the user's personal library remains stored locally inside IndexedDB.

---

# Metadata Provider Architecture

```
                ShowDeck

                     │

            Metadata Manager

                     │

      ┌──────────────┼──────────────┐

      │              │              │

    TMDB         TVmaze       Future Providers

      │              │

      └──────┬───────┘

        Data Normalizer

              │

         IndexedDB Cache

              │

              UI
```

The rest of the application must **never** directly communicate with TMDB, TVmaze, or any external provider.

All communication must go through the Metadata Manager.

Example:

```javascript
Metadata.search(query)

Metadata.getShow(id)

Metadata.getMovie(id)

Metadata.getEpisode(id)

Metadata.getSeason(id)
```

The UI should never know which provider returned the data.

---

# Provider Abstraction

Every provider must implement the same interface.

Example:

```
MetadataProvider

search()

getShow()

getMovie()

getSeason()

getEpisode()

getPerson()
```

Each provider is responsible for converting its own API response into ShowDeck's internal data model.

---

# Internal Data Model

Regardless of the provider, ShowDeck should always work with a single normalized structure.

Example:

```json
{
  "id": "showdeck-123",
  "provider": "tmdb",
  "providerId": 1396,
  "title": "Breaking Bad",
  "poster": "...",
  "backdrop": "...",
  "genres": [],
  "episodes": [],
  "status": "Running"
}
```

The rest of the application must never depend on provider-specific fields.

---

# Initial Provider Support

## TVmaze

Purpose:

* Zero configuration fallback.
* Great TV episode support.
* Fills in gaps where TMDB might lack specific episode data.

---

## TMDB

Purpose:

* Richer metadata.
* Better posters.
* Better artwork.
* Better movie support.
* Additional details and translations.

TMDB integration will **not** ship with a bundled API key.

Instead, ShowDeck strictly enforces **Bring Your Own API Key (BYOA)** for TMDB.

---

# Bring Your Own API Key (BYOA)

This is a core product philosophy to keep the app 100% free forever.

ShowDeck will never require users to use a shared API key, nor will we pay for commercial API limits.

Instead, users must connect their own free TMDB Developer API key.

Benefits:

* No shared rate limits.
* No recurring infrastructure cost for the developer.
* No backend server required.
* Better privacy.
* Better scalability.
* Open-source friendly.

---

# Onboarding Flow (BYOA First)

Since TVmaze does not support Movies, TMDB is required for a complete experience. A new user must provide an API key before they can fully search and track content.

Flow:

```
Install ShowDeck

↓

Welcome Screen (Prompt for TMDB API Key)

↓

Paste Personal API Key

↓

Test Connection & Save

↓

Search works immediately for Shows & Movies

↓

Tracking begins
```

The application uses TMDB as the primary metadata source (and TVmaze as a transparent fallback for episodes), while continuing to store all personal data locally in IndexedDB.

---

# API Key Storage

User-provided API keys must:

* Never leave the user's device.
* Never be uploaded to any ShowDeck server.
* Never be shared with other users.
* Never be included in backups unless the user explicitly chooses to include application settings.

Suggested storage:

* IndexedDB (preferred)
* Local Storage (acceptable for non-sensitive configuration)

---

# Metadata Provider Settings

Future Settings page:

```
Metadata Provider

(•) TVmaze

( ) TMDB

TMDB API Key

*********************

[ Test Connection ]

Status

✓ Connected

[ Save ]
```

Future enhancements:

* Automatic provider fallback.
* Multiple providers enabled simultaneously.
* Provider priority ordering.
* Provider health monitoring.

---

# Future Provider Support

The architecture should be designed so that adding a new provider only requires implementing the provider interface.

Potential future providers:

* TMDB
* TVmaze
* OMDb
* FanArt.tv
* Additional metadata services

No changes should be required in the UI or business logic.

---

# Development Rules

The following rules are mandatory.

## DO

* Create a dedicated Metadata Manager.
* Normalize all provider responses.
* Cache metadata in IndexedDB.
* Keep provider logic isolated.
* Make providers replaceable.
* Design for future expansion.

## DO NOT

* Hardcode API calls inside UI components.
* Scatter provider-specific logic throughout the application.
* Depend on provider-specific response formats.
* Bundle personal API keys into the repository.
* Require a backend server to access metadata.

---

# Alignment with ShowDeck Vision

This architecture supports every core principle of ShowDeck.

✅ Privacy First

* User API keys stay on their device.

✅ Offline First

* Metadata is cached locally.

✅ Local First

* Personal library never leaves the device.

✅ Zero Infrastructure Cost

* No backend server.
* No API proxy.
* No recurring hosting costs.

✅ Future Proof

* Providers can be added, removed, or replaced without affecting the rest of the application.

This metadata strategy will serve as the foundation for ShowDeck's long-term architecture and ensures the application remains sustainable, maintainable, and independent of any single external service.
