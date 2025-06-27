import { AppDataSource } from '../data-source';
import { Calendar } from '../entities/Calendar';

/**
 * Välimuisti kalenterialias → Google Calendar ID -mappaukselle.
 * Tallennetaan muistissa, jotta tietokantahakuja ei tarvitse tehdä turhaan.
 */
let cachedCalendarMap: Record<string, string> | null = null;

/**
 * Hakee tietokannasta kaikki kalenterit ja rakentaa mappauksen
 * kalenterien alias-nimistä niiden Google Calendar ID:hin.
 * Tallentaa tuloksen sisäiseen välimuistiin seuraavia kutsuja varten.
 *
 * @returns {Promise<Record<string, string>>} Alias → Google Calendar ID -mappi.
 *
 * @example
 * const map = await getCalendarMap();
 * console.log(map['C238-1']); // esim. '59596f673673a4c675c2f8dc36245e1338b3470bcb7d7b08d4c67e793e941f87@group.calendar.google.com'
 */
export async function getCalendarMap(): Promise<Record<string, string>> {

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const repo = AppDataSource.getRepository(Calendar);
  const calendars = await repo.find();

  cachedCalendarMap = calendars.reduce((map, cal) => {
    map[cal.alias] = cal.calendarId;
    return map;
  }, {} as Record<string, string>);

  return cachedCalendarMap;
}
