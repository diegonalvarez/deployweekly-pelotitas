const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3099';

interface RequestOptions extends RequestInit {
  token?: string;
}

async function request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('accessToken');
    if (stored) headers['Authorization'] = `Bearer ${stored}`;
  }

  const res = await fetch(`${API_URL}/api${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) }),

  patch: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(data) }),

  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
