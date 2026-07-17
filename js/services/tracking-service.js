/**
 * ShowDeck — Tracking Service
 * Encapsulates high-level tracking logic such as auto-completing shows
 * and handling bulk episode marking to keep UI components lean.
 */
import { db } from '../database/db.js';
import { updateTrackingStatus } from '../database/shows.js';
import { markWatched, markUnwatched, markSeasonWatched, markSeasonUnwatched } from '../database/episodes.js';

/**
 * Checks if a show should be auto-completed based on watched episodes.
 * Optionally prompts for a rating if it transitions to completed.
 */
export async function checkAutoComplete(showId, episodesData, showData, ratingModalCallback) {
  const nowTime = Date.now();
  const hasUnreleased = episodesData.some(e => e.airDate && new Date(e.airDate).getTime() > nowTime);
  const allWatched = episodesData.every(e => e.watched);
  
  if (allWatched && !hasUnreleased && showData.trackingStatus !== 'completed') {
    await updateTrackingStatus(showId, 'completed');
    showData.trackingStatus = 'completed';
    
    if (ratingModalCallback) {
      const rating = await ratingModalCallback(`Rate ${showData.title}`);
      if (rating !== null) {
        await db.shows.update(showId, { rating });
        showData.rating = rating;
      }
    }
    return true; // Indicates it was auto-completed
  }
  return false;
}

/**
 * Marks a specific episode as watched and checks for auto-complete.
 */
export async function toggleEpisodeWatch(epId, isWatched, currentShowId, episodesData, showData, ratingModalCallback) {
  const ep = episodesData.find(e => e.id === epId);
  if (!ep) return false;

  let bulkUpdated = false;

  if (isWatched) {
    await markUnwatched(epId);
    ep.watched = false;
  } else {
    // Check if previous episodes should be marked
    const prevUnwatched = episodesData.filter(e => {
      if (e.watched) return false;
      if (e.season > ep.season) return false;
      if (e.season === ep.season && e.episode >= ep.episode) return false;
      
      if (e.airDate) {
        const epDate = new Date(e.airDate);
        if (epDate.getTime() > Date.now()) return false;
      }
      return true;
    });

    if (prevUnwatched.length > 0) {
      const { confirmModal } = await import('../components/modal.js');
      const ok = await confirmModal('Mark Previous?', `You're marking Episode ${ep.episode} watched, but ${prevUnwatched.length} previous episodes are unwatched. Mark them as watched too?`);
      if (ok) {
        const now = new Date();
        await db.transaction('rw', db.episodes, async () => {
          for (const p of prevUnwatched) {
            await db.episodes.update(p.id, { watched: true, watchedAt: now, watchCount: (p.watchCount || 0) + 1 });
            p.watched = true;
          }
        });
        bulkUpdated = true;
      }
    }
    
    await markWatched(epId);
    ep.watched = true;

    const completed = await checkAutoComplete(currentShowId, episodesData, showData, ratingModalCallback);
    if (completed) bulkUpdated = true;
  }

  return bulkUpdated;
}

/**
 * Marks an entire season watched/unwatched and checks for auto-complete.
 */
export async function toggleSeasonWatch(currentShowId, currentSeason, isComplete, episodesData, showData, ratingModalCallback) {
  if (isComplete) {
    await markSeasonUnwatched(currentShowId, currentSeason);
    episodesData.forEach(e => { if (e.season === currentSeason) e.watched = false; });
    return false;
  } else {
    await markSeasonWatched(currentShowId, currentSeason);
    episodesData.forEach(e => { if (e.season === currentSeason) e.watched = true; });
    
    const completed = await checkAutoComplete(currentShowId, episodesData, showData, ratingModalCallback);
    return completed;
  }
}
