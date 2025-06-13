import { Request, Response, Router } from "express";
import { AppDataSource } from "../../data-source"; // tai missä ikinä onkaan
import { ReservationMetric } from "../../entities/ReservationMetrics";
import { DateTime } from "luxon";
import { Calendar } from "../../entities/Calendar";

const router = Router();

const FINNISH_ZONE = "Europe/Helsinki"; // Hoitaa kesä ja talviajat :)
const monthNamesFi: Record<string, number> = {
  Tammi: 1,
  Helmi: 2,
  Maalis: 3,
  Huhti: 4,
  Touko: 5,
  Kesä: 6,
  Heinä: 7,
  Elo: 8,
  Syys: 9,
  Loka: 10,
  Marras: 11,
  Joulu: 12,
};

// Spesifinen aikaväli (tunti/viikonpäivä/kuukausi)
router.get("/analytics-drilldown", async (req: Request, res: Response) => {
  try {
    const { type, value } = req.query;

    if (!type || !value) {
      res.status(400).json({ error: "Missing type or value" });
      return;
    }

    const metricRepo = AppDataSource.getRepository(ReservationMetric);
    const calendarRepo = AppDataSource.getRepository(Calendar);

    const events = await metricRepo
      .createQueryBuilder("rm")
      .where("rm.action = :action", { action: "created" })
      .getMany();

    const filteredEvents = events.filter((event) => {
      if (!event.eventStart) return false;
      const eventTime = DateTime.fromISO(event.eventStart, {
        zone: "utc",
      }).setZone(FINNISH_ZONE);

      switch (type) {
        case "hour":
          return eventTime.hour === Number(value);
        case "weekday":
          return eventTime.weekday === Number(value);
        case "month": {
          if (/^\d{4}-\d{2}$/.test(value as string)) {
            return eventTime.toFormat("yyyy-MM") === value;
          } else {
            const monthNumber = monthNamesFi[value as string];
            return monthNumber ? eventTime.month === monthNumber : false;
          }
        }
        default:
          return false;
      }
    });

    // Lasketaan määrät kalentereittain
    const calendarCountMap = new Map<string, number>();
    filteredEvents.forEach((event) => {
      const key = event.calendarId;
      calendarCountMap.set(key, (calendarCountMap.get(key) || 0) + 1);
    });

    // Haetaan kaikki kalenterit ja JÄRJESTETÄÄN niiden id:n perusteella
    const calendars = await calendarRepo
      .createQueryBuilder("c")
      .orderBy("c.id", "ASC")
      .getMany();

    const formattedResults = calendars
      .filter((c) => calendarCountMap.has(c.alias)) // vain ne kalenterit joissa on dataa
      .map((calendar) => ({
        calendar_id: calendar.alias,
        calendar_name: calendar.alias, // jos on erillinen nimi niin tähän
        count: calendarCountMap.get(calendar.alias) || 0,
      }));

    res.json(formattedResults);
  } catch (error) {
    console.error("Drilldown error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Kaikki varaukset kalentereittain
router.get("/analytics-drilldown-all", async (req: Request, res: Response) => {
  try {
    const metricRepo = AppDataSource.getRepository(ReservationMetric);
    const calendarRepo = AppDataSource.getRepository(Calendar); // <-- Muista tuoda tämä

    // Haetaan kaikki kalenterit järjestyksessä id ASC
    const calendars = await calendarRepo
      .createQueryBuilder("c")
      .orderBy("c.id", "ASC")
      .getMany();

    // Haetaan kaikki created-action varaukset
    const allEvents = await metricRepo
      .createQueryBuilder("rm")
      .where("rm.action = :action", { action: "created" })
      .getMany();

    // Lasketaan määrät kalentereittain
    const calendarCountMap = new Map<string, number>();
    allEvents.forEach((event) => {
      const key = event.calendarId;
      calendarCountMap.set(key, (calendarCountMap.get(key) || 0) + 1);
    });

    // Muotoillaan tulokset kalentereiden id:n mukaisessa järjestyksessä
    const formattedResults = calendars.map((calendar) => ({
      calendar_id: calendar.alias,
      calendar_name: calendar.alias, // Jos haluat muun nimen tähän, muokkaa
      count: calendarCountMap.get(calendar.alias) || 0,
    }));

    res.json(formattedResults);
  } catch (error) {
    console.error("Drilldown all error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
