import api from './api';

export interface ColorVariant {
    color: string;
    colorCode: string;
    colorName: string;
}

export interface VariantStock {
    color: string;
    colorCode: string;
    size: string;
    quantity: number;
}

export interface ProductImage {
    _id?: string;
    productCode?: string;
    imageUrl: string;
    imageOrder?: number;
    altText?: string;
    isPrimary?: boolean;
    imageType?: 'product' | 'variant' | 'detail' | 'lifestyle';
}

export interface Product {
    _id?: string;
    productCode: string;
    name: string;
    description: string;
    category: 'Men' | 'Women' | 'Kids';
    subcategory?: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    primaryImage: string;
    images?: ProductImage[];
    colors?: ColorVariant[];
    sizes?: string[];
    variantStock?: VariantStock[];
    totalStock?: number;
    lowStockThreshold?: number;
    status?: 'active' | 'inactive';
    features?: string[];
    material?: string;
    rating?: number;
    reviews?: number;
    inStock?: boolean;
    newArrival?: boolean;
    isFeatured?: boolean;
    isTrending?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateProductDto {
    productCode: string;
    name: string;
    description: string;
    category: 'Men' | 'Women' | 'Kids';
    subcategory?: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    primaryImage: string;
    images?: ProductImage[];
    colors?: ColorVariant[];
    sizes?: string[];
    variantStock?: VariantStock[];
    features?: string[];
    material?: string;
    status?: 'active' | 'inactive';
    newArrival?: boolean;
    isFeatured?: boolean;
    isTrending?: boolean;
}

const productService = {
    // Get all products
    getAll: async (params?: {
        category?: string;
        status?: string;
        search?: string;
    }): Promise<{ success: boolean; data: Product[] }> => {
        const queryParams = new URLSearchParams();
        if (params?.category) queryParams.append('category', params.category);
        if (params?.status) queryParams.append('status', params.status);
        if (params?.search) queryParams.append('search', params.search);

        const query = queryParams.toString();
        return api.get(`/products${query ? `?${query}` : ''}`);
    },

    // Get single product
    getByCode: async (productCode: string): Promise<{ success: boolean; data: Product }> => {
        return api.get(`/products/${productCode}`);
    },

    // Create product
    create: async (product: CreateProductDto): Promise<{ success: boolean; data: Product }> => {
        return api.post('/products', product);
    },

    // Update product
    update: async (
        productCode: string,
        product: Partial<CreateProductDto>
    ): Promise<{ success: boolean; data: Product }> => {
        return api.put(`/products/${productCode}`, product);
    },

    // Delete product (soft delete)
    delete: async (productCode: string): Promise<{ success: boolean; message: string }> => {
        return api.delete(`/products/${productCode}`);
    },

    // Restore soft-deleted product
    restore: async (productCode: string): Promise<{ success: boolean; message: string }> => {
        return api.patch(`/products/${productCode}/restore`, {});
    },

    // Get all products including deleted ones (admin)
    getAllIncludingDeleted: async (params?: {
        category?: string;
        status?: string;
        search?: string;
    }): Promise<{ success: boolean; data: any[] }> => {
        const queryParams = new URLSearchParams();
        if (params?.category) queryParams.append('category', params.category);
        if (params?.status) queryParams.append('status', params.status);
        if (params?.search) queryParams.append('search', params.search);
        queryParams.append('includeDeleted', 'true');

        const query = queryParams.toString();
        return api.get(`/products?${query}`);
    },

    // Update stock
    updateStock: async (
        productCode: string,
        variantStock: VariantStock[]
    ): Promise<{ success: boolean; data: Product }> => {
        return api.patch(`/products/${productCode}/stock`, { variantStock });
    },

    // Get product images
    getImages: async (productCode: string): Promise<{ success: boolean; data: ProductImage[] }> => {
        return api.get(`/products/${productCode}/images`);
    },

    // Add image to product
    addImage: async (
        productCode: string,
        image: ProductImage
    ): Promise<{ success: boolean; data: ProductImage }> => {
        return api.post(`/products/${productCode}/images`, image);
    },

    // Delete image
    deleteImage: async (
        productCode: string,
        imageId: string
    ): Promise<{ success: boolean; message: string }> => {
        return api.delete(`/products/${productCode}/images/${imageId}`);
    },
};

export default productService;
