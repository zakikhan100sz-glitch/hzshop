import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/User.js';

async function run() {
  const MONGODB_URI = process.env.MONGODB_URI;
  const email = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || '';
  const name = process.env.ADMIN_NAME || 'Owner';

  if (!MONGODB_URI) throw new Error('Missing MONGODB_URI');
  if (!email) throw new Error('Missing ADMIN_EMAIL');
  if (!password || password.length < 8) throw new Error('ADMIN_PASSWORD must be at least 8 characters');

  await mongoose.connect(MONGODB_URI);

  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await User.findOne({ email });
  if (!existing) {
    await User.create({ name, email, passwordHash, role: 'owner' });
    console.log('Owner created:', email);
  } else {
    existing.name = name;
    existing.passwordHash = passwordHash;
    existing.role = 'owner';
    await existing.save();
    console.log('Owner updated:', email);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error('❌ seedOwner failed:', e.message);
  process.exit(1);
});