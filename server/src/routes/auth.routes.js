import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(6).max(128)
});

router.post('/register', async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const existing = await User.findOne({ email: body.email });
    if (existing) {
      res.status(409);
      throw new Error('Email already in use');
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await User.create({
      name: body.name,
      email: body.email,
      passwordHash,
      role: 'customer'
    });

    const token = jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_SECRET || 'dev_secret_change_me', {
      expiresIn: '7d'
    });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    next(err);
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

router.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await User.findOne({ email: body.email });
    if (!user) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_SECRET || 'dev_secret_change_me', {
      expiresIn: '7d'
    });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

export default router;
