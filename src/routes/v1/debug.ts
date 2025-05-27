import { Router } from "express";
import { calendarCache } from "../../cache/calendarCache";
import { calendar_v3 } from "googleapis";

const router = Router();

type CachedEventSummary = {
  id?: string | null;
  summary?: string | null;
  description?: string | null;
  start?: string | null;
  end?: string | null;
  status?: string | null;
};

type CachedCalendarOutput = {
  lastFetched: string;
  events: CachedEventSummary[];
};

router.get("/cache", (req, res) => {
  const output: Record<string, CachedCalendarOutput> = {};

  for (const [calendarId, entry] of calendarCache.entries()) {
    output[calendarId] = {
      lastFetched: entry.lastFetched.toISOString(),
      events: entry.events.map((event: calendar_v3.Schema$Event) => ({
        id: event.id ?? null,
        summary: event.summary ?? null,
        description: event.description ?? null,
        start: event.start?.dateTime ?? event.start?.date ?? null,
        end: event.end?.dateTime ?? event.end?.date ?? null,
        status: event.status ?? null,
      }))
    };
  }

  res.json({
    success: true,
    calendars: output
  });
});

export default router;
