import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../types/auth";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

interface JWTPayload {
  email: string;
  name: string;
  googleId: string;
  picture?: string;
}

// Async middleware wrapper
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const ensureAuthenticated = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Development bypass (poista kommentti jos haluat ohittaa autentikoinnin kehityksessä)
  // if (process.env.NODE_ENV === "development") return next();
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log("[Auth] No Bearer token provided");
    res.status(401).json({ 
      success: false,
      error: "Bearer token required" 
    });
    return;
  }
  
  const token = authHeader.substring(7); // Poista "Bearer "
  
  try {
    // Validoi JWT token
    const payload = jwt.verify(token, JWT_SECRET as string) as JWTPayload;
    
    // Lisää käyttäjätiedot requestiin
    (req as AuthenticatedRequest).user = {
      email: payload.email,
      name: payload.name,
      googleId: payload.googleId,
    };
    
    console.log(`[Auth] User authenticated: ${payload.email}`);
    next();
  } catch (error) {
    console.error("[Auth] JWT validation failed:", error);
    
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ 
        success: false,
        error: "Token expired" 
      });
      return;
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        success: false,
        error: "Invalid token" 
      });
      return;
    }
    
    res.status(401).json({ 
      success: false,
      error: "Authentication failed" 
    });
  }
});