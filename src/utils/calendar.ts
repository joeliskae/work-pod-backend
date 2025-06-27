import { calendar_v3 } from "googleapis";

/**
 * Muuntaa Google Calendar API:n tapahtumat FullCalendar-kirjaston odottamaan muotoon.
 *
 * Ottaa listan `calendar_v3.Schema$Event`-tyyppisiä tapahtumia ja palauttaa
 * uuden listan yksinkertaistettuja olioita, jotka sisältävät vain tarvittavat
 * kentät FullCalendarin käyttöön.
 *
 * @param {calendar_v3.Schema$Event[]} items Google Calendar API:sta haetut tapahtumat.
 * @returns {{
 *   id?: string;
 *   title: string;
 *   start?: string;
 *   end?: string;
 * }[]} FullCalendar-yhteensopivien tapahtumien lista.
 *
 * @example
 * const events = await calendar.events.list(...);
 * const parsed = parseToFullCalendarFormat(events.data.items ?? []);
 * // → [{ id: '123', title: 'Tapaaminen', start: '2025-06-27T12:00:00Z', end: '2025-06-27T13:00:00Z' }, ...]
 */
export function parseToFullCalendarFormat(
  items: calendar_v3.Schema$Event[]
): {
  id?: string;
  title: string;
  start?: string;
  end?: string;
}[] {
  return items.map(event => ({
    id: event.id ?? undefined,
    title: event.summary ?? "Ei otsikkoa",
    start: (event.start?.dateTime ?? event.start?.date) ?? undefined,
    end: (event.end?.dateTime ?? event.end?.date) ?? undefined,
  }));
}
