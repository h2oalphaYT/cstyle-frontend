import { useMemo, useState } from 'react';
import { App, Button, Card, Col, Form, Input, Modal, Row, Segmented, Select, Space, Switch, Table, Tag, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { http } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { cardClass, PageHeader, RemoteSelect, today, useAction, useList } from './lib';
import { shortDay } from './productionTypes';

interface HolidayRow {
    id: string; date: string; name: string; type: string; paid: boolean; categories?: string[]; poya?: boolean; observed?: boolean; orgUnits?: string[];
}

const CATEGORY_TAGS: Record<string, [string, string]> = { public: ['Public', 'blue'], bank: ['Bank', 'purple'], mercantile: ['Mercantile', 'gold'] };

/**
 * Sri Lanka public, bank and mercantile holidays (Poya days included) plus company holidays.
 * "Factory closed" decides whether the day counts as a holiday for attendance, leave and payroll.
 */
export function HolidaysPage() {
    const { can } = useAuth();
    const { modal } = App.useApp();
    const act = useAction();
    const thisYear = Number(today().slice(0, 4));
    const [year, setYear] = useState(thisYear);
    const { data, loading, reload } = useList<HolidayRow>('/hr/holidays', { search: `${year}-`, limit: 500 });
    const rows = useMemo(() => data.filter(h => h.date.startsWith(`${year}-`)), [data, year]);
    const writable = can('settings.manage', 'attendance.edit');
    const [editing, setEditing] = useState<HolidayRow | null>(null);
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();
    const next = rows.find(h => h.date >= today());

    const openForm = (row: HolidayRow | null) => {
        setEditing(row);
        form.resetFields();
        form.setFieldsValue(row ? { ...row, observed: row.observed !== false } : { type: 'company', paid: true, observed: true, poya: false, categories: [] });
        setOpen(true);
    };
    const save = async () => {
        const v = await form.validateFields();
        const r = await act(() => (editing ? http.put(`/hr/holidays/${editing.id}`, v) : http.post('/hr/holidays', v)), 'Holiday saved');
        if (r) { setOpen(false); reload(); }
    };
    const toggle = async (row: HolidayRow, observed: boolean) => {
        if (await act(() => http.put(`/hr/holidays/${row.id}`, { observed }), observed ? 'Factory closed on this day' : 'Normal working day now')) reload();
    };
    const remove = (row: HolidayRow) => modal.confirm({
        title: `Delete ${row.name}?`, okType: 'danger', okText: 'Delete',
        onOk: async () => { if (await act(() => http.delete(`/hr/holidays/${row.id}`), 'Deleted')) reload(); },
    });

    return (
        <div>
            <PageHeader title="Holidays" subtitle="Sri Lanka public, bank and mercantile holidays, Poya days and company holidays"
                extra={<>
                    <Segmented value={year} onChange={(v) => setYear(Number(v))} options={[thisYear - 1, thisYear, thisYear + 1].map(y => ({ value: y, label: String(y) }))} />
                    {writable && <Button type="primary" icon={<PlusOutlined />} onClick={() => openForm(null)}>Add</Button>}
                </>} />
            <Card className={cardClass()}>
                <Space wrap className="mb-3">
                    <Tag>{rows.length} holidays</Tag>
                    <Tag color="gold">🌕 {rows.filter(r => r.poya).length} Poya days</Tag>
                    <Tag color="green">{rows.filter(r => r.observed !== false).length} factory closed</Tag>
                    {next && <Typography.Text type="secondary">Next: <b>{next.name}</b> on {shortDay(next.date, { weekday: 'long', day: 'numeric', month: 'long' })}</Typography.Text>}
                </Space>
                <Table<HolidayRow> rowKey="id" size="middle" loading={loading} dataSource={rows} pagination={false} scroll={{ x: 900 }}
                    rowClassName={(r) => (r.date < today() ? 'opacity-60' : r.id === next?.id ? 'font-semibold' : '')}
                    locale={{ emptyText: `No holidays for ${year}. Run "npm run setup:garment" on the server to load the gazetted list.` }}
                    columns={[
                        { title: 'Date', dataIndex: 'date', width: 150, render: (d: string) => shortDay(d, { weekday: 'short', day: '2-digit', month: 'short' }) },
                        { title: 'Holiday', dataIndex: 'name', render: (n: string, r) => <span>{r.poya ? '🌕 ' : ''}{n}</span> },
                        {
                            title: 'Gazetted as', width: 230, render: (_, r) => (r.categories?.length
                                ? r.categories.map(c => <Tag key={c} color={CATEGORY_TAGS[c]?.[1]}>{CATEGORY_TAGS[c]?.[0] || c}</Tag>)
                                : <Tag>{r.type === 'company' ? 'Company' : r.type}</Tag>),
                        },
                        {
                            title: 'Factory closed', width: 140,
                            render: (_, r) => <Switch checked={r.observed !== false} disabled={!writable} onChange={(v) => toggle(r, v)} checkedChildren="Closed" unCheckedChildren="Working" />,
                        },
                        { title: 'Paid', dataIndex: 'paid', width: 70, render: (p: boolean) => (p ? 'Yes' : 'No') },
                        { title: 'Applies to', dataIndex: 'orgUnits', width: 110, render: (u: string[]) => (u?.length ? `${u.length} unit(s)` : 'Everyone') },
                        ...(writable ? [{
                            title: '', key: 'actions', width: 100, render: (_: unknown, r: HolidayRow) => (
                                <Space size={0}>
                                    <Button type="text" icon={<EditOutlined />} onClick={() => openForm(r)} aria-label="Edit" />
                                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(r)} aria-label="Delete" />
                                </Space>
                            ),
                        }] : []),
                    ]} />
                <Typography.Paragraph type="secondary" className="mt-3 mb-0 text-xs">
                    Closed days are not working days: leave does not count them and work on them is paid as holiday overtime. Days marked "Working" stay on the calendar only.
                    Change a day before it arrives; attendance already saved for that day is not recalculated.
                </Typography.Paragraph>
            </Card>
            <Modal title={`${editing ? 'Edit' : 'Add'} holiday`} open={open} onCancel={() => setOpen(false)} onOk={save} okText="Save" destroyOnClose>
                <Form form={form} layout="vertical">
                    <Row gutter={12}>
                        <Col span={10}><Form.Item name="date" label="Date" rules={[{ required: true }]}><Input type="date" /></Form.Item></Col>
                        <Col span={14}><Form.Item name="name" label="Name" rules={[{ required: true }]}><Input maxLength={120} /></Form.Item></Col>
                    </Row>
                    <Form.Item name="categories" label="Gazetted as">
                        <Select mode="multiple" allowClear options={Object.entries(CATEGORY_TAGS).map(([value, [l]]) => ({ value, label: l }))} placeholder="Company holiday" />
                    </Form.Item>
                    <Row gutter={12}>
                        <Col span={8}><Form.Item name="observed" label="Factory closed" valuePropName="checked"><Switch /></Form.Item></Col>
                        <Col span={8}><Form.Item name="paid" label="Paid" valuePropName="checked"><Switch /></Form.Item></Col>
                        <Col span={8}><Form.Item name="poya" label="Poya day" valuePropName="checked"><Switch /></Form.Item></Col>
                    </Row>
                    <Form.Item name="type" label="Type">
                        <Select options={['public', 'mercantile', 'bank', 'company', 'other'].map(v => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }))} />
                    </Form.Item>
                    <Form.Item name="orgUnits" label="Applies to (empty = everyone)"><RemoteSelect path="/hr/org-units" mode="multiple" placeholder="All employees" /></Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
