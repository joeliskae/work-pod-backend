import { Router } from "express";
import { calendarMap } from "../../config/calendarMap";
import { ensureAuthenticated } from "../../middleware/auth";
import { calendar } from "../../services/googleCalendar";

const router = Router();

// Apufunktio joka tarkistaa onko kalenteri varattu
async function checkAvailability(calendarId: string, start: string, end: string): Promise<{ available: boolean, conflictingEvents?: any[] }> {
  try {
    const response = await calendar.events.list({
      calendarId,
      timeMin: start,
      timeMax: end,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    
    // Filtteröidään pois peruutetut tapahtumat
    const activeEvents = events.filter(event => event.status !== 'cancelled');
    
    if (activeEvents.length > 0) {
      return {
        available: false,
        conflictingEvents: activeEvents.map(event => ({
          id: event.id,
          summary: event.summary,
          start: event.start?.dateTime || event.start?.date,
          end: event.end?.dateTime || event.end?.date,
        }))
      };
    }

    return { available: true };
  } catch (error) {
    console.error('Availability check failed:', error);
    throw new Error('Kalenterin saatavuuden tarkistus epäonnistui');
  }
}

// POST /api/v1/book
router.post("/book", ensureAuthenticated, async (req, res): Promise<void> => {
  const alias = req.body.calendarId as string;
  const calendarId = calendarMap[alias];
  const { start, end } = req.body;

  if (!calendarId || !start || !end) {
    res.status(400).json({ error: "Missing or invalid parameters." });
    return;
  }

  // Validoidaan että start on ennen end aikaa
  if (new Date(start) >= new Date(end)) {
    res.status(400).json({ error: "Start time must be before end time." });
    return;
  }

  try {
    // Tarkistetaan onko kalenteri vapaana
    const availability = await checkAvailability(calendarId, start, end);
    
    if (!availability.available) {
      res.status(409).json({ 
        success: false, 
        error: "Kalenteri on jo varattu kyseiselle ajankohdalle.",
        conflictingEvents: availability.conflictingEvents
      });
      return;
    }

    // Jos kalenteri on vapaa, luodaan varaus
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
    
    // Jos virhe on konfliktista johtuva, palautetaan 409
    if (error.message.includes('saatavuuden tarkistus')) {
      res.status(500).json({ success: false, error: "Kalenterin tarkistus epäonnistui. Yritä uudelleen." });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
});

export default router;