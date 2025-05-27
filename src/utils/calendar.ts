import { calendar_v3 } from "googleapis";

export function parseToFullCalendarFormat(
  items: calendar_v3.Schema$Event[]
): {
  id?: string;
  title: string;
  start?: string;
  end?: string;
  description: string;
}[] {
  return items.map(event => ({
    id: event.id ?? undefined,
    title: event.summary ?? "Ei otsikkoa",
    start: (event.start?.dateTime ?? event.start?.date) ?? undefined,
    end: (event.end?.dateTime ?? event.end?.date) ?? undefined,
    description: event.description ?? "",
  }));
}
