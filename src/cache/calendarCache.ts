import { CalendarCacheEntry, CalendarEvent } from "../types/calendar";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // cache on elossa 24h sen pyyntöhetkestä eteenpäin.

export const calendarCache: Map<string, CalendarCacheEntry> = new Map();

export function getCachedEvents(calendarId: string): CalendarCacheEntry | null {
  const entry = calendarCache.get(calendarId);
  if (!entry) return null;

  const isExpired = Date.now() - entry.lastFetched.getTime() > CACHE_TTL_MS;
  return isExpired ? null : entry;
}

export function setCachedEvents(calendarId: string, events: CalendarEvent[]): void {
  calendarCache.set(calendarId, {
    events,
    lastFetched: new Date(),
  });
}

export function invalidateCalendar(calendarId: string): void {
  calendarCache.delete(calendarId);
}
