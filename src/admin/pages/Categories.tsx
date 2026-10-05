import { useCallback, useEffect, useRef, useState } from 'react';
import { App, Button, Card, Form, Input, InputNumber, Modal, Space, Switch, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { categoriesApi, errorMessage, uploadsApi, type Category } from '../../api';
import SafeImage from '../../components/SafeImage';

const CategoriesPage = () => {
    const { message, modal } = App.useApp();
    const [items, setItems] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [image, setImage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();
    const fileInput = useRef<HTMLInputElement>(null);
    const isDarkMode = document.documentElement.classList.contains('dark');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setItems((await categoriesApi.list(true)).data);
        } catch (err) {
            message.error(errorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [message]);

    useEffect(() => { load(); }, [load]);

    const openEditor = (c: Category | null) => {
        setEditing(c);
        form.resetFields();
        form.setFieldsValue(c ? { name: c.name, slug: c.slug, description: c.description, active: c.active, sortOrder: c.sortOrder } : { active: true, sortOrder: items.length + 1 });
        setImage(c?.image || '');
        setOpen(true);
    };

    const upload = async (files: FileList | null) => {
        const file = files?.[0];
        if (!file) return;
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { message.error('Only JPG, PNG or WEBP images'); return; }
        if (file.size > 5 * 1024 * 1024) { message.error('Image must be under 5 MB'); return; }
        setUploading(true);
        try {
            setImage((await uploadsApi.categoryImage(file)).data.url);
        } catch (err) {
            message.error(errorMessage(err, 'Upload failed'));
        } finally {
            setUploading(false);
            if (fileInput.current) fileInput.current.value = '';
        }
    };

    const save = async () => {
        const values = await form.validateFields();
        setSaving(true);
        try {
            const body = { ...values, image };
            if (editing) await categoriesApi.update(editing.id, body);
            else await categoriesApi.create(body);
            message.success('Category saved');
            setOpen(false);
            load();
        } catch (err) {
            message.error(errorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const remove = (c: Category) => modal.confirm({
        title: `Delete ${c.name}?`,
        content: c.productCount ? `${c.productCount} product(s) use this category — move them first.` : 'This cannot be undone.',
        okType: 'danger',
        okText: 'Delete',
        onOk: async () => {
            try {
                await categoriesApi.remove(c.id);
                message.success('Category deleted');
                load();
            } catch (err) {
                message.error(errorMessage(err));
            }
        },
    });

    const columns: ColumnsType<Category> = [
        { title: 'Image', dataIndex: 'image', width: 80, render: (src: string, c) => <SafeImage src={src} alt={c.name} wrapperClassName="w-12 h-14 rounded" className="w-full h-full object-cover" /> },
        { title: 'Name', dataIndex: 'name', render: (n: string, c) => <div><div className="font-medium">{n}</div><div className="text-xs text-gray-500">/{c.slug}</div></div> },
        { title: 'Products', dataIndex: 'productCount', width: 100 },
        { title: 'Order', dataIndex: 'sortOrder', width: 80 },
        { title: 'Status', dataIndex: 'active', width: 100, render: (a: boolean) => <Tag color={a ? 'success' : 'default'}>{a ? 'Active' : 'Hidden'}</Tag> },
        {
            title: 'Actions', width: 120, render: (_, c) => (
                <Space>
                    <Button type="text" icon={<EditOutlined />} onClick={() => openEditor(c)} aria-label="Edit" />
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(c)} aria-label="Delete" />
                </Space>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className={`text-3xl font-bold font-poppins m-0 ${isDarkMode ? 'text-white' : 'text-brand-black'}`}>Categories</h1>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => openEditor(null)} className="bg-brand-gold border-0 text-brand-black font-semibold">Add Category</Button>
            </div>
            <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl`}>
                <Table rowKey="id" columns={columns} dataSource={items} loading={loading} pagination={false} scroll={{ x: 600 }} />
            </Card>

            <Modal title={editing ? `Edit ${editing.name}` : 'Add Category'} open={open} onCancel={() => setOpen(false)} onOk={save}
                confirmLoading={saving} okButtonProps={{ disabled: uploading }} okText="Save" destroyOnClose>
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Enter a name' }]}><Input /></Form.Item>
                    <Form.Item name="slug" label="URL slug" extra="Leave empty to generate from the name"><Input placeholder="linen-shirts" /></Form.Item>
                    <Form.Item name="description" label="Description"><Input.TextArea rows={2} /></Form.Item>
                    <Space size="large">
                        <Form.Item name="sortOrder" label="Display order"><InputNumber /></Form.Item>
                        <Form.Item name="active" label="Visible" valuePropName="checked"><Switch /></Form.Item>
                    </Space>
                    <div className="space-y-2">
                        <span className="block">Image</span>
                        {image && <SafeImage src={image} alt="Category" wrapperClassName="w-32 aspect-[3/4] rounded" className="w-full h-full object-cover" />}
                        <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={(e) => upload(e.target.files)} />
                        <Button icon={<UploadOutlined />} loading={uploading} onClick={() => fileInput.current?.click()}>{image ? 'Replace image' : 'Upload image'}</Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default CategoriesPage;
