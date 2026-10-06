import { useCallback, useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { App, Button, Card, DatePicker, Form, Input, InputNumber, Modal, Select, Space, Switch, Table, Tabs, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { bannersApi, couponsApi, errorMessage, uploadsApi, type Banner, type Coupon } from '../../api';
import SafeImage from '../../components/SafeImage';

const couponState = (c: Coupon) => {
    if (!c.active) return <Tag>Inactive</Tag>;
    if (c.expiryDate && new Date(c.expiryDate) < new Date()) return <Tag color="red">Expired</Tag>;
    if (c.usageLimit != null && c.usedCount >= c.usageLimit) return <Tag color="orange">Used up</Tag>;
    return <Tag color="success">Active</Tag>;
};

const CouponsTab = () => {
    const { message, modal } = App.useApp();
    const [items, setItems] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Coupon | null>(null);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();

    const load = useCallback(async () => {
        setLoading(true);
        try { setItems((await couponsApi.list()).data); } catch (err) { message.error(errorMessage(err)); } finally { setLoading(false); }
    }, [message]);
    useEffect(() => { load(); }, [load]);

    const openEditor = (c: Coupon | null) => {
        setEditing(c);
        form.resetFields();
        form.setFieldsValue(c ? { ...c, expiryDate: c.expiryDate ? dayjs(c.expiryDate) : null } : { type: 'percentage', active: true, minimumAmount: 0, firstOrderOnly: false });
        setOpen(true);
    };

    const save = async () => {
        const v = await form.validateFields();
        setSaving(true);
        try {
            const body = { ...v, code: v.code.toUpperCase(), expiryDate: v.expiryDate ? v.expiryDate.endOf('day').toISOString() : null, maxDiscount: v.maxDiscount ?? null, usageLimit: v.usageLimit ?? null };
            if (editing) await couponsApi.update(editing.id, body); else await couponsApi.create(body);
            message.success('Coupon saved');
            setOpen(false);
            load();
        } catch (err) {
            message.error(errorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const columns: ColumnsType<Coupon> = [
        { title: 'Code', dataIndex: 'code', render: (c: string, r) => <div><div className="font-semibold tracking-wider">{c}</div><div className="text-xs text-admin-muted">{r.description}</div></div> },
        { title: 'Discount', render: (_, c) => (c.type === 'percentage' ? `${c.value}%${c.maxDiscount ? ` (max Rs ${c.maxDiscount.toLocaleString()})` : ''}` : `Rs ${c.value.toLocaleString()}`) },
        { title: 'Min. order', dataIndex: 'minimumAmount', render: (m: number) => (m ? `Rs ${m.toLocaleString()}` : '—') },
        { title: 'Used', render: (_, c) => `${c.usedCount}${c.usageLimit != null ? ` / ${c.usageLimit}` : ''}` },
        { title: 'Expires', dataIndex: 'expiryDate', render: (d: string | null) => (d ? new Date(d).toLocaleDateString() : 'Never') },
        { title: 'Status', render: (_, c) => <Space size={4}>{couponState(c)}{c.firstOrderOnly && <Tag color="blue">First order</Tag>}</Space> },
        {
            title: 'Actions', width: 110, render: (_, c) => (
                <Space>
                    <Button type="text" icon={<EditOutlined />} onClick={() => openEditor(c)} aria-label="Edit" />
                    <Button type="text" danger icon={<DeleteOutlined />} aria-label="Delete" onClick={() => modal.confirm({
                        title: `Delete ${c.code}?`, okType: 'danger', okText: 'Delete',
                        onOk: async () => { try { await couponsApi.remove(c.id); load(); } catch (err) { message.error(errorMessage(err)); } },
                    })} />
                </Space>
            ),
        },
    ];

    return (
        <>
            <div className="flex justify-end mb-4">
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openEditor(null)} className="font-semibold">Add Coupon</Button>
            </div>
            <Table rowKey="id" columns={columns} dataSource={items} loading={loading} pagination={false} scroll={{ x: 800 }} />
            <Modal title={editing ? `Edit ${editing.code}` : 'Add Coupon'} open={open} onCancel={() => setOpen(false)} onOk={save} confirmLoading={saving} okText="Save" destroyOnClose>
                <Form form={form} layout="vertical">
                    <Form.Item name="code" label="Code" rules={[{ required: true }, { pattern: /^[A-Za-z0-9_-]+$/, message: 'Letters, numbers, - and _ only' }]}><Input style={{ textTransform: 'uppercase' }} /></Form.Item>
                    <Form.Item name="description" label="Description (shown to shoppers)"><Input /></Form.Item>
                    <Space wrap>
                        <Form.Item name="type" label="Type"><Select className="w-36" options={[{ value: 'percentage', label: 'Percentage' }, { value: 'fixed', label: 'Fixed amount' }]} /></Form.Item>
                        <Form.Item name="value" label="Value" rules={[{ required: true }]}><InputNumber min={0} /></Form.Item>
                        <Form.Item name="maxDiscount" label="Max discount (Rs)"><InputNumber min={0} /></Form.Item>
                    </Space>
                    <Space wrap>
                        <Form.Item name="minimumAmount" label="Minimum order (Rs)"><InputNumber min={0} /></Form.Item>
                        <Form.Item name="usageLimit" label="Usage limit"><InputNumber min={0} placeholder="Unlimited" /></Form.Item>
                        <Form.Item name="expiryDate" label="Expires"><DatePicker /></Form.Item>
                    </Space>
                    <Space size="large">
                        <Form.Item name="active" label="Active" valuePropName="checked"><Switch /></Form.Item>
                        <Form.Item name="firstOrderOnly" label="First order only" valuePropName="checked"><Switch /></Form.Item>
                    </Space>
                </Form>
            </Modal>
        </>
    );
};

const BannersTab = () => {
    const { message, modal } = App.useApp();
    const [items, setItems] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Banner | null>(null);
    const [image, setImage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [form] = Form.useForm();
    const fileInput = useRef<HTMLInputElement>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try { setItems((await bannersApi.list(undefined, true)).data); } catch (err) { message.error(errorMessage(err)); } finally { setLoading(false); }
    }, [message]);
    useEffect(() => { load(); }, [load]);

    const openEditor = (b: Banner | null) => {
        setEditing(b);
        form.resetFields();
        form.setFieldsValue(b || { placement: 'hero', active: true, ctaText: 'Shop Now', link: '/shop', sortOrder: items.length + 1 });
        setImage(b?.image || '');
        setOpen(true);
    };

    const upload = async (files: FileList | null) => {
        const file = files?.[0];
        if (!file) return;
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { message.error('Only JPG, PNG or WEBP images'); return; }
        if (file.size > 5 * 1024 * 1024) { message.error('Image must be under 5 MB'); return; }
        setUploading(true);
        try { setImage((await uploadsApi.bannerImage(file)).data.url); } catch (err) { message.error(errorMessage(err, 'Upload failed')); } finally {
            setUploading(false);
            if (fileInput.current) fileInput.current.value = '';
        }
    };

    const save = async () => {
        const v = await form.validateFields();
        if (!image) { message.error('Upload a banner image'); return; }
        try {
            if (editing) await bannersApi.update(editing.id, { ...v, image }); else await bannersApi.create({ ...v, image });
            message.success('Banner saved');
            setOpen(false);
            load();
        } catch (err) {
            message.error(errorMessage(err));
        }
    };

    const columns: ColumnsType<Banner> = [
        { title: 'Image', dataIndex: 'image', width: 180, render: (src: string) => <SafeImage src={src} alt="" wrapperClassName="w-40 h-16 rounded" className="w-full h-full object-cover" /> },
        { title: 'Title', dataIndex: 'title', render: (t: string, b) => <div><div className="font-medium">{t}</div><div className="text-xs text-admin-muted">{b.subtitle}</div></div> },
        { title: 'Placement', dataIndex: 'placement', render: (p: string) => <Tag>{p === 'hero' ? 'Home hero' : 'Promo'}</Tag> },
        { title: 'Link', dataIndex: 'link' },
        { title: 'Status', dataIndex: 'active', render: (a: boolean) => <Tag color={a ? 'success' : 'default'}>{a ? 'Active' : 'Hidden'}</Tag> },
        {
            title: 'Actions', width: 110, render: (_, b) => (
                <Space>
                    <Button type="text" icon={<EditOutlined />} onClick={() => openEditor(b)} aria-label="Edit" />
                    <Button type="text" danger icon={<DeleteOutlined />} aria-label="Delete" onClick={() => modal.confirm({
                        title: `Delete "${b.title}"?`, okType: 'danger', okText: 'Delete',
                        onOk: async () => { try { await bannersApi.remove(b.id); load(); } catch (err) { message.error(errorMessage(err)); } },
                    })} />
                </Space>
            ),
        },
    ];

    return (
        <>
            <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
                <p className="text-admin-muted m-0">Active hero banners replace the home page slideshow.</p>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openEditor(null)} className="font-semibold">Add Banner</Button>
            </div>
            <Table rowKey="id" columns={columns} dataSource={items} loading={loading} pagination={false} scroll={{ x: 800 }} />
            <Modal title={editing ? 'Edit Banner' : 'Add Banner'} open={open} onCancel={() => setOpen(false)} onOk={save} okButtonProps={{ disabled: uploading }} okText="Save" destroyOnClose width={640}>
                <Form form={form} layout="vertical">
                    <Form.Item name="title" label="Title" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="subtitle" label="Subtitle"><Input /></Form.Item>
                    <Space wrap>
                        <Form.Item name="ctaText" label="Button text"><Input /></Form.Item>
                        <Form.Item name="link" label="Button link" rules={[{ pattern: /^\/(?!\/)/, message: 'Use a path like /shop' }]}><Input /></Form.Item>
                    </Space>
                    <Space wrap>
                        <Form.Item name="placement" label="Placement"><Select className="w-36" options={[{ value: 'hero', label: 'Home hero' }, { value: 'promo', label: 'Promo' }]} /></Form.Item>
                        <Form.Item name="sortOrder" label="Order"><InputNumber /></Form.Item>
                        <Form.Item name="active" label="Active" valuePropName="checked"><Switch /></Form.Item>
                    </Space>
                    {image && <SafeImage src={image} alt="Banner" wrapperClassName="w-full aspect-[12/5] rounded mb-2" className="w-full h-full object-cover" />}
                    <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={(e) => upload(e.target.files)} />
                    <Button icon={<UploadOutlined />} loading={uploading} onClick={() => fileInput.current?.click()}>{image ? 'Replace image' : 'Upload image'} (wide, e.g. 2400×1000)</Button>
                </Form>
            </Modal>
        </>
    );
};

const OffersPage = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-poppins m-0 text-admin-text">Coupons & Banners</h1>
            <Card className="rounded-xl">
                <Tabs items={[
                    { key: 'coupons', label: 'Coupons', children: <CouponsTab /> },
                    { key: 'banners', label: 'Banners', children: <BannersTab /> },
                ]} />
            </Card>
        </div>
    );
};

export default OffersPage;
