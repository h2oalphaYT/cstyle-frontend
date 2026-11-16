import { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Input, InputNumber, Modal, Popconfirm, Row, Select, Space, Switch, Table, Tag, Typography } from 'antd';
import type { SelectProps } from 'antd';
import { AppstoreAddOutlined, DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { http } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { cardClass, PageHeader, useAction, useList } from '../hr/lib';
import { CATEGORIES, categoryOf, qty, UNITS, type StoreItem } from './types';

// ── Shared item list, so every line picker does not reload it ─────────
let itemCache: Promise<StoreItem[]> | null = null;
export const loadItems = (fresh = false) => {
    if (fresh || !itemCache) itemCache = http.get<StoreItem[]>('/stores/items', { limit: 500, active: 'true' }).then(r => r.data).catch(() => { itemCache = null; return []; });
    return itemCache;
};
export const useItems = () => {
    const [items, setItems] = useState<StoreItem[]>([]);
    const reload = (fresh = false) => loadItems(fresh).then(setItems);
    useEffect(() => { reload(); }, []);
    return { items, reload };
};

export const CategoryTag = ({ value }: { value?: string }) => { const c = categoryOf(value); return <Tag color={c.color} className="m-0">{c.label}</Tag>; };

/** Item picker: search by code, name, short code or physical number. */
export const ItemSelect = ({ items, ...rest }: SelectProps & { items: StoreItem[] }) => (
    <Select
        showSearch
        allowClear
        placeholder="Code or name"
        optionFilterProp="search"
        popupMatchSelectWidth={360}
        options={items.map(i => ({
            value: i.id,
            search: `${i.code} ${i.name} ${i.shortCode || ''} ${i.physicalNo || ''} ${i.styleNo || ''}`,
            label: <span><b>{i.code}</b> {i.name}{i.physicalNo ? <Typography.Text type="secondary"> · #{i.physicalNo}</Typography.Text> : null}</span>,
        }))}
        {...rest}
    />
);

/** Add / edit one item. Calls onSaved with the saved item. */
export const ItemFormModal = ({ open, item, onClose, onSaved }: { open: boolean; item?: Partial<StoreItem> | null; onClose: () => void; onSaved: (i: StoreItem) => void }) => {
    const [form] = Form.useForm();
    const act = useAction();
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        if (open) { form.resetFields(); form.setFieldsValue({ category: 'trim', unit: 'pcs', openingStock: 0, reorderLevel: 0, trackStock: true, active: true, ...(item || {}) }); }
    }, [open, item, form]);
    const save = async () => {
        const v = await form.validateFields();
        setSaving(true);
        const res = await act(() => (item?.id ? http.put<StoreItem>(`/stores/items/${item.id}`, v) : http.post<StoreItem>('/stores/items', v)), item?.id ? 'Item updated' : 'Item added');
        setSaving(false);
        if (res) { loadItems(true); onSaved(res.data); }
    };
    return (
        <Modal open={open} onCancel={onClose} onOk={save} confirmLoading={saving} okText="Save item" title={item?.id ? `Edit ${item.code}` : 'New item'} width={680} destroyOnHidden>
            <Form form={form} layout="vertical" requiredMark="optional">
                <Row gutter={12}>
                    <Col xs={12} md={8}><Form.Item name="code" label="Item code" rules={[{ required: true, message: 'Code' }]} extra="Your own number, e.g. BTN-14L"><Input maxLength={30} className="uppercase" /></Form.Item></Col>
                    <Col xs={12} md={16}><Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name' }]}><Input maxLength={120} placeholder="e.g. Metal shank button 14L" /></Form.Item></Col>
                    <Col xs={12} md={8}><Form.Item name="category" label="Type"><Select options={CATEGORIES.map(c => ({ value: c.value, label: c.label }))} /></Form.Item></Col>
                    <Col xs={12} md={8}><Form.Item name="unit" label="Unit"><Select options={UNITS.map(u => ({ value: u, label: u }))} /></Form.Item></Col>
                    <Col xs={12} md={8}><Form.Item name="physicalNo" label="Physical number" extra="Tag, bin or roll number"><Input maxLength={40} /></Form.Item></Col>
                    <Col xs={12} md={8}><Form.Item name="shortCode" label="Short code" extra="e.g. B/W/B"><Input maxLength={20} /></Form.Item></Col>
                    <Col xs={12} md={8}><Form.Item name="styleNo" label="Style no"><Input maxLength={40} /></Form.Item></Col>
                    <Col xs={12} md={4}><Form.Item name="colour" label="Colour"><Input maxLength={40} /></Form.Item></Col>
                    <Col xs={12} md={4}><Form.Item name="size" label="Size"><Input maxLength={20} /></Form.Item></Col>
                    <Col xs={12} md={8}><Form.Item name="openingStock" label="Opening stock"><InputNumber min={0} className="w-full" /></Form.Item></Col>
                    <Col xs={12} md={8}><Form.Item name="reorderLevel" label="Warn below" extra="0 = no warning"><InputNumber min={0} className="w-full" /></Form.Item></Col>
                    <Col xs={12} md={8}><Form.Item name="location" label="Rack / location"><Input maxLength={60} /></Form.Item></Col>
                    <Col span={24}><Form.Item name="description" label="Description"><Input.TextArea rows={2} maxLength={500} /></Form.Item></Col>
                    <Col span={12}><Form.Item name="trackStock" label="Keep a stock balance" valuePropName="checked" extra="Turn off for things made inside, like cut parts: in / out is still listed"><Switch /></Form.Item></Col>
                    <Col span={12}><Form.Item name="active" label="Active" valuePropName="checked"><Switch /></Form.Item></Col>
                </Row>
            </Form>
        </Modal>
    );
};

/** Item master: every material and item that goes through the gate. */
export function ItemMasterPage() {
    const { can } = useAuth();
    const act = useAction();
    const canManage = can('stores.manage');
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<string | undefined>();
    const [active, setActive] = useState<string | undefined>('true');
    const [page, setPage] = useState(1);
    const list = useList<StoreItem>('/stores/items', { search, category, active, page, limit: 50 });
    const [editing, setEditing] = useState<Partial<StoreItem> | null>(null);

    const addStandard = async () => { if (await act(() => http.post('/stores/items/standard'), 'Standard items checked')) { loadItems(true); list.reload(); } };
    const remove = async (r: StoreItem) => { if (await act(() => http.delete(`/stores/items/${r.id}`), 'Item deleted')) { loadItems(true); list.reload(); } };

    return (
        <div>
            <PageHeader title="Item Master" subtitle="Every material and item that passes the gate: fabric, buttons, thread, cut parts, finished styles. Gate passes pick items from this list."
                extra={canManage && <>
                    <Popconfirm title="Add the standard items?" description="Adds the cut parts from the cut checking list (Back, Front, Waist Band, Fly, Pocket…) and common trims, thread and packing. Items you already have are skipped." onConfirm={addStandard} okText="Add">
                        <Button icon={<AppstoreAddOutlined />}>Add standard items</Button>
                    </Popconfirm>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing({})}>New item</Button>
                </>} />
            <Card className={cardClass()}>
                <Space wrap className="mb-4">
                    <Input allowClear prefix={<SearchOutlined />} placeholder="Code, name, short code or physical no" className="w-72" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                    <Select allowClear placeholder="All types" className="w-48" value={category} onChange={v => { setCategory(v); setPage(1); }} options={CATEGORIES.map(c => ({ value: c.value, label: c.label }))} />
                    <Select className="w-36" value={active ?? ''} onChange={v => { setActive(v || undefined); setPage(1); }} options={[{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }, { value: '', label: 'All' }]} />
                </Space>
                <Table<StoreItem> rowKey="id" size="middle" loading={list.loading} dataSource={list.data}
                    pagination={{ current: page, pageSize: 50, total: list.pagination?.total, onChange: setPage, showSizeChanger: false, showTotal: t => `${t} items` }}
                    onRow={r => (canManage ? { onDoubleClick: () => setEditing(r) } : {})}
                    columns={[
                        { title: 'Code', dataIndex: 'code', width: 120, render: (c: string) => <b>{c}</b> },
                        { title: 'Name', dataIndex: 'name', render: (n: string, r) => <span>{n}{!r.active && <Tag className="ml-2">Inactive</Tag>}</span> },
                        { title: 'Short', dataIndex: 'shortCode', width: 90, render: (s: string) => s || '—' },
                        { title: 'Type', dataIndex: 'category', width: 170, render: (c: string) => <CategoryTag value={c} /> },
                        { title: 'Unit', dataIndex: 'unit', width: 80 },
                        { title: 'Physical no', dataIndex: 'physicalNo', width: 120, render: (s: string) => s || '—' },
                        { title: 'Style', dataIndex: 'styleNo', width: 90, render: (s: string) => s || '—' },
                        { title: 'Opening', dataIndex: 'openingStock', width: 110, align: 'right', render: (n: number, r) => (r.trackStock === false ? <Typography.Text type="secondary" className="whitespace-nowrap">Not tracked</Typography.Text> : qty(n)) },
                        { title: 'Location', dataIndex: 'location', width: 110, render: (s: string) => s || '—' },
                        ...(canManage ? [{
                            title: '', width: 90, render: (_: unknown, r: StoreItem) => (
                                <Space size={0}>
                                    <Button type="text" icon={<EditOutlined />} aria-label="Edit" onClick={() => setEditing(r)} />
                                    <Popconfirm title={`Delete ${r.code}?`} description="Items used on gate passes cannot be deleted; mark them inactive." onConfirm={() => remove(r)}>
                                        <Button type="text" danger icon={<DeleteOutlined />} aria-label="Delete" />
                                    </Popconfirm>
                                </Space>
                            ),
                        }] : []),
                    ]} />
            </Card>
            <ItemFormModal open={!!editing} item={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); list.reload(); }} />
        </div>
    );
}
