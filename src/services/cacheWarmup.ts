
import { calendar } from "./googleCalendar";
import { getCalendarMap } from "../config/calendarMap";
import { setCachedEvents } from "../cache/calendarCache";

//TODO: Tee päivittäin imuroitava cache
export async function warmUpCache() {
  const calendarMap = await getCalendarMap();
  const now = new Date();
  const future = new Date(now);
  future.setDate(future.getDate() + 30); // Välimuistin pituus <- esim 30 päivää

  const promises = Object.entries(calendarMap).map(async ([alias, calendarId]) => {
    try {
      const response = await calendar.events.list({
        calendarId,
        timeMin: now.toISOString(),
        timeMax: future.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
      });

      const events = response.data.items || [];
      setCachedEvents(calendarId, events);
      console.log(`[Cache] Warmed cache for ${alias} with ${events.length} events.`);
    } catch (err) {
      console.error(`[Cache] Failed to warm cache for ${alias} (${calendarId})`, err);
    }
  });

  await Promise.all(promises);
}
