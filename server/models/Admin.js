import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true
  },
  passwordHash: { type: String, required: true },
  active: { type: Boolean, default: true }
},
  { timestamps: true });

export default mongoose.models.Admin || mongoose.model('Admin', adminSchema);
