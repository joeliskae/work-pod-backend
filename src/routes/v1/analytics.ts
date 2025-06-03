import { Router } from "express";
import { ensureAuthenticated } from "../../middleware/auth";
import { spamGuard } from "../../middleware/spamGuard";
import sqlite3 from "sqlite3";

const router = Router();
const db = new sqlite3.Database("./usage.sqlite");

// GET /api/v1/analytics-
// TODO: Muista laittaa autentikaatio päälle!
router.get("/analytics-hour", spamGuard, (req, res) => {
  const query = `
    SELECT strftime('%H', event_start) AS hour, COUNT(*) AS count
    FROM reservation_metrics
    WHERE action = 'created'
    GROUP BY hour
    ORDER BY hour;
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(rows);
  });
});

router.get(
  "/analytics-week", spamGuard, (req, res) => {
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
  }
);

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


export default router;
