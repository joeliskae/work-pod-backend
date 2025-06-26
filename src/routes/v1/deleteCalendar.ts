import { Router } from "express";
import { AppDataSource } from "../../data-source";
import { Calendar } from "../../entities/Calendar";
import { deleteCalendar } from "../../services/googleCalendar";
import { spamGuard } from "../../middleware/spamGuard";
import { ensureAuthenticated } from "../../middleware/auth";
import returnErrorResponse from "../../utils/returnErrorResponse";

const router = Router();

// DELETE /api/v1/calendars/by-alias/:alias
router.delete(
  "/deleteCalendar/:alias",
  ensureAuthenticated,
  spamGuard,
  async (req, res): Promise<void> => {
    const { alias } = req.params;
    const repo = AppDataSource.getRepository(Calendar);

    const calendar = await repo.findOneBy({ alias });

    if (!calendar) {
      res
        .status(404)
        .json({ error: `Calendar with alias '${alias}' not found` });
      return;
    }

    try {
      await deleteCalendar(calendar.calendarId);
      await repo.remove(calendar);
      res.json({ message: `Calendar '${alias}' deleted successfully` });
    } catch (err) {
      returnErrorResponse(res, 500, "Failed to delete calendar");
    }
  }
);

export default router;
