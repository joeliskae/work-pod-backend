import { AppDataSource } from '../data-source';
import { Calendar } from '../entities/Calendar';

let cachedCalendarMap: Record<string, string> | null = null;

export async function getCalendarMap(): Promise<Record<string, string>> {

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const repo = AppDataSource.getRepository(Calendar);
  const calendars = await repo.find();

  cachedCalendarMap = calendars.reduce((map, cal) => {
    map[cal.alias] = cal.calendarId;
    return map;
  }, {} as Record<string, string>);

  return cachedCalendarMap;
}
