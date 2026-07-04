/**
 * ShowDeck — Episodes Database Operations
 * Track individual episode watch status.
 */

import { db } from './db.js';

/**
 * Add episodes for a show (bulk insert from API data).
 * @param {number} showId - Internal show ID
 * @param {Array} episodesData - Array of episode objects from API
 */
export async function addEpisodes(showId, episodesData) {
  const episodes = episodesData.map(ep => ({
    showId,
    tmdbId: ep.tmdbId || null,
    season: ep.season,
    episode: ep.episode,
    title: ep.title || `Episode ${ep.episode}`,
    overview: ep.overview || '',
    airDate: ep.airDate || null,
    runtime: ep.runtime || null,
    stillPath: ep.stillPath || null,
    watched: false,
    watchedAt: null,
    favorite: false,
    skipped: false,
  }));

  return db.episodes.bulkAdd(episodes);
}

/**
 * Get all episodes for a show.
 */
export async function getEpisodes(showId) {
  return db.episodes
    .where('showId')
    .equals(showId)
    .sortBy('episode');
}

/**
 * Get episodes for a specific season.
 */
export async function getSeasonEpisodes(showId, season) {
  return db.episodes
    .where('[showId+season+episode]')
    .between([showId, season, Dexie.minKey], [showId, season, Dexie.maxKey])
    .toArray();
}

/**
 * Mark episode as watched.
 */
export async function markWatched(episodeId) {
  const now = new Date();
  await db.episodes.update(episodeId, {
    watched: true,
    watchedAt: now,
    skipped: false,
  });

  const ep = await db.episodes.get(episodeId);
  if (ep) {
    await db.activity.add({
      type: 'watched',
      itemId: ep.showId,
      itemType: 'episode',
      detail: `S${String(ep.season).padStart(2, '0')}E${String(ep.episode).padStart(2, '0')}`,
      date: now,
    });
  }
}

/**
 * Mark episode as unwatched.
 */
export async function markUnwatched(episodeId) {
  await db.episodes.update(episodeId, {
    watched: false,
    watchedAt: null,
  });
}

/**
 * Toggle watched status.
 */
export async function toggleWatched(episodeId) {
  const ep = await db.episodes.get(episodeId);
  if (!ep) return;
  if (ep.watched) {
    await markUnwatched(episodeId);
  } else {
    await markWatched(episodeId);
  }
  return !ep.watched;
}

/**
 * Mark all episodes in a season as watched.
 */
export async function markSeasonWatched(showId, season) {
  const now = new Date();
  const episodes = await getSeasonEpisodes(showId, season);
  const ids = episodes.filter(e => !e.watched).map(e => e.id);

  await db.episodes.where('id').anyOf(ids).modify({
    watched: true,
    watchedAt: now,
    skipped: false,
  });

  if (ids.length > 0) {
    await db.activity.add({
      type: 'watched',
      itemId: showId,
      itemType: 'season',
      detail: `Season ${season} (${ids.length} episodes)`,
      date: now,
    });
  }
}

/**
 * Mark all episodes in a season as unwatched.
 */
export async function markSeasonUnwatched(showId, season) {
  const episodes = await getSeasonEpisodes(showId, season);
  const ids = episodes.filter(e => e.watched).map(e => e.id);

  await db.episodes.where('id').anyOf(ids).modify({
    watched: false,
    watchedAt: null,
  });
}

/**
 * Skip an episode.
 */
export async function skipEpisode(episodeId) {
  await db.episodes.update(episodeId, {
    skipped: true,
    watched: false,
    watchedAt: null,
  });
}

/**
 * Toggle favorite on episode.
 */
export async function toggleFavorite(episodeId) {
  const ep = await db.episodes.get(episodeId);
  if (!ep) return;
  await db.episodes.update(episodeId, { favorite: !ep.favorite });
  return !ep.favorite;
}

/**
 * Get show progress (watched / total).
 */
export async function getShowProgress(showId) {
  const episodes = await db.episodes.where('showId').equals(showId).toArray();
  const total = episodes.length;
  const watched = episodes.filter(e => e.watched).length;
  const skipped = episodes.filter(e => e.skipped).length;
  return {
    total,
    watched,
    skipped,
    remaining: total - watched - skipped,
    percentage: total > 0 ? Math.round((watched / total) * 100) : 0,
  };
}

/**
 * Get next unwatched episode for a show.
 */
export async function getNextEpisode(showId) {
  const episodes = await db.episodes
    .where('showId')
    .equals(showId)
    .toArray();

  // Sort by season, then episode
  episodes.sort((a, b) => {
    if (a.season !== b.season) return a.season - b.season;
    return a.episode - b.episode;
  });

  return episodes.find(e => !e.watched && !e.skipped) || null;
}

/**
 * Get seasons list for a show.
 */
export async function getSeasons(showId) {
  const episodes = await db.episodes.where('showId').equals(showId).toArray();
  const seasonMap = new Map();

  for (const ep of episodes) {
    if (!seasonMap.has(ep.season)) {
      seasonMap.set(ep.season, { season: ep.season, total: 0, watched: 0 });
    }
    const s = seasonMap.get(ep.season);
    s.total++;
    if (ep.watched) s.watched++;
  }

  return Array.from(seasonMap.values()).sort((a, b) => a.season - b.season);
}

/**
 * Delete all episodes for a show.
 */
export async function deleteShowEpisodes(showId) {
  return db.episodes.where('showId').equals(showId).delete();
}

/**
 * Get total watched episodes count (across all shows).
 */
export async function getTotalWatchedEpisodes() {
  return db.episodes.where('watched').equals(1).count();
}

/**
 * Get recently watched episodes.
 */
export async function getRecentlyWatched(limit = 20) {
  return db.episodes
    .where('watched')
    .equals(1)
    .reverse()
    .sortBy('watchedAt')
    .then(eps => eps.slice(0, limit));
}
