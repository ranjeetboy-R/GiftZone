import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
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
        isNew: {
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

productSchema.index({ category: 1, active: 1, createdAt: -1 });
productSchema.index({ name: 'text', description: 'text' });

export default mongoose.models.Product || mongoose.model('Product', productSchema);
