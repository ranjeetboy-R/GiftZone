const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// 10 minutes
const CACHE_TTL = 10 * 60 * 1000;

const productCache = new Map();
const productListCache = new Map();

function isProductDetailsRequest(path, method) {
  return (
    method === 'GET' &&
    /^\/api\/products\/[^/?]+$/.test(path) &&
    path !== '/api/products/categories'
  );
}

function isProductListRequest(path, method) {
  return (
    method === 'GET' &&
    path.startsWith('/api/products?')
  );
}

function isCategoryRequest(path, method) {
  return (
    method === 'GET' &&
    path === '/api/products/categories'
  );
}

export async function apiFetch(path, options = {}) {
  const { token, ...rest } = options;

  const method = (rest.method || 'GET').toUpperCase();

  const shouldCacheProduct = isProductDetailsRequest(
    path,
    method
  );

  const shouldCacheProductList = isProductListRequest(
    path,
    method
  );

  const shouldCacheCategories = isCategoryRequest(
    path,
    method
  );

  const shouldCache =
    shouldCacheProduct ||
    shouldCacheProductList ||
    shouldCacheCategories;

  const cacheKey = `${API_URL}${path}`;

  /*
   * Product details cache
   */
  if (shouldCacheProduct) {
    const cached = productCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    if (cached?.promise) {
      return cached.promise;
    }
  }

  /*
   * Product list cache
   */
  if (shouldCacheProductList) {
    const cached = productListCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    if (cached?.promise) {
      return cached.promise;
    }
  }

  /*
   * Category cache
   */
  if (shouldCacheCategories) {
    const cached = productListCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    if (cached?.promise) {
      return cached.promise;
    }
  }

  const headers = {
    ...(rest.body instanceof FormData
      ? {}
      : {
        'Content-Type': 'application/json'
      }),

    ...(rest.headers || {}),

    ...(token
      ? {
        Authorization: `Bearer ${token}`
      }
      : {})
  };

  const request = (async () => {
    const response = await fetch(
      `${API_URL}${path}`,
      {
        ...rest,
        headers,
        credentials: 'include',

        // Browser/network cache ko disable rakho.
        // Hamara custom cache use hoga.
        cache: 'no-store'
      }
    );

    const data = await response
      .json()
      .catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || 'Request failed'
      );
    }

    /*
     * Save product details
     */
    if (shouldCacheProduct) {
      productCache.set(cacheKey, {
        data,
        expiresAt: Date.now() + CACHE_TTL
      });
    }

    /*
     * Save product lists and categories
     */
    if (
      shouldCacheProductList ||
      shouldCacheCategories
    ) {
      productListCache.set(cacheKey, {
        data,
        expiresAt: Date.now() + CACHE_TTL
      });
    }

    /*
     * Product mutation ke baad cache invalidate
     */
    if (
      method !== 'GET' &&
      path.startsWith('/api/products/')
    ) {
      productCache.clear();
      productListCache.clear();
    }

    return data;
  })();

  /*
   * Store pending promise
   * so duplicate requests don't happen
   */
  if (shouldCacheProduct) {
    productCache.set(cacheKey, {
      promise: request
    });

    request.catch(() => {
      productCache.delete(cacheKey);
    });
  }

  if (
    shouldCacheProductList ||
    shouldCacheCategories
  ) {
    productListCache.set(cacheKey, {
      promise: request
    });

    request.catch(() => {
      productListCache.delete(cacheKey);
    });
  }

  return request;
}

export { API_URL };

// Stream api 
export async function apiFetchStream(path, { signal, onMeta, onProducts } = {}) {

  const response = await fetch(`${API_URL}${path}`, {
    signal,
    cache: 'no-store'
  }
  );

  if (!response.ok) {
    throw new Error(
      `Request failed with status ${response.status}`
    );
  }

  if (!response.body) {
    throw new Error(
      'Streaming is not supported by this response.'
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, {
      stream: true
    }
    );

    const lines = buffer.split('\n');

    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }

      const data = JSON.parse(line);

      if (data.type === 'meta') {
        onMeta?.(data.pagination);
      }

      if (data.type === 'products') {
        onProducts?.(data.products || []);
      }
    }
  }

  if (buffer.trim()) {
    const data = JSON.parse(buffer);

    if (data.type === 'meta') {
      onMeta?.(data.pagination);
    }

    if (data.type === 'products') {
      onProducts?.(data.products || []);
    }
  }
}