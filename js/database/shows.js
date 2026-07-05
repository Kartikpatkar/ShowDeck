/**
 * ShowDeck — Shows Database Operations
 * CRUD for TV shows in IndexedDB.
 */

import { db } from './db.js';

/**
 * Add a show to the library.
 * @param {object} showData
 * @returns {Promise<number>} Internal ID
 */
export async function addShow(showData) {
  const now = new Date();
  const show = {
    tmdbId: showData.tmdbId || null,
    tvmazeId: showData.tvmazeId || null,
    title: showData.title,
    originalTitle: showData.originalTitle || showData.title,
    posterPath: showData.posterPath || null,
    backdropPath: showData.backdropPath || null,
    overview: showData.overview || '',
    genres: showData.genres || [],
    status: showData.status || 'Unknown',
    firstAirDate: showData.firstAirDate || null,
    lastAirDate: showData.lastAirDate || null,
    totalSeasons: showData.totalSeasons || 0,
    totalEpisodes: showData.totalEpisodes || 0,
    network: showData.network || null,
    runtime: showData.runtime || null,
    trackingStatus: showData.trackingStatus || 'plan',
    rating: showData.rating || null,
    ratingType: showData.ratingType || 'star5',
    notes: showData.notes || '',
    tags: showData.tags || [],
    collections: showData.collections || [],
    addedAt: now,
    updatedAt: now,
    cachedAt: now,
  };

  const id = await db.shows.add(show);

  // Log activity
  await db.activity.add({
    type: 'added',
    itemId: id,
    itemType: 'show',
    detail: show.title,
    date: now,
  });

  return id;
}

/**
 * Get show by internal ID.
 */
export async function getShow(id) {
  return db.shows.get(id);
}

/**
 * Get show by TMDB ID.
 */
export async function getShowByTmdbId(tmdbId) {
  return db.shows.where('tmdbId').equals(tmdbId).first();
}

/**
 * Get show by TVMaze ID.
 */
export async function getShowByTvmazeId(tvmazeId) {
  return db.shows.where('tvmazeId').equals(tvmazeId).first();
}

/**
 * Check if show exists in library (by TMDB ID).
 */
export async function showExists(tmdbId) {
  const count = await db.shows.where('tmdbId').equals(tmdbId).count();
  return count > 0;
}

/**
 * Get all shows, optionally filtered.
 * @param {object} [options]
 * @param {string} [options.trackingStatus] - Filter by status
 * @param {string} [options.sortBy] - Sort field (title, addedAt, rating, updatedAt)
 * @param {string} [options.sortOrder] - 'asc' or 'desc'
 * @param {string} [options.genre] - Filter by genre
 */
export async function getAllShows(options = {}) {
  let collection = db.shows.toCollection();

  let shows = await collection.toArray();

  // Filter by tracking status
  if (options.trackingStatus) {
    shows = shows.filter(s => s.trackingStatus === options.trackingStatus);
  }

  // Filter by genre
  if (options.genre) {
    shows = shows.filter(s => s.genres?.includes(options.genre));
  }

  // Filter by tag
  if (options.tag) {
    shows = shows.filter(s => s.tags?.includes(options.tag));
  }

  // Sort
  const sortBy = options.sortBy || 'addedAt';
  const sortOrder = options.sortOrder || 'desc';

  shows.sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (valA instanceof Date) valA = valA.getTime();
    if (valB instanceof Date) valB = valB.getTime();
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return shows;
}

/**
 * Update a show.
 * @param {number} id
 * @param {object} changes
 */
export async function updateShow(id, changes) {
  changes.updatedAt = new Date();
  return db.shows.update(id, changes);
}

/**
 * Update tracking status.
 */
export async function updateTrackingStatus(id, status) {
  const now = new Date();
  await db.shows.update(id, {
    trackingStatus: status,
    updatedAt: now,
  });
  await db.activity.add({
    type: 'status_changed',
    itemId: id,
    itemType: 'show',
    detail: status,
    date: now,
  });
}

/**
 * Rate a show.
 */
export async function rateShow(id, rating, ratingType = 'star5') {
  const now = new Date();
  await db.shows.update(id, {
    rating,
    ratingType,
    updatedAt: now,
  });
  await db.activity.add({
    type: 'rated',
    itemId: id,
    itemType: 'show',
    detail: `${rating}`,
    date: now,
  });
}

/**
 * Delete a show and its episodes.
 */
export async function deleteShow(id) {
  await db.episodes.where('showId').equals(id).delete();
  await db.shows.delete(id);
  await db.activity.add({
    type: 'removed',
    itemId: id,
    itemType: 'show',
    detail: '',
    date: new Date(),
  });
}

/**
 * Get recently added shows.
 */
export async function getRecentShows(limit = 10) {
  return db.shows.orderBy('addedAt').reverse().limit(limit).toArray();
}

/**
 * Get shows by tracking status.
 */
export async function getShowsByStatus(status) {
  return db.shows.where('trackingStatus').equals(status).toArray();
}

/**
 * Count shows by tracking status.
 */
export async function getShowStatusCounts() {
  const all = await db.shows.toArray();
  const counts = {
    watching: 0,
    completed: 0,
    paused: 0,
    dropped: 0,
    plan: 0,
    rewatching: 0,
    total: all.length,
  };
  for (const show of all) {
    if (counts[show.trackingStatus] !== undefined) {
      counts[show.trackingStatus]++;
    }
  }
  return counts;
}

/**
 * Manually sync a show to update its metadata and episodes.
 */
export async function syncShow(id) {
  const show = await getShow(id);
  if (!show || !show.tmdbId) return null;
  
  const provider = await import('../api/provider.js');
  const newData = await provider.getShowDetails(show.tmdbId, show.tvmazeId);
  
  const now = new Date();
  await db.shows.update(id, {
    title: newData.title,
    posterPath: newData.posterPath,
    backdropPath: newData.backdropPath,
    overview: newData.overview,
    status: newData.status,
    totalSeasons: newData.totalSeasons,
    totalEpisodes: newData.totalEpisodes,
    network: newData.network,
    runtime: newData.runtime,
    updatedAt: now,
    cachedAt: now
  });
  
  return await getShow(id);
}
