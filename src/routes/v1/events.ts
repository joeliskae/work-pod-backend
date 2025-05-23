import { Router} from "express";
import { parseToFullCalendarFormat } from "../../utils/calendar";
import { calendarMap } from "../../config/calendarMap";
import { ensureAuthenticated } from "../../middleware/auth";
import { calendar } from "../../services/googleCalendar";

const router = Router();

// GET /api/v1/events
router.get("/events", ensureAuthenticated, async (req, res): Promise<void> => {
  const alias = req.query.calendarId as string;
  const timeMin = (req.query.timeMin as string)?.trim();
  const timeMax = (req.query.timeMax as string)?.trim();

  const calendarId = calendarMap[alias];

  if (!calendarId || !timeMin || !timeMax) {
    res.status(400).json({ error: "Missing or invalid parameters." });
    return;
  }

  try {
    const response = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
    });

    const items = response.data.items || [];
    // console.log(items);
    const parsed = parseToFullCalendarFormat(items);

    res.json(parsed);
  } catch (error: any) {
    console.error("Virhe haettaessa kalenteritapahtumia:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;