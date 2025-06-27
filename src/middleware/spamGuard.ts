import { Request, Response, NextFunction } from "express";

/**
 * Map tallentaa viimeisimmän pyynnön aikaleiman
 * avaimella, joka koostuu IP-osoitteesta, HTTP-metodista ja polusta.
 * Avaimen muoto: "<ip>-<method>-<url>"
 */
const recentRequests = new Map<string, number>();

/** 
 * Ajastin millisekunteina, joka määrittää
 * kuinka tiheästi samanlainen pyyntö sallitaan (tässä 1000 ms).
 */
const TTL_MS = 1000; // 1 sekunti

/**
 * Middleware, joka suojaa toistuvilta samanlaisilta pyynnöiltä lyhyessä ajassa (rate limiting).
 * 
 * Jos käyttäjä yrittää tehdä saman pyynnön uudestaan alle TTL_MS:n sisällä,
 * pyyntö blokataan ja vastataan 429 - Too Many Requests virheellä.
 * 
 * @param {Request} req Expressin Request-objekti
 * @param {Response} res Expressin Response-objekti
 * @param {NextFunction} next Expressin next-funktio middleware-ketjussa
 */
export function spamGuard(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.headers['x-forwarded-for'] || "unknown";
  const key = `${ip}-${req.method}-${req.originalUrl}`;

  const now = Date.now();
  const lastTime = recentRequests.get(key);

  if (lastTime && now - lastTime < TTL_MS) {
    // Liian monta samanlaista pyyntöä peräkkäin, estetään
    res.locals.blocked = true;
    res.status(429).json({ error: "Too many repeated requests. Try again shortly." });
    return;
  }

  recentRequests.set(key, now);

  // Poistetaan vanha pyyntö myöhemmin, jotta muisti ei kasva loputtomasti
  setTimeout(() => recentRequests.delete(key), TTL_MS * 2);

  next();
}
