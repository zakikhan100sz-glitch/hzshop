import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
    color: { type: String, default: '' },
    size: { type: String, default: '' },
    image: { type: String, default: '' }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    customer: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        city: { type: String, required: true },
        address: { type: String },
        notes: { type: String }
      },
    status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'completed', 'cancelled'], default: 'pending' },
    whatsappMessage: { type: String, default: '' }
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
