/**
 * ShowDeck — Movies Database Operations
 * CRUD for movies in IndexedDB.
 */

import { db } from './db.js';

/**
 * Add a movie to the library.
 */
export async function addMovie(movieData) {
  const now = new Date();
  const movie = {
    tmdbId: movieData.tmdbId || null,
    title: movieData.title,
    originalTitle: movieData.originalTitle || movieData.title,
    posterPath: movieData.posterPath || null,
    backdropPath: movieData.backdropPath || null,
    overview: movieData.overview || '',
    genres: movieData.genres || [],
    releaseDate: movieData.releaseDate || null,
    runtime: movieData.runtime || null,
    status: movieData.status || 'Unknown',
    trackingStatus: movieData.trackingStatus || 'plan',
    watched: movieData.watched || false,
    watchedAt: movieData.watchedAt || null,
    rating: movieData.rating || null,
    ratingType: movieData.ratingType || 'star5',
    notes: movieData.notes || '',
    tags: movieData.tags || [],
    collections: movieData.collections || [],
    addedAt: now,
    updatedAt: now,
    cachedAt: now,
  };

  const id = await db.movies.add(movie);

  await db.activity.add({
    type: 'added',
    itemId: id,
    itemType: 'movie',
    detail: movie.title,
    date: now,
  });

  return id;
}

export async function getMovie(id) {
  return db.movies.get(id);
}

export async function getMovieByTmdbId(tmdbId) {
  return db.movies.where('tmdbId').equals(tmdbId).first();
}

export async function movieExists(tmdbId) {
  const count = await db.movies.where('tmdbId').equals(tmdbId).count();
  return count > 0;
}

export async function getAllMovies(options = {}) {
  let movies = await db.movies.toArray();

  if (options.trackingStatus) {
    movies = movies.filter(m => m.trackingStatus === options.trackingStatus);
  }
  if (options.genre) {
    movies = movies.filter(m => m.genres?.includes(options.genre));
  }
  if (options.tag) {
    movies = movies.filter(m => m.tags?.includes(options.tag));
  }

  const sortBy = options.sortBy || 'addedAt';
  const sortOrder = options.sortOrder || 'desc';

  movies.sort((a, b) => {
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

  return movies;
}

export async function updateMovie(id, changes) {
  changes.updatedAt = new Date();
  return db.movies.update(id, changes);
}

export async function updateMovieTrackingStatus(id, status) {
  const now = new Date();
  const updates = { trackingStatus: status, updatedAt: now };
  if (status === 'completed') {
    updates.watched = true;
    updates.watchedAt = now;
  }
  await db.movies.update(id, updates);
  await db.activity.add({
    type: 'status_changed',
    itemId: id,
    itemType: 'movie',
    detail: status,
    date: now,
  });
}

export async function rateMovie(id, rating, ratingType = 'star5') {
  const now = new Date();
  await db.movies.update(id, { rating, ratingType, updatedAt: now });
  await db.activity.add({
    type: 'rated',
    itemId: id,
    itemType: 'movie',
    detail: `${rating}`,
    date: now,
  });
}

export async function deleteMovie(id) {
  await db.movies.delete(id);
  await db.activity.add({
    type: 'removed',
    itemId: id,
    itemType: 'movie',
    detail: '',
    date: new Date(),
  });
}

export async function getRecentMovies(limit = 10) {
  return db.movies.orderBy('addedAt').reverse().limit(limit).toArray();
}

export async function getMoviesByStatus(status) {
  return db.movies.where('trackingStatus').equals(status).toArray();
}

export async function getMovieStatusCounts() {
  const all = await db.movies.toArray();
  const counts = {
    watching: 0, completed: 0, paused: 0, dropped: 0, plan: 0, rewatching: 0, total: all.length,
  };
  for (const m of all) {
    if (counts[m.trackingStatus] !== undefined) counts[m.trackingStatus]++;
  }
  return counts;
}
