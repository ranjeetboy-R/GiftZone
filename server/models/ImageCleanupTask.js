import mongoose from 'mongoose';

const imageCleanupTaskSchema = new mongoose.Schema({
  publicId: { type: String, required: true, unique: true },
  resourceType: { type: String, default: 'image' },
  attempts: { type: Number, default: 0 },
  lastError: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.ImageCleanupTask || mongoose.model('ImageCleanupTask', imageCleanupTaskSchema);
