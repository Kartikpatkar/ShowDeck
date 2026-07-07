/**
 * ShowDeck — Unified Provider Interface
 * Abstracts TMDB + TVMaze behind a single API.
 * - Search: TMDB primary, TVMaze fallback
 * - Episodes: TVMaze primary (better granularity), TMDB fallback
 * - Posters/Backdrops: TMDB only
 * - Schedule: TVMaze only
 */

import * as tmdb from './tmdb.js';
import * as tvmaze from './tvmaze.js';
import { db } from '../database/db.js';

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Search for shows and movies.
 * Uses TMDB multi-search, falls back to TVMaze for shows.
 */
export async function search(query, page = 1) {
  if (!query?.trim()) return { results: [], page: 1, totalPages: 0 };

  try {
    return await tmdb.searchMulti(query, page);
  } catch (err) {
    console.warn('[Provider] TMDB search failed, falling back to TVMaze:', err.message);
    try {
      const results = await tvmaze.searchShows(query);
      return {
        results: results.map(r => ({ ...r, mediaType: 'show' })),
        page: 1,
        totalPages: 1,
        totalResults: results.length,
      };
    } catch (err2) {
      console.error('[Provider] All search providers failed:', err2.message);
      return { results: [], page: 1, totalPages: 0, totalResults: 0 };
    }
  }
}

/**
 * Search shows only.
 */
export async function searchShows(query, page = 1) {
  try {
    return await tmdb.searchShows(query, page);
  } catch {
    const results = await tvmaze.searchShows(query);
    return { results, page: 1, totalPages: 1, totalResults: results.length };
  }
}

/**
 * Search movies only (TMDB only — TVMaze doesn't have movies).
 */
export async function searchMovies(query, page = 1) {
  return tmdb.searchMovies(query, page);
}

/**
 * Discover shows based on filters (TMDB only).
 */
export async function discoverShows(filters, page = 1) {
  return tmdb.discoverShows(filters, page);
}

/**
 * Discover movies based on filters (TMDB only).
 */
export async function discoverMovies(filters, page = 1) {
  return tmdb.discoverMovies(filters, page);
}

export async function getGenres(type = 'tv') {
  const cacheKey = `genres_${type}`;
  const cached = await getCached(cacheKey);
  if (cached) return cached;

  try {
    const data = type === 'tv' ? await tmdb.getTvGenres() : await tmdb.getMovieGenres();
    await setCache(cacheKey, data);
    return data;
  } catch (err) {
    console.warn(`[Provider] TMDB ${type} genres failed:`, err.message);
    return [];
  }
}

export async function getCountries() {
  const cached = await getCached('countries');
  if (cached) return cached;

  try {
    const data = await tmdb.getCountries();
    await setCache('countries', data);
    return data;
  } catch (err) {
    console.warn('[Provider] TMDB countries failed:', err.message);
    return [];
  }
}

/**
 * Get trending shows (cached for 24h).
 */
export async function getTrendingShows() {
  const cached = await getCached('trending_shows');
  if (cached) return { results: cached };
  
  try {
    const data = await tmdb.getTrendingShows();
    await setCache('trending_shows', data);
    return { results: data };
  } catch (err) {
    console.warn('[Provider] TMDB trending failed:', err.message);
    return { results: [] };
  }
}

/**
 * Get full show details.
 * Tries TMDB first for richer data.
 */
export async function getShowDetails(tmdbId) {
  const cached = await getCached(`show:${tmdbId}`);
  if (cached) return cached;

  try {
    const details = await tmdb.getShowDetails(tmdbId);
    await setCache(`show:${tmdbId}`, details);
    return details;
  } catch (err) {
    console.warn('[Provider] TMDB show details failed:', err.message);
    return null;
  }
}

/**
 * Get full movie details (TMDB only).
 */
export async function getMovieDetails(tmdbId) {
  const cached = await getCached(`movie:${tmdbId}`);
  if (cached) return cached;

  try {
    const details = await tmdb.getMovieDetails(tmdbId);
    await setCache(`movie:${tmdbId}`, details);
    return details;
  } catch (err) {
    console.warn('[Provider] TMDB movie details failed:', err.message);
    return null;
  }
}

/**
 * Get episodes for a season.
 * Tries TVMaze first (better episode data), falls back to TMDB.
 */
export async function getSeasonEpisodes(tmdbId, tvmazeId, seasonNumber) {
  const cacheKey = `episodes:${tmdbId || tvmazeId}:s${seasonNumber}`;
  const cached = await getCached(cacheKey);
  if (cached) return cached;

  let episodes = [];

  // Try TMDB first (since we likely have tmdbId)
  if (tmdbId) {
    try {
      episodes = await tmdb.getSeasonEpisodes(tmdbId, seasonNumber);
      if (episodes.length > 0) {
        await setCache(cacheKey, episodes);
        return episodes;
      }
    } catch (err) {
      console.warn('[Provider] TMDB episodes failed:', err.message);
    }
  }

  // Fallback to TVMaze
  if (tvmazeId) {
    try {
      episodes = await tvmaze.getSeasonEpisodes(tvmazeId, seasonNumber);
      await setCache(cacheKey, episodes);
      return episodes;
    } catch (err) {
      console.warn('[Provider] TVMaze episodes failed:', err.message);
    }
  }

  return episodes;
}

/**
 * Get all episodes for a show.
 */
export async function getAllEpisodes(tmdbId, tvmazeId, totalSeasons) {
  const allEpisodes = [];

  if (tmdbId) {
    let validSeasons = [];
    try {
      const details = await getShowDetails(tmdbId);
      if (details && details.seasons) {
        validSeasons = details.seasons.map(s => s.seasonNumber).filter(n => n > 0);
      } else if (totalSeasons) {
        validSeasons = Array.from({length: totalSeasons}, (_, i) => i + 1);
      }
    } catch {
      if (totalSeasons) validSeasons = Array.from({length: totalSeasons}, (_, i) => i + 1);
    }

    for (const s of validSeasons) {
      const eps = await getSeasonEpisodes(tmdbId, tvmazeId, s);
      allEpisodes.push(...eps);
    }
  } else if (tvmazeId) {
    try {
      const eps = await tvmaze.getEpisodes(tvmazeId);
      allEpisodes.push(...eps);
    } catch {
      // silent fail
    }
  }

  return allEpisodes;
}

/**
 * Get trending content.
 */
export async function getTrending(type = 'all') {
  try {
    const [shows, movies] = await Promise.all([
      type === 'all' || type === 'show' ? tmdb.getTrendingShows() : [],
      type === 'all' || type === 'movie' ? tmdb.getTrendingMovies() : [],
    ]);

    return [
      ...(Array.isArray(shows) ? shows : []).map(s => ({ ...s, mediaType: 'show' })),
      ...(Array.isArray(movies) ? movies : []).map(m => ({ ...m, mediaType: 'movie' })),
    ];
  } catch {
    return [];
  }
}

/**
 * Get today's schedule (TVMaze).
 */
export async function getSchedule(country = 'US') {
  try {
    return await tvmaze.getSchedule(country);
  } catch {
    return [];
  }
}

/**
 * Get poster URL (TMDB).
 */
export function getPosterUrl(path, size = 'posterMedium') {
  return tmdb.getPosterUrl(path, size);
}

/**
 * Get backdrop URL (TMDB).
 */
export function getBackdropUrl(path, size = 'backdropLarge') {
  return tmdb.getBackdropUrl(path, size);
}

// ── Cache Helpers ──

async function getCached(key) {
  try {
    const entry = await db.apiCache.where('key').equals(key).first();
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      await db.apiCache.where('key').equals(key).delete();
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

async function setCache(key, data) {
  try {
    const existing = await db.apiCache.where('key').equals(key).first();
    const entry = {
      key,
      data,
      expiresAt: Date.now() + CACHE_TTL,
      cachedAt: Date.now(),
    };
    if (existing) {
      await db.apiCache.update(existing.id, entry);
    } else {
      await db.apiCache.add(entry);
    }
  } catch {
    // Cache write failures are non-critical
  }
}

/**
 * Clear expired cache entries.
 */
export async function clearExpiredCache() {
  try {
    await db.apiCache.where('expiresAt').below(Date.now()).delete();
  } catch {
    // silent
  }
}
