// src/routes/debug.ts

import { Router } from "express";
import { calendarCache } from "../../cache/calendarCache";

const router = Router();

// GET /api/v1/debug/cache
router.get("/cache", (req, res) => {
  const output: Record<string, any> = {};

  for (const [calendarId, entry] of calendarCache.entries()) {
    output[calendarId] = {
      lastFetched: entry.lastFetched.toISOString(),
      events: entry.events.map((event) => ({
        id: event.id,
        summary: event.summary,
        description: event.description,
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,
        status: event.status,
      }))
    };
  }

  res.json({
    success: true,
    calendars: output
  });
});

export default router;
