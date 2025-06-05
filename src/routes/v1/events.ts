import { Router } from "express";
import { parseToFullCalendarFormat } from "../../utils/calendar";
import { getCalendarMap } from "../../config/calendarMap";
import { ensureAuthenticated } from "../../middleware/auth";
import { calendar } from "../../services/googleCalendar";
import { getCachedEvents, setCachedEvents } from "../../cache/calendarCache";
import { calendar_v3 } from "googleapis";
import { spamGuard } from "../../middleware/spamGuard";

const router = Router();

// GET /api/v1/events
router.get("/events", ensureAuthenticated, spamGuard, async (req, res): Promise<void> => {
  const alias = req.query.calendarId as string;
  const timeMin = (req.query.timeMin as string)?.trim();
  const timeMax = (req.query.timeMax as string)?.trim();

  const calendarMap = await getCalendarMap();
  const calendarId = calendarMap[alias];

  if (!calendarId || !timeMin || !timeMax) {
    res.status(400).json({ error: "Missing or invalid parameters." });
    return;
  }

  try {
    let events: calendar_v3.Schema$Event[] = [];


    // 1. Yritetään hakea välimuistista
    const cached = getCachedEvents(calendarId);

    if (cached) {
      // 2. Filtteröidään välimuistin eventit annettuun aikaväliin
      const minDate = new Date(timeMin);
      const maxDate = new Date(timeMax);

      req.cacheHit = true;

      events = cached.events.filter((event) => {
        const eventStart = new Date(event.start?.dateTime || event.start?.date || "");
        const eventEnd = new Date(event.end?.dateTime || event.end?.date || "");
        return eventEnd > minDate && eventStart < maxDate;
      });
    } else {
      // 3. Jos cache puuttuu tai on vanhentunut, haetaan Googlelta ja tallennetaan
      const response = await calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: "startTime",
      });

      events = response.data.items || [];
      await setCachedEvents(calendarId, events);
    }

    const parsed = parseToFullCalendarFormat(events);
    res.json(parsed);
    } catch (error: unknown) {
      console.error(`[${new Date().toISOString()}] Virhe haettaessa kalenteritapahtumia: `, error);

      if (typeof error === "object" && error !== null && "message" in error) {
        res.status(500).json({ error: (error as { message: string }).message });
      } else {
        res.status(500).json({ error: "Tuntematon virhe" });
      }
    }
});

export default router;
