import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { App, AutoComplete, Button, Card, Col, Descriptions, Drawer, Empty, Form, Input, InputNumber, Modal, Popconfirm, Row, Select, Space, Statistic, Table, Tag, Tooltip, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined, OrderedListOutlined, PlusOutlined, PrinterOutlined, SearchOutlined, StopOutlined } from '@ant-design/icons';
import { errorMessage, http } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { cardClass, PageHeader, today, useAction, useList } from '../hr/lib';
import { ItemFormModal, ItemSelect, loadItems, useItems } from './items';
import { printGatePass } from './printGatePass';
import { DIR_TEXT, GARMENT_TYPES, itemId, qty, type DesignJob, type Direction, type GatePass, type GatePassLine, type StockRow, type StoreItem } from './types';

const fmtDate = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const totalQty = (lines: GatePassLine[]) => lines.reduce((s, l) => s + (Number(l.quantity) || 0), 0);
const lineSummary = (lines: GatePassLine[]) => {
    const styles = [...new Set(lines.map(l => l.styleNo).filter(Boolean))];
    const first = lines.slice(0, 2).map(l => l.description || l.itemCode).join(', ');
    return `${styles.length ? `Design ${styles.join(', ')} · ` : ''}${first}${lines.length > 2 ? ` +${lines.length - 2} more` : ''}`;
};
type EditorLine = Partial<GatePassLine> & { pick?: string };
/** Gate pass out lines pick either a design job ("job:<id>") or an item ("item:<id>") from one list. */
const pickOf = (l: Partial<GatePassLine>) => (itemId(l.job) ? `job:${itemId(l.job)}` : itemId(l.item) ? `item:${itemId(l.item)}` : undefined);
const jobLabel = (j: Pick<DesignJob, 'designNo' | 'garmentType'>) => [j.garmentType, `design ${j.designNo}`].filter(Boolean).join(', ');
const fmtDue = (j: Pick<DesignJob, 'dueDate' | 'dueTime'>) => (j.dueDate ? `${fmtDate(j.dueDate)}${j.dueTime ? ` ${j.dueTime}` : ''}` : 'no due date');
const blankLine = (): EditorLine => ({ item: undefined, description: '', styleNo: '', size: '', quantity: undefined, unit: 'pcs', bundles: null, remark: '' });

const usePrint = () => {
    const { message } = App.useApp();
    return async (gp: GatePass) => {
        // Open the window first (pop-up blockers allow it only straight from the click), then load the full gate pass.
        const w = window.open('', '_blank', 'width=720,height=900');
        if (!w) { message.warning('Allow pop-ups for this site to print the gate pass'); return; }
        let full = gp;
        try { full = (await http.get<GatePass>(`/stores/gate-passes/${gp.id}`)).data; } catch { /* print what we have */ }
        printGatePass(full, w);
    };
};

// ── Cut checking list → lines ──────────────────────────────────────
/** Mirrors the paper cut checking list: number of pieces and bundles per cut part, for one style. */
const CutListModal = ({ open, items, onClose, onAdd }: { open: boolean; items: StoreItem[]; onClose: () => void; onAdd: (lines: Partial<GatePassLine>[]) => void }) => {
    const parts = useMemo(() => items.filter(i => i.category === 'cut_part'), [items]);
    const [rows, setRows] = useState<Record<string, { quantity?: number | null; bundles?: number | null }>>({});
    const [styleNo, setStyleNo] = useState('');
    const [size, setSize] = useState('');
    useEffect(() => { if (open) setRows({}); }, [open]);
    const set = (id: string, k: 'quantity' | 'bundles', v: number | null) => setRows(r => ({ ...r, [id]: { ...r[id], [k]: v } }));
    const chosen = parts.filter(p => (rows[p.id]?.quantity || 0) > 0);
    return (
        <Modal open={open} onCancel={onClose} width={640} title="Cut checking list" okText={`Add ${chosen.length || ''} line${chosen.length === 1 ? '' : 's'}`}
            okButtonProps={{ disabled: !chosen.length }}
            onOk={() => onAdd(chosen.map(p => ({ item: p.id, description: p.name, styleNo, size, quantity: rows[p.id].quantity!, unit: p.unit, bundles: rows[p.id].bundles ?? null, remark: '' })))}>
            {!parts.length ? <Empty description="No cut parts in the item master yet. Use “Add standard items” on the Item Master page." /> : (
                <>
                    <Space className="mb-3" wrap>
                        <Input addonBefore="Design / Item no" value={styleNo} onChange={e => setStyleNo(e.target.value)} className="w-60" placeholder="e.g. 3308" />
                        <Input addonBefore="Size" value={size} onChange={e => setSize(e.target.value)} className="w-36" />
                    </Space>
                    <Table<StoreItem> rowKey="id" size="small" pagination={false} dataSource={parts} scroll={{ y: 420 }}
                        columns={[
                            { title: 'Description', render: (_, p) => <span>{p.name}{p.shortCode && <Typography.Text type="secondary"> ({p.shortCode})</Typography.Text>}</span> },
                            { title: 'Number', width: 110, render: (_, p) => <InputNumber size="small" min={0} value={rows[p.id]?.quantity} onChange={v => set(p.id, 'quantity', v)} className="w-full" /> },
                            { title: 'Bundle', width: 100, render: (_, p) => <InputNumber size="small" min={0} precision={0} value={rows[p.id]?.bundles} onChange={v => set(p.id, 'bundles', v)} className="w-full" /> },
                        ]} />
                </>
            )}
        </Modal>
    );
};

// ── Editor ─────────────────────────────────────────────────────────
export interface EditorPreset { party: string; jobId: string }
const GatePassEditor = ({ direction, open, editing, preset, onClose, onSaved }: { direction: Direction; open: boolean; editing: GatePass | null; preset?: EditorPreset | null; onClose: () => void; onSaved: (gp: GatePass) => void }) => {
    const text = DIR_TEXT[direction];
    const [form] = Form.useForm();
    const act = useAction();
    const { items, reload: reloadItems } = useItems();
    const [nextNo, setNextNo] = useState('');
    const [stock, setStock] = useState<Map<string, StockRow>>(new Map());
    const [saving, setSaving] = useState(false);
    const [newItemFor, setNewItemFor] = useState<number | null>(null);
    const [cutList, setCutList] = useState(false);
    const [jobs, setJobs] = useState<DesignJob[]>([]);
    const itemMap = useMemo(() => new Map(items.map(i => [i.id, i])), [items]);
    const jobMap = useMemo(() => new Map(jobs.map(j => [j.id, j])), [jobs]);
    const lines: EditorLine[] = Form.useWatch('lines', form) || [];
    const party: string = Form.useWatch('party', form) || '';
    const designNo: string = Form.useWatch(['job', 'designNo'], form) || '';
    // Open jobs, this customer's first.
    const jobOptions = useMemo(() => {
        const mine = (j: DesignJob) => (party && j.party.toLowerCase() === party.trim().toLowerCase() ? 0 : 1);
        return [...jobs].sort((a, b) => mine(a) - mine(b) || (a.dueDate || '9999').localeCompare(b.dueDate || '9999'));
    }, [jobs, party]);
    const matchingJob = direction === 'in' && designNo && party
        ? jobs.find(j => j.party.toLowerCase() === party.trim().toLowerCase() && j.designNo.toLowerCase() === designNo.trim().toLowerCase())
        : undefined;

    useEffect(() => {
        if (!open) return;
        form.resetFields();
        let loadedJobs: Promise<DesignJob[]> = Promise.resolve([]);
        loadedJobs = http.get<DesignJob[]>('/stores/jobs', { status: 'open' }).then(r => { setJobs(r.data); return r.data; }).catch(() => []);
        if (editing) {
            const job = editing.job && typeof editing.job === 'object' ? editing.job : null;
            form.setFieldsValue({
                ...editing,
                job: job ? { id: job._id, designNo: job.designNo, garmentType: job.garmentType, quantity: editing.jobQty, dueDate: job.dueDate, dueTime: job.dueTime } : {},
                lines: editing.lines.map(l => ({ ...l, item: itemId(l.item) || undefined, job: itemId(l.job) || undefined, pick: pickOf(l) })),
            });
        } else {
            form.setFieldsValue({ date: today(), job: {}, lines: [blankLine(), blankLine(), blankLine()] });
            if (preset) {
                form.setFieldValue('party', preset.party);
                loadedJobs.then(js => { const j = js.find(x => x.id === preset.jobId); if (j) setJobLine(0, j); });
            }
            http.get<{ number: string }>('/stores/gate-passes/next-number', { direction }).then(r => setNextNo(r.data.number)).catch(() => setNextNo(''));
        }
        reloadItems(true);
        if (direction === 'out') http.get<StockRow[]>('/stores/stock', { active: 'all' }).then(r => setStock(new Map(r.data.map(s => [s.id, s])))).catch(() => undefined);
    }, [open, editing, direction, preset]); // eslint-disable-line react-hooks/exhaustive-deps

    const setJobLine = (index: number, j: DesignJob) => {
        const cur = form.getFieldValue(['lines', index]) || {};
        form.setFieldValue(['lines', index], {
            ...cur, pick: `job:${j.id}`, job: j.id, item: undefined, unit: 'pcs', description: jobLabel(j), styleNo: j.designNo,
            quantity: cur.quantity ?? (j.balance || undefined),
        });
        if (!form.getFieldValue('party')) form.setFieldValue('party', j.party);
    };
    const pick = (index: number, v?: string) => {
        if (v?.startsWith('job:')) { const j = jobMap.get(v.slice(4)); if (j) setJobLine(index, j); return; }
        form.setFieldValue(['lines', index, 'job'], undefined);
        pickItem(index, v?.slice(5));
        form.setFieldValue(['lines', index, 'pick'], v);
    };

    const pickItem = (index: number, id?: string) => {
        const item = id ? itemMap.get(id) : undefined;
        const cur = form.getFieldValue(['lines', index]) || {};
        form.setFieldValue(['lines', index], {
            ...cur, item: id, unit: item?.unit || cur.unit || 'pcs',
            description: item && (!cur.description || items.some(i => i.name === cur.description)) ? item.name : cur.description,
            styleNo: cur.styleNo || item?.styleNo || '', size: cur.size || item?.size || '',
        });
    };

    const save = async () => {
        let v;
        try { v = await form.validateFields(); } catch { return; }
        const filled = (v.lines || []).filter((l: EditorLine) => l.item || l.job || l.pick || l.description || l.quantity).map(({ pick: p, ...l }: EditorLine) => (direction === 'out'
            ? { ...l, item: p?.startsWith('item:') ? p.slice(5) : null, job: p?.startsWith('job:') ? p.slice(4) : null }
            : l));
        if (!filled.length) { form.setFields([{ name: 'party', errors: [] }]); return act(async () => { throw new Error('Add at least one line'); }); }
        setSaving(true);
        const body = { ...v, direction, lines: filled, job: direction === 'in' ? (v.job?.designNo ? v.job : null) : undefined };
        const res = await act(() => (editing ? http.put<GatePass>(`/stores/gate-passes/${editing.id}`, body) : http.post<GatePass>('/stores/gate-passes', body)), editing ? 'Gate pass updated' : undefined);
        setSaving(false);
        if (res) onSaved(res.data);
    };

    const sum = totalQty(lines as GatePassLine[]);
    return (
        <Drawer open={open} onClose={onClose} width={1180} destroyOnHidden
            title={<Space>{editing ? `Edit ${editing.number}` : `New ${text.title.toLowerCase()}`}<Tag color={direction === 'out' ? 'volcano' : 'green'}>{direction === 'out' ? 'Goods leaving' : 'Goods coming in'}</Tag></Space>}
            extra={<Space><Button onClick={onClose}>Close</Button><Button type="primary" loading={saving} onClick={save}>{editing ? 'Save changes' : 'Save gate pass'}</Button></Space>}>
            <Form form={form} layout="vertical">
                <div className="rounded-xl border border-admin-border p-4 mb-4" style={{ background: 'linear-gradient(180deg, rgba(234,196,53,0.10), transparent 70%)' }}>
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <div>
                            <div className="text-lg font-bold font-poppins">C STYLE (PVT) Ltd. <span className="ml-2 px-2 py-0.5 rounded bg-black text-white text-xs tracking-[0.2em] align-middle">GATE PASS {direction.toUpperCase()}</span></div>
                            <Typography.Text type="secondary">Factory: New Town, Pitigala · Office: No 284/B/1, Sugathadassi Mawatha, Pitigala</Typography.Text>
                        </div>
                        <Statistic title="Gate pass no" value={editing?.number || nextNo || '—'} valueStyle={{ fontSize: 20, fontWeight: 700 }} />
                    </div>
                    <Row gutter={12}>
                        <Col xs={12} md={4}><Form.Item name="date" label="Date" rules={[{ required: true }]}><Input type="date" max={today()} /></Form.Item></Col>
                        <Col xs={24} md={7}><Form.Item name="party" label={text.party} rules={[{ required: true, message: `${text.party} is required` }]}><Input placeholder={text.partyHint} maxLength={120} /></Form.Item></Col>
                        <Col xs={12} md={5}><Form.Item name="contactPerson" label="Contact person"><Input placeholder="Name or phone" maxLength={120} /></Form.Item></Col>
                        <Col xs={12} md={4}><Form.Item name="invoiceNo" label="Invoice no"><Input maxLength={40} /></Form.Item></Col>
                        <Col xs={12} md={4}><Form.Item name="bookNo" label="Book no"><Input maxLength={30} placeholder="Paper serial" /></Form.Item></Col>
                        <Col xs={12} md={4}><Form.Item name="vehicleNo" label="Vehicle no"><Input maxLength={30} /></Form.Item></Col>
                        <Col xs={12} md={6}><Form.Item name="purpose" label="Purpose"><Select allowClear placeholder="Choose or leave empty"
                            options={(direction === 'out' ? ['For stitching', 'For washing', 'For printing / embroidery', 'Sample', 'Delivery to customer', 'Return to supplier', 'Repair'] : ['Stitched goods returned', 'Purchase', 'Washing returned', 'Customer return', 'Sample returned', 'Other'])
                                .map(p => ({ value: p, label: p }))} /></Form.Item></Col>
                    </Row>
                </div>

                {direction === 'in' && (
                    <div className="rounded-xl border border-admin-border p-4 mb-4">
                        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                            <Typography.Title level={5} className="!m-0">Cutting for a design</Typography.Title>
                            <Typography.Text type="secondary">Fill this when a customer gives cut pieces to stitch. Leave empty for fabric, trims and other goods.</Typography.Text>
                        </div>
                        <Form.Item name={['job', 'id']} hidden><Input /></Form.Item>
                        <Row gutter={12}>
                            <Col xs={12} md={5}><Form.Item name={['job', 'designNo']} label="Design no" className="!mb-2"><Input placeholder="e.g. 3308" maxLength={40} /></Form.Item></Col>
                            <Col xs={12} md={5}><Form.Item name={['job', 'garmentType']} label="Garment" className="!mb-2"><AutoComplete options={GARMENT_TYPES.map(g => ({ value: g }))} placeholder="Pant, Frock…" filterOption={(i, o) => String(o?.value).toLowerCase().includes(i.toLowerCase())} /></Form.Item></Col>
                            <Col xs={12} md={5}><Form.Item name={['job', 'quantity']} label="Garments to make" className="!mb-2" tooltip="How many finished pieces these cut pieces make, e.g. 6 pants"
                                rules={[{ validator: (_, v) => (v > 0 || !designNo ? Promise.resolve() : Promise.reject(new Error('How many garments?'))) }]}><InputNumber min={0} className="w-full" addonAfter="pcs" /></Form.Item></Col>
                            <Col xs={12} md={5}><Form.Item name={['job', 'dueDate']} label="Due date" className="!mb-2"><Input type="date" /></Form.Item></Col>
                            <Col xs={12} md={4}><Form.Item name={['job', 'dueTime']} label="Due time" className="!mb-2"><Input type="time" /></Form.Item></Col>
                        </Row>
                        {matchingJob && !editing && (
                            <Typography.Text type="secondary">This design already has an open job for {matchingJob.party} ({qty(matchingJob.received)} received, {qty(matchingJob.completed)} sent). These pieces will be added to it.</Typography.Text>
                        )}
                    </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <Typography.Title level={5} className="!m-0">{direction === 'in' && designNo ? 'Cut pieces received' : `Items ${text.verb}`}</Typography.Title>
                    <Space wrap>
                        <Button icon={<OrderedListOutlined />} onClick={() => setCutList(true)}>From cut checking list</Button>
                        <Button icon={<PlusOutlined />} onClick={() => setNewItemFor(-1)}>New item</Button>
                    </Space>
                </div>
                <div className="overflow-x-auto">
                    <div className="min-w-[1060px]">
                        <div className="grid gap-2 px-1 pb-1 text-xs font-semibold text-admin-muted" style={{ gridTemplateColumns: '28px 250px 1fr 110px 70px 110px 80px 76px 1fr 32px' }}>
                            <span>#</span><span>{direction === 'out' ? 'Design job or item' : <>Item <Typography.Text type="secondary" className="!text-xs font-normal">(optional)</Typography.Text></>}</span><span>Description</span><span>Design no</span><span>Size</span><span>Qty</span><span>Unit</span><span>Bundles</span><span>Remark</span><span />
                        </div>
                        <Form.List name="lines">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map((f, idx) => {
                                        const line = lines[idx] || {};
                                        const id = line.item as string | undefined;
                                        const job = direction === 'out' && line.pick?.startsWith('job:') ? jobMap.get(line.pick.slice(4)) : undefined;
                                        const over = job && Number(line.quantity) > job.balance;
                                        const st = id ? stock.get(id) : undefined;
                                        const tracked = st?.trackStock !== false;
                                        const short = direction === 'out' && st && tracked && Number(line.quantity) > st.balance;
                                        return (
                                            <div key={f.key} className="grid gap-2 items-start px-1 py-1 border-t border-admin-border" style={{ gridTemplateColumns: '28px 250px 1fr 110px 70px 110px 80px 76px 1fr 32px' }}>
                                                <span className="pt-1 text-admin-muted">{idx + 1}</span>
                                                <div>
                                                    {direction === 'out' ? (
                                                        <Form.Item name={[f.name, 'pick']} className="!mb-0" rules={[{
                                                            validator: (_, v) => (v || !(line.description || line.quantity) ? Promise.resolve() : Promise.reject(new Error('Choose a design job or item'))),
                                                        }]}>
                                                            <Select showSearch allowClear placeholder="Design no or item" optionFilterProp="search" popupMatchSelectWidth={420} onChange={(v) => pick(idx, v as string)}
                                                                options={[
                                                                    {
                                                                        label: 'Open design jobs', options: jobOptions.map(j => ({
                                                                            value: `job:${j.id}`, search: `${j.designNo} ${j.garmentType} ${j.party}`,
                                                                            label: <span><b>{j.designNo}</b> {j.garmentType} <Typography.Text type="secondary">· {j.party} · {qty(j.balance)} to send · due {fmtDue(j)}</Typography.Text></span>,
                                                                        })),
                                                                    },
                                                                    { label: 'Items', options: items.map(i => ({ value: `item:${i.id}`, search: `${i.code} ${i.name} ${i.physicalNo || ''}`, label: <span><b>{i.code}</b> {i.name}</span> })) },
                                                                ]} />
                                                        </Form.Item>
                                                    ) : (
                                                        <Form.Item name={[f.name, 'item']} className="!mb-0">
                                                            <ItemSelect items={items} onChange={(v) => pickItem(idx, v as string)} placeholder={designNo ? 'Cut part (optional)' : 'No number yet'} />
                                                        </Form.Item>
                                                    )}
                                                    {direction === 'out' && <Form.Item name={[f.name, 'item']} hidden noStyle><Input type="hidden" /></Form.Item>}
                                                    {direction === 'out' && <Form.Item name={[f.name, 'job']} hidden noStyle><Input type="hidden" /></Form.Item>}
                                                    {job && <Typography.Text type={over ? 'warning' : 'secondary'} className="!text-xs block mt-0.5">{qty(job.balance)} left to send · due {fmtDue(job)}{over ? ' — more than left' : ''}</Typography.Text>}
                                                    {direction === 'in' && !id && !designNo && (line.description || line.quantity) ? <Tag color="gold" className="mt-1">Not numbered — link later</Tag> : null}
                                                    {st && tracked && <Typography.Text type={short ? 'danger' : 'secondary'} className="!text-xs block mt-0.5">In stock: {qty(st.balance)} {st.unit}{short ? ' — not enough' : ''}</Typography.Text>}
                                                </div>
                                                <Form.Item name={[f.name, 'description']} className="!mb-0"><Input placeholder={direction === 'in' && !id ? 'What came in' : 'Description'} maxLength={200} /></Form.Item>
                                                <Form.Item name={[f.name, 'styleNo']} className="!mb-0"><Input placeholder={designNo || '3341'} maxLength={40} /></Form.Item>
                                                <Form.Item name={[f.name, 'size']} className="!mb-0"><Input maxLength={20} /></Form.Item>
                                                <Form.Item name={[f.name, 'quantity']} className="!mb-0" rules={[{
                                                    validator: (_, v) => (v > 0 || !(line.item || line.description) ? Promise.resolve() : Promise.reject(new Error('Qty'))),
                                                }]}><InputNumber min={0} className="w-full" status={short ? 'warning' : undefined} /></Form.Item>
                                                <Form.Item name={[f.name, 'unit']} className="!mb-0"><Input maxLength={20} /></Form.Item>
                                                <Form.Item name={[f.name, 'bundles']} className="!mb-0"><InputNumber min={0} precision={0} className="w-full" /></Form.Item>
                                                <Form.Item name={[f.name, 'remark']} className="!mb-0"><Input maxLength={120} /></Form.Item>
                                                <Tooltip title="Remove line"><Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(f.name)} disabled={fields.length === 1} /></Tooltip>
                                            </div>
                                        );
                                    })}
                                    <div className="flex items-center justify-between border-t border-admin-border pt-2 px-1">
                                        <Button type="dashed" icon={<PlusOutlined />} onClick={() => add(blankLine())}>Add line</Button>
                                        <span className="font-semibold">Total qty: {qty(sum)}</span>
                                    </div>
                                    <CutListModal open={cutList} items={items} onClose={() => setCutList(false)} onAdd={(ls) => {
                                        const keep = (form.getFieldValue('lines') || []).filter((l: Partial<GatePassLine>) => l.item || l.description || l.quantity);
                                        form.setFieldValue('lines', [...keep, ...ls]);
                                        setCutList(false);
                                    }} />
                                </>
                            )}
                        </Form.List>
                    </div>
                </div>

                <Row gutter={12} className="mt-4">
                    <Col xs={24} md={8}><Form.Item name="checkedBy" label="Checked by"><Input maxLength={80} /></Form.Item></Col>
                    <Col xs={24} md={8}><Form.Item name="authorisedBy" label="Authorised by"><Input maxLength={80} /></Form.Item></Col>
                    <Col xs={24} md={8}><Form.Item name="note" label="Note"><Input maxLength={500} /></Form.Item></Col>
                </Row>
            </Form>
            <ItemFormModal open={newItemFor !== null} onClose={() => setNewItemFor(null)} onSaved={async (item) => {
                await reloadItems(true);
                const ls: Partial<GatePassLine>[] = form.getFieldValue('lines') || [];
                const target = newItemFor !== null && newItemFor >= 0 ? newItemFor : ls.findIndex(l => !l.item && !l.description && !l.quantity);
                if (target >= 0) { setTimeout(() => pickItem(target, item.id), 0); } else { form.setFieldValue('lines', [...ls, { ...blankLine(), item: item.id, description: item.name, unit: item.unit }]); }
                setNewItemFor(null);
            }} />
        </Drawer>
    );
};

// ── View ───────────────────────────────────────────────────────────
const GatePassView = ({ gp, onClose, onEdit, onCancelled }: { gp: GatePass | null; onClose: () => void; onEdit: (gp: GatePass) => void; onCancelled: () => void }) => {
    const { can } = useAuth();
    const act = useAction();
    const print = usePrint();
    const [reason, setReason] = useState('');
    if (!gp) return null;
    const text = DIR_TEXT[gp.direction];
    const cancel = async () => { if (await act(() => http.post(`/stores/gate-passes/${gp.id}/cancel`, { reason }), 'Gate pass cancelled')) onCancelled(); };
    return (
        <Drawer open onClose={onClose} width={860} title={<Space>{gp.number}{gp.status === 'cancelled' ? <Tag color="red">Cancelled</Tag> : <Tag color={gp.direction === 'out' ? 'volcano' : 'green'}>{text.title}</Tag>}</Space>}
            extra={<Space>
                <Button icon={<PrinterOutlined />} onClick={() => print(gp)}>Print</Button>
                {gp.status === 'posted' && can('stores.edit', 'stores.manage') && <Button icon={<EditOutlined />} onClick={() => onEdit(gp)}>Edit</Button>}
                {gp.status === 'posted' && can('stores.manage') && (
                    <Popconfirm title="Cancel this gate pass?" description={<Input placeholder="Reason" value={reason} onChange={e => setReason(e.target.value)} />} onConfirm={cancel} okText="Cancel gate pass" okButtonProps={{ danger: true }}>
                        <Button danger icon={<StopOutlined />}>Cancel</Button>
                    </Popconfirm>
                )}
            </Space>}>
            <Descriptions bordered size="small" column={2} className="mb-4">
                <Descriptions.Item label="Date">{fmtDate(gp.date)}</Descriptions.Item>
                <Descriptions.Item label="Book no">{gp.bookNo || '—'}</Descriptions.Item>
                <Descriptions.Item label={text.party} span={2}><b>{gp.party}</b></Descriptions.Item>
                {gp.job && typeof gp.job === 'object' && (
                    <Descriptions.Item label="Design job" span={2}>
                        <b>Design {gp.job.designNo}</b>{gp.job.garmentType ? ` · ${gp.job.garmentType}` : ''} · {qty(gp.jobQty)} garments · due {fmtDue(gp.job)}
                    </Descriptions.Item>
                )}
                <Descriptions.Item label="Contact person">{gp.contactPerson || '—'}</Descriptions.Item>
                <Descriptions.Item label="Invoice no">{gp.invoiceNo || '—'}</Descriptions.Item>
                <Descriptions.Item label="Vehicle no">{gp.vehicleNo || '—'}</Descriptions.Item>
                <Descriptions.Item label="Purpose">{gp.purpose || '—'}</Descriptions.Item>
                <Descriptions.Item label="Checked by">{gp.checkedBy || '—'}</Descriptions.Item>
                <Descriptions.Item label="Authorised by">{gp.authorisedBy || '—'}</Descriptions.Item>
                {gp.note && <Descriptions.Item label="Note" span={2}>{gp.note}</Descriptions.Item>}
                {gp.status === 'cancelled' && <Descriptions.Item label="Cancelled" span={2}>{gp.cancelReason || 'No reason given'}</Descriptions.Item>}
            </Descriptions>
            <Table<GatePassLine> rowKey={(r) => r._id || `${r.itemCode}-${r.description}-${r.size}-${r.quantity}`} size="small" pagination={false} dataSource={gp.lines}
                summary={() => <Table.Summary.Row><Table.Summary.Cell index={0} colSpan={4} align="right"><b>Total</b></Table.Summary.Cell><Table.Summary.Cell index={4} align="right"><b>{qty(totalQty(gp.lines))}</b></Table.Summary.Cell><Table.Summary.Cell index={5} colSpan={2} /></Table.Summary.Row>}
                columns={[
                    { title: 'S/No', width: 50, render: (_, __, i) => i + 1 },
                    { title: 'Item', width: 120, render: (_, l) => (l.itemCode ? <b>{l.itemCode}</b> : l.job ? <Tag color="blue">Design job</Tag> : gp.job ? '—' : <Tag color="gold">No number</Tag>) },
                    { title: 'Description', render: (_, l) => <span>{l.description}{l.styleNo && <Typography.Text type="secondary"> · Design {l.styleNo}</Typography.Text>}</span> },
                    { title: 'Size', dataIndex: 'size', width: 60 },
                    { title: 'Qty', width: 90, align: 'right', render: (_, l) => `${qty(l.quantity)} ${l.unit || ''}` },
                    { title: 'Bundles', dataIndex: 'bundles', width: 70, render: (b: number | null) => b ?? '' },
                    { title: 'Remark', dataIndex: 'remark' },
                ]} />
            <Typography.Paragraph type="secondary" className="mt-3 !mb-0">Written by {gp.createdBy?.name || '—'}{gp.createdAt ? ` on ${new Date(gp.createdAt).toLocaleString('en-GB')}` : ''}</Typography.Paragraph>
        </Drawer>
    );
};

// ── List page ──────────────────────────────────────────────────────
export function GatePassPage({ direction }: { direction: Direction }) {
    const text = DIR_TEXT[direction];
    const { can } = useAuth();
    const { message, modal } = App.useApp();
    const print = usePrint();
    const canEdit = can('stores.edit', 'stores.manage');
    const [search, setSearch] = useState('');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [status, setStatus] = useState<string | undefined>();
    const [page, setPage] = useState(1);
    const list = useList<GatePass>('/stores/gate-passes', { direction, search, from, to, status, page, limit: 25 });
    const [editorOpen, setEditorOpen] = useState(false);
    const [editing, setEditing] = useState<GatePass | null>(null);
    const [viewing, setViewing] = useState<GatePass | null>(null);
    const [params, setParams] = useSearchParams();
    const [preset, setPreset] = useState<EditorPreset | null>(null);
    // Opened from a design job: start a gate pass out for it.
    useEffect(() => {
        const jobId = params.get('job');
        if (!jobId || !canEdit) return;
        setPreset({ jobId, party: params.get('party') || '' });
        setEditing(null);
        setEditorOpen(true);
        setParams({}, { replace: true });
    }, [params, canEdit, setParams]);
    const month = today().slice(0, 7);
    const [stats, setStats] = useState<{ count: number; qty: number }>({ count: 0, qty: 0 });

    useEffect(() => {
        http.get<GatePass[]>('/stores/gate-passes', { direction, from: `${month}-01`, to: today(), status: 'posted', limit: 200 })
            .then(r => setStats({ count: r.pagination?.total ?? r.data.length, qty: r.data.reduce((s, g) => s + totalQty(g.lines), 0) }))
            .catch(() => undefined);
    }, [direction, month, list.data]);

    const open = async (row: GatePass) => {
        try { setViewing((await http.get<GatePass>(`/stores/gate-passes/${row.id}`)).data); } catch (err) { message.error(errorMessage(err)); }
    };

    return (
        <div>
            <PageHeader title={text.title} subtitle={text.subtitle}
                extra={canEdit && <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setPreset(null); setEditorOpen(true); loadItems(true); }}>New gate pass {text.short.toLowerCase()}</Button>} />
            <Row gutter={[16, 16]} className="mb-4">
                <Col xs={12} md={6}><Card className={cardClass()} size="small"><Statistic title="Gate passes this month" value={stats.count} /></Card></Col>
                <Col xs={12} md={6}><Card className={cardClass()} size="small"><Statistic title={`Quantity ${text.verb} this month`} value={stats.qty} /></Card></Col>
            </Row>
            <Card className={cardClass()}>
                <Space wrap className="mb-4">
                    <Input allowClear prefix={<SearchOutlined />} placeholder="Number, party, design no, invoice" className="w-72" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                    <Input type="date" value={from} onChange={e => { setFrom(e.target.value); setPage(1); }} className="w-40" aria-label="From" />
                    <Input type="date" value={to} onChange={e => { setTo(e.target.value); setPage(1); }} className="w-40" aria-label="To" />
                    <Select allowClear placeholder="Any status" className="w-36" value={status} onChange={v => { setStatus(v); setPage(1); }} options={[{ value: 'posted', label: 'Posted' }, { value: 'cancelled', label: 'Cancelled' }]} />
                </Space>
                <Table<GatePass> rowKey="id" loading={list.loading} dataSource={list.data} size="middle"
                    onRow={r => ({ onClick: () => open(r), className: 'cursor-pointer' })}
                    pagination={{ current: page, pageSize: 25, total: list.pagination?.total, onChange: setPage, showSizeChanger: false }}
                    locale={{ emptyText: <Empty description={`No gate passes ${direction} yet`} /> }}
                    columns={[
                        { title: 'GP no', dataIndex: 'number', width: 120, render: (n: string, r) => <span><b>{n}</b>{r.bookNo && <Typography.Text type="secondary" className="block text-xs">Book #{r.bookNo}</Typography.Text>}</span> },
                        { title: 'Date', dataIndex: 'date', width: 120, render: fmtDate },
                        { title: text.party, dataIndex: 'party', render: (p: string, r) => <span>{p}{r.contactPerson && <Typography.Text type="secondary" className="block text-xs">{r.contactPerson}</Typography.Text>}</span> },
                        { title: 'Items', render: (_, r) => <span className="text-sm">{lineSummary(r.lines)}</span> },
                        { title: 'Qty', width: 80, align: 'right', render: (_, r) => <b>{qty(totalQty(r.lines))}</b> },
                        { title: 'Invoice', dataIndex: 'invoiceNo', width: 100, render: (s: string) => s || '—' },
                        {
                            title: 'Status', dataIndex: 'status', width: 120, render: (s: string, r) => (s === 'cancelled' ? <Tag color="red">Cancelled</Tag>
                                : r.direction === 'in' && !r.job && r.lines.some(l => !l.item) ? <Tooltip title="Some lines have no item number yet"><Tag color="gold">To link</Tag></Tooltip> : <Tag color="green">Posted</Tag>),
                        },
                        {
                            title: '', width: 90, render: (_, r) => (
                                <Space size={0} onClick={e => e.stopPropagation()}>
                                    <Tooltip title="View"><Button type="text" icon={<EyeOutlined />} onClick={() => open(r)} /></Tooltip>
                                    <Tooltip title="Print"><Button type="text" icon={<PrinterOutlined />} onClick={() => print(r)} /></Tooltip>
                                </Space>
                            ),
                        },
                    ]} />
            </Card>
            <GatePassEditor direction={direction} open={editorOpen} editing={editing} preset={preset} onClose={() => setEditorOpen(false)}
                onSaved={(gp) => {
                    setEditorOpen(false);
                    list.reload();
                    if (!editing) {
                        modal.confirm({
                            title: `Gate pass ${gp.number} saved`,
                            content: 'Print it now?',
                            okText: 'Print', cancelText: 'Close', icon: <PrinterOutlined />, onOk: () => print(gp),
                        });
                    }
                    setEditing(null);
                }} />
            <GatePassView gp={viewing} onClose={() => setViewing(null)} onEdit={(gp) => { setViewing(null); setEditing(gp); setEditorOpen(true); }} onCancelled={() => { setViewing(null); list.reload(); }} />
        </div>
    );
}
