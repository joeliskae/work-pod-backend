import { calendar_v3 } from "googleapis";

export type CalendarEvent = Partial<calendar_v3.Schema$Event> & {
  // available?: boolean,
  // [key: string]: any; // optional fallback jos jotain jää uupumaan
};

export type CalendarCacheEntry = {
  events: calendar_v3.Schema$Event[];
  lastFetched: Date;
};

export type UserEvent = {
  id?: string | null;
  calendarId: string;
  title: string;
  start?: string | null;
  end?: string | null;
  // description: string;
};