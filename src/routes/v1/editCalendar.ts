import { Router } from "express";
import { AppDataSource } from "../../data-source";
import { Calendar } from "../../entities/Calendar";
import { spamGuard } from "../../middleware/spamGuard";
import { ensureAuthenticated } from "../../middleware/auth";
import returnErrorResponse from "../../utils/returnErrorResponse";

const router = Router();

router.post(
  "/editCalendar/:id",
  ensureAuthenticated,
  spamGuard,
  async (req, res): Promise<void> => {
    const { id } = req.params;
    const { alias, color } = req.body;
    if (!alias || typeof alias !== "string") {
      res.status(400).json({ error: "Alias is required and must be a string" });
      return;
    }

    const repo = AppDataSource.getRepository(Calendar);
    const calendar = await repo.findOneBy({ alias: id });
    if (!calendar) {
      returnErrorResponse(res, 404, "Calendar not found");
      return;
    }

    // TODO: Tarkista ettei kalenterin alias ole jo käytössä.

    calendar.alias = alias;
    calendar.color = color;
    try {
      await repo.save(calendar);
      res.json({ message: "Calendar updated successfully" });
      return;
    } catch (error) {
      returnErrorResponse(res, 500, "Failed to update calendar");
      return;
    }
  }
);

export default router;
