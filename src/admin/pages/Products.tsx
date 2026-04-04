import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Table, Button, Tag, Space, Input, Select, Modal, Form, InputNumber, Upload, message, Tabs, Card, Badge, Tooltip, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    UploadOutlined,
    BgColorsOutlined,
    AppstoreOutlined,
    UndoOutlined,
} from '@ant-design/icons';
import productService from '../../services/productService';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

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
    key: string;
    id: string;
    image: string;
    name: string;
    category: string;
    price: number;
    discount: number;
    stock: number;
    status: 'active' | 'inactive';
    bDelete?: boolean;
    description?: string;
    colors?: ColorVariant[];
    sizes?: string[];
    variantStock?: VariantStock[];
}

// Predefined color palette
const COLOR_PALETTE = [
    { name: 'Black', code: '#000000' },
    { name: 'White', code: '#FFFFFF' },
    { name: 'Navy Blue', code: '#001F3F' },
    { name: 'Royal Blue', code: '#0074D9' },
    { name: 'Sky Blue', code: '#7FDBFF' },
    { name: 'Red', code: '#FF4136' },
    { name: 'Maroon', code: '#85144B' },
    { name: 'Pink', code: '#F012BE' },
    { name: 'Green', code: '#2ECC40' },
    { name: 'Olive', code: '#3D9970' },
    { name: 'Lime', code: '#01FF70' },
    { name: 'Yellow', code: '#FFDC00' },
    { name: 'Orange', code: '#FF851B' },
    { name: 'Brown', code: '#8B4513' },
    { name: 'Beige', code: '#F5F5DC' },
    { name: 'Gray', code: '#AAAAAA' },
    { name: 'Silver', code: '#DDDDDD' },
    { name: 'Purple', code: '#B10DC9' },
];

// Standard sizes
const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

const ProductsPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [editingProductId, setEditingProductId] = useState<string | null>(null); // null = ADD mode
    const [form] = Form.useForm();
    const [selectedColors, setSelectedColors] = useState<ColorVariant[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [variantStocks, setVariantStocks] = useState<VariantStock[]>([]);
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const isDarkMode = document.documentElement.classList.contains('dark');

    // Load products from database
    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            // Load ALL products including soft-deleted ones for admin view
            const response = await productService.getAllIncludingDeleted();
            if (response.success && response.data) {
                const transformedProducts = response.data.map((product: any) => ({
                    key: product.productCode,
                    id: product.productCode,
                    image: product.primaryImage || 'https://via.placeholder.com/100',
                    name: product.name,
                    category: product.category,
                    price: product.price,
                    discount: product.discount || 0,
                    stock: product.totalStock || 0,
                    status: product.status || 'inactive',
                    bDelete: product.bDelete || false,
                    colors: product.colors || [],
                    sizes: product.sizes || [],
                    variantStock: product.variantStock || [],
                }));
                setProducts(transformedProducts);
            }
        } catch (error) {
            console.error('Failed to load products:', error);
            message.error('Failed to load products from database');
        } finally {
            setLoading(false);
        }
    };

    const columns: ColumnsType<Product> = [
        {
            title: 'Image',
            dataIndex: 'image',
            key: 'image',
            width: 80,
            render: (image: string) => (
                <img src={image} alt="Product" className="w-12 h-12 object-cover rounded-lg" />
            ),
        },
        {
            title: 'Product ID',
            dataIndex: 'id',
            key: 'id',
            width: 100,
        },
        {
            title: 'Product Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            filters: [
                { text: 'Men', value: 'Men' },
                { text: 'Women', value: 'Women' },
                { text: 'Kids', value: 'Kids' },
            ],
            onFilter: (value, record) => record.category === value,
            render: (category: string) => (
                <Tag color={category === 'Men' ? 'blue' : category === 'Women' ? 'pink' : 'green'}>{category}</Tag>
            ),
        },
        {
            title: 'Price (LKR)',
            dataIndex: 'price',
            key: 'price',
            sorter: (a, b) => a.price - b.price,
            render: (price: number) => `Rs ${price.toLocaleString()}`,
        },
        {
            title: 'Discount',
            dataIndex: 'discount',
            key: 'discount',
            render: (discount: number) => (discount > 0 ? `${discount}%` : '-'),
        },
        {
            title: 'Colors',
            dataIndex: 'colors',
            key: 'colors',
            width: 120,
            render: (colors?: ColorVariant[]) => (
                <div className="flex gap-1 flex-wrap">
                    {colors && colors.length > 0 ? (
                        colors.slice(0, 4).map((color, idx) => (
                            <Tooltip key={idx} title={color.colorName}>
                                <div
                                    className="w-6 h-6 rounded-full border-2 border-gray-300"
                                    style={{ backgroundColor: color.colorCode }}
                                />
                            </Tooltip>
                        ))
                    ) : (
                        <span className="text-gray-400 text-xs">No colors</span>
                    )}
                    {colors && colors.length > 4 && (
                        <Badge count={`+${colors.length - 4}`} className="ml-1" />
                    )}
                </div>
            ),
        },
        {
            title: 'Sizes',
            dataIndex: 'sizes',
            key: 'sizes',
            width: 120,
            render: (sizes?: string[]) => (
                <div className="flex gap-1 flex-wrap">
                    {sizes && sizes.length > 0 ? (
                        sizes.map((size, idx) => (
                            <Tag key={idx} className="text-xs">{size}</Tag>
                        ))
                    ) : (
                        <span className="text-gray-400 text-xs">No sizes</span>
                    )}
                </div>
            ),
        },
        {
            title: 'Total Stock',
            dataIndex: 'stock',
            key: 'stock',
            sorter: (a, b) => a.stock - b.stock,
            render: (stock: number, record: Product) => {
                const totalVariantStock = record.variantStock?.reduce((sum, v) => sum + v.quantity, 0) || 0;
                const displayStock = totalVariantStock > 0 ? totalVariantStock : stock;
                return (
                    <span className={displayStock < 20 ? 'text-red-500 font-bold' : ''}>
                        {displayStock}
                    </span>
                );
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            filters: [
                { text: 'Active', value: 'active' },
                { text: 'Inactive', value: 'inactive' },
                { text: 'Deleted', value: 'deleted' },
            ],
            onFilter: (value, record) => {
                if (value === 'deleted') return !!record.bDelete;
                return record.status === value && !record.bDelete;
            },
            render: (status: string, record: Product) => {
                if (record.bDelete) {
                    return <Tag color="red" className="font-bold">DELETED</Tag>;
                }
                return <Tag color={status === 'active' ? 'success' : 'default'}>{status.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 160,
            render: (_, record) => {
                if (record.bDelete) {
                    // Deleted product — show Restore button only
                    return (
                        <Tooltip title="Restore Product">
                            <Button
                                type="primary"
                                icon={<UndoOutlined />}
                                size="small"
                                className="bg-green-500 hover:bg-green-600 border-0 text-white font-medium"
                                onClick={() => handleRestore(record.id)}
                            >
                                Restore
                            </Button>
                        </Tooltip>
                    );
                }
                // Active product — show full action set
                return (
                    <Space size="small">
                        <Tooltip title="Manage Stock">
                            <Button
                                type="text"
                                icon={<AppstoreOutlined />}
                                className="text-green-500 hover:text-green-600"
                                onClick={() => handleManageStock(record)}
                            />
                        </Tooltip>
                        <Tooltip title="View">
                            <Button
                                type="text"
                                icon={<EyeOutlined />}
                                className="text-blue-500 hover:text-blue-600"
                            />
                        </Tooltip>
                        <Tooltip title="Edit">
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                className="text-brand-gold hover:text-brand-gold-dark"
                                onClick={() => handleEdit(record)}
                            />
                        </Tooltip>
                        <Tooltip title="Delete">
                            <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                className="text-red-500 hover:text-red-600"
                                onClick={() => handleDelete(record.id)}
                            />
                        </Tooltip>
                    </Space>
                );
            },
        },
    ];

    const handleAddProduct = () => {
        setEditingProductId(null);   // ← ADD mode
        setIsModalOpen(true);
        form.resetFields();
        setSelectedColors([]);
        setSelectedSizes([]);
        setVariantStocks([]);
    };

    const handleEdit = (record: Product) => {
        setEditingProductId(record.id);   // ← EDIT mode
        setIsModalOpen(true);
        // Map the record fields to the form fields
        form.setFieldsValue({
            name: record.name,
            category: record.category,
            status: record.status,
            price: record.price,
            discount: record.discount,
            description: record.description || '',
            image: record.image,
        });
        setSelectedColors(record.colors || []);
        setSelectedSizes(record.sizes || []);
        setVariantStocks(record.variantStock || []);
    };

    const handleManageStock = (record: Product) => {
        setSelectedProduct(record);
        setSelectedColors(record.colors || []);
        setSelectedSizes(record.sizes || []);
        setVariantStocks(record.variantStock || []);
        setIsStockModalOpen(true);
    };

    const handleColorToggle = (color: typeof COLOR_PALETTE[0]) => {
        const colorVariant: ColorVariant = {
            color: color.name,
            colorCode: color.code,
            colorName: color.name,
        };

        const exists = selectedColors.find(c => c.colorCode === color.code);
        if (exists) {
            setSelectedColors(selectedColors.filter(c => c.colorCode !== color.code));
            // Remove stock entries for this color
            setVariantStocks(variantStocks.filter(v => v.colorCode !== color.code));
        } else {
            setSelectedColors([...selectedColors, colorVariant]);
        }
    };

    const handleSizeToggle = (size: string) => {
        if (selectedSizes.includes(size)) {
            setSelectedSizes(selectedSizes.filter(s => s !== size));
            // Remove stock entries for this size
            setVariantStocks(variantStocks.filter(v => v.size !== size));
        } else {
            setSelectedSizes([...selectedSizes, size]);
        }
    };

    const handleStockChange = (color: string, colorCode: string, size: string, quantity: number) => {
        const existingIndex = variantStocks.findIndex(
            v => v.color === color && v.size === size
        );

        if (existingIndex >= 0) {
            const newStocks = [...variantStocks];
            newStocks[existingIndex].quantity = quantity;
            setVariantStocks(newStocks);
        } else {
            setVariantStocks([...variantStocks, { color, colorCode, size, quantity }]);
        }
    };

    const getStockQuantity = (color: string, size: string): number => {
        const stock = variantStocks.find(v => v.color === color && v.size === size);
        return stock ? stock.quantity : 0;
    };

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: 'Delete this product?',
            content: 'The product will be hidden from the store but can be restored later.',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    const response = await productService.delete(id);
                    if (response.success) {
                        message.success('Product deleted — it will still appear here as DELETED and can be restored.');
                        await loadProducts();
                    } else {
                        message.error('Failed to delete product');
                    }
                } catch (error: any) {
                    message.error(error?.message || 'Failed to delete product');
                }
            },
        });
    };

    const handleRestore = (id: string) => {
        Modal.confirm({
            title: 'Restore this product?',
            content: 'The product will be set back to Active and will appear in the store again.',
            okText: 'Restore',
            icon: <UndoOutlined className="text-green-500" />,
            onOk: async () => {
                try {
                    const response = await productService.restore(id);
                    if (response.success) {
                        message.success('Product restored successfully!');
                        await loadProducts();
                    } else {
                        message.error('Failed to restore product');
                    }
                } catch (error: any) {
                    message.error(error?.message || 'Failed to restore product');
                }
            },
        });
    };

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);

            const isEditMode = editingProductId !== null;

            // Common payload for both create and update
            const productData = {
                name: values.name,
                description: values.description || ' ',   // backend requires non-empty
                category: values.category,
                price: values.price,
                discount: values.discount || 0,
                primaryImage: values.image || 'https://via.placeholder.com/400',
                colors: selectedColors.map(c => ({
                    color: c.color,
                    colorCode: c.colorCode,
                    colorName: c.colorName
                })),
                sizes: selectedSizes,
                variantStock: variantStocks.map(v => ({
                    color: v.color,
                    colorCode: v.colorCode,
                    size: v.size,
                    quantity: v.quantity
                })),
                status: values.status || 'active',
            } as any;

            let response: any;

            if (isEditMode) {
                // ─── UPDATE existing product ───
                // productCode goes in the URL: PUT /api/products/:productCode
                // Also include it in the body as a reference
                const updatePayload = {
                    ...productData,
                    productCode: editingProductId,   // explicit identifier in body
                };
                console.log(`📤 Updating product: PUT /api/products/${editingProductId}`, updatePayload);
                response = await productService.update(editingProductId!, updatePayload);
            } else {
                // ─── CREATE new product ───
                const productCode = `PRD${Date.now().toString().slice(-6)}`;
                response = await productService.create({ ...productData, productCode });
            }

            if (response.success) {
                message.success(isEditMode ? 'Product updated successfully!' : 'Product added successfully!');
                setIsModalOpen(false);
                setEditingProductId(null);
                form.resetFields();
                setSelectedColors([]);
                setSelectedSizes([]);
                setVariantStocks([]);
                await loadProducts();
            } else {
                message.error('Failed to save product');
            }
        } catch (error: any) {
            console.error('Error saving product:', error);
            message.error(error?.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveStock = () => {
        console.log('Updated stock:', {
            productId: selectedProduct?.id,
            variantStock: variantStocks,
        });
        message.success('Stock updated successfully!');
        setIsStockModalOpen(false);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`text-3xl font-bold font-poppins ${isDarkMode ? 'text-white' : 'text-brand-black'}`}
                >
                    Products Management
                </motion.h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={handleAddProduct}
                    className="bg-brand-gold hover:bg-brand-gold-dark border-0 text-brand-black font-medium"
                >
                    Add New Product
                </Button>
            </div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } border rounded-xl p-4 shadow-lg`}
            >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                        placeholder="Search products..."
                        prefix={<SearchOutlined />}
                        size="large"
                        className={isDarkMode ? 'bg-gray-900 border-gray-600' : ''}
                    />
                    <Select placeholder="Category" size="large" className="w-full">
                        <Option value="">All Categories</Option>
                        <Option value="men">Men</Option>
                        <Option value="women">Women</Option>
                        <Option value="kids">Kids</Option>
                    </Select>
                    <Select placeholder="Status" size="large" className="w-full">
                        <Option value="">All Status</Option>
                        <Option value="active">Active</Option>
                        <Option value="inactive">Inactive</Option>
                    </Select>
                    <Select placeholder="Sort By" size="large" className="w-full">
                        <Option value="name">Name</Option>
                        <Option value="price">Price</Option>
                        <Option value="stock">Stock</Option>
                    </Select>
                </div>
            </motion.div>

            {/* Products Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Table
                    columns={columns}
                    dataSource={products}
                    loading={loading}
                    rowClassName={(record: Product) =>
                        record.bDelete
                            ? 'opacity-50 bg-red-50 dark:bg-red-950/20 line-through-cells'
                            : ''
                    }
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} products`,
                    }}
                    className={`${isDarkMode ? 'dark-table' : ''}`}
                    scroll={{ x: 1400 }}
                />
            </motion.div>

            {/* Stock Management Modal */}
            <Modal
                title={
                    <div className="flex items-center space-x-2">
                        <AppstoreOutlined className="text-brand-gold" />
                        <span className="text-xl font-bold">Manage Stock - {selectedProduct?.name}</span>
                    </div>
                }
                open={isStockModalOpen}
                onCancel={() => setIsStockModalOpen(false)}
                width={900}
                footer={[
                    <Button key="cancel" size="large" onClick={() => setIsStockModalOpen(false)}>
                        Cancel
                    </Button>,
                    <Button
                        key="save"
                        type="primary"
                        size="large"
                        onClick={handleSaveStock}
                        className="bg-brand-gold hover:bg-brand-gold-dark border-0 text-brand-black font-medium"
                    >
                        Save Stock Changes
                    </Button>,
                ]}
            >
                <div className="mt-6">
                    {selectedColors.length > 0 && selectedSizes.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 dark:bg-gray-800">
                                        <th className="border p-3 text-left font-semibold">Color / Size</th>
                                        {selectedSizes.map(size => (
                                            <th key={size} className="border p-3 text-center font-semibold min-w-[100px]">
                                                {size}
                                            </th>
                                        ))}
                                        <th className="border p-3 text-center font-semibold bg-blue-50 dark:bg-blue-900">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedColors.map((color) => {
                                        const rowTotal = selectedSizes.reduce(
                                            (sum, size) => sum + getStockQuantity(color.colorName, size),
                                            0
                                        );
                                        return (
                                            <tr key={color.colorCode} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="border p-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div
                                                            className="w-8 h-8 rounded-full border-2 border-gray-300"
                                                            style={{ backgroundColor: color.colorCode }}
                                                        />
                                                        <span className="font-medium">{color.colorName}</span>
                                                    </div>
                                                </td>
                                                {selectedSizes.map(size => (
                                                    <td key={`${color.colorCode}-${size}`} className="border p-2 text-center">
                                                        <InputNumber
                                                            min={0}
                                                            value={getStockQuantity(color.colorName, size)}
                                                            onChange={(value) =>
                                                                handleStockChange(color.colorName, color.colorCode, size, value || 0)
                                                            }
                                                            className="w-full"
                                                            size="large"
                                                        />
                                                    </td>
                                                ))}
                                                <td className="border p-3 text-center font-bold bg-blue-50 dark:bg-blue-900">
                                                    {rowTotal}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    <tr className="bg-blue-50 dark:bg-blue-900 font-bold">
                                        <td className="border p-3">Total</td>
                                        {selectedSizes.map(size => {
                                            const columnTotal = selectedColors.reduce(
                                                (sum, color) => sum + getStockQuantity(color.colorName, size),
                                                0
                                            );
                                            return (
                                                <td key={`total-${size}`} className="border p-3 text-center">
                                                    {columnTotal}
                                                </td>
                                            );
                                        })}
                                        <td className="border p-3 text-center text-lg">
                                            {variantStocks.reduce((sum, v) => sum + v.quantity, 0)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <AppstoreOutlined className="text-4xl mb-4" />
                            <p>Please add colors and sizes to manage stock</p>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Add/Edit Product Modal */}
            <Modal
                title={
                    <span className="text-xl font-bold">
                        {editingProductId ? `Edit Product — ${editingProductId}` : 'Add New Product'}
                    </span>
                }
                open={isModalOpen}
                onCancel={() => {
                    if (!loading) {
                        setIsModalOpen(false);
                        setEditingProductId(null);
                        form.resetFields();
                    }
                }}
                footer={null}
                width={900}
                closable={!loading}
            >
                <Spin spinning={loading} tip="Saving product...">
                    <Tabs defaultActiveKey="1" className="mt-4">
                        <TabPane tab="Basic Info" key="1">
                            <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-6">
                                <Form.Item
                                    name="name"
                                    label="Product Name"
                                    rules={[{ required: true, message: 'Please enter product name' }]}
                                >
                                    <Input size="large" placeholder="e.g., Classic Black Shirt" />
                                </Form.Item>

                                <div className="grid grid-cols-2 gap-4">
                                    <Form.Item
                                        name="category"
                                        label="Category"
                                        rules={[{ required: true, message: 'Please select category' }]}
                                    >
                                        <Select size="large" placeholder="Select category">
                                            <Option value="Men">Men</Option>
                                            <Option value="Women">Women</Option>
                                            <Option value="Kids">Kids</Option>
                                            <Option value="Accessories">Accessories</Option>
                                        </Select>
                                    </Form.Item>

                                    <Form.Item
                                        name="status"
                                        label="Status"
                                        rules={[{ required: true, message: 'Please select status' }]}
                                    >
                                        <Select size="large" placeholder="Select status">
                                            <Option value="active">Active</Option>
                                            <Option value="inactive">Inactive</Option>
                                        </Select>
                                    </Form.Item>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <Form.Item
                                        name="price"
                                        label="Price (LKR)"
                                        rules={[{ required: true, message: 'Please enter price' }]}
                                    >
                                        <InputNumber
                                            size="large"
                                            placeholder="3500"
                                            className="w-full"
                                            min={0}
                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        />
                                    </Form.Item>

                                    <Form.Item name="discount" label="Discount (%)">
                                        <InputNumber size="large" placeholder="0" className="w-full" min={0} max={100} />
                                    </Form.Item>

                                    <Form.Item
                                        name="stock"
                                        label="Stock Quantity"
                                        rules={[{ required: true, message: 'Please enter stock' }]}
                                    >
                                        <InputNumber size="large" placeholder="100" className="w-full" min={0} />
                                    </Form.Item>
                                </div>

                                <Form.Item name="images" label="Product Images">
                                    <Upload listType="picture-card" maxCount={5}>
                                        <div>
                                            <UploadOutlined />
                                            <div className="mt-2">Upload</div>
                                        </div>
                                    </Upload>
                                </Form.Item>

                                <Form.Item name="description" label="Description">
                                    <TextArea
                                        rows={4}
                                        placeholder="Enter product description..."
                                        maxLength={500}
                                        showCount
                                    />
                                </Form.Item>

                                <Form.Item className="mb-0 mt-6">
                                    <Space className="w-full justify-end">
                                        <Button size="large" onClick={() => setIsModalOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button
                                            type="primary"
                                            size="large"
                                            htmlType="submit"
                                            className="bg-brand-gold hover:bg-brand-gold-dark border-0 text-brand-black font-medium"
                                        >
                                            Save Product
                                        </Button>
                                    </Space>
                                </Form.Item>
                            </Form>
                        </TabPane>

                        <TabPane tab={
                            <span>
                                <BgColorsOutlined /> Colors & Sizes
                            </span>
                        } key="2">
                            <div className="mt-6 space-y-6">
                                {/* Color Selection */}
                                <Card title="Available Colors" size="small">
                                    <div className="mb-4">
                                        <div className="flex flex-wrap gap-2">
                                            {selectedColors.map((color) => (
                                                <Tag
                                                    key={color.colorCode}
                                                    closable
                                                    onClose={() => handleColorToggle({ name: color.colorName, code: color.colorCode })}
                                                    className="px-3 py-2 text-sm"
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <div
                                                            className="w-4 h-4 rounded-full border"
                                                            style={{ backgroundColor: color.colorCode }}
                                                        />
                                                        <span>{color.colorName}</span>
                                                    </div>
                                                </Tag>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-6 gap-3">
                                        {COLOR_PALETTE.map((color) => {
                                            const isSelected = selectedColors.some(c => c.colorCode === color.code);
                                            return (
                                                <Tooltip key={color.code} title={color.name}>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleColorToggle(color)}
                                                        className={`relative w-full aspect-square rounded-lg border-2 transition-all hover:scale-110 ${isSelected
                                                            ? 'border-brand-gold ring-4 ring-brand-gold/30'
                                                            : 'border-gray-300 hover:border-brand-gold'
                                                            }`}
                                                        style={{ backgroundColor: color.code }}
                                                    >
                                                        {isSelected && (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                                                    <span className="text-brand-gold font-bold">✓</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </button>
                                                </Tooltip>
                                            );
                                        })}
                                    </div>
                                </Card>

                                {/* Size Selection */}
                                <Card title="Available Sizes" size="small">
                                    <div className="grid grid-cols-7 gap-3">
                                        {STANDARD_SIZES.map((size) => {
                                            const isSelected = selectedSizes.includes(size);
                                            return (
                                                <button
                                                    key={size}
                                                    type="button"
                                                    onClick={() => handleSizeToggle(size)}
                                                    className={`px-4 py-3 rounded-lg border-2 font-bold text-lg transition-all hover:scale-105 ${isSelected
                                                        ? 'border-brand-gold bg-brand-gold text-brand-black'
                                                        : 'border-gray-300 hover:border-brand-gold'
                                                        }`}
                                                >
                                                    {size}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </Card>

                                {/* Stock Quantity Management */}
                                {selectedColors.length > 0 && selectedSizes.length > 0 && (
                                    <Card
                                        title={
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center space-x-2">
                                                    <AppstoreOutlined className="text-brand-gold" />
                                                    <span>Stock Quantity Matrix</span>
                                                </span>
                                                <Tag color="blue">
                                                    {selectedColors.length} × {selectedSizes.length} = {selectedColors.length * selectedSizes.length} variants
                                                </Tag>
                                            </div>
                                        }
                                        size="small"
                                    >
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="bg-gray-100 dark:bg-gray-800">
                                                        <th className="border p-3 text-left font-semibold sticky left-0 bg-gray-100 dark:bg-gray-800 z-10">
                                                            Color / Size
                                                        </th>
                                                        {selectedSizes.map(size => (
                                                            <th key={size} className="border p-3 text-center font-semibold min-w-[100px]">
                                                                {size}
                                                            </th>
                                                        ))}
                                                        <th className="border p-3 text-center font-semibold bg-blue-50 dark:bg-blue-900 sticky right-0">
                                                            Total
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedColors.map((color) => {
                                                        const rowTotal = selectedSizes.reduce(
                                                            (sum, size) => sum + getStockQuantity(color.colorName, size),
                                                            0
                                                        );
                                                        return (
                                                            <tr key={color.colorCode} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                                <td className="border p-3 sticky left-0 bg-white dark:bg-gray-900 z-10">
                                                                    <div className="flex items-center space-x-3">
                                                                        <div
                                                                            className="w-8 h-8 rounded-full border-2 border-gray-300 flex-shrink-0"
                                                                            style={{ backgroundColor: color.colorCode }}
                                                                        />
                                                                        <span className="font-medium">{color.colorName}</span>
                                                                    </div>
                                                                </td>
                                                                {selectedSizes.map(size => (
                                                                    <td key={`${color.colorCode}-${size}`} className="border p-2 text-center">
                                                                        <InputNumber
                                                                            min={0}
                                                                            value={getStockQuantity(color.colorName, size)}
                                                                            onChange={(value) =>
                                                                                handleStockChange(color.colorName, color.colorCode, size, value || 0)
                                                                            }
                                                                            className="w-full"
                                                                            size="large"
                                                                            placeholder="0"
                                                                        />
                                                                    </td>
                                                                ))}
                                                                <td className="border p-3 text-center font-bold text-lg bg-blue-50 dark:bg-blue-900 sticky right-0">
                                                                    {rowTotal}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                    <tr className="bg-blue-100 dark:bg-blue-900 font-bold">
                                                        <td className="border p-3 sticky left-0 bg-blue-100 dark:bg-blue-900 z-10">
                                                            Total
                                                        </td>
                                                        {selectedSizes.map(size => {
                                                            const columnTotal = selectedColors.reduce(
                                                                (sum, color) => sum + getStockQuantity(color.colorName, size),
                                                                0
                                                            );
                                                            return (
                                                                <td key={`total-${size}`} className="border p-3 text-center text-lg">
                                                                    {columnTotal}
                                                                </td>
                                                            );
                                                        })}
                                                        <td className="border p-3 text-center text-xl bg-brand-gold text-brand-black sticky right-0">
                                                            {variantStocks.reduce((sum, v) => sum + v.quantity, 0)}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Instructions */}
                                        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                                💡 <strong>Tip:</strong> Enter the stock quantity for each color-size combination.
                                                Row totals show stock per color, column totals show stock per size,
                                                and the grand total shows your complete inventory.
                                            </p>
                                        </div>
                                    </Card>
                                )}

                                {/* Empty State */}
                                {(selectedColors.length === 0 || selectedSizes.length === 0) && (
                                    <Card className="bg-gray-50 dark:bg-gray-800/50">
                                        <div className="text-center py-8 text-gray-500">
                                            <AppstoreOutlined className="text-4xl mb-3 text-gray-400" />
                                            <p className="text-lg font-medium mb-2">Select Colors and Sizes First</p>
                                            <p className="text-sm">
                                                Choose at least one color and one size to manage stock quantities for each variant.
                                            </p>
                                        </div>
                                    </Card>
                                )}

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-3 pt-4 border-t">
                                    <Button size="large" onClick={() => setIsModalOpen(false)} disabled={loading}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="primary"
                                        size="large"
                                        onClick={() => form.submit()}
                                        className="bg-brand-gold hover:bg-brand-gold-dark border-0 text-brand-black font-medium"
                                        loading={loading}
                                        disabled={loading}
                                    >
                                        Save Product
                                    </Button>
                                </div>
                            </div>
                        </TabPane>
                    </Tabs>
                </Spin>
            </Modal>
        </div>
    );
};

export default ProductsPage;
