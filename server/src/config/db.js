import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is missing in server/.env');

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri, {
      autoIndex: process.env.NODE_ENV !== 'production'
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err?.message || err);
    process.exit(1);
  }
}
