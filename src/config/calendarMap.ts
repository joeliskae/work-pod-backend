import { AppDataSource } from '../data-source';
import { Calendar } from '../entities/Calendar';

let cachedCalendarMap: Record<string, string> | null = null;
let lastFetch = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minuutti

export async function getCalendarMap(): Promise<Record<string, string>> {
  const now = Date.now();

  if (cachedCalendarMap && (now - lastFetch) < CACHE_TTL_MS) {
    return cachedCalendarMap;
  }

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const repo = AppDataSource.getRepository(Calendar);
  const calendars = await repo.find();

  cachedCalendarMap = calendars.reduce((map, cal) => {
    map[cal.alias] = cal.calendarId;
    return map;
  }, {} as Record<string, string>);

  lastFetch = now;
  return cachedCalendarMap;
}
