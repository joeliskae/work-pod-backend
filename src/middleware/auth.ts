import { Request, Response, NextFunction } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../types/auth";
import { getRepository } from "typeorm";
import { Tablet } from "../entities/TabletEntity";

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

    // Tablet check with IP validation
const isTabletClient = req.headers["x-client-type"] === "tablet";
if (isTabletClient) {
  try {
    // Hae clientin IP-osoite
    const clientIp = req.ip || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    
    if (!clientIp) {
      res.status(403).json({ error: 'IP-osoitetta ei voitu määrittää' });
      return; 
    }

    // Tarkista löytyykö IP tietokannasta
    const tabletRepository = getRepository(Tablet);
    const authorizedTablet = await tabletRepository.findOne({
      where: { ipAddress: clientIp }
    });

    if (!authorizedTablet) {
      console.log(`Unauthorized tablet access attempt from IP: ${clientIp}`);
      res.status(403).json({ 
        error: 'Tablet ei ole rekisteröity tälle IP-osoitteelle' 
      });
      return; 
    }
    
    console.log(`Authorized tablet access: ${authorizedTablet.name} from ${clientIp}`);
    
    // Sallittu tablet, jatka suoraan
    return next();
    
  } catch (error) {
    console.error('Virhe tablet-autentikoinnissa:', error);
    res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
    return; 
  }
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
