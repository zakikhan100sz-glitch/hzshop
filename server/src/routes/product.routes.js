import express from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';

const router = express.Router();

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|\\]/g, "\\$&");
}

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(48, Math.max(1, parseInt(req.query.limit || '12', 10)));
    const q = String(req.query.q || '').trim();

    const category = String(req.query.category || '').trim();
    const colors = String(req.query.colors || '').trim();
    const sizes = String(req.query.sizes || '').trim();
    const sort = String(req.query.sort || 'newest');

    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (colors) filter.colors = { $in: colors.split(',').map(s => s.trim()).filter(Boolean) };
    if (sizes) filter.sizes = { $in: sizes.split(',').map(s => s.trim()).filter(Boolean) };

    const searchFilter = { ...filter };
    if (q) {
      const rx = new RegExp(escapeRegExp(q), 'i');
      searchFilter.$or = [
        { title: rx },
        { slug: rx },
        { category: rx },
        { description: rx },
        { tags: { $in: [rx] } }
      ];
    }

    const sortMap = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 }
    };

    const total = await Product.countDocuments(searchFilter);
    const items = await Product.find(searchFilter)
      .sort(sortMap[sort] || sortMap.newest)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({ page, limit, total, pages: Math.ceil(total / limit), items });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    let product = null;

    if (mongoose.isValidObjectId(id)) {
      product = await Product.findById(id).lean();
    }

    if (!product) {
      product = await Product.findOne({ slug: id }).lean();
    }

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    res.json({ product });
  } catch (err) {
    next(err);
  }
});

export default router;