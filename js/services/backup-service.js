/**
 * ShowDeck — Local Backup Service
 * Handles manual JSON exports, imports, and CSV generation
 */
import { db, clearAllData } from '../database/db.js';

export async function exportLocalBackup() {
  const backup = {
    version: '1.6.2',
    settings: {
      tmdbKey: localStorage.getItem('showdeck_tmdb_key'),
      name: localStorage.getItem('showdeck_user_name'),
      theme: localStorage.getItem('showdeck_theme'),
      accentTheme: localStorage.getItem('showdeck_accent_theme'),
      customColor: localStorage.getItem('showdeck_custom_color'),
      includeAdult: localStorage.getItem('showdeck_include_adult'),
      view: localStorage.getItem('showdeck_view_preference')
    },
    data: {
      shows: await db.shows.toArray(),
      movies: await db.movies.toArray(),
      episodes: await db.episodes.toArray(),
      collections: await db.collections.toArray(),
      tags: await db.tags.toArray(),
      activity: await db.activity.toArray(),
    }
  };
  
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `showdeck_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importLocalBackup(fileContent) {
  const backup = JSON.parse(fileContent);
  if (!backup.data) throw new Error('Invalid backup format');
  
  // Basic schema validation
  const requiredShowFields = ['title'];
  const requiredMovieFields = ['title'];
  if (backup.data.shows?.length && !requiredShowFields.every(f => f in backup.data.shows[0])) {
    throw new Error('Invalid backup: shows data is malformed');
  }
  if (backup.data.movies?.length && !requiredMovieFields.every(f => f in backup.data.movies[0])) {
    throw new Error('Invalid backup: movies data is malformed');
  }
  
  await db.transaction('rw', db.shows, db.movies, db.episodes, db.collections, db.tags, db.activity, async () => {
    if (backup.data.shows?.length) await db.shows.bulkPut(backup.data.shows);
    if (backup.data.movies?.length) await db.movies.bulkPut(backup.data.movies);
    if (backup.data.episodes?.length) await db.episodes.bulkPut(backup.data.episodes);
    if (backup.data.collections?.length) await db.collections.bulkPut(backup.data.collections);
    if (backup.data.tags?.length) await db.tags.bulkPut(backup.data.tags);
    if (backup.data.activity?.length) await db.activity.bulkPut(backup.data.activity);
  });
}

export async function exportCsv() {
  const shows = await db.shows.toArray();
  const movies = await db.movies.toArray();
  const episodes = await db.episodes.where('watched').equals(1).toArray();
  
  let csvContent = 'Type,Title,Status,Rating,WatchedEpisodes\n';
  
  shows.forEach(s => {
    const epCount = episodes.filter(e => e.showId === s.id).length;
    csvContent += `Show,"${s.title.replace(/"/g, '""')}",${s.trackingStatus},${s.rating || ''},${epCount}\n`;
  });
  
  movies.forEach(m => {
    csvContent += `Movie,"${m.title.replace(/"/g, '""')}",${m.trackingStatus},${m.rating || ''},N/A\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `showdeck_export_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
