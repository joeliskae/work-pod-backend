import { Router, Request, Response, NextFunction } from "express";
import { calendarMap } from "../../config/calendarMap";
import { ensureAuthenticated } from "../../middleware/auth";
import { calendar } from "../../services/googleCalendar";

const router = Router();

// POST /api/v1/book
router.post("/book", ensureAuthenticated, async (req, res): Promise<void> => {
  const alias = req.body.calendarId as string;
  const calendarId = calendarMap[alias];
  const { start, end } = req.body;

  if (!calendarId || !start || !end) {
    res.status(400).json({ error: "Missing or invalid parameters." });
    return;
  }

  try {
    const event = {
      summary: `${(req.user as any)?.name ?? "Varattu"}`,
      description: `user_email: ${(req.user as any)?.email}`,
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

export default router;