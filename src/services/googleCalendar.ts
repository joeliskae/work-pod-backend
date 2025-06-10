import { google } from "googleapis";
import path from "path";

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "../../service-account.json"),
  scopes: ["https://www.googleapis.com/auth/calendar"],
});

const calendar = google.calendar({ version: "v3", auth });

export async function createCalendar(summary: string) {
  const res = await calendar.calendars.insert({
    requestBody: {
      summary,
      timeZone: 'Europe/Helsinki',
    },
  });
  return res.data; // { id, summary, ... }
}

// Poistaa kalenterin Google Kalenterista
export async function deleteCalendar(calendarId: string): Promise<void> {
  await calendar.calendars.delete({
    calendarId,
  });
}

export { calendar };
