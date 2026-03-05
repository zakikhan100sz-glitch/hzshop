import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      res.status(401);
      throw new Error('Unauthorized');
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
    const user = await User.findById(payload.sub).select('-passwordHash');
    if (!user) {
      res.status(401);
      throw new Error('Unauthorized');
    }
    req.user = user;
    next();
  } catch (e) {
    res.status(401);
    next(new Error('Unauthorized'));
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error('Unauthorized'));
    }
    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error('Forbidden'));
    }
    next();
  };
}
