import { Request } from "express";

export interface User {
  name?: string;
  email?: string;
  googleId?: string;
  id?: string;
  role?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}
