/**
 * ShowDeck — API Tracker
 * Tracks daily API requests for TMDB and TVMaze to avoid hitting limits.
 */

function getTodayKey() {
  const date = new Date();
  return `showdeck_api_usage_${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getUsageData() {
  const key = getTodayKey();
  const raw = localStorage.getItem(key);
  if (!raw) return { tmdb: 0, tvmaze: 0 };
  try {
    return JSON.parse(raw);
  } catch {
    return { tmdb: 0, tvmaze: 0 };
  }
}

function saveUsageData(data) {
  const key = getTodayKey();
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Log a request for a specific provider ('tmdb' or 'tvmaze').
 */
export function logApiUsage(provider) {
  const data = getUsageData();
  if (typeof data[provider] === 'number') {
    data[provider] += 1;
    saveUsageData(data);
  }
}

/**
 * Get current daily counts.
 */
export function getApiUsage() {
  return getUsageData();
}

/**
 * Clear old tracking keys from localStorage (cleanup).
 */
export function cleanupOldUsageData() {
  const todayKey = getTodayKey();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('showdeck_api_usage_') && key !== todayKey) {
      localStorage.removeItem(key);
    }
  }
}

// Run cleanup on import
cleanupOldUsageData();
