/**
 * ShowDeck — TVMaze API Wrapper
 * Handles communication with TVMaze API (no API key required).
 * https://www.tvmaze.com/api
 */
import { logApiUsage } from '../utils/apiTracker.js';

const BASE_URL = 'https://api.tvmaze.com';

/**
 * @private Fetch wrapper.
 */
async function tvmazeFetch(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  logApiUsage('tvmaze');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`TVMaze API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// ── Search ──

/**
 * Search TV shows on TVMaze.
 */
export async function searchShows(query) {
  const data = await tvmazeFetch('/search/shows', { q: query });
  return data.map(item => mapShowResult(item.show, item.score));
}

/**
 * Single search (best match only).
 */
export async function singleSearch(query) {
  try {
    const data = await tvmazeFetch('/singlesearch/shows', { q: query });
    return mapShowDetail(data);
  } catch {
    return null;
  }
}

// ── Show Details ──

/**
 * Get show by TVMaze ID.
 */
export async function getShowDetails(tvmazeId) {
  const data = await tvmazeFetch(`/shows/${tvmazeId}`, {
    embed: 'cast',
  });
  return mapShowDetail(data);
}

/**
 * Get show by TMDB ID (lookup).
 */
export async function getShowByTmdbId(tmdbId) {
  try {
    const data = await tvmazeFetch('/lookup/shows', { thetvdb: tmdbId });
    return mapShowDetail(data);
  } catch {
    return null;
  }
}

// ── Episodes ──

/**
 * Get all episodes for a show.
 */
export async function getEpisodes(tvmazeId) {
  const data = await tvmazeFetch(`/shows/${tvmazeId}/episodes`);
  return data.map(ep => ({
    tvmazeId: ep.id,
    season: ep.season,
    episode: ep.number,
    title: ep.name,
    overview: ep.summary ? ep.summary.replace(/<[^>]+>/g, '') : '',
    airDate: ep.airdate,
    runtime: ep.runtime,
    stillPath: ep.image?.medium || null,
  }));
}

/**
 * Get episodes for a specific season.
 */
export async function getSeasonEpisodes(tvmazeId, seasonNumber) {
  const seasons = await tvmazeFetch(`/shows/${tvmazeId}/seasons`);
  const season = seasons.find(s => s.number === seasonNumber);
  if (!season) return [];

  const episodes = await tvmazeFetch(`/seasons/${season.id}/episodes`);
  return episodes.map(ep => ({
    tvmazeId: ep.id,
    season: ep.season,
    episode: ep.number,
    title: ep.name,
    overview: ep.summary ? ep.summary.replace(/<[^>]+>/g, '') : '',
    airDate: ep.airdate,
    runtime: ep.runtime,
    stillPath: ep.image?.medium || null,
  }));
}

// ── Schedule ──

/**
 * Get shows airing today.
 */
export async function getSchedule(country = 'US', date = null) {
  const params = { country };
  if (date) params.date = date;
  const data = await tvmazeFetch('/schedule', params);
  return data.map(item => ({
    tvmazeId: item.show?.id,
    showTitle: item.show?.name,
    season: item.season,
    episode: item.number,
    title: item.name,
    airDate: item.airdate,
    airTime: item.airtime,
    runtime: item.runtime,
    showPoster: item.show?.image?.medium || null,
  }));
}

/**
 * Get upcoming episodes for a show.
 */
export async function getNextEpisode(tvmazeId) {
  try {
    const data = await tvmazeFetch(`/shows/${tvmazeId}`, {
      embed: 'nextepisode',
    });
    const next = data._embedded?.nextepisode;
    if (!next) return null;
    return {
      season: next.season,
      episode: next.number,
      title: next.name,
      airDate: next.airdate,
      airTime: next.airtime,
    };
  } catch {
    return null;
  }
}

// ── Mappers ──

function mapShowResult(show, score = 0) {
  return {
    tvmazeId: show.id,
    title: show.name,
    posterPath: show.image?.medium || null,
    posterPathOriginal: show.image?.original || null,
    overview: show.summary ? show.summary.replace(/<[^>]+>/g, '') : '',
    genres: show.genres || [],
    status: show.status,
    premiered: show.premiered,
    network: show.network?.name || show.webChannel?.name || null,
    runtime: show.runtime || show.averageRuntime || null,
    voteAverage: show.rating?.average || null,
    score,
  };
}

function mapShowDetail(show) {
  return {
    tvmazeId: show.id,
    title: show.name,
    posterPath: show.image?.medium || null,
    posterPathOriginal: show.image?.original || null,
    overview: show.summary ? show.summary.replace(/<[^>]+>/g, '') : '',
    genres: show.genres || [],
    status: show.status,
    premiered: show.premiered,
    ended: show.ended,
    network: show.network?.name || show.webChannel?.name || null,
    runtime: show.runtime || show.averageRuntime || null,
    voteAverage: show.rating?.average || null,
    schedule: show.schedule || null,
    officialSite: show.officialSite || null,
    cast: show._embedded?.cast?.map(c => ({
      id: c.person?.id,
      name: c.person?.name,
      character: c.character?.name,
      profilePath: c.person?.image?.medium || null,
    })) || [],
  };
}
