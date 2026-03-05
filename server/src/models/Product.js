import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    highlights: { type: [String], default: [] },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null },
    images: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    inStock: { type: Boolean, default: true },
    stockQty: { type: Number, default: 100 },
    tags: { type: [String], default: [] },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 120 }
  },
  { timestamps: true }
);

productSchema.index({ title: 'text', category: 'text', tags: 'text' });

export const Product = mongoose.model('Product', productSchema);
