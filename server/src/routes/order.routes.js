import express from 'express';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { buildWhatsAppLink } from '../utils/whatsapp.js';

const router = express.Router();

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        qty: z.number().int().min(1),
        color: z.string().optional().default(''),
        size: z.string().optional().default('')
      })
    )
    .min(1),

  customer: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(5),
    city: z.string().min(2),
    address: z.string().optional().default(''),
    notes: z.string().optional().default('')
  })
});

function fmtAFN(n) {
  return `AFN ${Number(n || 0).toFixed(2)}`;
}

async function getUserIdFromAuthHeader(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
    const user = await User.findById(payload.sub).select('_id').lean();
    return user ? user._id : null;
  } catch {
    return null;
  }
}

router.post('/', async (req, res, next) => {
  try {
    const body = createOrderSchema.parse(req.body);

    // Hydrate items from DB
    const ids = body.items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: ids } }).lean();
    const map = new Map(products.map((p) => [String(p._id), p]));

    const orderItems = body.items.map((i) => {
      const p = map.get(String(i.productId));
      if (!p) throw new Error('Invalid product in cart');
      return {
        productId: p._id,
        title: p.title,
        price: Number(p.price || 0),
        qty: i.qty,
        color: i.color || '',
        size: i.size || '',
        image: p.images?.[0] || ''
      };
    });

    const subtotal = orderItems.reduce((sum, it) => sum + it.price * it.qty, 0);
    const shipping = 0;
    const total = subtotal + shipping;

    const orderCode = nanoid(8).toUpperCase();

    // WhatsApp message
    const messageLines = [
      `hzShop Order #${orderCode}`,
      '',
      `Customer: ${body.customer.fullName}`,
      `Phone: ${body.customer.phone}`,
      `City: ${body.customer.city}`,
      body.customer.address ? `Address: ${body.customer.address}` : null,
      body.customer.notes ? `Notes: ${body.customer.notes}` : null,
      '',
      'Items:'
    ].filter(Boolean);

    for (const it of orderItems) {
      messageLines.push(
        `- ${it.title} x${it.qty} (${fmtAFN(it.price)})` +
          (it.color ? ` | Color: ${it.color}` : '') +
          (it.size ? ` | Size: ${it.size}` : '')
      );
    }

    messageLines.push(
      '',
      `Subtotal: ${fmtAFN(subtotal)}`,
      `Shipping: ${fmtAFN(shipping)}`,
      `Total: ${fmtAFN(total)}`
    );

    const whatsappNumber = process.env.WHATSAPP_NUMBER || '+15551234567';
    const whatsappLink = buildWhatsAppLink({
      number: whatsappNumber,
      text: messageLines.join('\n')
    });

    const userId = await getUserIdFromAuthHeader(req);

    const order = await Order.create({
      userId,
      items: orderItems,
      subtotal,
      shipping,
      total,
      customer: body.customer,
      whatsappMessage: messageLines.join('\n')
    });

    res.json({
      orderId: order._id,
      whatsappLink
    });
  } catch (err) {
    next(err);
  }
});

export default router;