import express from 'express';
import { z } from 'zod';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { slugify } from '../utils/slugify.js';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

const router = express.Router();

router.use(requireAuth, requireRole('admin', 'owner'));

router.get('/products', async (req, res, next) => {
  try {
    const items = await Product.find().sort({ createdAt: -1 }).lean();
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.post('/users', requireRole('owner'), async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(8)
    });

    const body = schema.parse(req.body);

    const existing = await User.findOne({ email: body.email });
    if (existing) {
      res.status(409);
      throw new Error('Email already exists');
    }

    const passwordHash = await bcrypt.hash(body.password, 10);

    const admin = await User.create({
      name: body.name,
      email: body.email,
      passwordHash,
      role: 'admin'
    });

    res.json({
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (err) {
    next(err);
  }
});

const productSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().optional(),
  category: z.string().min(2).max(80),
  description: z.string().optional().default(''),
  highlights: z.array(z.string()).optional().default([]),
  price: z.number().min(0),
  compareAtPrice: z.number().nullable().optional().default(null),
  images: z.array(z.string()).optional().default([]),
  colors: z.array(z.string()).optional().default([]),
  sizes: z.array(z.string()).optional().default([]),
  inStock: z.boolean().optional().default(true),
  stockQty: z.number().int().optional().default(100),
  tags: z.array(z.string()).optional().default([])
});

router.post('/products', async (req, res, next) => {
  try {
    const body = productSchema.parse(req.body);
    const slug = body.slug ? slugify(body.slug) : slugify(body.title);
    const created = await Product.create({ ...body, slug });
    res.json({ product: created });
  } catch (err) {
    next(err);
  }
});

router.put('/products/:id', async (req, res, next) => {
  try {
    const body = productSchema.parse(req.body);
    const slug = body.slug ? slugify(body.slug) : slugify(body.title);
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { ...body, slug },
      { new: true }
    );
    if (!updated) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.json({ product: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/products/:id', async (req, res, next) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get('/orders', async (req, res, next) => {
  try {
    const items = await Order.find().sort({ createdAt: -1 }).lean();
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.patch('/orders/:id/status', async (req, res, next) => {
  try {
    const schema = z.object({ status: z.enum(['pending', 'confirmed', 'shipped', 'completed', 'cancelled']) });
    const body = schema.parse(req.body);
    const updated = await Order.findByIdAndUpdate(req.params.id, { status: body.status }, { new: true });
    if (!updated) {
      res.status(404);
      throw new Error('Order not found');
    }
    res.json({ order: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
