import { Router } from "express";
import { calendarMap } from "../../config/calendarMap";
import { ensureAuthenticated } from "../../middleware/auth";
import { calendar } from "../../services/googleCalendar";

const router = Router();

// DELETE /api/v1/cancel/:calendarId/:eventId
router.delete("/cancel/:calendarId/:eventId", ensureAuthenticated, async (req, res): Promise<void> => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Someone using /v1/cancel`);

  const alias = req.params.calendarId;
  const eventId = req.params.eventId;
  const userEmail = (req.user as any)?.email;

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
    // Hae tapahtuma ensin ja tarkista että se kuuluu käyttäjälle
    const event = await calendar.events.get({
      calendarId,
      eventId
    });

    const eventDescription = event.data.description || "";
    if (!eventDescription.includes(`user_email: ${userEmail}`)) {
      res.status(403).json({ error: "You can only cancel your own bookings" });
      return;
    }

    // Poista tapahtuma
    await calendar.events.delete({
      calendarId,
      eventId
    });

    console.log(`[${timestamp}] ${userEmail} cancelled booking ${eventId}`);
    res.json({ success: true, message: "Booking cancelled successfully" });

  } catch (error: any) {
    console.error("Varauksen peruutus epäonnistui:", error);

    if (error.code === 404) {
      res.status(404).json({ error: "Booking not found" });
    } else if (error.code === 410) {
      res.status(410).json({ error: "Booking already cancelled" });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

export default router;
