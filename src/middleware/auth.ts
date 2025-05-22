import { Request, Response, NextFunction } from "express";

export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === "development") return next();
  if (req.isAuthenticated?.()) return next();
  res.status(401).json({ error: "Unauthorized" });
}
