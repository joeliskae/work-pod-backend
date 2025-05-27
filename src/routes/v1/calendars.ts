import { Router } from "express";
import { calendarMap } from "../../config/calendarMap";
import { ensureAuthenticated } from "../../middleware/auth";
import { spamGuard } from "../../middleware/spamGuard";

const router = Router();

// GET /api/v1/calendars
router.get("/calendars", ensureAuthenticated, spamGuard, (req, res) => {
  const aliases = Object.keys(calendarMap);
  res.json({ calendars: aliases });
});

export default router;