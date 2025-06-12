import { Router } from 'express';
import { AppDataSource } from '../../data-source';
import { Calendar } from '../../entities/Calendar';
import { spamGuard } from '../../middleware/spamGuard';

const router = Router();

router.post('/editCalendar/:id', spamGuard, async (req, res): Promise<void> => {
  const { id } = req.params;
  const { alias, color } = req.body;
  if (!alias || typeof alias !== 'string') {
    res.status(400).json({ error: 'Alias is required and must be a string' });
    return; 
  }

  const repo = AppDataSource.getRepository(Calendar);
  const calendar = await repo.findOneBy({ alias: id });
  if (!calendar) {
    res.status(404).json({ error: 'Calendar not found' });
    return;
  }

  // TODO: Tarkista ettei kalenterin alias ole jo käytössä.

  calendar.alias = alias;
  calendar.color = color;
  try {
    await repo.save(calendar);
    res.json({ message: 'Calendar updated successfully' });
    return; 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update calendar' });
    return; 
  }
});

export default router;
