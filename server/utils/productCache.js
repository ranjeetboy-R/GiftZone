import redis from '../config/redis.js';

const CACHE_TTL = 60 * 60;

export async function getProductCacheVersion() {
  const version = await redis.get('products:version');

  return Number(version) || 1;
}

export async function invalidateProductCache() {
  await redis.incr('products:version');
}