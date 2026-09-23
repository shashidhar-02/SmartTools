import { FirstPartyEvent, SearchOpportunity } from '../../types';

const STORAGE_KEY_EVENTS = 'smarttools_first_party_events';
const STORAGE_KEY_UNFULFILLED = 'smarttools_unfulfilled_queries';

export const logFirstPartyEvent = (event: Omit<FirstPartyEvent, 'timestamp'>) => {
  try {
    const fullEvent: FirstPartyEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };
    const storedRaw = localStorage.getItem(STORAGE_KEY_EVENTS);
    const events: FirstPartyEvent[] = storedRaw ? JSON.parse(storedRaw) : [];
    // Keep max 200 events locally for memory efficiency
    const updated = [fullEvent, ...events].slice(0, 200);
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(updated));
  } catch {
    // Graceful fallback for sandboxed storage
  }
};

export const logUnfulfilledQuery = (rawQuery: string) => {
  const query = rawQuery.trim().toLowerCase();
  if (!query || query.length < 3) return;

  try {
    const storedRaw = localStorage.getItem(STORAGE_KEY_UNFULFILLED);
    const map: Record<string, { query: string; count: number; lastSearched: string }> = storedRaw
      ? JSON.parse(storedRaw)
      : {};

    if (map[query]) {
      map[query].count += 1;
      map[query].lastSearched = new Date().toISOString();
    } else {
      map[query] = {
        query,
        count: 1,
        lastSearched: new Date().toISOString(),
      };
    }
    localStorage.setItem(STORAGE_KEY_UNFULFILLED, JSON.stringify(map));
  } catch {
    // Graceful fallback
  }
};

export const getFirstPartyEvents = (): FirstPartyEvent[] => {
  try {
    const storedRaw = localStorage.getItem(STORAGE_KEY_EVENTS);
    return storedRaw ? JSON.parse(storedRaw) : [];
  } catch {
    return [];
  }
};

export const getUnfulfilledQueries = (): { query: string; count: number; lastSearched: string }[] => {
  try {
    const storedRaw = localStorage.getItem(STORAGE_KEY_UNFULFILLED);
    if (!storedRaw) return [];
    const map = JSON.parse(storedRaw);
    return Object.values(map);
  } catch {
    return [];
  }
};
