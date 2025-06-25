import { Request, Response, NextFunction } from "express";
import { OAuth2Client } from "google-auth-library";
import { AuthenticatedRequest } from "../types/auth";
import { Tablet } from "../entities/TabletEntity";
import { AppDataSource } from "../data-source";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Async middleware wrapper
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const normalizeIp = (ip: string): string => {
  return ip.replace(/^::ffff:/, ''); // poistaa ::ffff: etuliitteen
};

export const ensureAuthenticated = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // if (process.env.NODE_ENV === "development") return next();

    // Tabletti puoli--
    // Tablet check with IP validation
    const isTabletClient = req.headers["x-client-type"] === "tablet";
    if (isTabletClient) {
      try {

        // return next();
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
        const tabletRepository = AppDataSource.getRepository(Tablet);
        const normalizedIp = normalizeIp(clientIp);

        const authorizedTablet = await tabletRepository.findOne({
          where: { ipAddress: normalizedIp }
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
        console.error('Virhe tablet-autentikoinnissa:');
        res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
        return; 
      }
    }

    // Selain puoli--
    // Tarkista Bearer token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[Auth] No Bearer token provided");
      res.status(401).json({ error: "Bearer token required" });
      return;
    }

    const token = authHeader.substring(7); // Poista "Bearer "

    try {
      // Validoi Google ID token
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

      // Lisää käyttäjätiedot requestiin
      (req as AuthenticatedRequest).user = {
        email: payload.email,
        name: payload.name,
        googleId: payload.sub,
      };

      // console.log(`[Auth] User authenticated: ${payload.email}`);
      return next();

    } catch (error) {
      console.error("[Auth] Google token validation failed:", error);
      res.status(401).json({ error: "Invalid token" });
      return;
    }
  }
);