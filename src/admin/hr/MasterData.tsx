import { ReactNode, useState } from 'react';
import { App, Button, Card, Form, Input, InputNumber, Modal, Select, Space, Switch, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { http } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { cardClass, clearOptionCache, OrgSelect, PageHeader, RemoteSelect, StatusTag, useAction, useList } from './lib';

export interface FieldDef {
    name: string | (string | number)[];
    label: string;
    type?: 'text' | 'number' | 'switch' | 'select' | 'org' | 'remote' | 'textarea' | 'color' | 'date' | 'tags' | 'orgMulti';
    options?: { value: string | number; label: string }[];
    orgType?: string;
    path?: string;
    query?: Record<string, string>;
    required?: boolean;
    help?: string;
    min?: number;
    max?: number;
    span?: 1 | 2;
    pattern?: RegExp;
    patternMessage?: string;
}

interface Props<T> {
    title: string;
    subtitle?: string;
    path: string;
    query?: Record<string, string>;
    columns: ColumnsType<T>;
    fields: FieldDef[];
    defaults?: Record<string, unknown>;
    writePermission: string[];
    toForm?: (row: T) => Record<string, unknown>;
    toBody?: (values: Record<string, unknown>) => Record<string, unknown>;
    extraActions?: (row: T, reload: () => void) => ReactNode;
    headerExtra?: ReactNode;
    searchable?: boolean;
}

const renderField = (f: FieldDef) => {
    switch (f.type) {
        case 'number': return <InputNumber className="w-full" min={f.min} max={f.max} />;
        case 'switch': return <Switch />;
        case 'select': return <Select options={f.options} allowClear />;
        case 'org': return <OrgSelect type={f.orgType!} />;
        case 'orgMulti': return <RemoteSelect path="/hr/org-units" mode="multiple" placeholder="All employees" />;
        case 'remote': return <RemoteSelect path={f.path!} query={f.query} />;
        case 'textarea': return <Input.TextArea rows={3} />;
        case 'color': return <Input type="color" className="w-24" />;
        case 'date': return <Input type="date" />;
        case 'tags': return <Select mode="tags" />;
        default: return <Input />;
    }
};

/** Table + modal form for HR reference data (departments, groups, leave types, devices...). */
export default function MasterData<T extends { id: string; active?: boolean }>(props: Props<T>) {
    const { title, subtitle, path, query = {}, columns, fields, defaults = { active: true }, writePermission, toForm, toBody, extraActions, headerExtra, searchable = true } = props;
    const { can } = useAuth();
    const { modal } = App.useApp();
    const act = useAction();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const { data, pagination, loading, reload } = useList<T>(path, { ...query, search, page, limit: 50 });
    const [editing, setEditing] = useState<T | null>(null);
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();
    const writable = can(...writePermission);

    const openForm = (row: T | null) => {
        setEditing(row);
        form.resetFields();
        form.setFieldsValue(row ? (toForm ? toForm(row) : row) : { ...defaults, ...query });
        setOpen(true);
    };

    const save = async () => {
        const values = await form.validateFields();
        const body = { ...query, ...(toBody ? toBody(values) : values) };
        setSaving(true);
        const r = await act(() => (editing ? http.put(`${path}/${editing.id}`, body) : http.post(path, body)), `${title.replace(/s$/, '')} saved`);
        setSaving(false);
        if (r) { setOpen(false); clearOptionCache(); reload(); }
    };

    const remove = (row: T) => modal.confirm({
        title: 'Delete this record?',
        okType: 'danger',
        okText: 'Delete',
        onOk: async () => { if (await act(() => http.delete(`${path}/${row.id}`), 'Deleted')) { clearOptionCache(); reload(); } },
    });

    const allColumns: ColumnsType<T> = [
        ...columns,
        ...(columns.some(c => (c as { dataIndex?: string }).dataIndex === 'active') || !fields.some(f => f.name === 'active') ? [] : [{
            title: 'Status', dataIndex: 'active', width: 90, render: (a: boolean) => <StatusTag status={a ? 'active' : 'inactive'} />,
        }]),
        ...(writable || extraActions ? [{
            title: '', key: 'actions', width: 120 + (extraActions ? 60 : 0), fixed: 'right' as const,
            render: (_: unknown, row: T) => (
                <Space size={0}>
                    {extraActions?.(row, reload)}
                    {writable && <Button type="text" icon={<EditOutlined />} onClick={() => openForm(row)} aria-label="Edit" />}
                    {writable && <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(row)} aria-label="Delete" />}
                </Space>
            ),
        }] : []),
    ];

    return (
        <div>
            <PageHeader title={title} subtitle={subtitle} extra={<>
                {headerExtra}
                {writable && <Button type="primary" icon={<PlusOutlined />} onClick={() => openForm(null)}>Add</Button>}
            </>} />
            <Card className={cardClass()}>
                {searchable && <Input.Search allowClear placeholder="Search…" className="mb-3 max-w-sm" onSearch={(v) => { setSearch(v); setPage(1); }} />}
                <Table<T>
                    rowKey="id"
                    size="middle"
                    loading={loading}
                    columns={allColumns}
                    dataSource={data}
                    scroll={{ x: 800 }}
                    pagination={{ current: page, pageSize: 50, total: pagination?.total, onChange: setPage, hideOnSinglePage: true }}
                />
            </Card>
            <Modal title={`${editing ? 'Edit' : 'Add'} ${title.replace(/s$/, '').toLowerCase()}`} open={open} onCancel={() => setOpen(false)} onOk={save}
                confirmLoading={saving} okText="Save" width={fields.length > 6 ? 760 : 520} destroyOnClose>
                <Form form={form} layout="vertical" className={fields.length > 6 ? 'grid grid-cols-1 md:grid-cols-2 gap-x-4' : ''}>
                    {fields.map(f => (
                        <Form.Item key={String(f.name)} name={f.name} label={f.label} extra={f.help}
                            valuePropName={f.type === 'switch' ? 'checked' : 'value'}
                            className={f.span === 2 ? 'md:col-span-2' : ''}
                            rules={[
                                ...(f.required ? [{ required: true, message: `${f.label} is required` }] : []),
                                ...(f.pattern ? [{ pattern: f.pattern, message: f.patternMessage || 'Invalid format' }] : []),
                            ]}>
                            {renderField(f)}
                        </Form.Item>
                    ))}
                </Form>
            </Modal>
        </div>
    );
}
