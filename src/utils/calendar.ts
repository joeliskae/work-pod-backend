export function parseToFullCalendarFormat(items: any[]): any[] {
  return items.map((event) => ({
    id: event.id,
    title: event.summary || "Ei otsikkoa",
    start: event.start?.dateTime || event.start?.date,
    end: event.end?.dateTime || event.end?.date,
    allDay: !!event.start?.date,
    url: event.htmlLink,
  }));
}
