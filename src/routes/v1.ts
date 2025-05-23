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

// DELETE /api/v1/cancel/:calendarId/:eventId
router.delete("/cancel/:calendarId/:eventId", ensureAuthenticated, async (req, res): Promise<void> => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Someone using /v1/cancel`);

  const alias = req.params.calendarId;
  const eventId = req.params.eventId;
  const userEmail = (req.user as any)?.email;

  if (!alias || !eventId || !userEmail) {
    res.status(400).json({ error: "Missing calendarId, eventId, or user email" });
    return;
  }

  const calendarId = calendarMap[alias];
  if (!calendarId) {
    res.status(400).json({ error: "Invalid calendar ID" });
    return;
  }

  try {
    // Hae tapahtuma ensin ja tarkista että se kuuluu käyttäjälle
    const event = await calendar.events.get({
      calendarId,
      eventId
    });

    const eventDescription = event.data.description || "";
    if (!eventDescription.includes(`user_email: ${userEmail}`)) {
      res.status(403).json({ error: "You can only cancel your own bookings" });
      return;
    }

    // Poista tapahtuma
    await calendar.events.delete({
      calendarId,
      eventId
    });

    console.log(`[${timestamp}] ${userEmail} cancelled booking ${eventId}`);
    res.json({ success: true, message: "Booking cancelled successfully" });

  } catch (error: any) {
    console.error("Varauksen peruutus epäonnistui:", error);

    if (error.code === 404) {
      res.status(404).json({ error: "Booking not found" });
    } else if (error.code === 410) {
      res.status(410).json({ error: "Booking already cancelled" });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// GET /api/v1/booking/:calendarId/:eventId
router.get("/booking/:calendarId/:eventId", ensureAuthenticated, async (req, res): Promise<void> => {
  const alias = req.params.calendarId;
  const eventId = req.params.eventId;
  const calendarId = calendarMap[alias];
  const userEmail = (req.user as any)?.email;

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
    const isOwner = description.includes(`user_email: ${userEmail}`);

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

  } catch (error: any) {
    console.error("Virhe varauksen haussa:", error);

    if (error.code === 404) {
      res.status(404).json({ error: "Booking not found" });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

export default router;
