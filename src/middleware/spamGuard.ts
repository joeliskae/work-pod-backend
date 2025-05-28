import { Request, Response, NextFunction } from "express";

const recentRequests = new Map<string, number>();
const TTL_MS = 1000; // 1 sekunti

export function spamGuard(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.headers['x-forwarded-for'] || "unknown";
  const key = `${ip}-${req.method}-${req.originalUrl}`;

  const now = Date.now();
  const lastTime = recentRequests.get(key);

  if (lastTime && now - lastTime < TTL_MS) {
    // Liian monta samanlaista pyyntöä peräkkäin, skippaa
    res.locals.blocked = true;
    res.status(429).json({ error: "Too many repeated requests. Try again shortly." });
    return;
  }

  recentRequests.set(key, now);

  // Poistetaan vanhat pyynnöt muistin säästämiseksi (asynkronisesti)
  setTimeout(() => recentRequests.delete(key), TTL_MS * 2);

  next();
}
