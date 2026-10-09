import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  compareAtPrice: {
    type: Number,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  images: {
    type: [String],
    default: []
  },
  // Public IDs are kept separately from presentation URLs so destructive
  // Cloudinary operations never need to guess an identifier from a URL.
  imageAssets: {
    type: [{
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      resourceType: { type: String, default: 'image' }
    }],
    default: []
  },
  sizes: {
    type: [String],
    default: []
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0,
    min: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isNewArrival: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  }
},
  {
    timestamps: true
  }
);

productSchema.index({
  category: 1,
  active: 1,
  createdAt: -1
});

productSchema.index({ active: 1, isFeatured: 1, rating: -1, reviews: -1, createdAt: -1 });
productSchema.index({ active: 1, isNewArrival: 1, createdAt: -1 });

productSchema.index({
  name: 'text',
  description: 'text'
});

export default mongoose.models.Product || mongoose.model('Product', productSchema);
