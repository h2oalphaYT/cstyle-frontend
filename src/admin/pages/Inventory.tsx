import { useCallback, useEffect, useState } from 'react';
import { App, Badge, Button, Card, Col, Input, InputNumber, Modal, Row, Select, Statistic, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, WarningOutlined } from '@ant-design/icons';
import { categoriesApi, errorMessage, productsApi, type Category, type Product, type ProductVariant } from '../../api';
import SafeImage from '../../components/SafeImage';

const PAGE_SIZE = 20;

const InventoryPage = () => {
    const { message } = App.useApp();
    const [rows, setRows] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<string | undefined>();
    const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [counts, setCounts] = useState({ low: 0, out: 0 });
    const [editing, setEditing] = useState<Product | null>(null);
    const [draft, setDraft] = useState<ProductVariant[]>([]);
    const [simpleStock, setSimpleStock] = useState(0);
    const [saving, setSaving] = useState(false);
    const isDarkMode = document.documentElement.classList.contains('dark');

    useEffect(() => { categoriesApi.list(true).then(r => setCategories(r.data)).catch(() => undefined); }, []);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [res, low, out] = await Promise.all([
                productsApi.list({
                    page, limit: PAGE_SIZE, search: search || undefined, category, status: 'all', sort: 'stock',
                    lowStock: filter === 'low' || undefined, inStock: filter === 'out' ? false : undefined,
                }),
                productsApi.list({ limit: 1, status: 'all', lowStock: true }),
                productsApi.list({ limit: 1, status: 'all', inStock: false }),
            ]);
            setRows(res.data);
            setTotal(res.pagination?.total || 0);
            setCounts({ low: low.pagination?.total || 0, out: out.pagination?.total || 0 });
        } catch (err) {
            message.error(errorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [page, search, category, filter, message]);

    useEffect(() => {
        const t = setTimeout(load, 250);
        return () => clearTimeout(t);
    }, [load]);

    const openEditor = (p: Product) => {
        setEditing(p);
        setDraft(p.variants.map(v => ({ ...v })));
        setSimpleStock(p.stock);
    };

    const save = async () => {
        if (!editing) return;
        setSaving(true);
        try {
            const body = editing.variants.length
                ? { variants: draft, stock: draft.reduce((s, v) => s + (v.stock || 0), 0) }
                : { stock: simpleStock };
            await productsApi.update(editing.id, body);
            message.success(`Stock updated for ${editing.name}`);
            setEditing(null);
            load();
        } catch (err) {
            message.error(errorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const columns: ColumnsType<Product> = [
        { title: '', dataIndex: 'thumbnail', width: 64, render: (src: string) => <SafeImage src={src} alt="" wrapperClassName="w-10 h-12 rounded" className="w-full h-full object-cover" /> },
        { title: 'Product', render: (_, p) => <div><div className="font-medium">{p.name}</div><div className="text-xs text-gray-500">{p.sku} · {p.category?.name}</div></div> },
        {
            title: 'Variants', render: (_, p) => p.variants.length ? (
                <div className="flex flex-wrap gap-1 max-w-md">
                    {p.variants.filter(v => v.stock <= Math.max(2, Math.floor(p.lowStockThreshold / 3))).slice(0, 6).map(v => (
                        <Tag key={v._id} color={v.stock === 0 ? 'red' : 'orange'}>{[v.color, v.size].filter(Boolean).join(' ')}: {v.stock}</Tag>
                    ))}
                    <span className="text-xs text-gray-500">{p.variants.length} variants</span>
                </div>
            ) : <span className="text-xs text-gray-500">No variants</span>,
        },
        {
            title: 'Total stock', dataIndex: 'stock', width: 130, render: (s: number, p) => (
                <Badge status={s === 0 ? 'error' : s <= p.lowStockThreshold ? 'warning' : 'success'} text={`${s} (alert ≤ ${p.lowStockThreshold})`} />
            ),
        },
        { title: 'Sold', dataIndex: 'soldCount', width: 70 },
        { title: '', width: 110, render: (_, p) => <Button icon={<EditOutlined />} onClick={() => openEditor(p)}>Adjust</Button> },
    ];

    const cardClass = `${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl`;

    return (
        <div className="space-y-6">
            <h1 className={`text-3xl font-bold font-poppins m-0 ${isDarkMode ? 'text-white' : 'text-brand-black'}`}>Stock / Inventory</h1>

            <Row gutter={[16, 16]}>
                <Col xs={24} md={8}><Card className={cardClass}><Statistic title="Products" value={total} /></Card></Col>
                <Col xs={12} md={8}><Card className={cardClass} onClick={() => setFilter('low')} hoverable><Statistic title="Low stock" value={counts.low} prefix={<WarningOutlined />} valueStyle={{ color: '#F59E0B' }} /></Card></Col>
                <Col xs={12} md={8}><Card className={cardClass} onClick={() => setFilter('out')} hoverable><Statistic title="Out of stock" value={counts.out} valueStyle={{ color: '#EF4444' }} /></Card></Col>
            </Row>

            <Card className={cardClass}>
                <div className="flex flex-wrap gap-3 mb-4">
                    <Input.Search allowClear placeholder="Search name or SKU" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full md:w-72" />
                    <Select allowClear placeholder="Category" value={category} onChange={(v) => { setCategory(v); setPage(1); }} className="w-44"
                        options={categories.map(c => ({ value: c.slug, label: c.name }))} />
                    <Select value={filter} onChange={(v) => { setFilter(v); setPage(1); }} className="w-40"
                        options={[{ value: 'all', label: 'All products' }, { value: 'low', label: 'Low stock' }, { value: 'out', label: 'Out of stock' }]} />
                </div>
                <Table rowKey="id" columns={columns} dataSource={rows} loading={loading} scroll={{ x: 800 }}
                    pagination={{ current: page, pageSize: PAGE_SIZE, total, onChange: setPage }} />
            </Card>

            <Modal title={editing ? `Adjust stock — ${editing.name}` : ''} open={!!editing} onCancel={() => setEditing(null)} onOk={save}
                confirmLoading={saving} okText="Save stock" width={640} destroyOnClose>
                {editing && (editing.variants.length ? (
                    <div className="max-h-[60vh] overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead><tr><th className="text-left p-2">Colour</th><th className="text-left p-2">Size</th><th className="text-left p-2">SKU</th><th className="p-2">Stock</th></tr></thead>
                            <tbody>
                                {draft.map((v, i) => (
                                    <tr key={v._id || i} className="border-t border-gray-200 dark:border-gray-700">
                                        <td className="p-2">{v.color || '—'}</td>
                                        <td className="p-2">{v.size || '—'}</td>
                                        <td className="p-2 text-xs text-gray-500">{v.sku}</td>
                                        <td className="p-2 text-center">
                                            <InputNumber min={0} size="small" value={v.stock} aria-label={`Stock for ${v.color} ${v.size}`}
                                                onChange={(val) => setDraft(d => d.map((x, j) => (j === i ? { ...x, stock: Math.max(0, Number(val) || 0) } : x)))} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p className="mt-3 mb-0 font-medium">Total: {draft.reduce((s, v) => s + (v.stock || 0), 0)}</p>
                    </div>
                ) : (
                    <div className="flex items-center gap-3"><span>Stock</span><InputNumber min={0} value={simpleStock} onChange={(v) => setSimpleStock(Math.max(0, Number(v) || 0))} /></div>
                ))}
            </Modal>
        </div>
    );
};

export default InventoryPage;
