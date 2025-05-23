import { Router, Request, Response, NextFunction } from "express";
import { parseToFullCalendarFormat } from "../utils/calendar";
import { calendarMap } from "../config/calendarMap";
import { ensureAuthenticated } from "../middleware/auth";
import { calendar } from "../services/googleCalendar";

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

    console.log(`[${new Date().toISOString()}] Someone using /v1/book`);
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

    console.log(`[${new Date().toISOString()}] Someone using /v1/busy`);
    res.json({ success: true, busyTimes: response.data.calendars });
  } catch (error: any) {
    console.error("Virhe haettaessa varauksia:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

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

    console.log(`[${new Date().toISOString()}] Someone using /v1/events`);
    res.json(parsed);
  } catch (error: any) {
    console.error("Virhe haettaessa kalenteritapahtumia:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/calendars
router.get("/calendars", ensureAuthenticated, (req, res) => {
  const aliases = Object.keys(calendarMap);
  console.log(`[${new Date().toISOString()}] Someone using /v1/calendars`);
  res.json({ calendars: aliases });
});

/// GET /api/v1/user-events
router.get("/user-events", ensureAuthenticated, async (req, res): Promise<void> => {
  const userEmail = (req.user as any)?.email || "undefined";

  // Tää varmaan ois hyvä laittaa päälle
  
  // if (!userEmail) {
  //   res.status(400).json({ error: "User email not available." });
  //   return;
  // }

  const timeMin = new Date().toISOString();
  const timeMax = new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString(); // seuraavat 60 päivää

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
