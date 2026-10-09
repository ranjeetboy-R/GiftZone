import Product from '../models/Product.js';
import ImageCleanupTask from '../models/ImageCleanupTask.js';
import cloudinary from '../config/cloudinary.js';

const PRODUCT_FOLDER = 'gift-zone/products/';

export function normalizeImageAssets(images, imageAssets) {
  if (!Array.isArray(images)) return [];
  const supplied = new Map((Array.isArray(imageAssets) ? imageAssets : [])
    .filter(asset => asset && typeof asset.url === 'string' && typeof asset.publicId === 'string')
    .map(asset => [asset.url, asset]));

  return images.map(url => {
    const asset = supplied.get(url);
    if (!asset || !asset.publicId.startsWith(PRODUCT_FOLDER)) {
      throw new Error('Product images must be uploaded through the product upload endpoint.');
    }
    return { url, publicId: asset.publicId, resourceType: asset.resourceType === 'image' ? 'image' : 'image' };
  });
}

export async function queueOrDeleteUnusedAssets(assets) {
  for (const asset of assets) {
    if (!asset?.publicId) continue;
    const stillUsed = await Product.exists({ 'imageAssets.publicId': asset.publicId });
    if (stillUsed) continue;
    try {
      const result = await cloudinary.uploader.destroy(asset.publicId, { resource_type: asset.resourceType || 'image', invalidate: true });
      if (!['ok', 'not found'].includes(result.result)) throw new Error(`Cloudinary returned ${result.result}`);
      await ImageCleanupTask.deleteOne({ publicId: asset.publicId });
    } catch (error) {
      await ImageCleanupTask.updateOne(
        { publicId: asset.publicId },
        { $set: { resourceType: asset.resourceType || 'image', lastError: 'Cloudinary cleanup failed' }, $inc: { attempts: 1 } },
        { upsert: true }
      );
      console.error('Cloudinary product-image cleanup queued:', asset.publicId);
    }
  }
}

export async function retryQueuedProductImageCleanup() {
  const tasks = await ImageCleanupTask.find().sort({ updatedAt: 1 }).limit(100).lean();
  await queueOrDeleteUnusedAssets(tasks);
}
