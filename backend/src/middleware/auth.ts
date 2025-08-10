import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';
import { createError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw createError('Access denied. No token provided.', 401);
    }

    const decoded = userService.verifyToken(token);
    if (!decoded) {
      throw createError('Invalid token.', 401);
    }
    
    const user = await userService.getUserById(decoded.id);

    if (!user) {
      throw createError('Invalid token.', 401);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      next(createError('Invalid token.', 401));
    } else {
      next(error);
    }
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError('Access denied.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(createError('Insufficient permissions.', 403));
    }

    next();
  };
};