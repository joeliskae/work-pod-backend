import { Router, Request, Response } from "express";
import { calendarMap } from "../../config/calendarMap";
import { ensureAuthenticated } from "../../middleware/auth";
import { calendar } from "../../services/googleCalendar";

const router = Router();

// POST /api/v1/busy
router.post("/busy", ensureAuthenticated, async (req: Request, res: Response): Promise<void> => {
  const { calendarIds, timeMin, timeMax } = req.body;

  if (!Array.isArray(calendarIds) || !timeMin || !timeMax) {
    res.status(400).json({ error: "Missing or invalid parameters." });
    return;
  }

  const ids = calendarIds
    .map((alias: string) => calendarMap[alias])
    .filter((id): id is string => typeof id === "string");

  if (ids.length === 0) {
    res.status(400).json({ error: "No valid calendar IDs found." });
    return;
  }

  try {
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        timeZone: "Europe/Helsinki",
        items: ids.map((id) => ({ id })),
      },
    });

    res.json({ success: true, busyTimes: response.data.calendars });
  } catch (error: any) {
    console.error("Virhe haettaessa varauksia:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;