import { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Drawer, Empty, Form, Input, InputNumber, Modal, Row, Segmented, Select, Space, Statistic, Table, Tag, Typography } from 'antd';
import { CalculatorOutlined, LinkOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { errorMessage, http } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { cardClass, PageHeader, today, useAction } from '../hr/lib';
import { CategoryTag, ItemFormModal, ItemSelect, useItems } from './items';
import { CATEGORIES, qty, type GatePassLine, type StockRow } from './types';

interface Summary { items: number; low: number; negative: number; unlinked: number }
interface LedgerRow { date: string; type: 'in' | 'out' | 'count'; reference: string; bookNo?: string; party?: string; detail: string; qty: number; balance: number }
interface Ledger { item: StockRow & { id: string }; opening: number; rows: LedgerRow[]; balance: number }
interface Unlinked { gatePass: string; number: string; date: string; party: string; line: GatePassLine & { _id: string } }

const TYPE_TAG: Record<LedgerRow['type'], JSX.Element> = {
    in: <Tag color="green">In</Tag>, out: <Tag color="volcano">Out</Tag>, count: <Tag color="blue">Count</Tag>,
};

/** Physical count of one item; the difference to the system stock is booked as an adjustment. */
const CountModal = ({ row, onClose, onSaved }: { row: StockRow | null; onClose: () => void; onSaved: () => void }) => {
    const [form] = Form.useForm();
    const act = useAction();
    const counted = Form.useWatch('countedQty', form);
    useEffect(() => { if (row) form.setFieldsValue({ date: today(), countedQty: null, countedBy: '', note: '' }); }, [row, form]);
    if (!row) return null;
    const diff = counted == null ? null : Math.round((counted - row.balance) * 1000) / 1000;
    const save = async () => {
        const v = await form.validateFields();
        if (await act(() => http.post('/stores/stock-counts', { ...v, item: row.id }), diff === 0 ? 'Count matches' : 'Stock adjusted')) onSaved();
    };
    return (
        <Modal open onCancel={onClose} onOk={save} okText="Save count" title={`Physical count · ${row.code} ${row.name}`}>
            <Form form={form} layout="vertical">
                <Row gutter={12}>
                    <Col span={12}><Form.Item name="date" label="Count date" rules={[{ required: true }]}><Input type="date" max={today()} /></Form.Item></Col>
                    <Col span={12}><Form.Item name="countedQty" label={`Counted (${row.unit})`} rules={[{ required: true, message: 'Enter the count' }]}><InputNumber min={0} className="w-full" autoFocus /></Form.Item></Col>
                    <Col span={12}><Form.Item name="countedBy" label="Counted by"><Input maxLength={80} /></Form.Item></Col>
                    <Col span={12}><Form.Item name="note" label="Note"><Input maxLength={300} /></Form.Item></Col>
                </Row>
            </Form>
            <Alert type={diff ? 'warning' : 'info'} showIcon
                message={<span>System stock now: <b>{qty(row.balance)} {row.unit}</b>{diff != null && <> · Difference: <b>{diff > 0 ? '+' : ''}{qty(diff)}</b></>}</span>}
                description="The difference is recorded as a stock adjustment and shows in the item's movements." />
        </Modal>
    );
};

const LedgerDrawer = ({ itemId, onClose }: { itemId: string | null; onClose: () => void }) => {
    const [data, setData] = useState<Ledger | null>(null);
    const [error, setError] = useState('');
    useEffect(() => {
        setData(null); setError('');
        if (itemId) http.get<Ledger>(`/stores/stock/${itemId}/ledger`).then(r => setData(r.data)).catch(e => setError(errorMessage(e)));
    }, [itemId]);
    return (
        <Drawer open={!!itemId} onClose={onClose} width={860} title={data ? `${data.item.code} · ${data.item.name}` : 'Movements'} loading={!data && !error}>
            {error && <Alert type="error" message={error} />}
            {data && (
                <>
                    <Row gutter={16} className="mb-4">
                        <Col span={6}><Statistic title="Opening" value={data.opening} /></Col>
                        <Col span={6}><Statistic title="Received" value={data.rows.filter(r => r.type === 'in').reduce((s, r) => s + r.qty, 0)} valueStyle={{ color: '#10b981' }} /></Col>
                        <Col span={6}><Statistic title="Sent" value={-data.rows.filter(r => r.type === 'out').reduce((s, r) => s + r.qty, 0)} valueStyle={{ color: '#ef4444' }} /></Col>
                        <Col span={6}><Statistic title={`Balance (${data.item.unit})`} value={data.balance} valueStyle={{ fontWeight: 700 }} /></Col>
                    </Row>
                    <Table<LedgerRow> rowKey={(r) => `${r.reference}-${r.date}-${r.qty}-${r.balance}`} size="small" dataSource={data.rows} pagination={{ pageSize: 50, hideOnSinglePage: true }}
                        locale={{ emptyText: <Empty description="No movements yet" /> }}
                        columns={[
                            { title: 'Date', dataIndex: 'date', width: 105 },
                            { title: '', dataIndex: 'type', width: 70, render: (t: LedgerRow['type']) => TYPE_TAG[t] },
                            { title: 'Reference', width: 130, render: (_, r) => <span><b>{r.reference}</b>{r.bookNo && <Typography.Text type="secondary" className="block text-xs">Book #{r.bookNo}</Typography.Text>}</span> },
                            { title: 'Party / detail', render: (_, r) => <span>{r.party}{r.detail && <Typography.Text type="secondary" className="block text-xs">{r.detail}</Typography.Text>}</span> },
                            { title: 'Qty', dataIndex: 'qty', width: 90, align: 'right', render: (n: number) => <span style={{ color: n < 0 ? '#ef4444' : '#10b981' }}>{n > 0 ? '+' : ''}{qty(n)}</span> },
                            { title: 'Balance', dataIndex: 'balance', width: 90, align: 'right', render: (n: number) => <b>{qty(n)}</b> },
                        ]} />
                </>
            )}
        </Drawer>
    );
};

/** Lines received on a gate pass in without an item number, to link to the item master. */
const UnlinkedCard = ({ onLinked }: { onLinked: () => void }) => {
    const act = useAction();
    const { items, reload } = useItems();
    const [rows, setRows] = useState<Unlinked[]>([]);
    const [choice, setChoice] = useState<Record<string, string>>({});
    const [newFor, setNewFor] = useState<Unlinked | null>(null);
    const load = () => http.get<Unlinked[]>('/stores/unlinked').then(r => setRows(r.data)).catch(() => undefined);
    useEffect(() => { load(); }, []);
    const link = async (u: Unlinked, item = choice[u.line._id]) => {
        if (!item) return;
        if (await act(() => http.put(`/stores/gate-passes/${u.gatePass}/lines/${u.line._id}/item`, { item }), 'Linked; stock updated')) { load(); onLinked(); }
    };
    if (!rows.length) return null;
    return (
        <Card className={`${cardClass()} mb-4`} size="small" title={<Space><LinkOutlined />Received without an item number<Tag color="gold">{rows.length}</Tag></Space>}
            extra={<Typography.Text type="secondary">Not counted in stock until linked to an item</Typography.Text>}>
            <Table<Unlinked> rowKey={r => r.line._id} size="small" dataSource={rows} pagination={{ pageSize: 5, hideOnSinglePage: true }}
                columns={[
                    { title: 'Date', dataIndex: 'date', width: 105 },
                    { title: 'Gate pass', dataIndex: 'number', width: 120 },
                    { title: 'From', dataIndex: 'party' },
                    { title: 'Description', render: (_, r) => <span>{r.line.description}{r.line.styleNo && <Typography.Text type="secondary"> · Style {r.line.styleNo}</Typography.Text>}{r.line.size && <Typography.Text type="secondary"> · {r.line.size}</Typography.Text>}</span> },
                    { title: 'Qty', width: 90, align: 'right', render: (_, r) => `${qty(r.line.quantity)} ${r.line.unit || ''}` },
                    {
                        title: 'Link to item', width: 380, render: (_, r) => (
                            <Space.Compact className="w-full">
                                <ItemSelect items={items} value={choice[r.line._id]} onChange={(v) => setChoice(c => ({ ...c, [r.line._id]: v as string }))} className="w-full" />
                                <Button onClick={() => link(r)} disabled={!choice[r.line._id]}>Link</Button>
                                <Button onClick={() => setNewFor(r)}>New</Button>
                            </Space.Compact>
                        ),
                    },
                ]} />
            <ItemFormModal open={!!newFor} item={newFor ? { name: newFor.line.description, styleNo: newFor.line.styleNo, size: newFor.line.size, unit: newFor.line.unit } : null}
                onClose={() => setNewFor(null)} onSaved={async (item) => { const u = newFor!; setNewFor(null); await reload(true); link(u, item.id); }} />
        </Card>
    );
};

export function StockPage() {
    const { can } = useAuth();
    const canManage = can('stores.manage');
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<string | undefined>();
    const [only, setOnly] = useState<string>('moving');
    const [rows, setRows] = useState<StockRow[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(false);
    const [ledger, setLedger] = useState<string | null>(null);
    const [counting, setCounting] = useState<StockRow | null>(null);
    const [tick, setTick] = useState(0);
    const act = useAction();

    useEffect(() => {
        const t = setTimeout(async () => {
            setLoading(true);
            const res = await act(() => http.get<StockRow[]>('/stores/stock', { search, category, only: only === 'all' ? undefined : only }));
            setLoading(false);
            if (res) { setRows(res.data); setSummary((res as unknown as { summary: Summary }).summary); }
        }, 200);
        return () => clearTimeout(t);
    }, [search, category, only, tick, act]);
    const reload = () => setTick(t => t + 1);

    return (
        <div>
            <PageHeader title="Stock" subtitle="Balance of every item: opening stock + gate passes in − gate passes out ± physical counts. Click an item for its movements."
                extra={<Button icon={<ReloadOutlined />} onClick={reload} aria-label="Refresh" />} />
            <Row gutter={[16, 16]} className="mb-4">
                <Col xs={12} md={6}><Card className={cardClass()} size="small"><Statistic title="Items" value={summary?.items ?? 0} /></Card></Col>
                <Col xs={12} md={6}><Card className={cardClass()} size="small"><Statistic title="Below warning level" value={summary?.low ?? 0} valueStyle={summary?.low ? { color: '#f59e0b' } : undefined} /></Card></Col>
                <Col xs={12} md={6}><Card className={cardClass()} size="small"><Statistic title="Negative stock" value={summary?.negative ?? 0} valueStyle={summary?.negative ? { color: '#ef4444' } : undefined} /></Card></Col>
                <Col xs={12} md={6}><Card className={cardClass()} size="small"><Statistic title="Received, not numbered" value={summary?.unlinked ?? 0} valueStyle={summary?.unlinked ? { color: '#B8941F' } : undefined} /></Card></Col>
            </Row>
            <UnlinkedCard key={tick} onLinked={reload} />
            <Card className={cardClass()}>
                <Space wrap className="mb-4">
                    <Input allowClear prefix={<SearchOutlined />} placeholder="Code, name or physical no" className="w-64" value={search} onChange={e => setSearch(e.target.value)} />
                    <Select allowClear placeholder="All types" className="w-48" value={category} onChange={setCategory} options={CATEGORIES.map(c => ({ value: c.value, label: c.label }))} />
                    <Segmented value={only} onChange={v => setOnly(v as string)} options={[{ value: 'all', label: 'All items' }, { value: 'moving', label: 'With stock or movement' }, { value: 'low', label: 'Low / negative' }]} />
                </Space>
                <Table<StockRow> rowKey="id" size="middle" loading={loading} dataSource={rows} pagination={{ pageSize: 50, hideOnSinglePage: true, showSizeChanger: false }}
                    onRow={r => ({ onClick: () => setLedger(r.id), className: 'cursor-pointer' })}
                    columns={[
                        { title: 'Code', dataIndex: 'code', width: 110, render: (c: string) => <b>{c}</b> },
                        { title: 'Item', dataIndex: 'name', render: (n: string, r) => <span>{n}{r.physicalNo && <Typography.Text type="secondary" className="block text-xs">#{r.physicalNo}{r.location ? ` · ${r.location}` : ''}</Typography.Text>}</span> },
                        { title: 'Type', dataIndex: 'category', width: 160, render: (c: string) => <CategoryTag value={c} /> },
                        { title: 'Opening', dataIndex: 'openingStock', width: 85, align: 'right', render: qty },
                        { title: 'In', dataIndex: 'in', width: 85, align: 'right', render: (n: number) => (n ? <span style={{ color: '#10b981' }}>+{qty(n)}</span> : '—') },
                        { title: 'Out', dataIndex: 'out', width: 85, align: 'right', render: (n: number) => (n ? <span style={{ color: '#ef4444' }}>−{qty(n)}</span> : '—') },
                        { title: 'Adj.', dataIndex: 'adjustment', width: 75, align: 'right', render: (n: number) => (n ? `${n > 0 ? '+' : ''}${qty(n)}` : '—') },
                        {
                            title: 'Balance', dataIndex: 'balance', width: 130, align: 'right', sorter: (a, b) => a.balance - b.balance,
                            render: (n: number, r) => (!r.trackStock ? <Typography.Text type="secondary">Not tracked</Typography.Text> : <span><b style={{ color: n < 0 ? '#ef4444' : undefined, fontSize: 15 }}>{qty(n)}</b> <Typography.Text type="secondary">{r.unit}</Typography.Text>{r.low && <Tag color="orange" className="ml-1 mr-0">Low</Tag>}</span>),
                        },
                        { title: 'Last movement', dataIndex: 'lastMovement', width: 120, render: (d: string | null) => d || '—' },
                        ...(canManage ? [{
                            title: '', width: 110, render: (_: unknown, r: StockRow) => r.trackStock && (
                                <Button size="small" icon={<CalculatorOutlined />} onClick={(e) => { e.stopPropagation(); setCounting(r); }}>Count</Button>
                            ),
                        }] : []),
                    ]} />
            </Card>
            <LedgerDrawer itemId={ledger} onClose={() => setLedger(null)} />
            <CountModal row={counting} onClose={() => setCounting(null)} onSaved={() => { setCounting(null); reload(); }} />
        </div>
    );
}
