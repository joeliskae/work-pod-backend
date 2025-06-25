import { Router } from "express";
import { AppDataSource } from "../../data-source";
import { User } from "../../entities/User";
import { spamGuard } from "../../middleware/spamGuard";
// import jwt from "jsonwebtoken";
// import { ensureAuthenticated } from "../../middleware/auth";
import { authenticateJWT } from "../../middleware/authenticateJWT";

const router = Router();
const userRepo = AppDataSource.getRepository(User);
// const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // tuotantoon .env!

// GET kaikki käyttäjät
router.get("/users/get", authenticateJWT, spamGuard, async (req, res) => {
  try {
    const users = await userRepo.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Käyttäjien haku epäonnistui" });
  }
});

// POST lisää uusi käyttäjä
router.post("/users/add", authenticateJWT, spamGuard, async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const newUser = userRepo.create({ name, email, role });
    const savedUser = await userRepo.save(newUser);
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ error: "Käyttäjän luominen epäonnistui" });
  }
});

// PUT muokkaa käyttäjää
router.put("/users/edit/:id", authenticateJWT, spamGuard, async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const user = await userRepo.findOneBy({ id });
    if (!user) {
        res.status(404).json({ error: "Käyttäjää ei löytynyt" });  
      return;
    } 

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.role = role;

    const updatedUser = await userRepo.save(user);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Käyttäjän päivittäminen epäonnistui" });
  }
});

// DELETE poista käyttäjä
router.delete("/users/delete/:id", authenticateJWT, spamGuard, async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await userRepo.delete(id);
    if (result.affected === 0) {
        res.status(404).json({ error: "Käyttäjää ei löytynyt" });
      return;
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Käyttäjän poistaminen epäonnistui" });
  }
});

// Tarkista oikeudet
router.post("/user/verify", spamGuard, authenticateJWT, async (req, res): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: "Sähköposti puuttuu pyynnöstä" });
      return;
    }

    const user = await userRepo.findOneBy({ email });

    if (!user) {
      res.status(403).json({ success: false, message: "Käyttäjää ei löytynyt tai ei oikeuksia" });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Virhe käyttäjän tarkistuksessa:", error);
    res.status(500).json({ success: false, message: "Palvelinvirhe" });
  }
});

export default router;
