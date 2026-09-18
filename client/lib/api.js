const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const PRODUCT_CACHE_TTL = 5 * 60 * 1000;
const productCache = new Map();

function isProductDetailsRequest(path, method) {
  return method === 'GET' &&
    /^\/api\/products\/[^/?]+$/.test(path) &&
    path !== '/api/products/categories';
}

export async function apiFetch(path, options = {}) {
  const { ...rest } = options;
  const method = (rest.method || 'GET').toUpperCase();
  const shouldCache = isProductDetailsRequest(path, method);
  const cacheKey = `${API_URL}${path}`;

  if (shouldCache) {
    const cached = productCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    if (cached?.promise) {
      return cached.promise;
    }
  }

  const headers = {
    ...(rest.body instanceof FormData ? {} : {
      'Content-Type': 'application/json'
    }),
    ...(rest.headers || {})
  };

  const request = (async () => {
    const response = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers,
      credentials: 'include',
      cache: 'no-store'
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message ||
        'Request failed'
      );
    }

    if (shouldCache) {
      productCache.set(cacheKey, {
        data,
        expiresAt: Date.now() + PRODUCT_CACHE_TTL
      });
    } else if (method !== 'GET' && path.startsWith('/api/products/')) {
      productCache.clear();
    }

    return data;
  })();

  if (shouldCache) {
    productCache.set(cacheKey, { promise: request });
    request.catch(() => {
      productCache.delete(cacheKey);
    });
  }

  return request;
}

export { API_URL };