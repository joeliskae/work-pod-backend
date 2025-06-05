import { AppDataSource } from '../data-source';
import { Calendar as CalendarEntity } from '../entities/Calendar';
import { ReservationMetric } from '../entities/ReservationMetrics';

export type ReservationEvent = {
  action: 'created' | 'deleted';
  calendarId: string;  // Google Calendar ID
  start: Date;
  end: Date;
};


export async function logBookingEvent(event: ReservationEvent): Promise<void> {
  try {

    const repo = AppDataSource.getRepository(ReservationMetric);
    const calendarRepo = AppDataSource.getRepository(CalendarEntity);

    // Haetaan Calendar entiteetti Google calendarId:n perusteella
    const calendarEntry = await calendarRepo.findOneBy({ calendarId: event.calendarId });

    const reservationMetric = repo.create({
      action: event.action,
      // TÄSSÄ tallennetaan alias, eli esim. "C238-1"
      calendarId: calendarEntry?.alias ?? event.calendarId,  
      eventStart: event.start.toISOString(),
      eventEnd: event.end.toISOString(),
    });

    await repo.save(reservationMetric);
  } catch (err) {
    console.error("Tietokantaan loggaus epäonnistui:", err);
  }
}

