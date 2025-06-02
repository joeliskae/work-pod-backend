import { Router } from "express";
import { ensureAuthenticated } from "../../middleware/auth";
import { spamGuard } from "../../middleware/spamGuard";
import sqlite3 from "sqlite3";

const router = Router();
const db = new sqlite3.Database("./reservation_metrics.db");

// GET /api/v1/analytics/reservations-per-hour
// TODO: Muista laittaa autentikaatio päälle!
router.get("/reservations-per-hour", spamGuard, (req, res) => {
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

export default router;
