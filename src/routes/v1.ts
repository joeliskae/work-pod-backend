import { Router, Request, Response, NextFunction } from "express";
import { google } from "googleapis";
import path from "path";
import { parseToFullCalendarFormat } from "../utils/calendar";
import { calendarMap } from "../config/calendarMap";

const router = Router();

// Google Calendar API setup
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "../../service-account.json"),
  scopes: ["https://www.googleapis.com/auth/calendar"],
});
const calendar = google.calendar({ version: "v3", auth });

function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === "development") return next();
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: "Unauthorized" });
}

// POST /api/v1/book
router.post("/book", ensureAuthenticated, async (req, res): Promise<void> => {
  const alias = req.query.calendarId as string;
  const calendarId = calendarMap[alias];
  const { start, end } = req.body;

  if (!calendarId || !start || !end) {
    res.status(400).json({ error: "Missing or invalid parameters." });
    return;
  }

  try {
    const event = {
      summary: `${(req.user as any)?.displayName ?? "Varattu"}`,
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



// POST /api/v1/events
router.post("/events", ensureAuthenticated, async (req, res): Promise<void> => {
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
    const parsed = parseToFullCalendarFormat(items);

    res.json(parsed);
  } catch (error: any) {
    console.error("Virhe haettaessa kalenteritapahtumia:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/calendars
router.post("/calendars", ensureAuthenticated, (req, res) => {
  const aliases = Object.keys(calendarMap);
  res.json({ calendars: aliases });
});

export default router;
