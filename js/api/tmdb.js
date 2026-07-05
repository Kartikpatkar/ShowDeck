/**
 * ShowDeck — TMDB API Wrapper
 * Handles all communication with The Movie Database API.
 * https://developer.themoviedb.org/docs
 */

/**
 * Get the user's TMDB API Key from localStorage.
 */
function getApiKey() {
  const key = localStorage.getItem('showdeck_tmdb_key');
  if (!key) {
    console.warn('[TMDB] No API key found. Add it in Settings to enable movie support and rich artwork.');
  }
  return key || '';
}

const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

// Image size presets
export const IMAGE_SIZES = {
  posterSmall: `${IMG_BASE}/w185`,
  posterMedium: `${IMG_BASE}/w342`,
  posterLarge: `${IMG_BASE}/w500`,
  posterOriginal: `${IMG_BASE}/original`,
  backdropSmall: `${IMG_BASE}/w300`,
  backdropMedium: `${IMG_BASE}/w780`,
  backdropLarge: `${IMG_BASE}/w1280`,
  backdropOriginal: `${IMG_BASE}/original`,
  profileSmall: `${IMG_BASE}/w185`,
  profileMedium: `${IMG_BASE}/w342`,
  still: `${IMG_BASE}/w300`,
};

/**
 * Build poster URL.
 */
export function getPosterUrl(path, size = 'posterMedium') {
  if (!path) return null;
  return `${IMAGE_SIZES[size]}${path}`;
}

/**
 * Build backdrop URL.
 */
export function getBackdropUrl(path, size = 'backdropLarge') {
  if (!path) return null;
  return `${IMAGE_SIZES[size]}${path}`;
}

/**
 * @private Fetch wrapper with error handling.
 */
async function tmdbFetch(endpoint, params = {}) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Missing TMDB API Key. Please add it in Settings.');
  }

  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('language', 'en-US');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      if (response.status === 401) {
        import('../components/toast.js').then(m => m.toast('Invalid TMDB API Key. Please check Settings.', 'error'));
      }
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    if (!navigator.onLine) {
      import('../components/toast.js').then(m => m.toast('You are offline. Showing cached data.', 'warning'));
    }
    throw err;
  }
}

// ── Search ──

/**
 * Search TV shows.
 */
export async function searchShows(query, page = 1) {
  const data = await tmdbFetch('/search/tv', { query, page });
  return {
    results: data.results.map(mapShowResult),
    page: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
  };
}

/**
 * Search movies.
 */
export async function searchMovies(query, page = 1) {
  const data = await tmdbFetch('/search/movie', { query, page });
  return {
    results: data.results.map(mapMovieResult),
    page: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
  };
}

/**
 * Multi-search (shows + movies + people).
 */
export async function searchMulti(query, page = 1) {
  const data = await tmdbFetch('/search/multi', { query, page });
  return {
    results: data.results.map(item => {
      if (item.media_type === 'tv') return { ...mapShowResult(item), mediaType: 'show' };
      if (item.media_type === 'movie') return { ...mapMovieResult(item), mediaType: 'movie' };
      return { ...item, mediaType: item.media_type };
    }).filter(i => i.mediaType === 'show' || i.mediaType === 'movie'),
    page: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
  };
}

// ── Show Details ──

/**
 * Helper to get user country code based on IP (cached).
 */
export async function getUserCountryCode() {
  let country = localStorage.getItem('showdeck_country');
  if (!country) {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      if (data && data.country_code) {
        country = data.country_code;
        localStorage.setItem('showdeck_country', country);
      } else {
        country = 'US';
      }
    } catch(e) {
      console.warn('Geolocation failed, defaulting to US', e);
      country = 'US';
    }
  }
  return country;
}

/**
 * Get full show details.
 */
export async function getShowDetails(tmdbId) {
  const data = await tmdbFetch(`/tv/${tmdbId}`, {
    append_to_response: 'credits,external_ids,watch/providers,content_ratings',
  });

  const country = await getUserCountryCode();

  return {
    tmdbId: data.id,
    title: data.name,
    originalTitle: data.original_name,
    posterPath: data.poster_path,
    backdropPath: data.backdrop_path,
    overview: data.overview,
    genres: data.genres?.map(g => g.name) || [],
    status: data.status,
    firstAirDate: data.first_air_date,
    lastAirDate: data.last_air_date,
    totalSeasons: data.number_of_seasons,
    totalEpisodes: data.number_of_episodes,
    network: data.networks?.[0]?.name || null,
    runtime: data.episode_run_time?.[0] || null,
    voteAverage: data.vote_average,
    voteCount: data.vote_count,
    popularity: data.popularity,
    cast: data.credits?.cast?.slice(0, 20).map(c => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profilePath: c.profile_path,
    })) || [],
    crew: data.credits?.crew?.filter(c =>
      ['Director', 'Creator', 'Executive Producer'].includes(c.job)
    ).map(c => ({
      id: c.id,
      name: c.name,
      job: c.job,
      profilePath: c.profile_path,
    })) || [],
    seasons: data.seasons?.map(s => ({
      seasonNumber: s.season_number,
      name: s.name,
      episodeCount: s.episode_count,
      airDate: s.air_date,
      posterPath: s.poster_path,
      overview: s.overview,
    })) || [],
    watchProviders: data['watch/providers']?.results?.[country] || null,
    externalIds: data.external_ids || {},
  };
}

/**
 * Get season episodes from TMDB.
 */
export async function getSeasonEpisodes(tmdbId, seasonNumber) {
  const data = await tmdbFetch(`/tv/${tmdbId}/season/${seasonNumber}`);

  return data.episodes?.map(ep => ({
    tmdbId: ep.id,
    season: ep.season_number,
    episode: ep.episode_number,
    title: ep.name,
    overview: ep.overview,
    airDate: ep.air_date,
    runtime: ep.runtime,
    stillPath: ep.still_path,
    voteAverage: ep.vote_average,
  })) || [];
}

// ── Movie Details ──

/**
 * Get full movie details.
 */
export async function getMovieDetails(tmdbId) {
  const data = await tmdbFetch(`/movie/${tmdbId}`, {
    append_to_response: 'credits,external_ids,watch/providers',
  });

  const country = await getUserCountryCode();

  return {
    tmdbId: data.id,
    title: data.title,
    originalTitle: data.original_title,
    posterPath: data.poster_path,
    backdropPath: data.backdrop_path,
    overview: data.overview,
    genres: data.genres?.map(g => g.name) || [],
    releaseDate: data.release_date,
    runtime: data.runtime,
    status: data.status,
    voteAverage: data.vote_average,
    voteCount: data.vote_count,
    popularity: data.popularity,
    budget: data.budget,
    revenue: data.revenue,
    tagline: data.tagline,
    cast: data.credits?.cast?.slice(0, 20).map(c => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profilePath: c.profile_path,
    })) || [],
    crew: data.credits?.crew?.filter(c =>
      ['Director', 'Producer', 'Writer', 'Screenplay'].includes(c.job)
    ).map(c => ({
      id: c.id,
      name: c.name,
      job: c.job,
      profilePath: c.profile_path,
    })) || [],
    watchProviders: data['watch/providers']?.results?.[country] || null,
    externalIds: data.external_ids || {},
  };
}

// ── Trending / Discover ──

/**
 * Get trending shows.
 */
export async function getTrendingShows(timeWindow = 'week') {
  const data = await tmdbFetch(`/trending/tv/${timeWindow}`);
  return data.results.map(mapShowResult);
}

/**
 * Get trending movies.
 */
export async function getTrendingMovies(timeWindow = 'week') {
  const data = await tmdbFetch(`/trending/movie/${timeWindow}`);
  return data.results.map(mapMovieResult);
}

// ── Mappers ──

function mapShowResult(item) {
  return {
    tmdbId: item.id,
    title: item.name,
    originalTitle: item.original_name,
    posterPath: item.poster_path,
    backdropPath: item.backdrop_path,
    overview: item.overview,
    firstAirDate: item.first_air_date,
    genres: item.genre_ids || [],
    voteAverage: item.vote_average,
    popularity: item.popularity,
  };
}

function mapMovieResult(item) {
  return {
    tmdbId: item.id,
    title: item.title,
    originalTitle: item.original_title,
    posterPath: item.poster_path,
    backdropPath: item.backdrop_path,
    overview: item.overview,
    releaseDate: item.release_date,
    genres: item.genre_ids || [],
    voteAverage: item.vote_average,
    popularity: item.popularity,
  };
}
