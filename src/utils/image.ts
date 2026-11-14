import { API_ORIGIN } from '../api/client';

/**
 * The API already returns absolute image URLs. This only guards against relative paths
 * (e.g. "/uploads/products/x.webp") so the UI never builds broken URLs by hand.
 */
export const resolveImageUrl = (src?: string | null): string => {
    if (!src) return '';
    if (/^(https?:|data:|blob:)/i.test(src)) return src;
    // Site's own public files (e.g. /images/hero/...) are served by the storefront, not the API.
    if (src.startsWith('/images/')) return src;
    return `${API_ORIGIN}${src.startsWith('/') ? '' : '/'}${src}`;
};
