import { Router } from "express";
import { calendarMap } from "../../config/calendarMap";
import { ensureAuthenticated } from "../../middleware/auth";
import { getCachedEvents } from "../../cache/calendarCache";
import { calendar_v3 } from "googleapis";

const router = Router();

// Apufunktio: Onko tapahtuma käynnissä juuri nyt
function isEventOngoingNow(event: calendar_v3.Schema$Event): boolean {
  const now = new Date();
  const start = new Date(event.start?.dateTime || event.start?.date || "");
  const end = new Date(event.end?.dateTime || event.end?.date || "");
  return start <= now && now < end;
}

// GET /api/v1/calendars
router.get("/calendars", ensureAuthenticated, (req, res) => {
  const calendars = Object.entries(calendarMap).map(([alias, calendarId]) => {
    const cached = getCachedEvents(calendarId);
    if (!cached) {
      return { alias, status: "unknown" };
    }

    const isBusy = cached.events.some((event) => {
      return event.status !== "cancelled" && isEventOngoingNow(event);
    });

    return {
      alias,
      status: isBusy ? "busy" : "free",
    };
  });

  res.json({ calendars });
});

export default router;
