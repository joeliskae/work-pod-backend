import { Router } from 'express';
import { createCalendar } from '../../services/googleCalendar';
import { AppDataSource } from '../../data-source';
import { Calendar } from '../../entities/Calendar';
import { spamGuard } from '../../middleware/spamGuard';
// import { ensureAuthenticated } from '../../middleware/auth';
import { authenticateJWT } from '../../middleware/authenticateJWT';

const router = Router();

router.post('/createCalendar', authenticateJWT, spamGuard, async (req, res) => {
  const { alias, color = 'blue' } = req.body;

  try {
    const newCalendar = await createCalendar(alias);

    const repo = AppDataSource.getRepository(Calendar);
    const saved = await repo.save({
      alias,
      calendarId: newCalendar.id!,
      isActive: false,
      color,
    });

    console.log("Calendar created successfully!");
    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create calendar' });
  }
});

export default router;