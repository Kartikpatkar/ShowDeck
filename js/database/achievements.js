/**
 * ShowDeck — Achievements Engine
 * Evaluates local databases to unlock and return user milestones.
 */

import { db } from './db.js';

const ACHIEVEMENTS_DEF = [
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Logged watch activity between Midnight and 4 AM.',
    icon: '🦉',
    color: '#8b5cf6'
  },
  {
    id: 'binge_master',
    title: 'Binge Master',
    description: 'Watched 5 or more episodes in a single day.',
    icon: '🍿',
    color: '#ef4444'
  },
  {
    id: 'cinephile',
    title: 'Cinephile',
    description: 'Completed watching 10 or more movies.',
    icon: '🎬',
    color: '#f59e0b'
  },
  {
    id: 'completionist',
    title: 'Completionist',
    description: 'Finished a TV show with at least 3 seasons.',
    icon: '🏆',
    color: '#10b981'
  }
];

export async function getAchievements() {
  const unlockedIds = new Set();
  
  // 1. Evaluate Night Owl and Binge Master via Activity
  const activities = await db.activity.toArray();
  const dateCounts = {};
  
  for (const act of activities) {
    const d = new Date(act.timestamp);
    const hour = d.getHours();
    
    if (hour >= 0 && hour < 4) {
      unlockedIds.add('night_owl');
    }
    
    if (act.type === 'episode_watched') {
      const dateKey = act.timestamp.split('T')[0];
      dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
      if (dateCounts[dateKey] >= 5) {
        unlockedIds.add('binge_master');
      }
    }
  }

  // 2. Evaluate Cinephile via Movies
  const completedMoviesCount = await db.movies.where('trackingStatus').equals('completed').count();
  if (completedMoviesCount >= 10) {
    unlockedIds.add('cinephile');
  }

  // 3. Evaluate Completionist via Shows
  const completedShows = await db.shows.where('trackingStatus').equals('completed').toArray();
  for (const show of completedShows) {
    if (show.totalSeasons >= 3) {
      unlockedIds.add('completionist');
      break;
    }
  }

  return ACHIEVEMENTS_DEF.map(ach => ({
    ...ach,
    unlocked: unlockedIds.has(ach.id)
  }));
}
