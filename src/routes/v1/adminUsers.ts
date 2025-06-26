import { Router } from "express";
import { AppDataSource } from "../../data-source";
import { User } from "../../entities/User";
import { spamGuard } from "../../middleware/spamGuard";
import jwt from "jsonwebtoken";
import { ensureAuthenticated } from "../../middleware/auth";
import returnErrorResponse from "../../utils/returnErrorResponse";

const router = Router();
const userRepo = AppDataSource.getRepository(User);
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // tuotantoon .env!

// GET kaikki käyttäjät
router.get("/users/get", ensureAuthenticated, spamGuard, async (req, res) => {
  try {
    const users = await userRepo.find();
    res.json(users);
  } catch (error) {
    returnErrorResponse(res, 500, "Failed to fetch users");
  }
});

// POST lisää uusi käyttäjä
router.post("/users/add", ensureAuthenticated, spamGuard, async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const newUser = userRepo.create({ name, email, role });
    const savedUser = await userRepo.save(newUser);
    res.status(201).json(savedUser);
  } catch (error) {
    returnErrorResponse(res, 500, "Failed to create user");
  }
});

// PUT muokkaa käyttäjää
router.put(
  "/users/edit/:id",
  ensureAuthenticated,
  spamGuard,
  async (req, res): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, email, role } = req.body;

      const user = await userRepo.findOneBy({ id });
      if (!user) {
        returnErrorResponse(res, 404, "Failed to update user: not found");
        return;
      }

      user.name = name ?? user.name;
      user.email = email ?? user.email;
      user.role = role;

      const updatedUser = await userRepo.save(user);
      res.json(updatedUser);
    } catch (error) {
      returnErrorResponse(res, 500, "Failed to update user");
    }
  }
);

// DELETE poista käyttäjä
router.delete(
  "/users/delete/:id",
  ensureAuthenticated,
  spamGuard,
  async (req, res): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await userRepo.delete(id);
      if (result.affected === 0) {
        returnErrorResponse(res, 404, "Failed to delete user: not found");
        return;
      }
      res.status(204).end();
    } catch (error) {
      returnErrorResponse(res, 500, "Failed to delete user");
    }
  }
);

// Tarkista oikeudet
router.post("/user/verify", spamGuard, async (req, res): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      returnErrorResponse(res, 400, "Email is required for verification");
      return;
    }

    const user = await userRepo.findOneBy({ email });
    if (!user) {
      returnErrorResponse(res, 403, "Failed to verify user: not found");
      return;
    }

    // Luo JWT-token käyttäjälle
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "2h" } // voimassaoloaika esim. 2 tuntia
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    returnErrorResponse(res, 500, "Server error during user verification");
  }
});

export default router;
