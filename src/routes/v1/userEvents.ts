import { Router } from "express";
import { calendarMap } from "../../config/calendarMap";
import { ensureAuthenticated } from "../../middleware/auth";
import { calendar } from "../../services/googleCalendar";

const router = Router();

/// GET /api/v1/user-events
router.get("/user-events", ensureAuthenticated, async (req, res): Promise<void> => {
  const userEmail = (req.user as any)?.email;
  
  if (!userEmail) {
    res.status(400).json({ error: "User email not available." });
    return;
  }

  const timeMin = new Date().toISOString();
  const timeMax = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(); // seuraavat 30 päivää

  const results: any[] = [];

  try {
    for (const alias of Object.keys(calendarMap)) {
      const calendarId = calendarMap[alias];
      const response = await calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: "startTime",
      });

      const matching = (response.data.items || []).filter((event) =>
        event.description?.includes(userEmail)
      ).map((event) => ({
        id: event.id,
        calendarId: alias,
        title: event.summary || "Varattu",
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,
        description: event.description || "",
      }));

      results.push(...matching);
    }

    console.log(`[${new Date().toISOString()}] Someone using /v1/user-events`);
    res.json(results);
  } catch (error: any) {
    console.error("Virhe haettaessa käyttäjän varauksia:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;