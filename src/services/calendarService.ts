import { AppDataSource } from '../data-source';
import { Calendar } from '../entities/Calendar';

/**
 * Hakee kaikki kalenteritietueet tietokannasta.
 *
 * Palauttaa listan `Calendar`-entiteettejä, jotka sisältävät kalenterien aliasit,
 * Google Calendar ID:t, aktiivisuustilan ja mahdolliset visuaaliset asetukset kuten värit.
 *
 * @returns {Promise<Calendar[]>} Lista kaikista tietokannan kalentereista.
 *
 * @example
 * const calendars = await getAllCalendars();
 * // → [{ id: 1, alias: 'C238-1', calendarId: 'abc@group.calendar.google.com', isActive: true, color: 'emerald' }, ...]
 */
export async function getAllCalendars() {
  const repo = AppDataSource.getRepository(Calendar);
  return repo.find();
}
