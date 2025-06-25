import { Router } from "express";
// import { ensureAuthenticated } from "../../middleware/auth";
import { spamGuard } from "../../middleware/spamGuard";
import { AppDataSource } from "../../data-source"; // Oletan että tämä on TypeORM konfiguraatiosi
import { ReservationMetric } from "../../entities/ReservationMetrics"; // Polku entiteettiisi
import { DateTime } from "luxon";
import { authenticateJWT } from "../../middleware/authenticateJWT";

const router = Router();

interface HourCount {
  hour: string; // e.g. "09"
  count: number;
}

// GET /api/v1/analytics-hour
router.get("/analytics-hour", authenticateJWT, spamGuard, async (req, res) => {
  try {
    const reservationMetricRepository = AppDataSource.getRepository(ReservationMetric);
    
    const metrics = await reservationMetricRepository.find({
      select: ["eventStart"],
      where: {
        action: "created"
      }
    });

    // Lasketaan tuntijakauma paikallisen ajan mukaan
    const hourCounts: Record<string, number> = {};

    for (const metric of metrics) {
      const localHour = DateTime.fromISO(metric.eventStart, { zone: "utc" })
        .setZone("Europe/Helsinki")
        .toFormat("HH");

      hourCounts[localHour] = (hourCounts[localHour] || 0) + 1;
    }

    const result: HourCount[] = Object.entries(hourCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([hour, count]) => ({ hour, count }));

    res.json(result);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// GET /api/v1/analytics-week
router.get("/analytics-week", authenticateJWT, spamGuard, async (req, res) => {
  try {
    const reservationMetricRepository = AppDataSource.getRepository(ReservationMetric);
    
    // TypeORM:ssa voimme käyttää raw queryä SQLite-spesifisille funktioille
    const results = await reservationMetricRepository
      .createQueryBuilder("metric")
      .select("strftime('%w', metric.eventStart)", "weekday")
      .addSelect("COUNT(*)", "count")
      .where("metric.action = :action", { action: "created" })
      .groupBy("weekday")
      .orderBy("weekday")
      .getRawMany();

    res.json(results);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// GET /api/v1/analytics-events
router.get("/analytics-events", authenticateJWT, spamGuard, async (req, res) => {
  try {
    const reservationMetricRepository = AppDataSource.getRepository(ReservationMetric);
    
    const results = await reservationMetricRepository
      .createQueryBuilder("metric")
      .select("metric.action", "action")
      .addSelect("COUNT(*)", "count")
      .where("metric.action IN (:...actions)", { actions: ["created", "deleted"] })
      .groupBy("metric.action")
      .getRawMany();

    res.json(results);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// GET /api/v1/analytics-yearly
router.get("/analytics-yearly", authenticateJWT, spamGuard, async (req, res) => {
  try {
    const year = new Date().getFullYear().toString();
    const reservationMetricRepository = AppDataSource.getRepository(ReservationMetric);
    
    const results = await reservationMetricRepository
      .createQueryBuilder("metric")
      .select("strftime('%m', metric.eventStart)", "month")
      .addSelect("COUNT(*)", "count")
      .where("metric.action = :action", { action: "created" })
      .andWhere("strftime('%Y', metric.eventStart) = :year", { year })
      .groupBy("month")
      .orderBy("month")
      .getRawMany();

    // Täydet 12 kuukautta (0 oletus puuttuvalle datalle)
    const data = Array.from({ length: 12 }, (_, i) => {
      const month = (i + 1).toString().padStart(2, "0");
      const row = results.find((r) => r.month === month);
      return row?.count ? parseInt(row.count) : 0;
    });

    res.json({
      labels: [
        "Tammi", "Helmi", "Maalis", "Huhti", "Touko", "Kesä",
        "Heinä", "Elo", "Syys", "Loka", "Marras", "Joulu"
      ],
      data
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;