import { Router } from "express";
import { ensureAuthenticated } from "../../middleware/auth";
import { spamGuard } from "../../middleware/spamGuard";
import sqlite3 from "sqlite3";
import { DateTime } from "luxon";

const router = Router();
const db = new sqlite3.Database("./usage.sqlite");


interface Row {
  event_start: string; // ISO8601-formatted UTC string
}

interface HourCount {
  hour: string; // e.g. "09"
  count: number;
}


// TODO: Muista laittaa autentikaatio päälle!!!
// GET /api/v1/analytics-hour

router.get("/analytics-hour", spamGuard, (req, res) => {
  const query = `
    SELECT event_start
    FROM reservation_metrics
    WHERE action = 'created';
  `;

  db.all(query, [], (err, rows: Row[]) => {
    if (err) {
      console.error("Database error:", err.message);
      res.status(500).json({ error: "Database error" });
      return;
    }

    // Lasketaan tuntijakauma paikallisen ajan mukaan
    const hourCounts: Record<string, number> = {};

    for (const row of rows) {
      const localHour = DateTime.fromISO(row.event_start, { zone: "utc" })
        .setZone("Europe/Helsinki")
        .toFormat("HH");

      hourCounts[localHour] = (hourCounts[localHour] || 0) + 1;
    }

    const result: HourCount[] = Object.entries(hourCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([hour, count]) => ({ hour, count }));

    res.json(result);
  });
});

// GET /api/v1/analytics-week
router.get("/analytics-week", spamGuard, (req, res) => {
  const query = `
    SELECT strftime('%w', event_start) AS weekday, COUNT(*) AS count
    FROM reservation_metrics
    WHERE action = 'created'
    GROUP BY weekday
    ORDER BY weekday;
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(rows);
  });
});

// GET /api/v1/analytics-events
router.get("/analytics-events", spamGuard, (req, res) => {
  const query = `
    SELECT action, COUNT(*) AS count
    FROM reservation_metrics
    WHERE action IN ('created', 'deleted')
    GROUP BY action;
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(rows);
  });
});

router.get("/analytics-yearly", spamGuard, (req, res) => {
  const year = new Date().getFullYear().toString();

  const query = `
    SELECT strftime('%m', event_start) AS month, COUNT(*) AS count
    FROM reservation_metrics
    WHERE action = 'created' AND strftime('%Y', event_start) = ?
    GROUP BY month
    ORDER BY month;
  `;

  db.all(query, [year], (err, rows: { month: string; count: number }[]) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

    // Täydet 12 kuukautta (0 oletus puuttuvalle datalle)
    const data = Array.from({ length: 12 }, (_, i) => {
      const month = (i + 1).toString().padStart(2, "0");
      const row = rows.find((r) => r.month === month);
      return row?.count ?? 0;
    });

    res.json({
      labels: [
        "Tammi", "Helmi", "Maalis", "Huhti", "Touko", "Kesä",
        "Heinä", "Elo", "Syys", "Loka", "Marras", "Joulu"
      ],
      data
    });
  });
});

export default router;
