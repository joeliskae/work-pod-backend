// --- src/routes/v1.ts ---
import { Router, Request, Response, NextFunction } from "express";
import { google } from "googleapis";
import path from "path";
import { parseToFullCalendarFormat } from "../utils/calendar";

const router = Router();

// Google Calendar API setup
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "../../service-account.json"),
  scopes: ["https://www.googleapis.com/auth/calendar"],
});
const calendar = google.calendar({ version: "v3", auth });

function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === "development") return next(); // kehitystilassa ohitetaan auth
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: "Unauthorized" });
}


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

// POST /api/v1/events
router.post("/events", ensureAuthenticated, async function (req: Request, res: Response): Promise<void> {
  const calendarId = req.query.calendarId;
  const timeMin = req.query.timeMin;
  const timeMax = req.query.timeMax;

  if (
    typeof calendarId !== "string" ||
    typeof timeMin !== "string" ||
    typeof timeMax !== "string"
  ) {
    res.status(400).json({ error: "Missing or invalid query parameters." });
    return;
  }

  try {
  const timeMinClean = timeMin.trim();
  const timeMaxClean = timeMax.trim();

  const response = await calendar.events.list({
    calendarId,
    timeMin: timeMinClean,
    timeMax: timeMaxClean,
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
export default router;
