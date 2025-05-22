import { Request, Response, NextFunction } from "express";

export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  //if (process.env.NODE_ENV === "development") return next();
  if (req.isAuthenticated?.()) {
    console.log(`[Auth] user authenticated: ${(req.user as any)?.email || "unknown user"}`);
    return next();
  } 
  console.log("[Auth] Unauthorized access attempt");
  res.status(401).json({ error: "Unauthorized" });
}
