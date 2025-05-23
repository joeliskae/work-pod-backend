import { Router } from "express";
import { calendarMap } from "../../config/calendarMap";
import { ensureAuthenticated } from "../../middleware/auth";

const router = Router();

// GET /api/v1/calendars
router.get("/calendars", ensureAuthenticated, (req, res) => {
  const aliases = Object.keys(calendarMap);
  res.json({ calendars: aliases });
});

export default router;