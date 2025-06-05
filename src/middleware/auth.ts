import { Request, Response, NextFunction } from "express";
import { OAuth2Client } from "google-auth-library";
import { AuthenticatedRequest } from "../types/auth";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Async middleware wrapper
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const ensureAuthenticated = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // if (process.env.NODE_ENV === "development") return next();

    const isTabletClient = req.headers["x-client-type"] === "tablet";
    if (isTabletClient) {
      // Ei autentikointia, jatka suoraan
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[Auth] No Bearer token provided");
      res.status(401).json({ error: "Bearer token required" });
      return;
    }

    const idToken = authHeader.substring(7); // Poista "Bearer "

    try {
      // Validoi Google ID token
      const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        console.log("[Auth] Invalid token payload");
        res.status(401).json({ error: "Invalid token" });
        return;
      }

      // Lisää käyttäjätiedot requestiin (ei tallenneta mihinkään)
      // console.log(payload);
      (req as AuthenticatedRequest).user = {
        email: payload.email,
        name: payload.name,
        googleId: payload.sub,
      };

      // console.log(`[Auth] User authenticated: ${payload.email}`);
      next();
    } catch (error) {
      console.error("[Auth] Token validation failed:", error);
      res.status(401).json({ error: "Invalid token" });
    }
  }
);
