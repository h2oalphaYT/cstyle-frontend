import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    App, Badge, Button, Card, Col, Drawer, Form, Input, InputNumber, Popconfirm, Row, Select, Space, Switch, Table, Tabs, Tag, Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    AppstoreOutlined, ArrowLeftOutlined, ArrowRightOutlined, DeleteOutlined, EditOutlined, EyeOutlined,
    PlusOutlined, ReloadOutlined, StarFilled, StarOutlined, UndoOutlined, UploadOutlined,
} from '@ant-design/icons';
import {
    categoriesApi, errorMessage, productsApi, uploadsApi,
    type Category, type Product, type ProductColor, type ProductVariant, type Specification,
} from '../../api';
import SafeImage from '../../components/SafeImage';

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '4Y', '6Y', '8Y', '10Y', '12Y'];
const COLOR_PALETTE: ProductColor[] = [
    { name: 'White', hex: '#F2F0EB' }, { name: 'Black', hex: '#1C1C1C' }, { name: 'Navy', hex: '#1F2A44' },
    { name: 'Sand', hex: '#C8B79A' }, { name: 'Olive', hex: '#6B6B47' }, { name: 'Charcoal', hex: '#3A3A3A' },
    { name: 'Grey', hex: '#8A8D91' }, { name: 'Khaki', hex: '#BFA77A' }, { name: 'Sky Blue', hex: '#8FB3D9' },
    { name: 'Light Blue', hex: '#A9C4E0' }, { name: 'Beige', hex: '#D9CBB0' }, { name: 'Sage', hex: '#9CAF88' },
    { name: 'Terracotta', hex: '#B5603F' }, { name: 'Cream', hex: '#EFE6D2' }, { name: 'Brown', hex: '#6B4A35' },
    { name: 'Pink', hex: '#E8B9C0' }, { name: 'Red', hex: '#C8463D' }, { name: 'Burgundy', hex: '#6D2E3A' },
    { name: 'Bottle Green', hex: '#2F5233' }, { name: 'Royal Blue', hex: '#2A4D9B' },
];
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_UPLOAD = 5 * 1024 * 1024;
const PAGE_SIZE = 15;
const STORE_URL = '';

type Status = 'all' | 'active' | 'inactive' | 'deleted';

interface FormValues {
    name: string;
    sku: string;
    category: string;
    subCategory?: string;
    gender: 'men' | 'women' | 'kids' | 'unisex';
    brand?: string;
    shortDescription?: string;
    description?: string;
    tags?: string[];
    price: number;
    salePrice?: number | null;
    stock?: number;
    lowStockThreshold?: number;
    material?: string;
    features?: string[];
    featured?: boolean;
    newArrival?: boolean;
    active?: boolean;
}

const variantKey = (size: string, color: string) => `${size}::${color.toLowerCase()}`;

const ProductsPage = () => {
    const { message, modal } = App.useApp();
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<Status>('all');
    const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [stockFilter, setStockFilter] = useState<'low' | 'out' | undefined>();

    // Editor state
    const [editorOpen, setEditorOpen] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const [form] = Form.useForm<FormValues>();
    const [colors, setColors] = useState<ProductColor[]>([]);
    const [sizes, setSizes] = useState<string[]>([]);
    const [variantStock, setVariantStock] = useState<Record<string, { stock: number; sku?: string; _id?: string }>>({});
    const [images, setImages] = useState<string[]>([]);
    const [thumbnail, setThumbnail] = useState('');
    const [specs, setSpecs] = useState<Specification[]>([]);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [customColor, setCustomColor] = useState<ProductColor>({ name: '', hex: '#888888' });
    const galleryInput = useRef<HTMLInputElement>(null);
    const thumbInput = useRef<HTMLInputElement>(null);

    const isDarkMode = document.documentElement.classList.contains('dark');

    useEffect(() => {
        categoriesApi.list(true).then(res => setCategories(res.data)).catch(() => message.error('Could not load categories'));
    }, [message]);

    useEffect(() => {
        const q = searchParams.get('search');
        if (q !== null) setSearch(q);
    }, [searchParams]);

    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await productsApi.list({
                page,
                limit: PAGE_SIZE,
                // "all" here means everything except deleted, which is the API default for admins.
                status: status === 'all' ? undefined : status,
                category: categoryFilter,
                search: search || undefined,
                lowStock: stockFilter === 'low' || undefined,
                inStock: stockFilter === 'out' ? false : undefined,
                sort: 'newest',
            });
            setProducts(res.data);
            setTotal(res.pagination?.total || 0);
        } catch (err) {
            message.error(errorMessage(err, 'Failed to load products'));
        } finally {
            setLoading(false);
        }
    }, [page, status, categoryFilter, search, stockFilter, message]);

    useEffect(() => {
        const t = setTimeout(loadProducts, 250);
        return () => clearTimeout(t);
    }, [loadProducts]);

    // ── Editor helpers ──────────────────────────────────────────────
    const openEditor = (product: Product | null) => {
        setEditing(product);
        form.resetFields();
        if (product) {
            form.setFieldsValue({
                name: product.name,
                sku: product.sku,
                category: product.category?._id || product.category?.id,
                subCategory: product.subCategory,
                gender: product.gender,
                brand: product.brand,
                shortDescription: product.shortDescription,
                description: product.description,
                tags: product.tags,
                price: product.price,
                salePrice: product.salePrice,
                stock: product.stock,
                lowStockThreshold: product.lowStockThreshold,
                material: product.material,
                features: product.features,
                featured: product.featured,
                newArrival: product.newArrival,
                active: product.active,
            });
            setColors(product.colors);
            setSizes(product.sizes);
            setVariantStock(Object.fromEntries(product.variants.map(v => [variantKey(v.size, v.color), { stock: v.stock, sku: v.sku, _id: v._id }])));
            setImages(product.images);
            setThumbnail(product.thumbnail);
            setSpecs(product.specifications);
        } else {
            form.setFieldsValue({ gender: 'men', brand: 'CStyle', active: true, featured: false, newArrival: true, lowStockThreshold: 10, stock: 0 });
            setColors([]);
            setSizes([]);
            setVariantStock({});
            setImages([]);
            setThumbnail('');
            setSpecs([]);
        }
        setEditorOpen(true);
    };

    const toggleColor = (c: ProductColor) => {
        setColors(prev => (prev.some(x => x.name === c.name) ? prev.filter(x => x.name !== c.name) : [...prev, c]));
    };
    const toggleSize = (s: string) => {
        setSizes(prev => (prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]));
    };

    const hasMatrix = colors.length > 0 || sizes.length > 0;
    const matrixRows = colors.length ? colors : [{ name: '', hex: '#888888' }];
    const matrixCols = sizes.length ? sizes : [''];
    const matrixTotal = useMemo(() => matrixRows.reduce((sum, c) => sum + matrixCols.reduce(
        (s, size) => s + (variantStock[variantKey(size, c.name)]?.stock || 0), 0), 0), [matrixRows, matrixCols, variantStock]);

    const setCellStock = (size: string, color: string, stock: number) => {
        const key = variantKey(size, color);
        setVariantStock(prev => ({ ...prev, [key]: { ...prev[key], stock: Math.max(0, Math.floor(stock || 0)) } }));
    };
    const fillAll = (stock: number) => {
        const next: typeof variantStock = { ...variantStock };
        matrixRows.forEach(c => matrixCols.forEach(s => { next[variantKey(s, c.name)] = { ...next[variantKey(s, c.name)], stock }; }));
        setVariantStock(next);
    };

    const validateFiles = (files: File[]) => {
        const bad = files.find(f => !ALLOWED_TYPES.includes(f.type));
        if (bad) throw new Error(`${bad.name}: only JPG, PNG or WEBP images are allowed`);
        const big = files.find(f => f.size > MAX_UPLOAD);
        if (big) throw new Error(`${big.name} is larger than 5 MB`);
    };

    const uploadGallery = async (fileList: FileList | null) => {
        const files = Array.from(fileList || []);
        if (!files.length) return;
        try {
            validateFiles(files);
            if (images.length + files.length > 12) throw new Error('A product can have at most 12 images');
            setUploading(true);
            const res = await uploadsApi.productImages(files);
            const urls = res.data.map(i => i.url);
            setImages(prev => [...prev, ...urls]);
            if (!thumbnail) setThumbnail(urls[0]);
            message.success(`${urls.length} image${urls.length > 1 ? 's' : ''} uploaded`);
        } catch (err) {
            message.error(errorMessage(err, 'Upload failed'));
        } finally {
            setUploading(false);
            if (galleryInput.current) galleryInput.current.value = '';
        }
    };

    const uploadThumbnail = async (fileList: FileList | null) => {
        const file = fileList?.[0];
        if (!file) return;
        try {
            validateFiles([file]);
            setUploading(true);
            const res = await uploadsApi.productImage(file);
            setImages(prev => [res.data.url, ...prev]);
            setThumbnail(res.data.url);
            message.success('Thumbnail uploaded');
        } catch (err) {
            message.error(errorMessage(err, 'Upload failed'));
        } finally {
            setUploading(false);
            if (thumbInput.current) thumbInput.current.value = '';
        }
    };

    const moveImage = (index: number, dir: -1 | 1) => {
        setImages(prev => {
            const next = [...prev];
            const target = index + dir;
            if (target < 0 || target >= next.length) return prev;
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    };
    const removeImage = (url: string) => {
        setImages(prev => prev.filter(u => u !== url));
        if (thumbnail === url) setThumbnail(images.find(u => u !== url) || '');
    };

    const save = async () => {
        let values: FormValues;
        try {
            values = await form.validateFields();
        } catch {
            message.error('Please fix the highlighted fields');
            return;
        }
        if (values.salePrice != null && values.salePrice >= values.price) {
            message.error('Sale price must be lower than the regular price');
            return;
        }
        const variants: ProductVariant[] = hasMatrix
            ? matrixRows.flatMap(c => matrixCols.map(size => {
                const cell = variantStock[variantKey(size, c.name)];
                return { _id: cell?._id, sku: cell?.sku || '', size, color: c.name, stock: cell?.stock || 0 };
            }))
            : [];
        const payload = {
            ...values,
            salePrice: values.salePrice ?? null,
            tags: values.tags || [],
            features: values.features || [],
            colors,
            sizes,
            variants,
            stock: hasMatrix ? matrixTotal : values.stock || 0,
            images,
            thumbnail: thumbnail || images[0] || '',
            specifications: specs.filter(s => s.key.trim() && s.value.trim()),
        };
        setSaving(true);
        try {
            const res = editing ? await productsApi.update(editing.id, payload) : await productsApi.create(payload);
            message.success(editing ? 'Product updated — live in the store now' : 'Product created — live in the store now');
            setEditorOpen(false);
            setEditing(res.data);
            loadProducts();
        } catch (err) {
            message.error(errorMessage(err, 'Failed to save product'));
        } finally {
            setSaving(false);
        }
    };

    // ── Row actions ─────────────────────────────────────────────────
    const runAction = async (fn: () => Promise<unknown>, success: string) => {
        try {
            await fn();
            message.success(success);
            loadProducts();
        } catch (err) {
            message.error(errorMessage(err));
        }
    };

    const confirmDelete = (p: Product) => modal.confirm({
        title: `Delete ${p.name}?`,
        content: 'It disappears from the store but stays in past orders and can be restored from the Deleted filter.',
        okText: 'Delete',
        okType: 'danger',
        onOk: () => runAction(() => productsApi.remove(p.id), 'Product deleted'),
    });

    const columns: ColumnsType<Product> = [
        {
            title: 'Image',
            dataIndex: 'thumbnail',
            width: 72,
            render: (src: string, p) => <SafeImage src={src} alt={p.name} wrapperClassName="w-12 h-14 rounded" className="w-full h-full object-cover" />,
        },
        {
            title: 'Product',
            dataIndex: 'name',
            render: (name: string, p) => (
                <div>
                    <div className="font-medium">{name}</div>
                    <div className="text-xs text-gray-500">{p.sku} · {p.images.length} image{p.images.length === 1 ? '' : 's'}</div>
                </div>
            ),
        },
        { title: 'Category', dataIndex: ['category', 'name'], width: 140, render: (n?: string) => n ? <Tag>{n}</Tag> : <Tag color="red">None</Tag> },
        {
            title: 'Price (LKR)',
            width: 140,
            render: (_, p) => p.onSale ? (
                <div><span className="font-medium">Rs {p.salePrice!.toLocaleString()}</span><br /><span className="text-xs line-through text-gray-400">Rs {p.price.toLocaleString()}</span></div>
            ) : <span>Rs {p.price.toLocaleString()}</span>,
        },
        {
            title: 'Stock',
            dataIndex: 'stock',
            width: 100,
            render: (stock: number, p) => (
                <Tooltip title={p.variants.length ? `${p.variants.length} variants` : undefined}>
                    <Badge status={stock <= 0 ? 'error' : stock <= p.lowStockThreshold ? 'warning' : 'success'} text={stock} />
                </Tooltip>
            ),
        },
        {
            title: 'Status',
            width: 150,
            render: (_, p) => p.isDeleted ? <Tag color="red">DELETED</Tag> : (
                <Space size={4} wrap>
                    <Switch size="small" checked={p.active} onChange={(v) => runAction(() => productsApi.setActive(p.id, v), v ? 'Product activated' : 'Product hidden from store')} />
                    <span className="text-xs">{p.active ? 'Active' : 'Inactive'}</span>
                    {p.featured && <Tag color="gold">Featured</Tag>}
                </Space>
            ),
        },
        {
            title: 'Actions',
            width: 150,
            render: (_, p) => p.isDeleted ? (
                <Button size="small" icon={<UndoOutlined />} onClick={() => runAction(() => productsApi.restore(p.id), 'Product restored')}>Restore</Button>
            ) : (
                <Space size="small">
                    <Tooltip title="Edit"><Button type="text" icon={<EditOutlined />} onClick={() => openEditor(p)} /></Tooltip>
                    <Tooltip title="View in store"><Button type="text" icon={<EyeOutlined />} href={`${STORE_URL}/product/${p.slug}`} target="_blank" disabled={!p.active} /></Tooltip>
                    <Tooltip title="Delete"><Button type="text" danger icon={<DeleteOutlined />} onClick={() => confirmDelete(p)} /></Tooltip>
                </Space>
            ),
        },
    ];

    const cardClass = `${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl`;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className={`text-3xl font-bold font-poppins m-0 ${isDarkMode ? 'text-white' : 'text-brand-black'}`}>Products</h1>
                    <p className="text-gray-500 m-0">{total} product{total === 1 ? '' : 's'} in MongoDB</p>
                </div>
                <Space>
                    <Button icon={<ReloadOutlined />} onClick={loadProducts}>Refresh</Button>
                    <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => openEditor(null)}
                        className="bg-brand-gold hover:bg-brand-gold-dark border-0 text-brand-black font-semibold">
                        Add Product
                    </Button>
                </Space>
            </div>

            <Card className={cardClass}>
                <div className="flex flex-wrap gap-3 mb-4">
                    <Input.Search
                        allowClear
                        placeholder="Search name, SKU, tag…"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); if (!e.target.value) setSearchParams({}); }}
                        className="w-full md:w-72"
                    />
                    <Select allowClear placeholder="Category" value={categoryFilter} onChange={(v) => { setCategoryFilter(v); setPage(1); }}
                        className="w-44" options={categories.map(c => ({ value: c.slug, label: c.name }))} />
                    <Select value={status} onChange={(v) => { setStatus(v); setPage(1); }} className="w-36"
                        options={[{ value: 'all', label: 'All (not deleted)' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'deleted', label: 'Deleted' }]} />
                    <Select allowClear placeholder="Stock" value={stockFilter} onChange={(v) => { setStockFilter(v); setPage(1); }} className="w-36"
                        options={[{ value: 'low', label: 'Low stock' }, { value: 'out', label: 'Out of stock' }]} />
                </div>
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={products}
                    loading={loading}
                    scroll={{ x: 900 }}
                    pagination={{ current: page, pageSize: PAGE_SIZE, total, onChange: setPage, showTotal: (t) => `${t} products` }}
                />
            </Card>

            <Drawer
                title={editing ? `Edit: ${editing.name}` : 'Add Product'}
                open={editorOpen}
                onClose={() => setEditorOpen(false)}
                width={Math.min(980, typeof window !== 'undefined' ? window.innerWidth : 980)}
                destroyOnClose
                extra={(
                    <Space>
                        <Button onClick={() => setEditorOpen(false)}>Cancel</Button>
                        <Button type="primary" loading={saving} disabled={uploading} onClick={save} className="bg-brand-gold border-0 text-brand-black font-semibold">
                            {editing ? 'Save Changes' : 'Create Product'}
                        </Button>
                    </Space>
                )}
            >
                <Form form={form} layout="vertical" requiredMark>
                    <Tabs
                        items={[
                            {
                                key: 'basic',
                                label: 'Basic Info',
                                forceRender: true,
                                children: (
                                    <>
                                        <Row gutter={16}>
                                            <Col xs={24} md={16}>
                                                <Form.Item name="name" label="Product Name" rules={[{ required: true, message: 'Enter a product name' }, { max: 160 }]}>
                                                    <Input placeholder="Classic Linen Shorts" />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} md={8}>
                                                <Form.Item name="sku" label="SKU" rules={[{ required: true, message: 'Enter a SKU' }, { pattern: /^[A-Za-z0-9-_]+$/, message: 'Letters, numbers, - and _ only' }]}>
                                                    <Input placeholder="CS-SH-010" style={{ textTransform: 'uppercase' }} />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row gutter={16}>
                                            <Col xs={24} md={8}>
                                                <Form.Item name="category" label="Category" rules={[{ required: true, message: 'Choose a category' }]}>
                                                    <Select placeholder="Select category" options={categories.map(c => ({ value: c.id, label: c.name }))} />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={12} md={8}>
                                                <Form.Item name="subCategory" label="Sub-category"><Input placeholder="e.g. Shorts" /></Form.Item>
                                            </Col>
                                            <Col xs={12} md={8}>
                                                <Form.Item name="gender" label="Shop For">
                                                    <Select options={[{ value: 'men', label: 'Men' }, { value: 'women', label: 'Women' }, { value: 'kids', label: 'Kids' }, { value: 'unisex', label: 'Unisex' }]} />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Form.Item name="shortDescription" label="Short Description" rules={[{ max: 300 }]}>
                                            <Input placeholder="One line shown under the product name" />
                                        </Form.Item>
                                        <Form.Item name="description" label="Description" rules={[{ max: 5000 }]}>
                                            <Input.TextArea rows={5} placeholder="Full product description" />
                                        </Form.Item>
                                        <Row gutter={16}>
                                            <Col xs={24} md={12}>
                                                <Form.Item name="tags" label="Tags (used in search)"><Select mode="tags" placeholder="linen, summer…" tokenSeparators={[',']} /></Form.Item>
                                            </Col>
                                            <Col xs={24} md={12}>
                                                <Form.Item name="brand" label="Brand"><Input /></Form.Item>
                                            </Col>
                                        </Row>
                                        <Space size="large" wrap>
                                            <Form.Item name="active" label="Active (visible in store)" valuePropName="checked"><Switch /></Form.Item>
                                            <Form.Item name="featured" label="Featured" valuePropName="checked"><Switch /></Form.Item>
                                            <Form.Item name="newArrival" label="New Arrival" valuePropName="checked"><Switch /></Form.Item>
                                        </Space>
                                    </>
                                ),
                            },
                            {
                                key: 'images',
                                label: `Images (${images.length})`,
                                forceRender: true,
                                children: (
                                    <div className="space-y-4">
                                        <p className="text-gray-500 text-sm m-0">JPG, PNG or WEBP up to 5 MB. Images are converted to WEBP and stored on the server. The starred image is the thumbnail shown on product cards.</p>
                                        <Space wrap>
                                            <input ref={thumbInput} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={(e) => uploadThumbnail(e.target.files)} />
                                            <input ref={galleryInput} type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: 'none' }} onChange={(e) => uploadGallery(e.target.files)} />
                                            <Button icon={<UploadOutlined />} loading={uploading} onClick={() => thumbInput.current?.click()}>Upload Thumbnail</Button>
                                            <Button type="primary" icon={<UploadOutlined />} loading={uploading} onClick={() => galleryInput.current?.click()} className="bg-brand-gold border-0 text-brand-black">
                                                Upload Images
                                            </Button>
                                        </Space>
                                        {images.length === 0 ? (
                                            <div className="border border-dashed border-gray-400 rounded-lg p-10 text-center text-gray-500">No images yet. Products without images show a placeholder in the store.</div>
                                        ) : (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                {images.map((url, i) => (
                                                    <div key={url} className={`relative rounded-lg overflow-hidden border-2 ${thumbnail === url ? 'border-yellow-500' : 'border-transparent'}`}>
                                                        <SafeImage src={url} alt={`Image ${i + 1}`} wrapperClassName="w-full aspect-[3/4]" className="w-full h-full object-cover" />
                                                        {thumbnail === url && <Tag color="gold" className="absolute top-2 left-2 m-0">Primary</Tag>}
                                                        <div className="absolute bottom-0 inset-x-0 flex justify-between bg-black/60 px-1 py-1">
                                                            <Tooltip title="Make primary"><Button size="small" type="text" className="text-yellow-400" icon={thumbnail === url ? <StarFilled /> : <StarOutlined />} onClick={() => setThumbnail(url)} /></Tooltip>
                                                            <Button size="small" type="text" className="text-white" icon={<ArrowLeftOutlined />} disabled={i === 0} onClick={() => moveImage(i, -1)} aria-label="Move left" />
                                                            <Button size="small" type="text" className="text-white" icon={<ArrowRightOutlined />} disabled={i === images.length - 1} onClick={() => moveImage(i, 1)} aria-label="Move right" />
                                                            <Popconfirm title="Remove this image?" onConfirm={() => removeImage(url)}>
                                                                <Button size="small" type="text" danger icon={<DeleteOutlined />} aria-label="Remove image" />
                                                            </Popconfirm>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-500 m-0">Removed images are deleted from storage when you save.</p>
                                    </div>
                                ),
                            },
                            {
                                key: 'pricing',
                                label: 'Pricing & Stock',
                                forceRender: true,
                                children: (
                                    <div className="space-y-6">
                                        <Row gutter={16}>
                                            <Col xs={12} md={6}>
                                                <Form.Item name="price" label="Price (LKR)" rules={[{ required: true, message: 'Enter a price' }]}>
                                                    <InputNumber min={0} step={100} className="w-full" />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={12} md={6}>
                                                <Form.Item name="salePrice" label="Sale Price (optional)">
                                                    <InputNumber min={0} step={100} className="w-full" />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={12} md={6}>
                                                <Form.Item name="lowStockThreshold" label="Low-stock alert at"><InputNumber min={0} className="w-full" /></Form.Item>
                                            </Col>
                                            {!hasMatrix && (
                                                <Col xs={12} md={6}>
                                                    <Form.Item name="stock" label="Stock"><InputNumber min={0} className="w-full" /></Form.Item>
                                                </Col>
                                            )}
                                        </Row>

                                        <div>
                                            <h4 className="font-semibold mb-2">Colours</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {[...COLOR_PALETTE, ...colors.filter(c => !COLOR_PALETTE.some(p => p.name === c.name))].map(c => {
                                                    const on = colors.some(x => x.name === c.name);
                                                    return (
                                                        <button type="button" key={c.name} onClick={() => toggleColor(c)}
                                                            className={`flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs ${on ? 'border-yellow-500 bg-yellow-500/10' : 'border-gray-300'}`}>
                                                            <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: c.hex }} />{c.name}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <Space className="mt-3" wrap>
                                                <Input placeholder="Custom colour name" value={customColor.name} onChange={e => setCustomColor(c => ({ ...c, name: e.target.value }))} className="w-44" />
                                                <input type="color" aria-label="Custom colour" value={customColor.hex} onChange={e => setCustomColor(c => ({ ...c, hex: e.target.value.toUpperCase() }))} />
                                                <Button onClick={() => {
                                                    if (!customColor.name.trim()) return;
                                                    toggleColor({ name: customColor.name.trim(), hex: customColor.hex.toUpperCase() });
                                                    setCustomColor({ name: '', hex: '#888888' });
                                                }}>Add colour</Button>
                                            </Space>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold mb-2">Sizes</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {[...STANDARD_SIZES, ...sizes.filter(s => !STANDARD_SIZES.includes(s))].map(s => (
                                                    <Tag.CheckableTag key={s} checked={sizes.includes(s)} onChange={() => toggleSize(s)} className="border border-gray-300 px-3 py-1">{s}</Tag.CheckableTag>
                                                ))}
                                            </div>
                                            <Input.Search className="mt-3 w-60" placeholder="Custom size" enterButton="Add" onSearch={(v) => { const s = v.trim().toUpperCase(); if (s && !sizes.includes(s)) setSizes(p => [...p, s]); }} />
                                        </div>

                                        {hasMatrix && (
                                            <div>
                                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                                    <h4 className="font-semibold m-0 flex items-center gap-2"><AppstoreOutlined /> Variant stock — total {matrixTotal}</h4>
                                                    <Space>
                                                        <span className="text-xs text-gray-500">Set all to</span>
                                                        <InputNumber min={0} size="small" placeholder="qty" onPressEnter={(e) => fillAll(Number((e.target as HTMLInputElement).value) || 0)} />
                                                    </Space>
                                                </div>
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full text-sm border-collapse">
                                                        <thead>
                                                            <tr>
                                                                <th className="text-left p-2 border-b">Colour \ Size</th>
                                                                {matrixCols.map(s => <th key={s} className="p-2 border-b">{s || 'One size'}</th>)}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {matrixRows.map(c => (
                                                                <tr key={c.name || 'none'}>
                                                                    <td className="p-2 border-b whitespace-nowrap">
                                                                        <span className="inline-block w-3 h-3 rounded-full mr-2 align-middle border" style={{ backgroundColor: c.hex }} />{c.name || 'Any colour'}
                                                                    </td>
                                                                    {matrixCols.map(s => (
                                                                        <td key={s} className="p-1 border-b text-center">
                                                                            <InputNumber min={0} size="small" className="w-20"
                                                                                value={variantStock[variantKey(s, c.name)]?.stock ?? 0}
                                                                                onChange={(v) => setCellStock(s, c.name, Number(v))}
                                                                                aria-label={`Stock for ${c.name} ${s}`} />
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ),
                            },
                            {
                                key: 'details',
                                label: 'Details & Specs',
                                forceRender: true,
                                children: (
                                    <div className="space-y-4">
                                        <Form.Item name="material" label="Material"><Input placeholder="100% Linen" /></Form.Item>
                                        <Form.Item name="features" label="Key features"><Select mode="tags" placeholder="Type a feature and press Enter" /></Form.Item>
                                        <div>
                                            <h4 className="font-semibold mb-2">Specifications</h4>
                                            {specs.map((s, i) => (
                                                <Space key={i} className="flex mb-2" align="start">
                                                    <Input placeholder="Name (e.g. Fit)" value={s.key} onChange={e => setSpecs(p => p.map((x, j) => (j === i ? { ...x, key: e.target.value } : x)))} />
                                                    <Input placeholder="Value (e.g. Relaxed)" value={s.value} onChange={e => setSpecs(p => p.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />
                                                    <Button danger icon={<DeleteOutlined />} onClick={() => setSpecs(p => p.filter((_, j) => j !== i))} aria-label="Remove specification" />
                                                </Space>
                                            ))}
                                            <Button icon={<PlusOutlined />} onClick={() => setSpecs(p => [...p, { key: '', value: '' }])}>Add specification</Button>
                                        </div>
                                    </div>
                                ),
                            },
                        ]}
                    />
                </Form>
            </Drawer>
        </div>
    );
};

export default ProductsPage;
