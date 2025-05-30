import { Router } from "express";
import { calendarMap } from "../../config/calendarMap";
import { ensureAuthenticated } from "../../middleware/auth";
import { calendar } from "../../services/googleCalendar";
import { AuthenticatedRequest } from "../../types/auth";
import { setCachedEvents } from "../../cache/calendarCache";
import { logBookingEvent } from "../../utils/logBookingEvents";

const router = Router();

// DELETE /api/v1/cancel/:calendarId/:eventId
router.delete("/cancel/:calendarId/:eventId", ensureAuthenticated, async (req: AuthenticatedRequest, res): Promise<void> => {
  const alias = req.params.calendarId;
  const eventId = req.params.eventId;
  const userEmail = req.user?.email;

  if (!alias || !eventId || !userEmail) {
    res.status(400).json({ error: "Missing calendarId, eventId, or user email" });
    return;
  }

  const calendarId = calendarMap[alias];
  if (!calendarId) {
    res.status(400).json({ error: "Invalid calendar ID" });
    return;
  }

  try {
    // Hae tapahtuma ensin ja varmista että käyttäjä omistaa sen
    const event = await calendar.events.get({ calendarId, eventId });

    const eventDescription = event.data.description || "";
    if (!eventDescription.includes(userEmail)) {
      res.status(403).json({ error: "You can only cancel your own bookings" });
      return;
    }

    // Kerätään anonyymiä dataa

    const startStr = event.data.start?.dateTime;
    const endStr = event.data.end?.dateTime;

    if (typeof startStr === "string" && typeof endStr === "string") {
      logBookingEvent({
        action: 'deleted',
        calendarId,
        start: new Date(startStr),
        end: new Date(endStr)
      });
    } else {
      console.warn("Ei voitu logittaa peruutustapahtumaa: puuttuva start/end.");
    }

    // Poista tapahtuma
    await calendar.events.delete({ calendarId, eventId });

    // Päivitä välimuisti
    const refreshed = await calendar.events.list({
      calendarId,
      timeMin: new Date().toISOString(),
      timeMax: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // seuraavat 30 päivää
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = (refreshed.data.items || []).filter(e => e.status !== "cancelled");
    setCachedEvents(calendarId, events);

    res.json({ success: true, message: "Booking cancelled successfully" });

  } catch (error: unknown) {
    console.error("Varauksen peruutus epäonnistui:", error);

    if (typeof error === "object" && error !== null) {
      const err = error as { code?: number; message?: string };

      if (err.code === 404) {
        res.status(404).json({ error: "Booking not found" });
        return;
      } else if (err.code === 410) {
        res.status(410).json({ error: "Booking already cancelled" });
        return;
      } else if (err.message) {
        res.status(500).json({ error: err.message });
        return;
      }
    }

    res.status(500).json({ error: "Unknown error occurred" });
  }
});

export default router;
