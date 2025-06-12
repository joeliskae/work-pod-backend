import { Router } from "express";
import { AppDataSource } from "../../data-source";
import { Tablet } from "../../entities/TabletEntity";
import { spamGuard } from "../../middleware/spamGuard";

const router = Router();
const tabletRepo = AppDataSource.getRepository(Tablet);

//TODO: Autentikaatiota taaaas..
router.post("/tablets/add", spamGuard, async (req, res): Promise<void> => {
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
    console.error(error);
    res.status(500).json({ error: "Palvelinvirhe" });
    return;
  }
});

router.get("/tablets/get", spamGuard, async (req, res): Promise<void> => {
  try {
    const tablets = await tabletRepo.find();

    res.json(tablets);
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Palvelinvirhe" });
    return;
  }
});

router.delete("/tablets/delete/:id", spamGuard, async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await tabletRepo.delete(id);
    if (result.affected === 0) {
      res.status(404).json({ error: "Tablettia ei löytynyt" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error("Virhe poistettaessa tablettia:", error);
    res.status(500).json({ error: "Palvelinvirhe" });
  }
});

router.put('/tablets/edit/:id', spamGuard, async (req, res): Promise<void> => {
  const { id } = req.params;
  const { name, location, calendarId, ipAddress, color } = req.body;

  try {
    const tabletRepo = AppDataSource.getRepository(Tablet);
    const tablet = await tabletRepo.findOneBy({ id });

    if (!tablet) {
        res.status(404).json({ error: 'Tablettia ei löytynyt' });
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
    res.status(500).json({ error: 'Virhe tabletin päivityksessä' });
  }
});

export default router;
