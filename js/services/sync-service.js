/**
 * ShowDeck — Cloud Sync Service
 * Handles data preparation for Google Drive Backup/Restore
 */
import { db, clearAllData } from '../database/db.js';
import { backupToDrive as apiBackup, restoreFromDrive as apiRestore, clearDriveData as apiClear, signOutDrive, signInDrive, isDriveSignedIn } from '../api/drive.js';

export async function createCloudBackup() {
  const backup = {
    version: '1.6.4',
    timestamp: new Date().toISOString(),
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
  
  await apiBackup(backup);
  const syncTime = new Date().toISOString();
  localStorage.setItem('showdeck_last_drive_sync', syncTime);
  return syncTime;
}

export async function restoreCloudBackup() {
  const backup = await apiRestore();
  if (!backup || !backup.data) throw new Error('No backup found');
  
  await clearAllData();
  
  if (backup.settings) {
    if (backup.settings.tmdbKey) localStorage.setItem('showdeck_tmdb_key', backup.settings.tmdbKey);
    if (backup.settings.name) localStorage.setItem('showdeck_user_name', backup.settings.name);
    if (backup.settings.theme) localStorage.setItem('showdeck_theme', backup.settings.theme);
    if (backup.settings.accentTheme) localStorage.setItem('showdeck_accent_theme', backup.settings.accentTheme);
    if (backup.settings.customColor) localStorage.setItem('showdeck_custom_color', backup.settings.customColor);
    if (backup.settings.includeAdult) localStorage.setItem('showdeck_include_adult', backup.settings.includeAdult);
    if (backup.settings.view) localStorage.setItem('showdeck_view_preference', backup.settings.view);
  }
  
  await db.transaction('rw', db.shows, db.movies, db.episodes, db.collections, db.tags, db.activity, async () => {
    if (backup.data.shows) await db.shows.bulkAdd(backup.data.shows);
    if (backup.data.movies) await db.movies.bulkAdd(backup.data.movies);
    if (backup.data.episodes) await db.episodes.bulkAdd(backup.data.episodes);
    if (backup.data.collections) await db.collections.bulkAdd(backup.data.collections);
    if (backup.data.tags) await db.tags.bulkAdd(backup.data.tags);
    if (backup.data.activity) await db.activity.bulkAdd(backup.data.activity);
  });
  
  const syncTime = new Date().toISOString();
  localStorage.setItem('showdeck_last_drive_sync', syncTime);
  return syncTime;
}

export async function deleteCloudBackup() {
  await apiClear();
  localStorage.removeItem('showdeck_last_drive_sync');
}

export { signOutDrive, signInDrive, isDriveSignedIn };
