import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const dbPromise = open({
  filename: './usage.sqlite',
  driver: sqlite3.Database,
});

export type ReservationEvent = {
  action: 'created' | 'deleted';
  calendarId: string;
  start: Date;
  end: Date;
};

import { calendarMap } from "../config/calendarMap";

  export function getAliasFromCalendarId(calendarId: string): string | undefined {
    return Object.keys(calendarMap).find(alias => calendarMap[alias] === calendarId);
}


export async function logBookingEvent(event: ReservationEvent): Promise<void> {
  try {
    const db = await dbPromise;

    await db.run(
      `INSERT INTO reservation_metrics (action, calendar_id, event_start, event_end)
       VALUES (?, ?, ?, ?)`,
      [
        event.action,
        getAliasFromCalendarId(event.calendarId),
        event.start.toISOString(),
        event.end.toISOString(),
      ]
    );
  } catch (err) {
    console.error("Tietokantaan loggaus epäonnistui:", err);
  }
}
