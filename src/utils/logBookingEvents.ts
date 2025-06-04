import { AppDataSource } from '../data-source';
import { ReservationMetric } from '../entities/ReservationMetrics';
import { calendarMap } from "../config/calendarMap";

export type ReservationEvent = {
  action: 'created' | 'deleted';
  calendarId: string;
  start: Date;
  end: Date;
};

export function getAliasFromCalendarId(calendarId: string): string | undefined {
  return Object.keys(calendarMap).find(alias => calendarMap[alias] === calendarId);
}

// Alusta TypeORM kerran sovelluksen käynnistyessä (esim. index.ts / main.ts)
export async function initDb() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
}

export async function logBookingEvent(event: ReservationEvent): Promise<void> {
  try {
    if (!AppDataSource.isInitialized) {
      await initDb();
    }

    const repo = AppDataSource.getRepository(ReservationMetric);

    const reservationMetric = repo.create({
      action: event.action,
      calendarId: getAliasFromCalendarId(event.calendarId),
      eventStart: event.start.toISOString(),
      eventEnd: event.end.toISOString(),
    });

    await repo.save(reservationMetric);
  } catch (err) {
    console.error("Tietokantaan loggaus epäonnistui:", err);
  }
}
