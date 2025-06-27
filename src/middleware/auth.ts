import { Request, Response, NextFunction } from "express";
import { OAuth2Client } from "google-auth-library";
import { AuthenticatedRequest } from "../types/auth";
import { Tablet } from "../entities/TabletEntity";
import { AppDataSource } from "../data-source";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Ympäröi asynkronisen Express middleware -funktion
 * ja ohjaa mahdolliset poikkeukset `next`-käsittelijälle.
 *
 * @param {function(Request, Response, NextFunction): Promise<void>} fn Asynkroninen middleware-funktio
 * @returns {function(Request, Response, NextFunction): void} Syntkroninen middleware, joka käsittelee virheet
 */
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Poistaa IPv6-muodossa mahdollisesti olevan "::ffff:"-etuliitteen
 * ja palauttaa IP-osoitteen selkeässä IPv4-muodossa.
 *
 * @param {string} ip IP-osoite mahdollisesti etuliitteellä
 * @returns {string} Normalisoitu IP-osoite ilman "::ffff:"-etuliitettä
 */
const normalizeIp = (ip: string): string => {
  return ip.replace(/^::ffff:/, ''); // poistaa ::ffff: etuliitteen
};

/**
 * Express middleware, joka varmistaa käyttäjän autentikaation.
 * 
 * - Tablet-laitteet autentikoidaan IP-osoitteen perusteella.
 * - Selainkutsut autentikoidaan Google OAuth2 Bearer tokenilla.
 *
 * Mikäli autentikointi epäonnistuu, palautetaan virhevastaukset.
 *
 * @param {Request} req Expressin Request-objekti
 * @param {Response} res Expressin Response-objekti
 * @param {NextFunction} next Expressin next-funktio middleware-ketjussa
 */
export const ensureAuthenticated = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Tablet-puolen autentikointi IP-osoitteella
    const isTabletClient = req.headers["x-client-type"] === "tablet";
    if (isTabletClient) {
      try {
        const clientIp = req.ip || 
                         req.connection.remoteAddress || 
                         req.socket.remoteAddress ||
                         (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();

        if (!clientIp) {
          res.status(403).json({ error: 'IP-osoitetta ei voitu määrittää' });
          return; 
        }

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
        return next();
        
      } catch (error) {
        console.error('Virhe tablet-autentikoinnissa:', error);
        res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
        return; 
      }
    }

    // Selainpuolen autentikointi Google OAuth Bearer tokenilla
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[Auth] No Bearer token provided");
      res.status(401).json({ error: "Bearer token required" });
      return;
    }

    const token = authHeader.substring(7); // Poista "Bearer "

    try {
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

      // Lisää käyttäjätiedot request-objektiin
      (req as AuthenticatedRequest).user = {
        email: payload.email,
        name: payload.name,
        googleId: payload.sub,
      };

      return next();

    } catch (error) {
      console.error("[Auth] Google token validation failed:", error);
      res.status(401).json({ error: "Invalid token" });
      return;
    }
  }
);
