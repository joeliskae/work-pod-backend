import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export interface AuthenticatedRequest extends Request {
  user?: {
    email: string;
    name?: string;
    googleId?: string;
  };
}

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
