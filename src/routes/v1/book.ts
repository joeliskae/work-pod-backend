import { Router } from "express";
import { getCalendarMap } from "../../config/calendarMap";
import { ensureAuthenticated } from "../../middleware/auth";
import { calendar } from "../../services/googleCalendar";
import { setCachedEvents } from "../../cache/calendarCache";
import { CalendarEvent } from "../../types/calendar";
import { AuthenticatedRequest } from "../../types/auth";
import { logBookingEvent } from "../../utils/logBookingEvents";
<<<<<<< HEAD
import { spamGuard } from "../../middleware/spamGuard";
=======
import returnErrorResponse from "../../utils/returnErrorResponse";
>>>>>>> f070a4fa201cee627bb36fba72538630b90bc57c

const router = Router();

// Apufunktio joka tarkistaa onko kalenteri varattu
async function checkAvailability(
  calendarId: string,
  start: string,
  end: string
): Promise<{ available: boolean; conflictingEvents?: CalendarEvent[] }> {
  try {
    const response = await calendar.events.list({
      calendarId,
      timeMin: start,
      timeMax: end,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events: CalendarEvent[] = response.data.items || [];

    // Filtteröidään pois peruutetut tapahtumat
    const activeEvents = events.filter((event) => event.status !== "cancelled");

    if (activeEvents.length > 0) {
      return {
        available: false,
        conflictingEvents: activeEvents.map((event) => ({
          id: event.id,
          summary: event.summary,
          start: event.start || event.start,
          end: event.end || event.end,
        })),
      };
    }

    return { available: true };
  } catch (error) {
    console.error("Availability check failed:", error);
    throw new Error("Kalenterin saatavuuden tarkistus epäonnistui");
  }
}

router.post("/book", ensureAuthenticated, async (req: AuthenticatedRequest, res): Promise<void> => {
  const alias = req.body.calendarId as string;
  const calendarMap = await getCalendarMap();
  const calendarId = calendarMap[alias];
  const { start, end } = req.body;
=======
router.post(
  "/book",
  ensureAuthenticated,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    const alias = req.body.calendarId as string;
    const calendarMap = await getCalendarMap();
    const calendarId = calendarMap[alias];
    const { start, end } = req.body;
>>>>>>> f070a4fa201cee627bb36fba72538630b90bc57c

    if (!calendarId || !start || !end) {
      returnErrorResponse(
        res,
        400,
        "Calendar ID, start time and end time are required."
      );
      return;
    }

    if (new Date(start) >= new Date(end)) {
      returnErrorResponse(res, 400, "Start time must be before end time.");
      return;
    }

    try {
      const availability = await checkAvailability(calendarId, start, end);

      if (!availability.available) {
        returnErrorResponse(
          res,
          409,
          "Calendar is already booked for the selected time."
        );
        return;
      }

      const event = {
        summary: `${req.user?.name ?? "Varattu"}`,
        description: `${req.user?.email}`,
        start: { dateTime: start },
        end: { dateTime: end },
      };

      const response = await calendar.events.insert({
        calendarId,
        requestBody: event,
      });

      // Kerätään anonyymiä usage dataa
      logBookingEvent({
        action: "created",
        calendarId,
        start: new Date(start),
        end: new Date(end),
      });

      // Haetaan uudet tapahtumat ja päivitetään välimuisti
      const refreshed = await calendar.events.list({
        calendarId,
        timeMin: new Date().toISOString(),
        timeMax: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // seuraavat 30 päivää
        singleEvents: true,
        orderBy: "startTime",
      });

      const events = (refreshed.data.items || []).filter(
        (e) => e.status !== "cancelled"
      );
      setCachedEvents(calendarId, events);

      res.json({ success: true, link: response.data.htmlLink });
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Varaus epäonnistui: `,
        error
      );

      if (error instanceof Error) {
        returnErrorResponse(res, 500, "Booking failed: " + error.message);
      } else {
        returnErrorResponse(res, 500, "Unknown error occurred during booking.");
      }
    }
  }
);

export default router;
