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
      summary: `${(req.user as any)?.displayName ?? "Varattu"}`,
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

// GET /api/v1/my-events
// Tää vaatii kunnon testausta ???
router.get("/my-events", ensureAuthenticated, async (req, res): Promise<void> => {
  const user = req.user as any;
  const displayName = user?.displayName;

  if (!displayName) {
    res.status(400).json({ error: "User display name missing." });
    return;
  }

  const timeMin = new Date().toISOString(); // nykyaika
  const timeMax = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(); // esim. 1 vuosi eteenpäin

  try {
    const allEvents: any[] = [];

    const calendarIds = Object.values(calendarMap);

    for (const calendarId of calendarIds) {
      const result = await calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: "startTime",
        q: displayName, // Google API:n haku – hakee mm. summarystä
      });

      const items = result.data.items || [];

      // Filtteröidään vielä tarkemmin ne, joissa summary sisältää käyttäjän nimen
      const userEvents = items.filter(event =>
        event.summary?.includes(displayName)
      );

      allEvents.push(...userEvents);
    }

    // Järjestetään aikajärjestykseen
    allEvents.sort((a, b) =>
      (a.start?.dateTime || a.start?.date || "") > (b.start?.dateTime || b.start?.date || "") ? 1 : -1
    );

    // Palautetaan kaikki sopivat varaukset
    console.log("Someone using /v1/my-events");
    res.json({
      events: allEvents.map(event => ({
        title: event.summary,
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,
        calendarId: event.organizer?.email || undefined,
        id: event.id,
      })),
    });
  } catch (error: any) {
    console.error("Virhe haettaessa käyttäjän varauksia:", error);
    res.status(500).json({ error: error.message });
  }
});


export default router;
