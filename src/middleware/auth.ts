import { Request, Response, NextFunction } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
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

    // Tablet check  
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

    const token = authHeader.substring(7); // Poista "Bearer "

    try {
      // Validoi ensin Google ID token
      const ticket = await client.verifyIdToken({
        idToken: token,
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

      // console.log(`[Auth] User authenticated (Google): ${payload.email}`);
      return next();

    } catch (googleError) {
      // console.log("[Auth] Not a valid Google ID Token, trying backend JWT...");

      try {
        // Tarkista backendin oma JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

        if (!decoded || !decoded.email) {
          throw new Error("Invalid backend JWT payload");
        }

        // Lisää käyttäjätiedot requestiin (ei tallenneta mihinkään)
        (req as AuthenticatedRequest).user = {
          email: decoded.email,
          name: decoded.name,
          id: decoded.id,
          role: decoded.role,
        };

        // console.log(`[Auth] User authenticated (JWT): ${decoded.email}`);
        return next();

      } catch (jwtError) {
        console.error("[Auth] Token validation failed:", jwtError);
        res.status(401).json({ error: "Invalid token" });
      }
    }
  }
);
