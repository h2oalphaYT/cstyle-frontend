// Central HTTP client. Every request to the backend goes through here so auth headers,
// error shapes and retries are handled in one place.

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');
export const API_ORIGIN = API_URL.replace(/\/api$/, '');

const TOKEN_KEY = 'cstyle-token';

export const tokenStore = {
    get: (): string | null => {
        try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
    },
    set: (token: string) => {
        try { localStorage.setItem(TOKEN_KEY, token); } catch { /* storage unavailable */ }
    },
    clear: () => {
        try { localStorage.removeItem(TOKEN_KEY); } catch { /* storage unavailable */ }
    },
};

export interface FieldError { field: string; message: string }

export class ApiError extends Error {
    status: number;
    errors?: FieldError[];
    constructor(status: number, message: string, errors?: FieldError[]) {
        super(message);
        this.status = status;
        this.errors = errors;
    }
}

export interface Pagination { page: number; limit: number; total: number; totalPages: number }
export interface ApiResponse<T> { success: boolean; message?: string; data: T; pagination?: Pagination }

// Listeners notified when the server rejects our token (expired / revoked).
const unauthorizedListeners = new Set<() => void>();
export const onUnauthorized = (fn: () => void) => {
    unauthorizedListeners.add(fn);
    return () => { unauthorizedListeners.delete(fn); };
};

type Query = Record<string, string | number | boolean | undefined | null>;

export const toQuery = (params?: Query) => {
    if (!params) return '';
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') q.append(k, String(v));
    });
    const s = q.toString();
    return s ? `?${s}` : '';
};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

interface RequestOptions {
    body?: unknown;
    query?: Query;
    signal?: AbortSignal;
    retries?: number;
}

async function request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    const token = tokenStore.get();
    if (token) headers.Authorization = `Bearer ${token}`;

    let body: BodyInit | undefined;
    if (opts.body instanceof FormData) {
        body = opts.body;
    } else if (opts.body !== undefined) {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(opts.body);
    }

    // Only idempotent reads are retried, and only for network errors / 5xx.
    const retries = opts.retries ?? (method === 'GET' ? 2 : 0);
    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
            const res = await fetch(`${API_URL}${path}${toQuery(opts.query)}`, { method, headers, body, signal: opts.signal });
            const json = await res.json().catch(() => null);
            if (!res.ok) {
                const message = json?.message || (res.status >= 500 ? 'The server had a problem. Please try again.' : 'Request failed');
                const err = new ApiError(res.status, message, json?.errors);
                if (res.status === 401 && token) unauthorizedListeners.forEach(fn => fn());
                if (res.status >= 500 && attempt < retries) {
                    lastError = err;
                    await sleep(400 * 2 ** attempt);
                    continue;
                }
                throw err;
            }
            return json as ApiResponse<T>;
        } catch (err) {
            if (err instanceof ApiError || (err as Error)?.name === 'AbortError') throw err;
            lastError = new ApiError(0, 'Cannot reach the CStyle server. Check your connection and try again.');
            if (attempt < retries) await sleep(400 * 2 ** attempt);
        }
    }
    throw lastError;
}

export const http = {
    get: <T>(path: string, query?: Query, signal?: AbortSignal) => request<T>('GET', path, { query, signal }),
    post: <T>(path: string, body?: unknown) => request<T>('POST', path, { body }),
    put: <T>(path: string, body?: unknown) => request<T>('PUT', path, { body }),
    patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, { body }),
    delete: <T>(path: string, body?: unknown) => request<T>('DELETE', path, { body }),
};

export const errorMessage = (err: unknown, fallback = 'Something went wrong') =>
    err instanceof Error && err.message ? err.message : fallback;
