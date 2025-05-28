import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import * as jwt from "jsonwebtoken"; // Kokeile tätä importtia

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Tyypit
interface GoogleTokenPayload {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}

interface JWTPayload {
  email: string;
  name: string;
  googleId: string;
  picture?: string;
}

interface LoginRequest extends Request {
  body: {
    googleIdToken: string;
  };
}

// JWT konfiguraatio
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = '24h';

/**
 * Kirjautuminen Google ID tokenilla - YKSINKERTAINEN VERSIO
 */
export const login = async (req: LoginRequest, res: Response): Promise<void> => {
  try {
    const { googleIdToken } = req.body;

    if (!googleIdToken) {
      res.status(400).json({
        success: false,
        error: "Google ID token is required"
      });
      return;
    }

    // Validoi Google ID token
    console.log("[Auth] Received googleIdToken: ", googleIdToken);

    const ticket = await client.verifyIdToken({
      idToken: googleIdToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload() as GoogleTokenPayload;
    
    if (!payload || !payload.email || !payload.name) {
      res.status(401).json({
        success: false,
        error: "Invalid Google token"
      });
      return;
    }

    // Luo JWT token - YKSINKERTAINEN TAPA
    const tokenPayload = {
      email: payload.email,
      name: payload.name,
      googleId: payload.sub,
    };

    // Käytä vain required parametrit
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Palauta vastaus
    res.status(200).json({
      success: true,
      token,
      user: {
        email: payload.email,
        name: payload.name,
        googleId: payload.sub,
        picture: payload.picture,
      }
    });

    console.log(`[Auth] User logged in: ${payload.email}`);

  } catch (error) {
    console.error("[Auth] Login failed:", error);
    res.status(401).json({
      success: false,
      error: "Authentication failed"
    });
  }
};

/**
 * Token refresh - YKSINKERTAINEN VERSIO
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: "Bearer token required"
      });
      return;
    }

    const oldToken = authHeader.substring(7);
    
    // Dekoodaa vanha token
    const decoded = jwt.verify(oldToken, JWT_SECRET) as any;

    // Luo uusi token
    const newTokenPayload = {
      email: decoded.email,
      name: decoded.name,
      googleId: decoded.googleId,
    };

    const newToken = jwt.sign(newTokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(200).json({
      success: true,
      token: newToken,
      user: {
        email: decoded.email,
        name: decoded.name,
        googleId: decoded.googleId,
      }
    });

  } catch (error) {
    console.error("[Auth] Token refresh failed:", error);
    res.status(401).json({
      success: false,
      error: "Invalid token"
    });
  }
};

/**
 * Logout
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};