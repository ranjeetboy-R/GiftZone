const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const CACHE_STALE_TIME = 5 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;
const apiCache = new Map();

function getRequestHeaders(options, token) {
  const headers = {
    ...(typeof FormData !== 'undefined' && options.body instanceof FormData
      ? {}
      : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  return headers;
}

function getAuthorization(headers) {
  return new Headers(headers).get('authorization') || '';
}

function getCacheKey(path, headers) {
  const normalizedHeaders = Array.from(
    new Headers(headers).entries()
  ).sort(([left], [right]) => left.localeCompare(right));

  return `${API_URL}${path}|${JSON.stringify(normalizedHeaders)}`;
}

function isCacheableRequest(method, path, token, headers, signal) {
  return (
    method === 'GET' &&
    !signal &&
    (
      path === '/api/products' ||
      path.startsWith('/api/products?') ||
      path.startsWith('/api/products/') ||
      Boolean(token || getAuthorization(headers))
    )
  );
}

function storeCacheEntry(key, entry) {
  apiCache.delete(key);
  apiCache.set(key, entry);

  while (apiCache.size > MAX_CACHE_ENTRIES) {
    const oldestAvailable = Array.from(apiCache.entries())
      .find(([, cachedEntry]) => !cachedEntry.promise);

    if (!oldestAvailable) {
      break;
    }

    apiCache.delete(oldestAvailable[0]);
  }
}

function invalidateRelatedCache(path, token, headers) {
  const family = ['/api/products', '/api/orders', '/api/users']
    .find(prefix => path === prefix || path.startsWith(`${prefix}/`));

  if (!family) {
    return;
  }

  const authScope = token
    ? `Bearer ${token}`
    : getAuthorization(headers);

  for (const [key, entry] of apiCache) {
    if (
      (
        entry.path === family ||
        entry.path.startsWith(`${family}/`) ||
        entry.path.startsWith(`${family}?`)
      ) &&
      (
        family === '/api/products' ||
        !authScope ||
        entry.authScope === authScope
      )
    ) {
      apiCache.delete(key);
    }
  }
}

async function executeRequest(path, options, token, method, key, entry) {
  const headers = getRequestHeaders(options, token);
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
    cache: 'no-store'
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  if (method !== 'GET') {
    invalidateRelatedCache(path, token, headers);
  }

  if (entry && apiCache.get(key) === entry) {
    entry.data = data;
    entry.updatedAt = Date.now();
    entry.promise = null;

    for (const listener of entry.listeners) {
      listener(data);
    }

    entry.listeners.clear();
  }

  return data;
}

function revalidate(path, options, token, method, key, entry) {
  if (entry.promise) {
    return;
  }

  const request = executeRequest(
    path,
    options,
    token,
    method,
    key,
    entry
  );

  entry.promise = request;
  request.catch(() => {
    if (apiCache.get(key) === entry) {
      entry.promise = null;
      entry.listeners.clear();
    }
  });
}

export function getCachedApiData(path, options = {}) {
  const { token, ...rest } = options;
  const headers = getRequestHeaders(rest, token);

  if (
    !isCacheableRequest(
      (rest.method || 'GET').toUpperCase(),
      path,
      token,
      headers,
      rest.signal
    )
  ) {
    return undefined;
  }

  return apiCache.get(getCacheKey(path, headers))?.data;
}

export async function apiFetch(path, options = {}) {
  const { token, onUpdate, ...rest } = options;
  const method = (rest.method || 'GET').toUpperCase();
  const headers = getRequestHeaders(rest, token);
  const canCache = isCacheableRequest(
    method,
    path,
    token,
    headers,
    rest.signal
  );

  if (!canCache) {
    return executeRequest(path, rest, token, method);
  }

  const key = getCacheKey(path, headers);
  const cached = apiCache.get(key);

  if (cached?.data !== undefined) {
    const isStale = Date.now() - cached.updatedAt >= CACHE_STALE_TIME;

    if (isStale) {
      if (typeof onUpdate === 'function') {
        cached.listeners.add(onUpdate);
      }

      revalidate(path, rest, token, method, key, cached);
    }

    storeCacheEntry(key, cached);
    return cached.data;
  }

  if (cached?.promise) {
    return cached.promise;
  }

  const entry = {
    path,
    authScope: token
      ? `Bearer ${token}`
      : getAuthorization(headers),
    data: undefined,
    updatedAt: 0,
    promise: null,
    listeners: new Set()
  };

  storeCacheEntry(key, entry);
  const request = executeRequest(
    path,
    rest,
    token,
    method,
    key,
    entry
  );

  entry.promise = request;
  request.catch(() => {
    if (apiCache.get(key) === entry) {
      apiCache.delete(key);
    }
  });

  return request;
}

export { API_URL };

export async function apiFetchStream(path, { signal, onMeta, onProducts } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    signal,
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (!response.body) {
    throw new Error('Streaming is not supported by this response.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
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
