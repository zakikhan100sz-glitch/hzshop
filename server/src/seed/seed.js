import path from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { slugify } from '../utils/slugify.js';

dotenv.config({ path: path.join(process.cwd(), '.env') });


const adminEmail = (process.env.SEED_ADMIN_EMAIL || '').toLowerCase().trim();
const adminPassword = process.env.SEED_ADMIN_PASSWORD || '';
const wipeProducts = process.env.SEED_WIPE_PRODUCTS === 'true'; 

const sampleProducts = [
  {
    title: 'Leather Backpack',
    category: 'Bags',
    description:
      'Premium leather backpack perfect for daily use. Features multiple compartments and padded laptop sleeve.',
    price: 129.99,
    images: ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80'],
    colors: ['Brown', 'Black', 'Tan'],
    sizes: ['One Size'],
    tags: ['bags', 'leather']
  },
  {
    title: 'Designer Handbag',
    category: 'Bags',
    description: 'Elegant designer handbag with gold hardware. Perfect for both casual and formal looks.',
    price: 189.99,
    images: ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80'],
    colors: ['Beige', 'Black', 'Navy'],
    sizes: ['One Size'],
    tags: ['bags']
  },
  {
    title: 'Classic Denim Jacket',
    category: 'Clothing',
    description: 'Timeless denim jacket with a modern fit. A wardrobe essential for any season.',
    price: 79.99,
    images: ['https://images.unsplash.com/photo-1520975958225-3b47f64f5d28?auto=format&fit=crop&w=1200&q=80'],
    colors: ['Light Blue', 'Dark Blue'],
    sizes: ['S', 'M', 'L', 'XL'],
    tags: ['clothing']
  },
  {
    title: 'Premium Cotton T-Shirt',
    category: 'Clothing',
    description: 'Soft and comfortable cotton t-shirt. Perfect for everyday wear with a relaxed fit.',
    price: 29.99,
    images: ['https://images.unsplash.com/photo-1520975958225-3b47f64f5d28?auto=format&fit=crop&w=1200&q=80'],
    colors: ['White', 'Black', 'Gray', 'Navy'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    tags: ['clothing']
  }
];

async function run() {
  
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to run seed in production. Set NODE_ENV=development.');
  }

  if (!adminEmail) throw new Error('Missing SEED_ADMIN_EMAIL in .env');
  if (!adminPassword || adminPassword.length < 8) throw new Error('SEED_ADMIN_PASSWORD must be at least 8 chars');

  await connectDB();


  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await User.findOneAndUpdate(
    { email: adminEmail },
    { name: 'Owner', email: adminEmail, passwordHash, role: 'owner' },
    { upsert: true, new: true }
  );

  console.log(' Owner account ready:', adminEmail);

  
  if (wipeProducts) {
    await Product.deleteMany({});
    console.log('Wiped all products because SEED_WIPE_PRODUCTS=true');
  }


  for (const p of sampleProducts) {
    const slug = slugify(p.title);
    const exists = await Product.findOne({ slug }).lean();
    if (!exists) {
      await Product.create({ ...p, slug });
    }
  }

  console.log('Seed finished');
  process.exit(0);
}

run().catch((e) => {
  console.error('Seed error:', e.message);
  process.exit(1);
});