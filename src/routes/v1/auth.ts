// authRoutes.ts
import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

const router = Router();
const client = new OAuth2Client();

// Salainen avain oman JWT:n allekirjoitukseen
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Kirjautumis-endpoint
router.post("/auth/login", async (req, res): Promise<void> => {
  const { idToken } = req.body;

  if (!idToken) {
    res.status(400).json({ error: "Missing idToken" });
    return;
  }

  try {
    // Verifioi Google ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID, // Tämä tarkistaa että token on juuri tälle sovellukselle
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      res.status(401).json({ error: "Invalid token payload" });
      return;
    }

    // Luo oma JWT käyttäjälle
    const userEmail = payload.email;
    const accessToken = jwt.sign(
      {
        email: payload.email,
        name: payload.name,
        googleId: payload.sub,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Lähetä oma JWT frontendille
    res.json({ accessToken, userEmail });
  } catch (err) {
    console.error("[Auth] Google ID token verification failed:", err);
    res.status(401).json({ error: "Token verification failed" });
  }
});

export default router;
