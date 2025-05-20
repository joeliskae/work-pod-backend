import { Router, Request, Response, NextFunction } from "express";
import { google } from "googleapis";
import { calendar } from "../services/googleCalendar";
import { ensureAuthenticated } from "../middleware/auth";

const router = Router();

// POST /api/v1/book
router.post("/book", ensureAuthenticated, async (req, res) => {
  const { calendarId, start, end } = req.body;

  try {
    const event = {
      summary: `Kopin varaus – ${(req.user as any).displayName}`,
      start: { dateTime: start },
      end: { dateTime: end },
    };

    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
    });

    res.json({ success: true, link: response.data.htmlLink });
  } catch (error: any) {
    console.error("Varaus epäonnistui:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/busy
router.post("/busy", ensureAuthenticated, async (req, res) => {
  const { calendarIds, timeMin, timeMax } = req.body;

  try {
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        timeZone: "Europe/Helsinki",
        items: calendarIds.map((id: string) => ({ id })),
      },
    });

    res.json({ success: true, busyTimes: response.data.calendars });
  } catch (error: any) {
    console.error("Virhe haettaessa varauksia:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
