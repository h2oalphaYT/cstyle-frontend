import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    Alert, App, Badge, Button, Card, Col, Descriptions, Drawer, Dropdown, Empty, Form, Input, InputNumber, Modal, Row, Select, Space, Statistic, Table, Tabs, Tag, Timeline, Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    CheckCircleOutlined, DownloadOutlined, FilePdfOutlined, LockOutlined, PlusOutlined, ReloadOutlined, SendOutlined, StopOutlined, UnlockOutlined, WarningOutlined,
} from '@ant-design/icons';
import { http } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { cardClass, download, EmployeeSelect, label, OrgFilters, PageHeader, PAYMENT_METHODS, rs, StatusTag, thisPeriod, today, useAction, useList } from './lib';

interface Period { id: string; code: string; name: string; startDate: string; endDate: string; status: string; lockedBy?: { name: string }; lockedAt?: string }
interface Run {
    id: string; runNumber: string; periodCode: string; name: string; status: string; filters: Record<string, { name: string } | null | unknown[]>;
    totals?: { employees: number; gross: number; deductions: number; net: number; employer: number; warnings: number; errors: number };
    history: { status: string; by?: { name: string }; at: string; note: string }[]; createdBy?: { name: string }; calculatedAt?: string; finalizedAt?: string; notes: string;
}
interface Item { code: string; name: string; type: string; category: string; amount: number; source: string; calculation: { method: string; formula: string; expression: string; variables: Record<string, number>; explanation: string } }
interface Line {
    id: string; employee: string; snapshot: Record<string, string>; items: Item[]; gross: number; totalEarnings: number; totalDeductions: number; employerContributions: number; net: number;
    warnings: string[]; blockers: string[]; variables: Record<string, number>; attendance: Record<string, number>; payslipNumber: string;
    payment: { status: string; method: string; date?: string; reference?: string };
}

const filterText = (f: Run['filters']) => ['company', 'branch', 'hub', 'department', 'group'].map(k => (f?.[k] as { name?: string } | null)?.name).filter(Boolean).join(' · ') || 'All employees';

export function PayrollProcessingPage() {
    const { can } = useAuth();
    const { modal } = App.useApp();
    const act = useAction();
    const navigate = useNavigate();
    const periods = useList<Period>('/payroll/periods');
    const [periodFilter, setPeriodFilter] = useState<string | undefined>();
    const runs = useList<Run>('/payroll/runs', { period: periodFilter, limit: 100 });
    const [open, setOpen] = useState(false);
    const [filters, setFilters] = useState<Record<string, string | undefined>>({});
    const [form] = Form.useForm();
    const [busy, setBusy] = useState(false);

    const create = async () => {
        const v = await form.validateFields();
        setBusy(true);
        const r = await act(() => http.post<Run>('/payroll/runs', { period: v.period, name: v.name, notes: v.notes, filters: { ...filters, employees: v.employees } }));
        setBusy(false);
        if (r) {
            const skipped = (r as unknown as { skipped: string[] }).skipped || [];
            if (skipped.length) modal.warning({ title: `${skipped.length} employee(s) were not included`, content: <ul className="text-xs">{skipped.slice(0, 30).map(s => <li key={s}>{s}</li>)}</ul> });
            navigate(`/admin/hr/payroll/runs/${r.data.id}`);
        }
    };
    const lock = (p: Period, action: 'lock' | 'unlock') => {
        let reason = '';
        modal.confirm({
            title: action === 'lock' ? `Lock ${p.name}?` : `Unlock ${p.name}?`,
            content: action === 'lock'
                ? 'Attendance, salary and payroll for this month can no longer be changed directly. Corrections must go through adjustments.'
                : <Input placeholder="Reason for unlocking (required)" onChange={(e) => { reason = e.target.value; }} />,
            okType: action === 'unlock' ? 'danger' : 'primary',
            onOk: async () => { if (await act(() => http.patch(`/payroll/periods/${p.id}/${action}`, { reason }), action === 'lock' ? 'Period locked' : 'Period unlocked')) periods.reload(); },
        });
    };

    const runColumns: ColumnsType<Run> = [
        { title: 'Run', dataIndex: 'runNumber', render: (n: string, r) => <Link to={`/admin/hr/payroll/runs/${r.id}`}>{n}</Link>, width: 150 },
        { title: 'Period', dataIndex: 'periodCode', width: 90 },
        { title: 'Name / scope', render: (_, r) => <div>{r.name || '—'}<div className="text-xs text-gray-500">{filterText(r.filters)}</div></div> },
        { title: 'Employees', render: (_, r) => r.totals?.employees ?? '—', width: 100 },
        ...(can('salary.view') ? [
            { title: 'Gross', render: (_: unknown, r: Run) => rs(r.totals?.gross), align: 'right' as const },
            { title: 'Net', render: (_: unknown, r: Run) => <b>{rs(r.totals?.net)}</b>, align: 'right' as const },
        ] : []),
        { title: 'Issues', width: 90, render: (_, r) => (r.totals?.errors ? <Tag color="red">{r.totals.errors} errors</Tag> : r.totals?.warnings ? <Tag color="orange">{r.totals.warnings}</Tag> : '—') },
        { title: 'Status', dataIndex: 'status', width: 120, render: (s: string) => <StatusTag status={s} /> },
    ];

    return (
        <div>
            <PageHeader title="Payroll Processing" subtitle="Draft → Calculated → Under review → Approved → Finalized → Paid"
                extra={can('payroll.process') && <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); form.setFieldsValue({ period: thisPeriod() }); setFilters({}); setOpen(true); }}>New payroll run</Button>} />
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={8}>
                    <Card className={cardClass()} title="Payroll periods" size="small">
                        <Table size="small" rowKey="id" loading={periods.loading} dataSource={periods.data} pagination={{ pageSize: 12, hideOnSinglePage: true }}
                            onRow={(p) => ({ onClick: () => setPeriodFilter(periodFilter === p.code ? undefined : p.code), className: `cursor-pointer ${periodFilter === p.code ? 'bg-yellow-50 dark:bg-gray-700' : ''}` })}
                            columns={[
                                { title: 'Month', render: (_, p) => <div>{p.name}<div className="text-xs text-gray-500">{p.code}</div></div> },
                                { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusTag status={s} /> },
                                ...(can('payroll.lock') ? [{
                                    title: '', width: 50, render: (_: unknown, p: Period) => p.status === 'locked'
                                        ? <Button size="small" type="text" icon={<UnlockOutlined />} title="Unlock" onClick={(e) => { e.stopPropagation(); lock(p, 'unlock'); }} />
                                        : <Button size="small" type="text" icon={<LockOutlined />} title="Lock" onClick={(e) => { e.stopPropagation(); lock(p, 'lock'); }} />,
                                }] : []),
                            ]} />
                    </Card>
                </Col>
                <Col xs={24} lg={16}>
                    <Card className={cardClass()} title={periodFilter ? `Runs for ${periodFilter}` : 'All payroll runs'} size="small"
                        extra={periodFilter && <Button size="small" onClick={() => setPeriodFilter(undefined)}>Show all</Button>}>
                        <Table rowKey="id" size="small" loading={runs.loading} dataSource={runs.data} columns={runColumns} scroll={{ x: 800 }} pagination={{ pageSize: 20, hideOnSinglePage: true }} />
                    </Card>
                </Col>
            </Row>
            <Modal title="New payroll run" open={open} onCancel={() => setOpen(false)} onOk={create} okText="Create and calculate" confirmLoading={busy} width={640} destroyOnClose>
                <Form form={form} layout="vertical">
                    <Row gutter={12}>
                        <Col span={10}><Form.Item name="period" label="Payroll month" rules={[{ required: true }]}><Input type="month" /></Form.Item></Col>
                        <Col span={14}><Form.Item name="name" label="Name"><Input placeholder="e.g. October 2026 — Head office" /></Form.Item></Col>
                    </Row>
                    <Typography.Text strong>Who to include</Typography.Text>
                    <div className="flex flex-wrap gap-2 my-2"><OrgFilters value={filters} onChange={setFilters} /></div>
                    <Form.Item name="employees" label="Only these employees (optional)"><EmployeeSelect mode="multiple" /></Form.Item>
                    <Form.Item name="notes" label="Notes"><Input.TextArea rows={2} /></Form.Item>
                    <Alert type="info" showIcon message="Employees already in another active run for the same month are skipped, so nobody is paid twice." />
                </Form>
            </Modal>
        </div>
    );
}

const Breakdown = ({ line }: { line: Line }) => {
    const groups: [string, string][] = [['earning', 'Earnings'], ['deduction', 'Deductions'], ['employer', 'Employer contributions']];
    return (
        <div className="space-y-4">
            {line.blockers.map(b => <Alert key={b} type="error" showIcon message={b} />)}
            {line.warnings.map(w => <Alert key={w} type="warning" showIcon message={w} />)}
            {groups.map(([type, title]) => {
                const items = line.items.filter(i => i.type === type);
                if (!items.length) return null;
                return (
                    <Card key={type} size="small" title={title}>
                        <Table size="small" rowKey="code" pagination={false} dataSource={items} expandable={{
                            expandedRowRender: (i) => (
                                <div className="text-xs space-y-1">
                                    <div className="whitespace-pre-line">{i.calculation?.explanation}</div>
                                    {i.calculation?.formula && <div>Formula: <code>{i.calculation.formula}</code></div>}
                                    {i.calculation?.expression && <div>With values: <code>{i.calculation.expression}</code></div>}
                                    {i.calculation?.variables && Object.keys(i.calculation.variables).length > 0 && <div>{Object.entries(i.calculation.variables).map(([k, v]) => <Tag key={k}>{k} = {v}</Tag>)}</div>}
                                    <div className="text-gray-500">Source: {label(i.source)} · method: {label(i.calculation?.method)}</div>
                                </div>
                            ),
                        }} columns={[
                            { title: 'Component', render: (_, i) => <span>{i.name} <code className="text-xs text-gray-500">{i.code}</code></span> },
                            { title: 'Calculation', render: (_, i) => <span className="text-xs">{i.calculation?.explanation?.split('\n')[0]}</span> },
                            { title: 'Amount', dataIndex: 'amount', align: 'right', render: rs, width: 140 },
                        ]} />
                    </Card>
                );
            })}
            <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label="Gross salary">{rs(line.gross)}</Descriptions.Item>
                <Descriptions.Item label="Total deductions">{rs(line.totalDeductions)}</Descriptions.Item>
                <Descriptions.Item label="Net salary"><b>{rs(line.net)}</b></Descriptions.Item>
                <Descriptions.Item label="Employer cost">{rs(line.gross + line.employerContributions)}</Descriptions.Item>
            </Descriptions>
            <Card size="small" title="Inputs used">
                <div className="flex flex-wrap gap-1">{Object.entries(line.variables || {}).filter(([k, v]) => typeof v === 'number' && !/^[A-Z0-9_]+$/.test(k)).map(([k, v]) => <Tag key={k}>{k}: {v}</Tag>)}</div>
            </Card>
        </div>
    );
};

export function PayrollRunPage() {
    const { id = '' } = useParams();
    const { can } = useAuth();
    const { modal, message } = App.useApp();
    const act = useAction();
    const [run, setRun] = useState<Run | null>(null);
    const [lines, setLines] = useState<Line[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [onlyIssues, setOnlyIssues] = useState(false);
    const [viewing, setViewing] = useState<Line | null>(null);
    const [selected, setSelected] = useState<string[]>([]);
    const [payOpen, setPayOpen] = useState(false);
    const [payForm] = Form.useForm();

    const load = async () => {
        setLoading(true);
        const r = await act(() => http.get<Run>(`/payroll/runs/${id}`));
        if (r) setRun(r.data);
        if (can('salary.view')) {
            const l = await act(() => http.get<Line[]>(`/payroll/runs/${id}/employees`));
            if (l) setLines(l.data);
        }
        setLoading(false);
    };
    useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const action = async (path: string, body: object = {}, success = 'Done') => {
        const r = await act(() => http.post(`/payroll/runs/${id}/${path}`, body), success);
        if (r) load();
    };
    const withNote = (title: string, path: string, success: string, required = false, danger = false, content?: string) => {
        let note = '';
        modal.confirm({
            title, okType: danger ? 'danger' : 'primary',
            content: <div className="space-y-2">{content && <p>{content}</p>}<Input.TextArea placeholder={required ? 'Reason (required)' : 'Note (optional)'} onChange={(e) => { note = e.target.value; }} /></div>,
            onOk: async () => {
                if (required && !note) { message.error('Please give a reason'); throw new Error('reason'); }
                await action(path, { note, reason: note }, success);
            },
        });
    };
    const pay = async () => {
        const v = await payForm.validateFields();
        const r = await act(() => http.post(`/payroll/runs/${id}/payments`, { ...v, lineIds: selected }), 'Payments recorded');
        if (r) { setPayOpen(false); setSelected([]); load(); }
    };

    const filtered = useMemo(() => lines.filter(l => (!onlyIssues || l.blockers.length || l.warnings.length)
        && (!search || `${l.snapshot.employeeCode} ${l.snapshot.fullName} ${l.snapshot.department}`.toLowerCase().includes(search.toLowerCase()))), [lines, onlyIssues, search]);

    if (!run) return <Card loading={loading} />;
    const s = run.status;
    const editable = ['draft', 'calculated', 'under_review'].includes(s);
    const columns: ColumnsType<Line> = [
        { title: 'Employee', fixed: 'left', render: (_, l) => <a onClick={() => setViewing(l)}>{l.snapshot.employeeCode} — {l.snapshot.fullName}</a> },
        { title: 'Department', render: (_, l) => l.snapshot.department || '—' },
        { title: 'Basis', render: (_, l) => label(l.snapshot.payBasis), width: 90 },
        { title: 'Days', render: (_, l) => `${l.variables?.PresentDays ?? 0}${l.variables?.NoPayDays ? ` / -${l.variables.NoPayDays}` : ''}`, width: 80 },
        { title: 'OT h', render: (_, l) => l.variables?.OTHours || '', width: 60 },
        { title: 'Gross', dataIndex: 'gross', align: 'right', render: rs },
        { title: 'Deductions', dataIndex: 'totalDeductions', align: 'right', render: rs },
        { title: 'Net', dataIndex: 'net', align: 'right', render: (n: number) => <b>{rs(n)}</b> },
        { title: 'Issues', width: 80, render: (_, l) => (l.blockers.length ? <Tag color="red" icon={<WarningOutlined />}>{l.blockers.length}</Tag> : l.warnings.length ? <Tag color="orange">{l.warnings.length}</Tag> : '') },
        { title: 'Payment', width: 110, render: (_, l) => <StatusTag status={l.payment?.status} /> },
        {
            title: '', width: 60, fixed: 'right', render: (_, l) => ['finalized', 'paid'].includes(s) || can('payroll.view')
                ? <Button type="text" icon={<FilePdfOutlined />} title="Payslip" onClick={() => download(`/payslips/${l.id}/pdf`).catch(e => message.error(e.message))} /> : null,
        },
    ];

    const exportMenu = {
        items: [
            { key: 'xlsx', label: 'Excel (all components)' }, { key: 'summary', label: 'Excel (summary)' }, { key: 'csv', label: 'CSV' }, { key: 'pdf', label: 'PDF' },
        ],
        onClick: ({ key }: { key: string }) => download(`/payroll/runs/${id}/export?format=${key === 'summary' ? 'xlsx&detail=false' : key}`).catch(e => message.error(e.message)),
    };

    return (
        <div>
            <PageHeader title={`${run.runNumber}${run.name ? ` — ${run.name}` : ''}`} subtitle={<Space><StatusTag status={s} /><span>{run.periodCode}</span><span>{filterText(run.filters)}</span></Space>}
                extra={<>
                    <Link to="/admin/hr/payroll"><Button>Back</Button></Link>
                    {editable && can('payroll.process') && <Button icon={<ReloadOutlined />} onClick={() => action('calculate', {}, 'Recalculated')}>Recalculate</Button>}
                    {s === 'calculated' && can('payroll.process') && <Button icon={<SendOutlined />} onClick={() => withNote('Send for review?', 'submit', 'Submitted for review')}>Submit for review</Button>}
                    {['calculated', 'under_review'].includes(s) && can('payroll.approve') && <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => withNote('Approve this payroll?', 'approve', 'Approved')}>Approve</Button>}
                    {['under_review', 'approved'].includes(s) && can('payroll.approve') && <Button onClick={() => withNote('Send back for changes?', 'return', 'Returned', true)}>Send back</Button>}
                    {s === 'approved' && can('payroll.finalize') && <Button type="primary" danger icon={<LockOutlined />} onClick={() => withNote('Finalize payroll?', 'finalize', 'Payroll finalized', false, false,
                        'Finalizing locks this payroll, records loan / advance recoveries and numbers the payslips. Later corrections must use adjustments.')}>Finalize</Button>}
                    {['finalized', 'paid'].includes(s) && can('payroll.pay') && <Button onClick={() => { payForm.resetFields(); payForm.setFieldsValue({ status: 'paid', method: 'bank_transfer', date: today() }); setPayOpen(true); }}>Record payment{selected.length ? ` (${selected.length})` : 's'}</Button>}
                    {can('payroll.export') && <Dropdown menu={exportMenu}><Button icon={<DownloadOutlined />}>Export</Button></Dropdown>}
                    {can('payslip.view') && <Button icon={<FilePdfOutlined />} onClick={() => download(`/payroll/runs/${id}/payslips.pdf`).catch(e => message.error(e.message))}>All payslips</Button>}
                    {!['cancelled', 'paid'].includes(s) && can(s === 'finalized' ? 'payroll.finalize' : 'payroll.process') && <Button danger icon={<StopOutlined />}
                        onClick={() => withNote(s === 'finalized' ? 'Reverse this finalized payroll?' : 'Cancel this payroll run?', 'cancel', s === 'finalized' ? 'Payroll reversed' : 'Cancelled', true, true,
                            s === 'finalized' ? 'Only possible while unpaid and the period is not locked. Loan / advance recoveries are restored.' : undefined)}>{s === 'finalized' ? 'Reverse' : 'Cancel'}</Button>}
                </>} />
            {run.totals && (
                <Row gutter={[12, 12]} className="mb-4">
                    {[['Employees', run.totals.employees, false], ['Gross', run.totals.gross, true], ['Deductions', run.totals.deductions, true], ['Net pay', run.totals.net, true], ['Employer contributions', run.totals.employer, true]].map(([t, v, m]) => (
                        <Col xs={12} md={Math.floor(24 / 5)} key={t as string} flex="1"><Card size="small" className={cardClass()}><Statistic title={t as string} value={v as number} precision={m ? 2 : 0} prefix={m ? 'Rs' : undefined} /></Card></Col>
                    ))}
                </Row>
            )}
            {(run.totals?.errors || 0) > 0 && <Alert type="error" showIcon className="mb-3" message={`${run.totals!.errors} problem(s) must be fixed before approval (missing bank details, negative net pay, formula errors…). Fix the data, then Recalculate.`} />}
            <Tabs items={[
                {
                    key: 'employees', label: `Employees (${lines.length})`, children: can('salary.view') ? (
                        <Card className={cardClass()}>
                            <Space className="mb-3" wrap>
                                <Input.Search allowClear placeholder="Search employee" onChange={(e) => setSearch(e.target.value)} className="w-64" />
                                <Button type={onlyIssues ? 'primary' : 'default'} onClick={() => setOnlyIssues(!onlyIssues)}>Only with issues</Button>
                            </Space>
                            <Table rowKey="id" size="small" loading={loading} columns={columns} dataSource={filtered} scroll={{ x: 1200 }} pagination={{ pageSize: 50 }}
                                rowSelection={['finalized', 'paid'].includes(s) && can('payroll.pay') ? { selectedRowKeys: selected, onChange: (k) => setSelected(k as string[]) } : undefined}
                                summary={(rows) => (
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0} colSpan={(['finalized', 'paid'].includes(s) && can('payroll.pay') ? 6 : 5)}><b>Total ({rows.length})</b></Table.Summary.Cell>
                                        <Table.Summary.Cell index={1} align="right"><b>{rs(rows.reduce((a, r) => a + r.gross, 0))}</b></Table.Summary.Cell>
                                        <Table.Summary.Cell index={2} align="right"><b>{rs(rows.reduce((a, r) => a + r.totalDeductions, 0))}</b></Table.Summary.Cell>
                                        <Table.Summary.Cell index={3} align="right"><b>{rs(rows.reduce((a, r) => a + r.net, 0))}</b></Table.Summary.Cell>
                                    </Table.Summary.Row>
                                )} />
                        </Card>
                    ) : <Empty description="Your role cannot see salary amounts" />,
                },
                {
                    key: 'history', label: 'History', children: (
                        <Card className={cardClass()}>
                            <Timeline items={run.history.map(h => ({ children: <span><StatusTag status={h.status} /> {new Date(h.at).toLocaleString()} by {h.by?.name || 'system'}{h.note ? ` — ${h.note}` : ''}</span> }))} />
                        </Card>
                    ),
                },
            ]} />
            <Drawer title={viewing ? `${viewing.snapshot.fullName} — ${run.periodCode}` : ''} open={!!viewing} onClose={() => setViewing(null)} width={Math.min(860, window.innerWidth)}
                extra={viewing && <Button icon={<FilePdfOutlined />} onClick={() => download(`/payslips/${viewing.id}/pdf`).catch(e => message.error(e.message))}>Payslip</Button>}>
                {viewing && <Breakdown line={viewing} />}
            </Drawer>
            <Modal title={`Record payment for ${selected.length || 'all'} employee(s)`} open={payOpen} onCancel={() => setPayOpen(false)} onOk={pay} destroyOnClose>
                <Alert type="info" showIcon className="mb-3" message="This records payment status only. Bank transfers are made outside the system (use Export → bank payment report)." />
                <Form form={payForm} layout="vertical">
                    <Form.Item name="status" label="Status"><Select options={['pending', 'processing', 'paid', 'failed', 'cancelled'].map(v => ({ value: v, label: label(v) }))} /></Form.Item>
                    <Form.Item name="method" label="Method"><Select options={PAYMENT_METHODS} /></Form.Item>
                    <Form.Item name="date" label="Payment date"><Input type="date" /></Form.Item>
                    <Form.Item name="reference" label="Reference (transfer / cheque no.)"><Input /></Form.Item>
                    <Form.Item name="note" label="Note"><Input /></Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

// ── Adjustments ─────────────────────────────────────────────────────
interface Adjustment { id: string; employee: { fullName: string; employeeCode: string }; originalPeriod: string; targetPeriod: string; type: string; amount: number; reason: string; status: string; createdBy?: { name: string } }

export function AdjustmentsPage() {
    const { can } = useAuth();
    const act = useAction();
    const { data, loading, reload } = useList<Adjustment>('/payroll/adjustments', { limit: 300 });
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();
    const save = async () => {
        const v = await form.validateFields();
        if (await act(() => http.post('/payroll/adjustments', v), 'Adjustment saved')) { setOpen(false); reload(); }
    };
    return (
        <div>
            <PageHeader title="Payroll Adjustments" subtitle="Corrections to a finalized or locked month are paid or recovered in a later month's payroll; the original payroll is never changed."
                extra={can('payroll.adjust') && <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setOpen(true); }}>New adjustment</Button>} />
            <Card className={cardClass()}>
                <Table rowKey="id" loading={loading} dataSource={data} pagination={{ pageSize: 50 }} columns={[
                    { title: 'Employee', render: (_, a) => `${a.employee?.employeeCode} — ${a.employee?.fullName}` },
                    { title: 'For', dataIndex: 'originalPeriod', width: 90 }, { title: 'Applied in', dataIndex: 'targetPeriod', width: 100 },
                    { title: 'Type', dataIndex: 'type', render: (t: string) => <Tag color={t === 'earning' ? 'green' : 'red'}>{t === 'earning' ? 'Pay extra' : 'Recover'}</Tag>, width: 110 },
                    { title: 'Amount', dataIndex: 'amount', render: rs, align: 'right' }, { title: 'Reason', dataIndex: 'reason' },
                    { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusTag status={s} />, width: 100 },
                    ...(can('payroll.adjust') ? [{ title: '', width: 60, render: (_: unknown, a: Adjustment) => a.status !== 'applied' && a.status !== 'cancelled' && <Button type="text" danger icon={<StopOutlined />} onClick={async () => { if (await act(() => http.patch(`/payroll/adjustments/${a.id}/cancel`), 'Cancelled')) reload(); }} /> }] : []),
                ]} />
            </Card>
            <Modal title="New adjustment" open={open} onCancel={() => setOpen(false)} onOk={save} destroyOnClose>
                <Form form={form} layout="vertical">
                    <Form.Item name="employee" label="Employee" rules={[{ required: true }]}><EmployeeSelect /></Form.Item>
                    <Row gutter={12}>
                        <Col span={12}><Form.Item name="originalPeriod" label="Month being corrected" rules={[{ required: true }]}><Input type="month" /></Form.Item></Col>
                        <Col span={12}><Form.Item name="targetPeriod" label="Apply in month" rules={[{ required: true }]}><Input type="month" /></Form.Item></Col>
                        <Col span={12}><Form.Item name="type" label="Type" rules={[{ required: true }]}><Select options={[{ value: 'earning', label: 'Pay the employee more' }, { value: 'deduction', label: 'Recover from the employee' }]} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="amount" label="Amount" rules={[{ required: true }]}><InputNumber min={0.01} className="w-full" /></Form.Item></Col>
                    </Row>
                    <Form.Item name="reason" label="Reason" rules={[{ required: true }]}><Input.TextArea rows={2} /></Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

// ── Payslips ────────────────────────────────────────────────────────
interface PayslipRow { id: string; periodCode: string; payslipNumber: string; snapshot: { employeeCode: string; fullName: string; department: string }; net: number; gross: number; payment: { status: string } }

export function PayslipsPage() {
    const { message } = App.useApp();
    const [period, setPeriod] = useState<string | undefined>();
    const [employee, setEmployee] = useState<string | undefined>();
    const { can } = useAuth();
    const { data, loading } = useList<PayslipRow>('/payslips', { period, employee });
    return (
        <div>
            <PageHeader title="Payslips" subtitle="Payslips are issued when a payroll is finalized" />
            <Card className={cardClass()}>
                <Space wrap className="mb-3">
                    <Input type="month" value={period} onChange={(e) => setPeriod(e.target.value || undefined)} className="w-40" />
                    {can('payslip.view') && <EmployeeSelect className="w-64" value={employee} onChange={(v) => setEmployee(v as string)} />}
                </Space>
                <Table rowKey="id" loading={loading} dataSource={data} pagination={{ pageSize: 50 }} columns={[
                    { title: 'Payslip', dataIndex: 'payslipNumber', width: 160 }, { title: 'Month', dataIndex: 'periodCode', width: 90 },
                    { title: 'Employee', render: (_, p) => `${p.snapshot.employeeCode} — ${p.snapshot.fullName}` }, { title: 'Department', render: (_, p) => p.snapshot.department },
                    { title: 'Net pay', dataIndex: 'net', render: rs, align: 'right' }, { title: 'Payment', render: (_, p) => <StatusTag status={p.payment?.status} />, width: 110 },
                    {
                        title: '', width: 150, render: (_, p) => <Space>
                            <Button size="small" icon={<FilePdfOutlined />} onClick={() => download(`/payslips/${p.id}/pdf`).catch(e => message.error(e.message))}>View</Button>
                            <Button size="small" icon={<DownloadOutlined />} onClick={() => download(`/payslips/${p.id}/pdf?download=1`).catch(e => message.error(e.message))} />
                        </Space>,
                    },
                ]} />
            </Card>
        </div>
    );
}

// ── Reports ─────────────────────────────────────────────────────────
interface ReportDef { key: string; title: string }
interface ReportResult { title: string; columns: { key: string; header: string; type?: string }[]; rows: Record<string, unknown>[]; summary?: [string, number][] }

export function ReportsPage() {
    const { message } = App.useApp();
    const act = useAction();
    const { data: reports } = useList<ReportDef>('/payroll/reports');
    const [type, setType] = useState<string>('monthly-payroll');
    const [filters, setFilters] = useState<Record<string, string | undefined>>({ from: `${thisPeriod()}-01`, to: today() });
    const [result, setResult] = useState<ReportResult | null>(null);
    const [loading, setLoading] = useState(false);
    const qs = () => new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][]).toString();
    const run = async () => {
        setLoading(true);
        const r = await act(() => http.get<ReportResult>(`/payroll/reports/${type}?${qs()}`));
        setLoading(false);
        if (r) setResult(r.data);
    };
    useEffect(() => { if (reports.length) run(); }, [type, reports.length]); // eslint-disable-line react-hooks/exhaustive-deps
    const exp = (format: string) => download(`/payroll/reports/${type}?${qs()}&format=${format}`).catch(e => message.error(e.message));

    return (
        <div>
            <PageHeader title="Payroll & HR Reports" extra={<>
                <Button icon={<DownloadOutlined />} onClick={() => exp('xlsx')}>Excel</Button>
                <Button icon={<FilePdfOutlined />} onClick={() => exp('pdf')}>PDF</Button>
                <Button onClick={() => exp('csv')}>CSV</Button>
            </>} />
            <Card className={cardClass()}>
                <Space wrap className="mb-3">
                    <Select className="w-64" value={type} onChange={setType} showSearch optionFilterProp="label" options={reports.map(r => ({ value: r.key, label: r.title }))} />
                    <Input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
                    <Input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
                    <EmployeeSelect className="w-56" value={filters.employee} onChange={(v) => setFilters({ ...filters, employee: v as string })} />
                    <OrgFilters value={filters} onChange={setFilters} />
                    <Input placeholder="Status" className="w-32" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })} />
                    <Button type="primary" onClick={run} loading={loading}>Run report</Button>
                </Space>
                {result && <>
                    <Typography.Title level={5}>{result.title} <Badge count={result.rows.length} overflowCount={99999} color="#999" /></Typography.Title>
                    <Table size="small" loading={loading} rowKey={(_, i) => String(i)} dataSource={result.rows} scroll={{ x: Math.max(800, result.columns.length * 120) }} pagination={{ pageSize: 50 }}
                        columns={result.columns.map(c => ({ title: c.header, dataIndex: c.key, align: c.type === 'money' || c.type === 'number' ? 'right' as const : undefined, render: (v: unknown) => (c.type === 'money' ? rs(v as number) : v as string) }))} />
                    {result.summary?.length ? <Space className="mt-2" wrap>{result.summary.map(([l, v]) => <Tag key={l}>{l}: {typeof v === 'number' ? v.toLocaleString('en-LK', { maximumFractionDigits: 2 }) : v}</Tag>)}</Space> : null}
                </>}
            </Card>
        </div>
    );
}
