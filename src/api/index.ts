import { http } from './client';
import type {
    Address, Banner, CartSummary, Category, Coupon, Customer, DashboardData, LineInput, Order, OrderStatus,
    PaymentMethod, PaymentStatus, Product, ProductQuery, Quote, Review, StoreConfig, UploadedImage, User,
} from './types';

export * from './client';
export * from './types';

type AuthResult = { token: string; user: User };

export const authApi = {
    login: (email: string, password: string) => http.post<AuthResult>('/auth/login', { email, password }),
    register: (body: { name: string; email: string; password: string; phone?: string }) => http.post<AuthResult>('/auth/register', body),
    logout: () => http.post<null>('/auth/logout'),
    me: () => http.get<User>('/auth/me'),
    updateMe: (body: { name?: string; phone?: string; addresses?: Address[] }) => http.put<User>('/auth/me', body),
    changePassword: (currentPassword: string, newPassword: string) =>
        http.put<AuthResult>('/auth/password', { currentPassword, newPassword }),
};

export const productsApi = {
    list: (query: ProductQuery = {}, signal?: AbortSignal) => http.get<Product[]>('/products', query as Record<string, string>, signal),
    get: (idOrSlug: string) => http.get<Product>(`/products/${encodeURIComponent(idOrSlug)}`),
    bySlug: (slug: string) => http.get<Product>(`/products/slug/${encodeURIComponent(slug)}`),
    related: (id: string, limit = 4) => http.get<Product[]>(`/products/${id}/related`, { limit }),
    suggestions: (q: string, signal?: AbortSignal) =>
        http.get<{ products: { id: string; name: string; slug: string; thumbnail: string; price: number }[]; categories: Category[] }>(
            '/products/suggestions', { q }, signal),
    recordView: (id: string) => http.post<null>(`/products/${id}/view`),
    reviews: (id: string, page = 1) => http.get<Review[]>(`/products/${id}/reviews`, { page }),
    addReview: (id: string, body: { rating: number; title?: string; comment?: string }) => http.post<Review>(`/products/${id}/reviews`, body),
    recentlyViewed: () => http.get<Product[]>('/users/me/recently-viewed'),

    // admin
    create: (body: Record<string, unknown>) => http.post<Product>('/products', body),
    update: (id: string, body: Record<string, unknown>) => http.put<Product>(`/products/${id}`, body),
    setActive: (id: string, active: boolean) => http.patch<Product>(`/products/${id}/status`, { active }),
    remove: (id: string) => http.delete<null>(`/products/${id}`),
    restore: (id: string) => http.patch<Product>(`/products/${id}/restore`),
    setThumbnail: (id: string, url: string) => http.patch<Product>(`/products/${id}/thumbnail`, { url }),
    removeImage: (id: string, url: string) => http.delete<Product>(`/products/${id}/images`, { url }),
};

export const categoriesApi = {
    list: (all = false) => http.get<Category[]>('/categories', all ? { all: 'true' } : undefined),
    get: (idOrSlug: string) => http.get<Category>(`/categories/${idOrSlug}`),
    create: (body: Partial<Category>) => http.post<Category>('/categories', body),
    update: (id: string, body: Partial<Category>) => http.put<Category>(`/categories/${id}`, body),
    remove: (id: string) => http.delete<null>(`/categories/${id}`),
};

export const bannersApi = {
    list: (placement?: 'hero' | 'promo', all = false) => http.get<Banner[]>('/banners', { placement, all: all ? 'true' : undefined }),
    create: (body: Partial<Banner>) => http.post<Banner>('/banners', body),
    update: (id: string, body: Partial<Banner>) => http.put<Banner>(`/banners/${id}`, body),
    remove: (id: string) => http.delete<null>(`/banners/${id}`),
};

export const uploadsApi = {
    productImage: (file: File) => {
        const form = new FormData();
        form.append('image', file);
        return http.post<UploadedImage>('/uploads/product', form);
    },
    productImages: (files: File[]) => {
        const form = new FormData();
        files.forEach(f => form.append('images', f));
        return http.post<UploadedImage[]>('/uploads/products', form);
    },
    categoryImage: (file: File) => {
        const form = new FormData();
        form.append('image', file);
        return http.post<UploadedImage>('/uploads/category', form);
    },
    bannerImage: (file: File) => {
        const form = new FormData();
        form.append('image', file);
        return http.post<UploadedImage>('/uploads/banner', form);
    },
};

export const cartApi = {
    get: () => http.get<CartSummary>('/cart'),
    add: (line: LineInput) => http.post<CartSummary>('/cart/items', line),
    update: (itemId: string, quantity: number) => http.patch<CartSummary>(`/cart/items/${itemId}`, { quantity }),
    remove: (itemId: string) => http.delete<CartSummary>(`/cart/items/${itemId}`),
    clear: () => http.delete<CartSummary>('/cart'),
    merge: (items: LineInput[]) => http.post<CartSummary>('/cart/merge', { items }),
};

export const wishlistApi = {
    get: () => http.get<Product[]>('/wishlist'),
    add: (productId: string) => http.post<Product[]>(`/wishlist/${productId}`),
    remove: (productId: string) => http.delete<Product[]>(`/wishlist/${productId}`),
    merge: (productIds: string[]) => http.post<Product[]>('/wishlist/merge', { productIds }),
};

export interface PlaceOrderInput {
    items: LineInput[];
    customer: { name: string; email: string; phone: string };
    shippingAddress: Address;
    billingAddress?: Address;
    paymentMethod: PaymentMethod;
    couponCode?: string;
    notes?: string;
}

export const ordersApi = {
    quote: (items: LineInput[], couponCode?: string, email?: string) => http.post<Quote>('/orders/quote', { items, couponCode, email }),
    validateCoupon: (code: string, items: LineInput[], email?: string) => http.post<Quote>('/coupons/validate', { code, items, email }),
    place: (body: PlaceOrderInput) => http.post<Order>('/orders', body),
    mine: (page = 1) => http.get<Order[]>('/orders/my', { page }),
    get: (id: string) => http.get<Order>(`/orders/${id}`),
    track: (orderNumber: string, email: string) => http.get<Order>('/orders/track', { orderNumber, email }),
    cancel: (id: string) => http.patch<Order>(`/orders/${id}/cancel`),

    // admin
    list: (query: { page?: number; limit?: number; status?: string; search?: string } = {}) => http.get<Order[]>('/orders', query),
    updateStatus: (id: string, body: { orderStatus?: OrderStatus; paymentStatus?: PaymentStatus; note?: string }) =>
        http.patch<Order>(`/orders/${id}/status`, body),
};

export const couponsApi = {
    publicList: () => http.get<Coupon[]>('/coupons/public'),
    list: () => http.get<Coupon[]>('/coupons'),
    create: (body: Partial<Coupon>) => http.post<Coupon>('/coupons', body),
    update: (id: string, body: Partial<Coupon>) => http.put<Coupon>(`/coupons/${id}`, body),
    remove: (id: string) => http.delete<null>(`/coupons/${id}`),
};

export const adminApi = {
    dashboard: (range = 'week') => http.get<DashboardData>('/admin/dashboard', { range }),
    sales: (range = 'month') => http.get<{ date: string; revenue: number; orders: number }[]>('/admin/sales', { range }),
    customers: (query: { page?: number; limit?: number; search?: string; role?: string } = {}) => http.get<Customer[]>('/admin/customers', query),
    updateCustomer: (id: string, body: { role?: string; active?: boolean }) => http.patch<User>(`/admin/customers/${id}`, body),
};

export const configApi = {
    get: () => http.get<StoreConfig>('/config'),
};
