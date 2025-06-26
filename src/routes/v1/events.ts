import { Router } from "express";
import { parseToFullCalendarFormat } from "../../utils/calendar";
import { getCalendarMap } from "../../config/calendarMap";
import { ensureAuthenticated } from "../../middleware/auth";
import { calendar } from "../../services/googleCalendar";
import { getCachedEvents, setCachedEvents } from "../../cache/calendarCache";
import { calendar_v3 } from "googleapis";
import { spamGuard } from "../../middleware/spamGuard";
import { AppDataSource } from "../../data-source";
import { Tablet } from "../../entities/TabletEntity";
import returnErrorResponse from "../../utils/returnErrorResponse";

const router = Router();

// GET /api/v1/events
router.get(
  "/events",
  ensureAuthenticated,
  spamGuard,
  async (req, res): Promise<void> => {
    const alias = req.query.calendarId as string;
    const timeMin = (req.query.timeMin as string)?.trim();
    const timeMax = (req.query.timeMax as string)?.trim();

    const calendarMap = await getCalendarMap();
    const calendarId = calendarMap[alias];

    if (!calendarId) {
      returnErrorResponse(
        res,
        404,
        `Calendar with alias "${alias}" not found.`
      );
      return;
    }

    if (!timeMin || !timeMax) {
      returnErrorResponse(
        res,
        400,
        "Missing required query parameters: timeMin and timeMax."
      );
      return;
    }

    try {
      let events: calendar_v3.Schema$Event[] = [];

      // 1. Yritetään hakea välimuistista
      const cached = getCachedEvents(calendarId);

      if (cached) {
        // 2. Filtteröidään välimuistin eventit annettuun aikaväliin
        const minDate = new Date(timeMin);
        const maxDate = new Date(timeMax);

        req.cacheHit = true;

        events = cached.events.filter((event) => {
          const eventStart = new Date(
            event.start?.dateTime || event.start?.date || ""
          );
          const eventEnd = new Date(
            event.end?.dateTime || event.end?.date || ""
          );
          return eventEnd > minDate && eventStart < maxDate;
        });
      } else {
        // 3. Jos cache puuttuu tai on vanhentunut, haetaan Googlelta ja tallennetaan
        const response = await calendar.events.list({
          calendarId,
          timeMin,
          timeMax,
          singleEvents: true,
          orderBy: "startTime",
        });

        events = response.data.items || [];
        await setCachedEvents(calendarId, events);
      }

      const parsed = parseToFullCalendarFormat(events);
      res.json(parsed);
    } catch (error: unknown) {
      console.error(
        `[${new Date().toISOString()}] Virhe haettaessa kalenteritapahtumia: `,
        error
      );

      if (typeof error === "object" && error !== null && "message" in error) {
        returnErrorResponse(res, 500, (error as { message: string }).message);
      } else {
        returnErrorResponse(
          res,
          500,
          "Unknown error occurred while fetching calendar events."
        );
      }
    }
  }
);

// Tablet endpoint /events/tablet
router.get("/events/tablet", spamGuard, async (req, res): Promise<void> => {
  const tabletRepository = AppDataSource.getRepository(Tablet);

  try {
    const clientIp = req.ip;

    // Haetaan tabletti IP:n perusteella
    const userIp = clientIp?.replace(/^::ffff:/, "");
    const tablet = await tabletRepository.findOne({
      where: { ipAddress: userIp },
    });

    if (!tablet || !tablet.calendarId) {
      returnErrorResponse(res, 404, "Tablet not found for IP: " + userIp);
      return;
    }

    res.json(tablet.calendarId);
  } catch (error) {
    returnErrorResponse(res, 500, "Error fetching tablet ID: " + error);
  }
});

export default router;
