import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      immutable: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    firstName: {
      type: String,
      trim: true,
      maxlength: 50,
      default: ''
    },

    lastName: {
      type: String,
      trim: true,
      maxlength: 50,
      default: ''
    },

    imageUrl: {
      type: String,
      trim: true,
      default: ''
    },

    phone: {
      type: String,
      trim: true,
      default: ''
    },

    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
      index: true
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    },

    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const User =
  mongoose.models.User ||
  mongoose.model('User', userSchema);

export default User;