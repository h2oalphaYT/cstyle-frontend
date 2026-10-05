export type Role = 'customer' | 'admin' | 'staff';

export interface Address {
    _id?: string;
    label?: string;
    fullName: string;
    phone?: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country?: string;
    isDefault?: boolean;
}

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: Role;
    addresses: Address[];
    active: boolean;
    createdAt: string;
    /** Back-office permissions (admins hold all of them). */
    permissions?: string[];
    dataScope?: 'all' | 'department' | 'team' | 'own';
    staffRoleName?: string | null;
    employee?: string | null;
}

export interface CategoryRef { _id: string; id?: string; name: string; slug: string }

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    active: boolean;
    sortOrder: number;
    productCount?: number;
}

export interface ProductColor { name: string; hex: string }
export interface ProductVariant { _id?: string; sku?: string; size: string; color: string; stock: number }
export interface Specification { key: string; value: string }

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    category: CategoryRef | null;
    subCategory: string;
    gender: 'men' | 'women' | 'kids' | 'unisex';
    brand: string;
    price: number;
    salePrice: number | null;
    finalPrice: number;
    effectivePrice: number;
    onSale: boolean;
    discountPercent: number;
    currency: string;
    sku: string;
    stock: number;
    lowStockThreshold: number;
    stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
    sizes: string[];
    colors: ProductColor[];
    variants: ProductVariant[];
    images: string[];
    thumbnail: string;
    material: string;
    features: string[];
    specifications: Specification[];
    tags: string[];
    featured: boolean;
    newArrival: boolean;
    active: boolean;
    isDeleted: boolean;
    ratingAverage: number;
    ratingCount: number;
    soldCount: number;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface ProductQuery {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    subCategory?: string;
    gender?: string;
    minPrice?: number | string;
    maxPrice?: number | string;
    size?: string;
    color?: string;
    tag?: string;
    featured?: boolean;
    newArrival?: boolean;
    onSale?: boolean;
    inStock?: boolean;
    lowStock?: boolean;
    status?: 'active' | 'inactive' | 'deleted' | 'all';
    ids?: string;
    exclude?: string;
    sort?: string;
}

export interface Review {
    id: string;
    product: string;
    user: string;
    name: string;
    rating: number;
    title: string;
    comment: string;
    verifiedPurchase: boolean;
    createdAt: string;
}

export interface CartLine {
    id: string;
    productId: string;
    variantId: string | null;
    name: string;
    slug: string;
    image: string;
    size: string;
    color: string;
    quantity: number;
    unitPrice: number;
    originalPrice: number;
    lineTotal: number;
    stock: number;
    available: boolean;
}

export interface CartSummary {
    items: CartLine[];
    itemCount: number;
    subtotal: number;
    shipping: number;
    freeShippingThreshold: number;
    currency: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'cod' | 'bank_transfer';

export interface OrderItem {
    _id: string;
    product: string;
    variant: string | null;
    name: string;
    sku: string;
    image: string;
    size: string;
    color: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
}

export interface Order {
    id: string;
    orderNumber: string;
    user: string | null;
    customer: { name: string; email: string; phone: string };
    items: OrderItem[];
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    currency: string;
    coupon?: { code: string; type: string; value: number };
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
    statusHistory: { status: OrderStatus; note: string; at: string }[];
    shippingAddress: Address;
    billingAddress: Address;
    notes: string;
    createdAt: string;
    updatedAt: string;
}

export interface Quote {
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    currency: string;
    coupon: { code: string; type: string; value: number; description: string } | null;
    freeShippingThreshold: number;
    shippingFee: number;
}

export interface Coupon {
    id: string;
    code: string;
    description: string;
    type: 'percentage' | 'fixed';
    value: number;
    minimumAmount: number;
    maxDiscount: number | null;
    expiryDate: string | null;
    active: boolean;
    usageLimit: number | null;
    usedCount: number;
    firstOrderOnly: boolean;
}

export interface Banner {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    ctaText: string;
    link: string;
    placement: 'hero' | 'promo';
    active: boolean;
    sortOrder: number;
}

export interface UploadedImage { url: string; path: string; filename: string; width: number; height: number; size: number }

export interface StoreConfig {
    currency: string;
    shippingFee: number;
    freeShippingThreshold: number;
    maxUploadSize: number;
    paymentMethods: PaymentMethod[];
}

export interface DashboardData {
    totals: { products: number; activeProducts: number; orders: number; customers: number; revenue: number; pendingOrders: number; lowStock: number };
    range: { from: string; revenue: number; orders: number; revenueChange: number | null };
    ordersByStatus: Partial<Record<OrderStatus, number>>;
    lowStockProducts: Product[];
    recentOrders: Order[];
    topProducts: { productId: string; name: string; image: string; quantity: number; revenue: number }[];
}

export interface Customer extends User {
    orders: number;
    totalSpent: number;
    lastOrderAt: string | null;
}

/** A cart line request as the API expects it. */
export interface LineInput {
    productId: string;
    variantId?: string | null;
    size?: string;
    color?: string;
    quantity: number;
}
