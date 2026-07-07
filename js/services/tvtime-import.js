/**
 * ShowDeck — TV Time GDPR Import Service
 * Parses a TV Time GDPR data export ZIP and imports shows/episodes into ShowDeck.
 */

import { db } from '../database/db.js';
import { searchShows } from '../api/tmdb.js';

// ── CSV Parser ──

function parseCSV(text) {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = (values[idx] || '').trim();
    });
    rows.push(row);
  }
  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ── Main Import Function ──

/**
 * Import TV Time GDPR ZIP data into ShowDeck.
 * @param {File} zipFile - The ZIP file from TV Time
 * @param {Function} onProgress - Callback: (stage, current, total, detail) => void
 * @param {Object} [options] - Options object including abortSignal
 * @returns {Object} Import summary
 */
export async function importTVTimeData(zipFile, onProgress = () => {}, options = {}) {
  const signal = options.abortSignal;
  const summary = {
    showsImported: 0,
    showsSkipped: 0,
    showsNotFound: 0,
    episodesImported: 0,
    moviesImported: 0,
    moviesSkipped: 0,
    errors: [],
    notFoundShows: [],
  };

  // 1. Read ZIP
  onProgress('reading', 0, 1, 'Reading ZIP file...');
  const zip = await JSZip.loadAsync(zipFile);

  // 2. Extract the key CSVs
  onProgress('parsing', 0, 3, 'Parsing followed shows...');
  
  const followedRaw = await extractCSV(zip, 'followed_tv_show.csv');
  const trackingRaw = await extractCSV(zip, 'tracking-prod-records-v2.csv');
  const moviesRaw = await extractCSV(zip, 'tracking-prod-records.csv');
  
  if (!followedRaw && !trackingRaw) {
    throw new Error('Could not find TV Time data files in ZIP. Make sure this is a TV Time GDPR export.');
  }

  onProgress('parsing', 1, 3, 'Parsing episode tracking data...');
  const followed = followedRaw ? parseCSV(followedRaw) : [];
  const tracking = trackingRaw ? parseCSV(trackingRaw) : [];
  const movies = moviesRaw ? parseCSV(moviesRaw) : [];

  onProgress('parsing', 2, 3, 'Building show map...');

  // 3. Build a map of unique shows → episode data
  const showMap = buildShowMap(followed, tracking);
  const movieList = buildMovieList(movies);

  const totalShows = Object.keys(showMap).length;
  let processed = 0;

  // 4. For each show, resolve via TMDB and import
  onProgress('importing', 0, totalShows, 'Starting show import...');

  for (const [showName, showInfo] of Object.entries(showMap)) {
    if (signal?.aborted) throw new Error('Import cancelled by user');
    processed++;
    onProgress('importing', processed, totalShows, showName);

    try {
      // Check if already exists by searching in our DB by title
      const existing = await db.shows.where('title').equalsIgnoreCase(showName).first();
      if (existing) {
        summary.showsSkipped++;
        continue;
      }

      // Throttle: 250ms between TMDB calls
      await sleep(250);

      // Search TMDB for this show
      const results = await searchShows(showName, 1);
      
      let match = null;
      if (results && results.results && results.results.length > 0) {
        match = results.results[0];
      }

      const totalEpisodes = match ? match.totalEpisodes : 0;
      const status = determineStatus(showInfo, totalEpisodes);

      if (!match) {
        summary.showsNotFound++;
        summary.notFoundShows.push(showName);
      }

      // Insert show (with or without match)
      const showId = await db.shows.add({
        tmdbId: match ? match.tmdbId : null,
        title: match ? match.title : showName,
        originalTitle: match ? (match.originalTitle || match.title) : showName,
        posterPath: match ? match.posterPath : null,
        backdropPath: match ? match.backdropPath : null,
        overview: match ? match.overview : '',
        genres: match ? match.genres : [],
        status: match ? match.status : '',
        firstAirDate: match ? match.firstAirDate : '',
        totalSeasons: match ? match.totalSeasons : 0,
        totalEpisodes: match ? match.totalEpisodes : 0,
        network: match ? match.network : '',
        runtime: match ? match.runtime : 0,
        trackingStatus: status,
        rating: 0,
        addedAt: showInfo.followedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
      });

      // Insert episodes as watched
      if (showInfo.episodes.length > 0) {
        const episodeBatch = showInfo.episodes.map(ep => ({
          showId: showId,
          tmdbId: null,
          season: ep.season,
          episode: ep.episode,
          title: `Episode ${ep.episode}`,
          overview: '',
          airDate: '',
          stillPath: null,
          runtime: ep.runtime || 0,
          watched: true,
          watchedAt: ep.watchedAt || new Date().toISOString(),
          favorite: false,
        }));

        await db.episodes.bulkAdd(episodeBatch);
        summary.episodesImported += episodeBatch.length;
      }

      summary.showsImported++;

    } catch (err) {
      summary.errors.push(`${showName}: ${err.message}`);
    }
  }

  // 5. Import movies
  onProgress('movies', 0, movieList.length, 'Importing movies...');
  let movieProcessed = 0;

  for (const movie of movieList) {
    if (signal?.aborted) throw new Error('Import cancelled by user');
    movieProcessed++;
    onProgress('movies', movieProcessed, movieList.length, movie.name);

    try {
      // Check if already exists
      const existing = await db.movies.where('title').equalsIgnoreCase(movie.name).first();
      if (existing) {
        summary.moviesSkipped++;
        continue;
      }

      // We don't have TMDB IDs for movies either, but we have basic info
      // Insert with minimal data — user can enrich later via search
      await db.movies.add({
        tmdbId: null,
        title: movie.name,
        originalTitle: movie.name,
        posterPath: null,
        backdropPath: null,
        overview: '',
        genres: [],
        releaseDate: movie.releaseDate || '',
        runtime: movie.runtime || 0,
        trackingStatus: movie.status,
        rating: 0,
        addedAt: movie.followedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
      });

      summary.moviesImported++;
    } catch (err) {
      summary.errors.push(`Movie "${movie.name}": ${err.message}`);
    }
  }

  onProgress('done', 1, 1, 'Import complete!');
  return summary;
}

// ── Helpers ──

async function extractCSV(zip, filename) {
  const file = zip.file(filename);
  if (!file) return null;
  return await file.async('text');
}

function buildShowMap(followed, tracking) {
  const showMap = {};

  // Start with followed shows
  for (const row of followed) {
    const name = row.tv_show_name;
    if (!name) continue;

    if (!showMap[name]) {
      showMap[name] = {
        tvTimeId: row.tv_show_id,
        followedAt: row.created_at,
        archived: row.archived === '1',
        episodes: [],
        latestWatchedAt: null,
      };
    }
  }

  // Add episode watch data from tracking
  for (const row of tracking) {
    const name = row.series_name;
    if (!name) continue;

    // Skip rewatch entries for deduplication — only count first watches
    const key = row.key || '';
    if (key.startsWith('rewatch-')) continue;

    const season = parseInt(row.season_number || row.s_no, 10);
    const episode = parseInt(row.episode_number || row.ep_no, 10);
    if (isNaN(season) || isNaN(episode)) continue;

    if (!showMap[name]) {
      showMap[name] = {
        tvTimeId: row.s_id || '',
        followedAt: row.created_at,
        archived: false,
        episodes: [],
        latestWatchedAt: null,
      };
    }

    // Deduplicate episodes (same season+episode)
    const exists = showMap[name].episodes.some(
      e => e.season === season && e.episode === episode
    );
    if (exists) continue;

    const watchedAt = row.created_at || row.updated_at || '';
    showMap[name].episodes.push({
      season,
      episode,
      runtime: Math.round(parseInt(row.runtime || '0', 10) / 60), // seconds → minutes
      watchedAt,
    });

    // Track latest watch date
    if (watchedAt && (!showMap[name].latestWatchedAt || watchedAt > showMap[name].latestWatchedAt)) {
      showMap[name].latestWatchedAt = watchedAt;
    }
  }

  return showMap;
}

function buildMovieList(records) {
  const movieMap = {};

  for (const row of records) {
    const type = row.type || row.entity_type || '';
    const name = row.movie_name;
    if (!name || (type !== 'follow' && type !== 'watch' && type !== 'seen')) continue;

    if (!movieMap[name]) {
      movieMap[name] = {
        name,
        runtime: Math.round(parseInt(row.runtime || '0', 10) / 60),
        releaseDate: (row.release_date || '').split(' ')[0],
        followedAt: row.created_at || '',
        status: (type === 'watch' || type === 'seen') ? 'completed' : 'plan'
      };
    } else if (type === 'watch' || type === 'seen') {
      // Upgrade status to completed if we find a watch record later
      movieMap[name].status = 'completed';
    }
  }

  return Object.values(movieMap);
}

function determineStatus(showInfo, totalEpisodes = 0) {
  if (showInfo.archived) return 'dropped';
  if (showInfo.episodes.length === 0) return 'plan';

  let hasEpisodesLeft = false;
  if (totalEpisodes > 0 && showInfo.episodes.length < totalEpisodes) {
    hasEpisodesLeft = true;
  }

  if (showInfo.latestWatchedAt) {
    const lastWatch = new Date(showInfo.latestWatchedAt);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    if (lastWatch > oneWeekAgo) {
      return 'watching';
    } else if (hasEpisodesLeft) {
      return 'paused';
    }
  }

  // If we get here, it's either fully watched, or it hasn't been watched recently
  return hasEpisodesLeft ? 'paused' : 'completed';
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
