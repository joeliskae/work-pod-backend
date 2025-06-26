import { Router } from "express";
import { AppDataSource } from "../../data-source";
import { Tablet } from "../../entities/TabletEntity";
import { spamGuard } from "../../middleware/spamGuard";
// import { ensureAuthenticated } from "../../middleware/auth";
import returnErrorResponse from "../../utils/returnErrorResponse";
import { authenticateJWT } from "../../middleware/authenticateJWT";

const router = Router();
const tabletRepo = AppDataSource.getRepository(Tablet);

router.post(
  "/tablets/add",
  authenticateJWT,
  spamGuard,
  async (req, res): Promise<void> => {
    try {
      const { name, location, calendarId, ipAddress, color } = req.body;

      if (!name || !location || !calendarId || !ipAddress) {
        res.status(400).json({ error: "Kaikki kentät ovat pakollisia." });
        return;
      }

      const tablet = tabletRepo.create({
        name,
        location,
        calendarId,
        ipAddress,
        color,
      });

      await tabletRepo.save(tablet);

      res.status(201).json(tablet);
      return;
    } catch (error) {
      returnErrorResponse(res, 500, "Server error while adding tablet");
      return;
    }
  }
);

router.get(
  "/tablets/get",
  authenticateJWT,
  spamGuard,
  async (req, res): Promise<void> => {
    try {
      const tablets = await tabletRepo.find();

      res.json(tablets);
      return;
    } catch (error) {
      returnErrorResponse(res, 500, "Server error while fetching tablets");
      return;
    }
  }
);

router.delete(
  "/tablets/delete/:id",
  authenticateJWT,
  spamGuard,
  async (req, res): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await tabletRepo.delete(id);
      if (result.affected === 0) {
        returnErrorResponse(res, 404, "Tablet not found");
        return;
      }
      res.status(204).send();
    } catch (error) {
      returnErrorResponse(res, 500, "Server error while deleting tablet");
    }
  }
);

router.put(
  "/tablets/edit/:id",
  authenticateJWT,
  spamGuard,
  async (req, res): Promise<void> => {
    const { id } = req.params;
    const { name, location, calendarId, ipAddress, color } = req.body;

    try {
      const tabletRepo = AppDataSource.getRepository(Tablet);
      const tablet = await tabletRepo.findOneBy({ id });

      if (!tablet) {
        returnErrorResponse(res, 404, "Tablet not found");
        return;
      }

      tablet.name = name;
      tablet.location = location;
      tablet.calendarId = calendarId;
      tablet.ipAddress = ipAddress;
      tablet.color = color;

      await tabletRepo.save(tablet);
      res.json(tablet);
    } catch (error) {
      console.error(error);
      returnErrorResponse(res, 500, "Failed to update tablet");
    }
  }
);

export default router;
