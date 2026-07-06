/**
 * ShowDeck — Database Module
 * IndexedDB setup via Dexie.js with full schema for shows, movies, episodes,
 * collections, tags, activity, and API cache.
 */

// Import Dexie from CDN (no build step)
import Dexie from '../lib/dexie.mjs';

const db = new Dexie('ShowDeckDB');

// Schema version 1
db.version(1).stores({
  // Shows — TV series tracked by user
  shows: '++id, tmdbId, tvmazeId, title, trackingStatus, rating, addedAt, updatedAt, *tags, *genres',

  // Movies — movies tracked by user
  movies: '++id, tmdbId, title, trackingStatus, rating, addedAt, updatedAt, *tags, *genres',

  // Episodes — individual episode tracking
  episodes: '++id, showId, [showId+season+episode], tmdbId, season, episode, watched, watchedAt, favorite',

  // Collections — user-created groups
  collections: '++id, name, createdAt',

  // Tags — user-created tags
  tags: '++id, &name',

  // Activity — watch history / activity log
  activity: '++id, type, itemId, itemType, date, [itemType+itemId]',

  // API Cache — cached API responses to reduce requests
  apiCache: '++id, &key, expiresAt',
});

// Schema version 2
db.version(2).stores({
  // Retain existing tables
  shows: '++id, tmdbId, tvmazeId, title, trackingStatus, rating, addedAt, updatedAt, *tags, *genres',
  movies: '++id, tmdbId, title, trackingStatus, rating, addedAt, updatedAt, *tags, *genres',
  episodes: '++id, showId, [showId+season+episode], tmdbId, season, episode, watched, watchedAt, favorite',
  collections: '++id, name, createdAt',
  tags: '++id, &name',
  activity: '++id, type, itemId, itemType, date, [itemType+itemId]',
  apiCache: '++id, &key, expiresAt',

  // New V2 Tables
  goals: '++id, name, type, target, progress, createdAt',
  backups: '++id, type, date, size',
  smartCollections: '++id, name, rules, createdAt'
});

export { db, Dexie };

// ── Helper: Clear all data ──
export async function clearAllData() {
  await db.shows.clear();
  await db.movies.clear();
  await db.episodes.clear();
  await db.collections.clear();
  await db.tags.clear();
  await db.activity.clear();
  await db.apiCache.clear();
  await db.goals.clear();
  await db.backups.clear();
  await db.smartCollections.clear();
}

// ── Helper: Get DB stats ──
export async function getDbStats() {
  const [shows, movies, episodes, collections, tags, activities, backups] = await Promise.all([
    db.shows.count(),
    db.movies.count(),
    db.episodes.filter(e => e.watched === true).count(),
    db.collections.count(),
    db.tags.count(),
    db.activity.count(),
    db.backups.count()
  ]);
  return { shows, movies, episodes, collections, tags, activities, backups };
}
