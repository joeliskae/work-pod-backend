import { Router } from "express";
import { AppDataSource } from "../../data-source";
import { Calendar } from "../../entities/Calendar";
import { spamGuard } from "../../middleware/spamGuard";
import { ensureAuthenticated } from "../../middleware/auth";
import returnErrorResponse from "../../utils/returnErrorResponse";

const router = Router();

router.patch(
  "/toggleActive/:alias",
  ensureAuthenticated,
  spamGuard,
  async (req, res): Promise<void> => {
    const { alias } = req.params;
    const { isActive } = req.body;

    const repo = AppDataSource.getRepository(Calendar);
    const calendar = await repo.findOneBy({ alias });
    if (!calendar) {
      returnErrorResponse(res, 404, `Calendar with alias '${alias}' not found`);
      return;
    }

    calendar.isActive = isActive;
    await repo.save(calendar);

    res.json({
      message: `Calendar '${alias}' active status set to ${isActive}`,
    });
  }
);

export default router;
