import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

/**
 * Laajennettu Expressin Request-tyyppi, joka sisältää
 * autentikoidun käyttäjän tiedot.
 */
export interface AuthenticatedRequest extends Request {
  /**
   * Autentikoidun käyttäjän tiedot, jotka on purettu JWT:stä.
   */
  user?: {
    /** Käyttäjän sähköpostiosoite */
    email: string;
    /** Käyttäjän koko nimi (valinnainen) */
    name?: string;
    /** Google-käyttäjän uniikki tunniste (valinnainen) */
    googleId?: string;
  };
}

/**
 * Express middleware, joka tarkistaa JWT:n Authorization-headerista,
 * validoi sen ja lisää dekoodatut käyttäjätiedot requestiin.
 * 
 * Jos token puuttuu tai on virheellinen, palautetaan 401 Unauthorized.
 *
 * @param {Request} req Expressin Request-objekti
 * @param {Response} res Expressin Response-objekti
 * @param {NextFunction} next Expressin next-funktio middleware-ketjussa
 */
export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedRequest['user'];
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (err) {
    console.error('[Auth] JWT verification failed:', err);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
