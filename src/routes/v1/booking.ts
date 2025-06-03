import { Router } from "express";
import { calendarMap } from "../../config/calendarMap";
import { ensureAuthenticated } from "../../middleware/auth";
import { calendar } from "../../services/googleCalendar";
import { AuthenticatedRequest } from "../../types/auth";

const router = Router();

// GET /api/v1/booking/:calendarId/:eventId
router.get("/booking/:calendarId/:eventId", ensureAuthenticated, async (req: AuthenticatedRequest, res): Promise<void> => {
  const alias = req.params.calendarId;
  const eventId = req.params.eventId;
  const calendarId = calendarMap[alias];
  const userEmail = (req.user)?.email;

  if (!calendarId || !eventId || !userEmail) {
    res.status(400).json({ error: "Missing calendarId, eventId, or user info" });
    return;
  }

  try {
    const event = await calendar.events.get({
      calendarId,
      eventId,
    });

    const description = event.data.description || "";
    const isOwner = description.includes(`${userEmail}`);

    if (!isOwner) {
      res.status(403).json({ error: "Not authorized to view this booking" });
      return;
    }

    const start = new Date(event.data.start?.dateTime || "");
    const end = new Date(event.data.end?.dateTime || "");

    const response = {
      name: event.data.summary || "Tuntematon", // Varauksen tekijän nimi
      room: alias,
      date: start.toISOString().split("T")[0],
      start: start.toTimeString().slice(0, 5),
      end: end.toTimeString().slice(0, 5)
    };

    res.json(response);

} catch (error) {
  console.error(`[${new Date().toISOString()}] Virhe varauksen haussa: `, error);

  if (error instanceof Error) {
    // Jos error on Error-tyyppi, tarkistetaan onko 'code' siinä (tyyppiturvallisesti)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyError = error as any;
    if (anyError.code === 404) {
      res.status(404).json({ error: "Booking not found" });
    } else {
      res.status(500).json({ error: error.message });
    }
  } else {
    // Jos error ei ole Error-tyyppiä, lähetetään geneerinen virheviesti
    res.status(500).json({ error: "Tuntematon virhe" });
  }
}

});

export default router;