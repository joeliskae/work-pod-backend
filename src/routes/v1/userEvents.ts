import { Router } from "express";
import { calendarMap } from "../../config/calendarMap";
import { ensureAuthenticated } from "../../middleware/auth";
import { calendar } from "../../services/googleCalendar";
import { getCachedEvents, setCachedEvents } from "../../cache/calendarCache";

const router = Router();

// GET /api/v1/user-events
router.get("/user-events", ensureAuthenticated, async (req, res): Promise<void> => {
  const userEmail = (req.user as any)?.email;

  if (!userEmail) {
    res.status(400).json({ error: "User email not available." });
    return;
  }

  const now = new Date();
  const timeMin = now.toISOString();
  const timeMax = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30).toISOString(); // 30 päivää eteenpäin

  const results: any[] = [];

  try {
    for (const alias of Object.keys(calendarMap)) {
      const calendarId = calendarMap[alias];
      let events = getCachedEvents(calendarId)?.events;

      if (events) {
        req.cacheHit = true;
      } else {
        // Ei ollut cachea -> hae Googlelta ja cacheta
        const response = await calendar.events.list({
          calendarId,
          timeMin,
          timeMax,
          singleEvents: true,
          orderBy: "startTime",
        });

        events = response.data.items || [];
        setCachedEvents(calendarId, events);
        req.cacheHit = false;
      }

      const matching = events
        .filter(event =>
          event.description?.trim() === userEmail &&
          event.start?.dateTime &&
          event.start.dateTime >= timeMin &&
          event.start.dateTime <= timeMax
        )
        .map(event => ({
          id: event.id,
          calendarId: alias,
          title: event.summary || "Varattu",
          start: event.start?.dateTime || event.start?.date,
          end: event.end?.dateTime || event.end?.date,
          description: event.description || "",
        }));

      results.push(...matching);
    }

    res.json(results);
  } catch (error: any) {
    console.error("Virhe haettaessa käyttäjän varauksia:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
