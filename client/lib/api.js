const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function apiFetch(path, options = {}) {
    const { token, ...rest } = options;
    const headers = {
        ...(rest.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(rest.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...rest,
        headers,
        cache: 'no-store'
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || 'Request failed');
    }

    return data;
}

export { API_URL };
