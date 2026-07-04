/**
 * ShowDeck — Statistics Database Queries
 */

import { db } from './db.js';

/**
 * Get comprehensive stats.
 */
export async function getFullStats() {
  const [shows, movies, episodes, activity] = await Promise.all([
    db.shows.toArray(),
    db.movies.toArray(),
    db.episodes.toArray(),
    db.activity.toArray(),
  ]);

  const watchedEpisodes = episodes.filter(e => e.watched);

  // Hours watched (estimate: 42min/episode avg, movie runtime from data)
  const episodeHours = (watchedEpisodes.length * 42) / 60;
  const movieHours = movies
    .filter(m => m.watched || m.trackingStatus === 'completed')
    .reduce((sum, m) => sum + (m.runtime || 120), 0) / 60;
  const totalHours = Math.round(episodeHours + movieHours);

  // Genre distribution
  const genreMap = {};
  [...shows, ...movies].forEach(item => {
    (item.genres || []).forEach(g => {
      genreMap[g] = (genreMap[g] || 0) + 1;
    });
  });
  const genres = Object.entries(genreMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Rating distribution
  const ratingMap = {};
  [...shows, ...movies].filter(i => i.rating).forEach(item => {
    const r = Math.round(item.rating);
    ratingMap[r] = (ratingMap[r] || 0) + 1;
  });

  // Average rating
  const rated = [...shows, ...movies].filter(i => i.rating);
  const avgRating = rated.length > 0
    ? (rated.reduce((s, i) => s + i.rating, 0) / rated.length).toFixed(1)
    : 0;

  // Completion rate (shows)
  const completedShows = shows.filter(s => s.trackingStatus === 'completed').length;
  const completionRate = shows.length > 0
    ? Math.round((completedShows / shows.length) * 100)
    : 0;

  // Activity by date (for heatmap)
  const activityByDate = {};
  activity
    .filter(a => a.type === 'watched')
    .forEach(a => {
      const date = new Date(a.date).toISOString().split('T')[0];
      activityByDate[date] = (activityByDate[date] || 0) + 1;
    });

  // Streak calculation
  const { currentStreak, longestStreak } = calculateStreaks(activityByDate);

  return {
    totalShows: shows.length,
    totalMovies: movies.length,
    totalEpisodes: watchedEpisodes.length,
    totalHours,
    genres,
    ratingDistribution: ratingMap,
    avgRating,
    completionRate,
    currentStreak,
    longestStreak,
    activityByDate,
  };
}

function calculateStreaks(activityByDate) {
  const dates = Object.keys(activityByDate).sort();
  if (dates.length === 0) return { currentStreak: 0, longestStreak: 0 };

  let longestStreak = 1;
  let currentStreak = 1;
  let tempStreak = 1;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Calculate longest streak
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (curr - prev) / 86400000;
    if (diff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  // Current streak (must include today or yesterday)
  const lastDate = dates[dates.length - 1];
  if (lastDate !== today && lastDate !== yesterday) {
    currentStreak = 0;
  } else {
    currentStreak = 1;
    for (let i = dates.length - 2; i >= 0; i--) {
      const curr = new Date(dates[i + 1]);
      const prev = new Date(dates[i]);
      const diff = (curr - prev) / 86400000;
      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak: Math.max(longestStreak, currentStreak) };
}
