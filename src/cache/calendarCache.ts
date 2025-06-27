import { CalendarCacheEntry, CalendarEvent } from "../types/calendar";

const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 tuntia

/**
 * Kalenteritapahtumien välimuisti.
 *
 * Tallentaa kunkin kalenterin tapahtumat (`CalendarEvent[]`) ja viimeisimmän hakuajan.
 * Välimuisti vanhenee 24 tunnin kuluttua tallennuksesta.
 */
export const calendarCache: Map<string, CalendarCacheEntry> = new Map();

/**
 * Palauttaa välimuistista annetun kalenterin tapahtumat, jos ne ovat vielä voimassa.
 *
 * @param {string} calendarId Kalenterin yksilöivä tunniste.
 * @returns {CalendarCacheEntry | null} Välimuistiobjekti, tai `null` jos ei löytynyt tai vanhentunut.
 *
 * @example
 * const cached = getCachedEvents("C238-1");
 * if (cached) {
 *   console.log("Käytetään välimuistia:", cached.events);
 * }
 */
export function getCachedEvents(calendarId: string): CalendarCacheEntry | null {
  const entry = calendarCache.get(calendarId);
  if (!entry) return null;

  const isExpired = Date.now() - entry.lastFetched.getTime() > CACHE_TTL_MS;
  return isExpired ? null : entry;
}

/**
 * Tallentaa annetun kalenterin tapahtumat välimuistiin nykyisellä kellonajalla.
 *
 * @param {string} calendarId Kalenterin tunniste.
 * @param {CalendarEvent[]} events Tapahtumat, jotka halutaan välimuistiin.
 *
 * @example
 * setCachedEvents("C238-1", fetchedEvents);
 */
export function setCachedEvents(calendarId: string, events: CalendarEvent[]): void {
  calendarCache.set(calendarId, {
    events,
    lastFetched: new Date(),
  });
}

/**
 * Poistaa tietyn kalenterin välimuistista.
 *
 * @param {string} calendarId Kalenterin tunniste.
 *
 * @example
 * invalidateCalendar("C238-1");
 */
export function invalidateCalendar(calendarId: string): void {
  calendarCache.delete(calendarId);
}
