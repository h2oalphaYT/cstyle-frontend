import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Table, Select, Row, Col, Tag, Badge, Tooltip, Input, Button, Progress, Statistic, Alert, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    InboxOutlined,
    SearchOutlined,
    WarningOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    AppstoreOutlined,
    BgColorsOutlined,
    EyeOutlined,
} from '@ant-design/icons';

const { Option } = Select;

interface ColorVariant {
    color: string;
    colorCode: string;
    colorName: string;
}

interface VariantStock {
    color: string;
    colorCode: string;
    size: string;
    quantity: number;
}

interface Product {
    id: string;
    name: string;
    category: string;
    image: string;
    totalStock: number;
    colors?: ColorVariant[];
    sizes?: string[];
    variantStock?: VariantStock[];
    lowStockThreshold: number;
}

interface SizeStockData {
    size: string;
    quantity: number;
    status: 'low' | 'medium' | 'good';
}

interface ColorStockData {
    color: string;
    colorCode: string;
    quantity: number;
    status: 'low' | 'medium' | 'good';
}

const InventoryPage = () => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    // Mock inventory data
    const products: Product[] = [
        {
            id: 'PRD001',
            name: 'Classic Black Shirt',
            category: 'Men',
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100',
            totalStock: 145,
            lowStockThreshold: 20,
            colors: [
                { color: 'Black', colorCode: '#000000', colorName: 'Black' },
                { color: 'White', colorCode: '#FFFFFF', colorName: 'White' },
                { color: 'Navy Blue', colorCode: '#001F3F', colorName: 'Navy Blue' },
            ],
            sizes: ['S', 'M', 'L', 'XL'],
            variantStock: [
                { color: 'Black', colorCode: '#000000', size: 'S', quantity: 25 },
                { color: 'Black', colorCode: '#000000', size: 'M', quantity: 35 },
                { color: 'Black', colorCode: '#000000', size: 'L', quantity: 28 },
                { color: 'Black', colorCode: '#000000', size: 'XL', quantity: 15 },
                { color: 'White', colorCode: '#FFFFFF', size: 'S', quantity: 8 },
                { color: 'White', colorCode: '#FFFFFF', size: 'M', quantity: 12 },
                { color: 'White', colorCode: '#FFFFFF', size: 'L', quantity: 10 },
                { color: 'White', colorCode: '#FFFFFF', size: 'XL', quantity: 5 },
                { color: 'Navy Blue', colorCode: '#001F3F', size: 'M', quantity: 4 },
                { color: 'Navy Blue', colorCode: '#001F3F', size: 'L', quantity: 3 },
            ],
        },
        {
            id: 'PRD002',
            name: 'Summer Dress',
            category: 'Women',
            image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=100',
            totalStock: 82,
            lowStockThreshold: 15,
            colors: [
                { color: 'Floral Print', colorCode: '#FFB6C1', colorName: 'Floral Print' },
                { color: 'Solid Blue', colorCode: '#0074D9', colorName: 'Solid Blue' },
            ],
            sizes: ['XS', 'S', 'M', 'L'],
            variantStock: [
                { color: 'Floral Print', colorCode: '#FFB6C1', size: 'XS', quantity: 12 },
                { color: 'Floral Print', colorCode: '#FFB6C1', size: 'S', quantity: 18 },
                { color: 'Floral Print', colorCode: '#FFB6C1', size: 'M', quantity: 22 },
                { color: 'Floral Print', colorCode: '#FFB6C1', size: 'L', quantity: 15 },
                { color: 'Solid Blue', colorCode: '#0074D9', size: 'S', quantity: 8 },
                { color: 'Solid Blue', colorCode: '#0074D9', size: 'M', quantity: 7 },
            ],
        },
        {
            id: 'PRD003',
            name: 'Denim Jeans',
            category: 'Men',
            image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=100',
            totalStock: 67,
            lowStockThreshold: 25,
            colors: [
                { color: 'Light Blue', colorCode: '#7FDBFF', colorName: 'Light Blue' },
                { color: 'Dark Blue', colorCode: '#001F3F', colorName: 'Dark Blue' },
            ],
            sizes: ['28', '30', '32', '34', '36'],
            variantStock: [
                { color: 'Light Blue', colorCode: '#7FDBFF', size: '28', quantity: 8 },
                { color: 'Light Blue', colorCode: '#7FDBFF', size: '30', quantity: 12 },
                { color: 'Light Blue', colorCode: '#7FDBFF', size: '32', quantity: 15 },
                { color: 'Light Blue', colorCode: '#7FDBFF', size: '34', quantity: 10 },
                { color: 'Dark Blue', colorCode: '#001F3F', size: '30', quantity: 9 },
                { color: 'Dark Blue', colorCode: '#001F3F', size: '32', quantity: 13 },
            ],
        },
        {
            id: 'PRD004',
            name: 'Kids T-Shirt',
            category: 'Kids',
            image: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=100',
            totalStock: 189,
            lowStockThreshold: 30,
            colors: [
                { color: 'Red', colorCode: '#FF4136', colorName: 'Red' },
                { color: 'Yellow', colorCode: '#FFDC00', colorName: 'Yellow' },
                { color: 'Green', colorCode: '#2ECC40', colorName: 'Green' },
            ],
            sizes: ['XS', 'S', 'M'],
            variantStock: [
                { color: 'Red', colorCode: '#FF4136', size: 'XS', quantity: 35 },
                { color: 'Red', colorCode: '#FF4136', size: 'S', quantity: 42 },
                { color: 'Red', colorCode: '#FF4136', size: 'M', quantity: 28 },
                { color: 'Yellow', colorCode: '#FFDC00', size: 'XS', quantity: 22 },
                { color: 'Yellow', colorCode: '#FFDC00', size: 'S', quantity: 25 },
                { color: 'Green', colorCode: '#2ECC40', size: 'S', quantity: 20 },
                { color: 'Green', colorCode: '#2ECC40', size: 'M', quantity: 17 },
            ],
        },
        {
            id: 'PRD005',
            name: 'Leather Jacket',
            category: 'Men',
            image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=100',
            totalStock: 28,
            lowStockThreshold: 10,
            colors: [
                { color: 'Black', colorCode: '#000000', colorName: 'Black' },
                { color: 'Brown', colorCode: '#8B4513', colorName: 'Brown' },
            ],
            sizes: ['M', 'L', 'XL'],
            variantStock: [
                { color: 'Black', colorCode: '#000000', size: 'M', quantity: 8 },
                { color: 'Black', colorCode: '#000000', size: 'L', quantity: 12 },
                { color: 'Black', colorCode: '#000000', size: 'XL', quantity: 5 },
                { color: 'Brown', colorCode: '#8B4513', size: 'L', quantity: 3 },
            ],
        },
    ];

    const getStockStatus = (stock: number, threshold: number) => {
        if (stock <= threshold) return { status: 'low', color: 'red', icon: <WarningOutlined /> };
        if (stock <= threshold * 2) return { status: 'medium', color: 'orange', icon: <ExclamationCircleOutlined /> };
        return { status: 'good', color: 'green', icon: <CheckCircleOutlined /> };
    };

    const calculateSizeWiseStock = (product: Product): SizeStockData[] => {
        if (!product.variantStock || !product.sizes) return [];

        const sizeMap = new Map<string, number>();
        product.sizes.forEach(size => sizeMap.set(size, 0));

        product.variantStock.forEach(variant => {
            const current = sizeMap.get(variant.size) || 0;
            sizeMap.set(variant.size, current + variant.quantity);
        });

        return Array.from(sizeMap.entries()).map(([size, quantity]) => {
            let status: 'low' | 'medium' | 'good' = 'good';
            if (quantity <= 10) status = 'low';
            else if (quantity <= 25) status = 'medium';
            return { size, quantity, status };
        });
    };

    const calculateColorWiseStock = (product: Product): ColorStockData[] => {
        if (!product.variantStock || !product.colors) return [];

        const colorMap = new Map<string, { quantity: number; colorCode: string }>();
        product.colors.forEach(color =>
            colorMap.set(color.color, { quantity: 0, colorCode: color.colorCode })
        );

        product.variantStock.forEach(variant => {
            const current = colorMap.get(variant.color);
            if (current) {
                colorMap.set(variant.color, {
                    quantity: current.quantity + variant.quantity,
                    colorCode: variant.colorCode
                });
            }
        });

        return Array.from(colorMap.entries()).map(([color, data]) => {
            let status: 'low' | 'medium' | 'good' = 'good';
            if (data.quantity <= 10) status = 'low';
            else if (data.quantity <= 30) status = 'medium';
            return { color, colorCode: data.colorCode, quantity: data.quantity, status };
        });
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchText.toLowerCase()) ||
            product.id.toLowerCase().includes(searchText.toLowerCase());
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const lowStockProducts = products.filter(p => p.totalStock <= p.lowStockThreshold);

    const columns: ColumnsType<Product> = [
        {
            title: 'Product',
            key: 'product',
            render: (_, record) => (
                <div className="flex items-center space-x-3">
                    <img src={record.image} alt={record.name} className="w-12 h-12 object-cover rounded-lg" />
                    <div>
                        <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-brand-black'}`}>
                            {record.name}
                        </div>
                        <div className="text-xs text-gray-500">{record.id}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (category: string) => (
                <Tag color={category === 'Men' ? 'blue' : category === 'Women' ? 'pink' : 'green'}>
                    {category}
                </Tag>
            ),
        },
        {
            title: 'Total Stock',
            dataIndex: 'totalStock',
            key: 'totalStock',
            sorter: (a, b) => a.totalStock - b.totalStock,
            render: (stock: number, record: Product) => {
                const statusInfo = getStockStatus(stock, record.lowStockThreshold);
                return (
                    <div className="flex items-center space-x-2">
                        <span className={`font-bold text-${statusInfo.color}-500`}>{stock}</span>
                        <Tooltip title={`${statusInfo.status} stock`}>
                            {statusInfo.icon}
                        </Tooltip>
                    </div>
                );
            },
        },
        {
            title: 'Colors',
            dataIndex: 'colors',
            key: 'colors',
            render: (colors?: ColorVariant[]) => (
                <div className="flex gap-1">
                    {colors?.slice(0, 3).map((color, idx) => (
                        <Tooltip key={idx} title={color.colorName}>
                            <div
                                className="w-6 h-6 rounded-full border-2 border-gray-300"
                                style={{ backgroundColor: color.colorCode }}
                            />
                        </Tooltip>
                    ))}
                    {colors && colors.length > 3 && (
                        <Badge count={`+${colors.length - 3}`} />
                    )}
                </div>
            ),
        },
        {
            title: 'Sizes',
            dataIndex: 'sizes',
            key: 'sizes',
            render: (sizes?: string[]) => (
                <div className="flex gap-1 flex-wrap">
                    {sizes?.map((size, idx) => (
                        <Tag key={idx} className="text-xs">{size}</Tag>
                    ))}
                </div>
            ),
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => {
                const statusInfo = getStockStatus(record.totalStock, record.lowStockThreshold);
                return (
                    <Tag color={statusInfo.color}>
                        {statusInfo.status.toUpperCase()} STOCK
                    </Tag>
                );
            },
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    className="bg-brand-gold hover:bg-brand-gold-dark border-0"
                    onClick={() => {
                        setSelectedProduct(record);
                        setIsModalOpen(true);
                    }}
                >
                    View Details
                </Button>
            ),
        },
    ];

    const sizeColumns: ColumnsType<SizeStockData> = [
        {
            title: 'Size',
            dataIndex: 'size',
            key: 'size',
            render: (size: string) => (
                <Tag className="text-sm font-bold px-3 py-1">{size}</Tag>
            ),
        },
        {
            title: 'Available Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity: number, record: SizeStockData) => (
                <div className="flex items-center space-x-3">
                    <span className={`font-bold text-lg ${record.status === 'low' ? 'text-red-500' :
                        record.status === 'medium' ? 'text-orange-500' :
                            'text-green-500'
                        }`}>
                        {quantity}
                    </span>
                    <Progress
                        percent={(quantity / 50) * 100}
                        showInfo={false}
                        strokeColor={
                            record.status === 'low' ? '#ff4d4f' :
                                record.status === 'medium' ? '#faad14' :
                                    '#52c41a'
                        }
                        className="flex-1"
                    />
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'low' ? 'red' : status === 'medium' ? 'orange' : 'green'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
    ];

    const colorColumns: ColumnsType<ColorStockData> = [
        {
            title: 'Color',
            dataIndex: 'color',
            key: 'color',
            render: (color: string, record: ColorStockData) => (
                <div className="flex items-center space-x-3">
                    <div
                        className="w-8 h-8 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: record.colorCode }}
                    />
                    <span className="font-semibold">{color}</span>
                </div>
            ),
        },
        {
            title: 'Available Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity: number, record: ColorStockData) => (
                <div className="flex items-center space-x-3">
                    <span className={`font-bold text-lg ${record.status === 'low' ? 'text-red-500' :
                        record.status === 'medium' ? 'text-orange-500' :
                            'text-green-500'
                        }`}>
                        {quantity}
                    </span>
                    <Progress
                        percent={(quantity / 100) * 100}
                        showInfo={false}
                        strokeColor={
                            record.status === 'low' ? '#ff4d4f' :
                                record.status === 'medium' ? '#faad14' :
                                    '#52c41a'
                        }
                        className="flex-1"
                    />
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'low' ? 'red' : status === 'medium' ? 'orange' : 'green'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
    ];

    // Detailed variant stock columns
    const variantColumns: ColumnsType<VariantStock> = [
        {
            title: 'Color',
            key: 'color',
            render: (_, record) => (
                <div className="flex items-center space-x-2">
                    <div
                        className="w-6 h-6 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: record.colorCode }}
                    />
                    <span>{record.color}</span>
                </div>
            ),
        },
        {
            title: 'Size',
            dataIndex: 'size',
            key: 'size',
            render: (size: string) => <Tag>{size}</Tag>,
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity: number) => (
                <Badge
                    count={quantity}
                    style={{
                        backgroundColor: quantity <= 5 ? '#ff4d4f' : quantity <= 15 ? '#faad14' : '#52c41a',
                        fontSize: '14px',
                        padding: '0 10px',
                    }}
                />
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-between items-center"
            >
                <div>
                    <h1 className={`text-3xl font-bold font-poppins ${isDarkMode ? 'text-white' : 'text-brand-black'}`}>
                        Stock / Inventory
                    </h1>
                    <p className="text-gray-500 mt-1">Monitor and manage your product inventory</p>
                </div>
            </motion.div>

            {/* Low Stock Alert */}
            {lowStockProducts.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <Alert
                        message={`Low Stock Warning: ${lowStockProducts.length} product(s) need restocking`}
                        description={`Products: ${lowStockProducts.map(p => p.name).join(', ')}`}
                        type="warning"
                        icon={<WarningOutlined />}
                        showIcon
                        closable
                    />
                </motion.div>
            )}

            {/* Statistics Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                        <Statistic
                            title="Total Products"
                            value={products.length}
                            prefix={<AppstoreOutlined className="text-brand-gold" />}
                            valueStyle={{ color: '#D4AF37' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                        <Statistic
                            title="Total Stock Items"
                            value={products.reduce((sum, p) => sum + p.totalStock, 0)}
                            prefix={<InboxOutlined className="text-blue-500" />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                        <Statistic
                            title="Low Stock Products"
                            value={lowStockProducts.length}
                            prefix={<WarningOutlined className="text-red-500" />}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                        <Statistic
                            title="Categories"
                            value={new Set(products.map(p => p.category)).size}
                            prefix={<BgColorsOutlined className="text-green-500" />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <Input
                            placeholder="Search by product name or ID..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            size="large"
                            allowClear
                        />
                    </Col>
                    <Col xs={24} md={6}>
                        <Select
                            placeholder="Filter by category"
                            style={{ width: '100%' }}
                            size="large"
                            allowClear
                            value={categoryFilter || undefined}
                            onChange={(value) => setCategoryFilter(value || '')}
                        >
                            <Option value="Men">Men</Option>
                            <Option value="Women">Women</Option>
                            <Option value="Kids">Kids</Option>
                        </Select>
                    </Col>
                    <Col xs={24} md={6}>
                        <Button
                            type="default"
                            size="large"
                            block
                            onClick={() => {
                                setSearchText('');
                                setCategoryFilter('');
                                setSelectedProduct(null);
                            }}
                        >
                            Reset Filters
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Product List */}
            <Card
                className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl`}
                title={
                    <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-brand-black'}`}>
                        All Products Inventory
                    </span>
                }
            >
                <Table
                    columns={columns}
                    dataSource={filteredProducts}
                    pagination={{ pageSize: 10 }}
                    rowClassName={(record) =>
                        record.totalStock <= record.lowStockThreshold
                            ? 'bg-red-50 dark:bg-red-900/10'
                            : ''
                    }
                />
            </Card>

            {/* Detailed View Modal */}
            <Modal
                title={
                    selectedProduct ? (
                        <div className="flex items-center space-x-4">
                            <img
                                src={selectedProduct.image}
                                alt={selectedProduct.name}
                                className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div>
                                <h2 className="text-xl font-bold">{selectedProduct.name}</h2>
                                <p className="text-sm text-gray-500">{selectedProduct.id}</p>
                            </div>
                        </div>
                    ) : 'Product Details'
                }
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setSelectedProduct(null);
                }}
                width={1200}
                footer={[
                    <Button key="close" type="primary" onClick={() => {
                        setIsModalOpen(false);
                        setSelectedProduct(null);
                    }}>
                        Close
                    </Button>
                ]}
                className="top-5"
            >
                {selectedProduct && (
                    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                        {/* Product Info Stats */}
                        <Row gutter={[16, 16]}>
                            <Col xs={24} md={8}>
                                <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'}`}>
                                    <Statistic
                                        title="Total Available Stock"
                                        value={selectedProduct.totalStock}
                                        valueStyle={{
                                            color:
                                                selectedProduct.totalStock <= selectedProduct.lowStockThreshold
                                                    ? '#ff4d4f'
                                                    : '#52c41a',
                                        }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} md={8}>
                                <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'}`}>
                                    <Statistic
                                        title="Total Color Variants"
                                        value={selectedProduct.colors?.length || 0}
                                        prefix={<BgColorsOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} md={8}>
                                <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'}`}>
                                    <Statistic
                                        title="Total Size Options"
                                        value={selectedProduct.sizes?.length || 0}
                                        prefix={<AppstoreOutlined />}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        {/* Size-wise Stock */}
                        <Card
                            className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
                            title={
                                <div className="flex items-center space-x-2">
                                    <AppstoreOutlined className="text-brand-gold text-xl" />
                                    <span className="text-base font-semibold">Size-wise Stock Distribution</span>
                                </div>
                            }
                            size="small"
                        >
                            <Table
                                columns={sizeColumns}
                                dataSource={calculateSizeWiseStock(selectedProduct)}
                                pagination={false}
                                rowKey="size"
                                size="small"
                            />
                        </Card>

                        {/* Color-wise Stock */}
                        <Card
                            className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
                            title={
                                <div className="flex items-center space-x-2">
                                    <BgColorsOutlined className="text-brand-gold text-xl" />
                                    <span className="text-base font-semibold">Color-wise Stock Distribution</span>
                                </div>
                            }
                            size="small"
                        >
                            <Table
                                columns={colorColumns}
                                dataSource={calculateColorWiseStock(selectedProduct)}
                                pagination={false}
                                rowKey="color"
                                size="small"
                            />
                        </Card>

                        {/* Detailed Variant Stock Matrix */}
                        <Card
                            className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
                            title={<span className="text-base font-semibold">Complete Stock Matrix (Color × Size)</span>}
                            size="small"
                        >
                            <Table
                                columns={variantColumns}
                                dataSource={selectedProduct.variantStock || []}
                                pagination={false}
                                rowKey={(record) => `${record.color}-${record.size}`}
                                size="small"
                            />
                        </Card>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default InventoryPage;
