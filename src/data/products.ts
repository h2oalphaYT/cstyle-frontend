export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  subcategory?: string;
  sizes: string[];
  colors: string[];
  description: string;
  features: string[];
  material: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Premium Cotton T-Shirt',
    price: 29.99,
    originalPrice: 39.99,
    image: 'https://images.pexels.com/photos/769749/pexels-photo-769749.jpeg?w=400',
    images: [
      'https://images.pexels.com/photos/769749/pexels-photo-769749.jpeg?w=600',
      'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?w=600',
      'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?w=600'
    ],
    category: 'Men',
    subcategory: 'T-Shirts',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'White', 'Navy', 'Gray'],
    description: 'Experience ultimate comfort with our premium cotton t-shirt. Made from 100% organic cotton with a modern fit.',
    features: ['100% Organic Cotton', 'Pre-shrunk', 'Tagless comfort', 'Modern fit'],
    material: '100% Organic Cotton',
    rating: 4.8,
    reviews: 124,
    inStock: true,
    isNew: true,
    isFeatured: true,
    isTrending: true
  },
  {
    id: '2',
    name: 'Elegant Summer Dress',
    price: 79.99,
    originalPrice: 99.99,
    image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?w=400',
    images: [
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?w=600',
      'https://images.pexels.com/photos/1192601/pexels-photo-1192601.jpeg?w=600',
      'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?w=600'
    ],
    category: 'Women',
    subcategory: 'Dresses',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Floral Print', 'Solid Blue', 'Solid Red', 'Black'],
    description: 'Beautiful flowing summer dress perfect for any occasion. Lightweight and breathable fabric with elegant design.',
    features: ['Flowy design', 'Breathable fabric', 'Side pockets', 'Machine washable'],
    material: '95% Viscose, 5% Elastane',
    rating: 4.9,
    reviews: 89,
    inStock: true,
    isFeatured: true,
    isTrending: true
  },
  {
    id: '3',
    name: 'Classic Denim Jacket',
    price: 89.99,
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=400',
    images: [
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=600',
      'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?w=600',
      'https://images.pexels.com/photos/1236701/pexels-photo-1236701.jpeg?w=600'
    ],
    category: 'Men',
    subcategory: 'Jackets',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Light Blue', 'Dark Blue', 'Black'],
    description: 'Timeless denim jacket crafted from premium denim. A wardrobe essential that never goes out of style.',
    features: ['Premium denim', 'Classic fit', 'Multiple pockets', 'Durable construction'],
    material: '100% Cotton Denim',
    rating: 4.7,
    reviews: 156,
    inStock: true,
    isFeatured: true
  },
  {
    id: '4',
    name: 'Stylish Kids Hoodie',
    price: 39.99,
    image: 'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?w=400',
    images: [
      'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?w=600',
      'https://images.pexels.com/photos/1192601/pexels-photo-1192601.jpeg?w=600'
    ],
    category: 'Kids',
    subcategory: 'Hoodies',
    sizes: ['4T', '5T', '6T', '7T', '8T'],
    colors: ['Pink', 'Blue', 'Gray', 'Purple'],
    description: 'Comfortable and stylish hoodie for kids. Made with soft cotton blend for all-day comfort.',
    features: ['Soft cotton blend', 'Kangaroo pocket', 'Adjustable hood', 'Machine washable'],
    material: '80% Cotton, 20% Polyester',
    rating: 4.6,
    reviews: 43,
    inStock: true,
    isNew: true,
    isTrending: true
  },
  {
    id: '5',
    name: 'Leather Crossbody Bag',
    price: 129.99,
    originalPrice: 159.99,
    image: 'https://images.pexels.com/photos/1152994/pexels-photo-1152994.jpeg?w=400',
    images: [
      'https://images.pexels.com/photos/1152994/pexels-photo-1152994.jpeg?w=600',
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?w=600'
    ],
    category: 'Accessories',
    subcategory: 'Bags',
    sizes: ['One Size'],
    colors: ['Black', 'Brown', 'Tan'],
    description: 'Premium leather crossbody bag with adjustable strap. Perfect for daily use with elegant design.',
    features: ['Genuine leather', 'Adjustable strap', 'Multiple compartments', 'Gold hardware'],
    material: 'Genuine Leather',
    rating: 4.8,
    reviews: 67,
    inStock: true,
    isFeatured: true
  },
  {
    id: '6',
    name: 'Casual Blazer',
    price: 119.99,
    image: 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?w=400',
    images: [
      'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?w=600',
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=600'
    ],
    category: 'Women',
    subcategory: 'Blazers',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Navy', 'Black', 'Gray', 'Beige'],
    description: 'Versatile casual blazer perfect for work or weekend. Tailored fit with modern styling.',
    features: ['Tailored fit', 'Lined interior', 'Functional pockets', 'Easy care'],
    material: '70% Polyester, 25% Viscose, 5% Elastane',
    rating: 4.5,
    reviews: 92,
    inStock: true
  }
];

export const categories = [
  { name: 'Men', subcategories: ['T-Shirts', 'Shirts', 'Pants', 'Jackets', 'Shoes'] },
  { name: 'Women', subcategories: ['Dresses', 'Tops', 'Bottoms', 'Blazers', 'Shoes'] },
  { name: 'Kids', subcategories: ['T-Shirts', 'Hoodies', 'Pants', 'Dresses', 'Shoes'] },
  { name: 'Accessories', subcategories: ['Bags', 'Watches', 'Jewelry', 'Belts', 'Sunglasses'] }
];