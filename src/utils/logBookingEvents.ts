import { AppDataSource } from '../data-source';
import { Calendar as CalendarEntity } from '../entities/Calendar';
import { ReservationMetric } from '../entities/ReservationMetrics';

/**
 * Tapahtuman kuvaus, joka kirjataan varausmetrikkatauluun.
 *
 * @typedef {Object} ReservationEvent
 * @property {'created' | 'deleted'} action Tapahtuman tyyppi (esim. luotu tai poistettu).
 * @property {string} calendarId Google Calendarin alias (esim C238-1).
 * @property {Date} start Tapahtuman alkuaika.
 * @property {Date} end Tapahtuman loppuaika.
 */
export type ReservationEvent = {
  action: 'created' | 'deleted';
  calendarId: string;  // Google Calendar ID
  start: Date;
  end: Date;
};

/**
 * Kirjaa varauksen luonti- tai poistotapahtuman `reservation_metrics`-tauluun.
 *
 * Funktio hakee ensin kalenterin aliaksen `calendars`-taulusta annettua `calendarId`:tä
 * vastaavalle riville. Jos aliasia ei löydy, käytetään alkuperäistä `calendarId`:tä.
 *
 * Tapahtumat tallennetaan tietokantaan ISO-muotoisina aikaleimoina.
 *
 * @param {ReservationEvent} event Varaustapahtuma, joka halutaan kirjata.
 * @returns {Promise<void>} Palauttaa lupauksen, joka resolvoituu kun tallennus on valmis.
 *
 * @example
 * await logBookingEvent({
 *   action: 'created',
 *   calendarId: 'C238-1',
 *   start: new Date('2025-06-27T12:00:00Z'),
 *   end: new Date('2025-06-27T13:00:00Z')
 * });
 */
export async function logBookingEvent(event: ReservationEvent): Promise<void> {
  try {
    const repo = AppDataSource.getRepository(ReservationMetric);
    const calendarRepo = AppDataSource.getRepository(CalendarEntity);

    // Haetaan Calendar entiteetti Google calendarId:n perusteella
    const calendarEntry = await calendarRepo.findOneBy({ calendarId: event.calendarId });

    const reservationMetric = repo.create({
      action: event.action,
      // Tallennetaan alias, esim. "C238-1", tai fallbackina calendarId
      calendarId: calendarEntry?.alias ?? event.calendarId,
      eventStart: event.start.toISOString(),
      eventEnd: event.end.toISOString(),
    });

    await repo.save(reservationMetric);
  } catch (err) {
    console.error("Tietokantaan loggaus epäonnistui:", err);
  }
}
