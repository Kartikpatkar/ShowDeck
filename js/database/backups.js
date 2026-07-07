/**
 * ShowDeck — Versioned Backups
 * Manages local database snapshots within IndexedDB to allow safe restoration.
 */

import { db } from './db.js';

/**
 * Creates a new backup of all user data.
 * @param {string} type - 'manual', 'daily', 'weekly', 'monthly'
 */
export async function createBackup(type = 'manual') {
  try {
    // 1. Gather all data
    const [shows, movies, episodes, collections, tags, activity, goals, smartCollections] = await Promise.all([
      db.shows.toArray(),
      db.movies.toArray(),
      db.episodes.toArray(),
      db.collections.toArray(),
      db.tags.toArray(),
      db.activity.toArray(),
      db.goals.toArray(),
      db.smartCollections.toArray()
    ]);

    const data = {
      shows,
      movies,
      episodes,
      collections,
      tags,
      activity,
      goals,
      smartCollections
    };

    // Calculate rough size
    const sizeStr = JSON.stringify(data);
    const sizeBytes = new Blob([sizeStr]).size;

    const backupRecord = {
      type,
      date: new Date().toISOString(),
      size: sizeBytes,
      data
    };

    // 2. Enforce limits (keep latest 3 manual, 1 daily, 1 weekly, 1 monthly)
    if (type !== 'manual') {
      // Remove older backups of the same automatic type
      const oldAuto = await db.backups.where('type').equals(type).toArray();
      for (const old of oldAuto) {
        await db.backups.delete(old.id);
      }
    } else {
      // Keep only the last 3 manual backups
      const manuals = await db.backups.where('type').equals('manual').sortBy('date');
      if (manuals.length >= 3) {
        // Delete the oldest ones until we have room for the new one (so keep max 2 before adding)
        const toDelete = manuals.slice(0, manuals.length - 2);
        for (const old of toDelete) {
          await db.backups.delete(old.id);
        }
      }
    }

    // 3. Save new backup
    const id = await db.backups.add(backupRecord);
    return id;
  } catch (err) {
    console.error('Failed to create backup:', err);
    throw err;
  }
}

/**
 * Restores the database from a given backup ID.
 * Uses a single transaction so if it fails, everything rolls back automatically.
 */
export async function restoreBackup(backupId) {
  const backup = await db.backups.get(backupId);
  if (!backup) throw new Error('Backup not found');

  const { data } = backup;
  if (!data) throw new Error('Backup data is corrupt or missing');

  try {
    await db.transaction('rw', 
      db.shows, db.movies, db.episodes, db.collections, 
      db.tags, db.activity, db.goals, db.smartCollections, 
      async () => {
        // Clear all
        await db.shows.clear();
        await db.movies.clear();
        await db.episodes.clear();
        await db.collections.clear();
        await db.tags.clear();
        await db.activity.clear();
        await db.goals.clear();
        await db.smartCollections.clear();

        // Bulk Add
        if (data.shows && data.shows.length) await db.shows.bulkAdd(data.shows);
        if (data.movies && data.movies.length) await db.movies.bulkAdd(data.movies);
        if (data.episodes && data.episodes.length) await db.episodes.bulkAdd(data.episodes);
        if (data.collections && data.collections.length) await db.collections.bulkAdd(data.collections);
        if (data.tags && data.tags.length) await db.tags.bulkAdd(data.tags);
        if (data.activity && data.activity.length) await db.activity.bulkAdd(data.activity);
        if (data.goals && data.goals.length) await db.goals.bulkAdd(data.goals);
        if (data.smartCollections && data.smartCollections.length) await db.smartCollections.bulkAdd(data.smartCollections);
    });
    return true;
  } catch (err) {
    console.error('Restore failed and was safely rolled back:', err);
    throw err;
  }
}

/**
 * Returns a list of all backups without their raw data payloads for UI display.
 */
export async function getBackupMetadata() {
  const all = await db.backups.reverse().sortBy('date');
  return all.map(b => ({
    id: b.id,
    type: b.type,
    date: b.date,
    size: b.size
  }));
}
