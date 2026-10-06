import { useState } from 'react';
import { App, Button, Card, Col, Drawer, Form, Input, InputNumber, Modal, Row, Select, Space, Table, Tag, Upload } from 'antd';
import { CheckOutlined, CloseOutlined, DeleteOutlined, PlusOutlined, ScheduleOutlined, StopOutlined, UploadOutlined } from '@ant-design/icons';
import { http } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { cardClass, EmployeeSelect, label, PageHeader, PAYMENT_METHODS, RemoteSelect, rs, StatusTag, thisPeriod, today, upload, useAction, useList } from './lib';

type Emp = { _id: string; fullName: string; employeeCode: string };
const empText = (e?: Emp) => (e ? `${e.employeeCode} — ${e.fullName}` : '—');

// ── Advances & loans ────────────────────────────────────────────────
interface Advance { id: string; kind: string; employee: Emp; reference: string; amount: number; interestRate: number; totalPayable: number; installmentCount: number; installmentAmount: number; date: string; startPeriod: string; endPeriod: string; reason: string; status: string; recovered: number; balance: number; approvedBy?: { name: string } }
interface Installment { id: string; sequence: number; period: string; amount: number; status: string }

export function AdvancesPage({ kind }: { kind: 'advance' | 'loan' }) {
    const { can } = useAuth();
    const { modal } = App.useApp();
    const act = useAction();
    const path = kind === 'loan' ? '/loans' : '/advances';
    const [status, setStatus] = useState<string | undefined>();
    const { data, loading, reload } = useList<Advance>(path, { status, limit: 300 });
    const [open, setOpen] = useState(false);
    const [schedule, setSchedule] = useState<{ adv: Advance; rows: Installment[] } | null>(null);
    const [form] = Form.useForm();
    const writable = can(kind === 'loan' ? 'loan.manage' : 'advance.manage');
    const title = kind === 'loan' ? 'Loans' : 'Salary Advances';

    const save = async () => {
        const v = await form.validateFields();
        if (await act(() => http.post(path, v), 'Saved — approve it to schedule the deductions')) { setOpen(false); reload(); }
    };
    const showSchedule = async (adv: Advance) => {
        const r = await act(() => http.get<Installment[]>(`${path}/${adv.id}/schedule`));
        if (r) setSchedule({ adv, rows: r.data });
    };

    return (
        <div>
            <PageHeader title={title} subtitle="Approved installments are deducted automatically in each payroll and marked recovered when the payroll is finalized."
                extra={writable && <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); form.setFieldsValue({ date: today(), startPeriod: thisPeriod(), installmentCount: kind === 'loan' ? 12 : 1, interestRate: 0 }); setOpen(true); }}>New {kind}</Button>} />
            <Card className={cardClass()}>
                <Select allowClear placeholder="Status" className="w-40 mb-3" value={status} onChange={setStatus} options={['pending', 'approved', 'active', 'settled', 'rejected', 'cancelled'].map(s => ({ value: s, label: label(s) }))} />
                <Table rowKey="id" loading={loading} dataSource={data} scroll={{ x: 1100 }} pagination={{ pageSize: 50 }} columns={[
                    { title: 'Ref', dataIndex: 'reference', width: 110 },
                    { title: 'Employee', render: (_, a) => empText(a.employee) },
                    { title: 'Date', dataIndex: 'date', width: 110 },
                    { title: 'Amount', dataIndex: 'amount', align: 'right', render: rs },
                    ...(kind === 'loan' ? [{ title: 'Interest', dataIndex: 'interestRate', width: 80, render: (r: number) => `${r}%` }] : []),
                    { title: 'Installment', render: (_, a) => `${rs(a.installmentAmount)} × ${a.installmentCount}`, width: 170 },
                    { title: 'Months', render: (_, a) => `${a.startPeriod} → ${a.endPeriod}`, width: 150 },
                    { title: 'Recovered', dataIndex: 'recovered', align: 'right', render: rs },
                    { title: 'Balance', dataIndex: 'balance', align: 'right', render: (b: number) => <b>{rs(b)}</b> },
                    { title: 'Status', dataIndex: 'status', width: 100, render: (s: string) => <StatusTag status={s} /> },
                    {
                        title: '', width: 120, render: (_, a) => <Space size={0}>
                            <Button type="text" icon={<ScheduleOutlined />} onClick={() => showSchedule(a)} title="Schedule" />
                            {writable && a.status === 'pending' && <Button type="text" icon={<CheckOutlined className="text-green-600" />} title="Approve" onClick={async () => { if (await act(() => http.patch(`${path}/${a.id}/approve`), 'Approved and scheduled')) reload(); }} />}
                            {writable && !['settled', 'cancelled', 'rejected'].includes(a.status) && <Button type="text" danger icon={<StopOutlined />} title="Cancel" onClick={() => modal.confirm({
                                title: `Cancel ${a.reference}?`, content: 'Remaining scheduled installments are cancelled.', okType: 'danger',
                                onOk: async () => { if (await act(() => http.patch(`${path}/${a.id}/cancel`, {}), 'Cancelled')) reload(); },
                            })} />}
                        </Space>,
                    },
                ]} />
            </Card>
            <Modal title={`New ${kind}`} open={open} onCancel={() => setOpen(false)} onOk={save} destroyOnClose>
                <Form form={form} layout="vertical">
                    <Form.Item name="employee" label="Employee" rules={[{ required: true }]}><EmployeeSelect /></Form.Item>
                    <Row gutter={12}>
                        <Col span={12}><Form.Item name="amount" label="Amount" rules={[{ required: true }]}><InputNumber min={1} className="w-full" /></Form.Item></Col>
                        <Col span={12}><Form.Item name="date" label="Date" rules={[{ required: true }]}><Input type="date" /></Form.Item></Col>
                        {kind === 'loan' && <Col span={12}><Form.Item name="interestRate" label="Flat interest %"><InputNumber min={0} max={100} className="w-full" /></Form.Item></Col>}
                        {kind === 'loan' && <Col span={12}><Form.Item name="loanType" label="Loan type"><Input placeholder="e.g. Festival loan" /></Form.Item></Col>}
                        <Col span={12}><Form.Item name="installmentCount" label="Number of installments" rules={[{ required: true }]}><InputNumber min={1} max={120} className="w-full" /></Form.Item></Col>
                        <Col span={12}><Form.Item name="startPeriod" label="First deduction month" rules={[{ required: true }]}><Input type="month" /></Form.Item></Col>
                    </Row>
                    <Form.Item name="reason" label="Reason"><Input.TextArea rows={2} /></Form.Item>
                </Form>
            </Modal>
            <Drawer title={schedule ? `${schedule.adv.reference} schedule` : ''} open={!!schedule} onClose={() => setSchedule(null)} width={480}>
                {schedule && <Table size="small" rowKey="id" pagination={false} dataSource={schedule.rows} columns={[
                    { title: '#', dataIndex: 'sequence', width: 50 }, { title: 'Month', dataIndex: 'period' }, { title: 'Amount', dataIndex: 'amount', render: rs, align: 'right' },
                    { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusTag status={s} /> },
                    ...(writable ? [{ title: '', render: (_: unknown, i: Installment) => i.status === 'scheduled' && <Button size="small" onClick={async () => { if (await act(() => http.patch(`${path}/${schedule.adv.id}/installments/${i.id}/skip`, {}), 'Skipped')) showSchedule(schedule.adv); }}>Skip month</Button> }] : []),
                ]} />}
            </Drawer>
        </div>
    );
}

// ── One-off allowances / bonuses / deductions ──────────────────────
interface Entry { id: string; employee: Emp; period: string; component: { name: string; code: string; type: string; category: string }; amount: number; quantity?: number; rate?: number; note: string; status: string }

export function PayrollEntriesPage({ kind }: { kind: 'allowance' | 'bonus' | 'deduction' }) {
    const { can } = useAuth();
    const act = useAction();
    const [period, setPeriod] = useState(thisPeriod());
    const { data, loading, reload } = useList<Entry>('/payroll-entries', { period, limit: 500 });
    const rows = data.filter(e => (kind === 'deduction' ? e.component?.type === 'deduction' : kind === 'bonus' ? e.component?.category === 'bonus' : e.component?.type === 'earning' && e.component?.category !== 'bonus'));
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();
    const titles = { allowance: 'Allowances', bonus: 'Bonuses', deduction: 'Deductions' };
    const query: Record<string, string> = kind === 'deduction' ? { type: 'deduction', active: 'true' } : kind === 'bonus' ? { category: 'bonus', active: 'true' } : { type: 'earning', active: 'true' };
    const save = async () => {
        const v = await form.validateFields();
        if (await act(() => http.post('/payroll-entries', v), 'Saved')) { setOpen(false); reload(); }
    };
    return (
        <div>
            <PageHeader title={titles[kind]} subtitle={`One-off ${kind === 'deduction' ? 'deductions' : 'earnings'} for a payroll month (service charge, commission, performance bonus, uniform deduction…). Recurring amounts belong on the salary.`}
                extra={<>
                    <Input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} className="w-40" />
                    {can('payrollEntry.manage') && <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); form.setFieldsValue({ period }); setOpen(true); }}>Add</Button>}
                </>} />
            <Card className={cardClass()}>
                <Table rowKey="id" loading={loading} dataSource={rows} pagination={{ pageSize: 50 }} scroll={{ x: 800 }} columns={[
                    { title: 'Employee', render: (_, e) => empText(e.employee) },
                    { title: 'Component', render: (_, e) => <Tag>{e.component?.name}</Tag> },
                    { title: 'Month', dataIndex: 'period', width: 100 },
                    { title: 'Amount', dataIndex: 'amount', align: 'right', render: (a: number, e) => <span>{rs(a)}{e.quantity != null && e.rate != null ? <span className="text-xs text-admin-muted"> ({e.quantity} × {e.rate})</span> : ''}</span> },
                    { title: 'Note', dataIndex: 'note' },
                    { title: 'Status', dataIndex: 'status', width: 110, render: (s: string) => <StatusTag status={s} /> },
                    ...(can('payrollEntry.manage') ? [{ title: '', width: 60, render: (_: unknown, e: Entry) => e.status !== 'processed' && <Button type="text" danger icon={<DeleteOutlined />} onClick={async () => { if (await act(() => http.delete(`/payroll-entries/${e.id}`), 'Deleted')) reload(); }} /> }] : []),
                ]} summary={(r) => <Table.Summary.Row><Table.Summary.Cell index={0} colSpan={3}><b>Total</b></Table.Summary.Cell><Table.Summary.Cell index={1} align="right"><b>{rs(r.reduce((s, e) => s + e.amount, 0))}</b></Table.Summary.Cell></Table.Summary.Row>} />
            </Card>
            <Modal title={`Add ${kind}`} open={open} onCancel={() => setOpen(false)} onOk={save} destroyOnClose>
                <Form form={form} layout="vertical">
                    <Form.Item name="employee" label="Employee" rules={[{ required: true }]}><EmployeeSelect /></Form.Item>
                    <Row gutter={12}>
                        <Col span={14}><Form.Item name="component" label="Component" rules={[{ required: true }]}><RemoteSelect path="/salary-components" query={query} /></Form.Item></Col>
                        <Col span={10}><Form.Item name="period" label="Payroll month" rules={[{ required: true }]}><Input type="month" /></Form.Item></Col>
                        <Col span={8}><Form.Item name="quantity" label="Qty (optional)"><InputNumber className="w-full" /></Form.Item></Col>
                        <Col span={8}><Form.Item name="rate" label="Rate (optional)"><InputNumber className="w-full" /></Form.Item></Col>
                        <Col span={8}><Form.Item name="amount" label="Amount" extra="Empty = qty × rate"><InputNumber className="w-full" min={0} /></Form.Item></Col>
                    </Row>
                    <Form.Item name="note" label="Note"><Input /></Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

// ── External payments ───────────────────────────────────────────────
interface External { id: string; employee: Emp; paymentType: string; amount: number; date: string; paymentMethod: string; referenceNumber: string; reason: string; period?: string; payrollTreatment: string; status: string; approvedBy?: { name: string }; attachments: { _id: string; name: string }[] }

export function ExternalPaymentsPage() {
    const { can } = useAuth();
    const act = useAction();
    const [status, setStatus] = useState<string | undefined>();
    const { data, loading, reload } = useList<External>('/external-payments', { status, limit: 300 });
    const [open, setOpen] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [form] = Form.useForm();
    const save = async () => {
        const v = await form.validateFields();
        const fd = new FormData();
        Object.entries(v).forEach(([k, val]) => { if (val !== undefined && val !== null && val !== '') fd.append(k, String(val)); });
        files.forEach(f => fd.append('attachments', f));
        if (await act(() => upload('/external-payments', fd), 'Recorded — another user must approve it')) { setOpen(false); setFiles([]); reload(); }
    };
    return (
        <div>
            <PageHeader title="External Payments" subtitle="Cash, special payments, reimbursements made outside normal payroll. Kept separately auditable; optionally shown on the payslip."
                extra={can('externalPayment.manage') && <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); form.setFieldsValue({ date: today(), paymentMethod: 'cash', payrollTreatment: 'none' }); setOpen(true); }}>Record payment</Button>} />
            <Card className={cardClass()}>
                <Select allowClear placeholder="Status" className="w-40 mb-3" value={status} onChange={setStatus} options={['pending', 'approved', 'rejected', 'processed'].map(s => ({ value: s, label: label(s) }))} />
                <Table rowKey="id" loading={loading} dataSource={data} scroll={{ x: 1100 }} pagination={{ pageSize: 50 }} columns={[
                    { title: 'Date', dataIndex: 'date', width: 110 },
                    { title: 'Employee', render: (_, x) => empText(x.employee) },
                    { title: 'Type', dataIndex: 'paymentType', render: label },
                    { title: 'Amount', dataIndex: 'amount', align: 'right', render: rs },
                    { title: 'Method / ref', render: (_, x) => `${label(x.paymentMethod)}${x.referenceNumber ? ` · ${x.referenceNumber}` : ''}` },
                    { title: 'Payroll', render: (_, x) => (x.payrollTreatment === 'none' ? 'Not in payroll' : `${x.payrollTreatment === 'earning' ? 'Adds to pay' : 'Shown as paid'} · ${x.period}`) },
                    { title: 'Status', dataIndex: 'status', width: 110, render: (s: string) => <StatusTag status={s} /> },
                    { title: 'Approved by', render: (_, x) => x.approvedBy?.name || '—', width: 120 },
                    ...(can('externalPayment.approve') ? [{
                        title: '', width: 90, render: (_: unknown, x: External) => x.status === 'pending' && <Space size={0}>
                            <Button type="text" icon={<CheckOutlined className="text-green-600" />} onClick={async () => { if (await act(() => http.patch(`/external-payments/${x.id}/approve`), 'Approved')) reload(); }} />
                            <Button type="text" danger icon={<CloseOutlined />} onClick={async () => { if (await act(() => http.patch(`/external-payments/${x.id}/reject`), 'Rejected')) reload(); }} />
                        </Space>,
                    }] : []),
                ]} />
            </Card>
            <Modal title="Record external payment" open={open} onCancel={() => setOpen(false)} onOk={save} destroyOnClose>
                <Form form={form} layout="vertical">
                    <Form.Item name="employee" label="Employee" rules={[{ required: true }]}><EmployeeSelect /></Form.Item>
                    <Row gutter={12}>
                        <Col span={12}><Form.Item name="paymentType" label="Type" rules={[{ required: true }]}><RemoteSelect path="/hr/lookups" query={{ category: 'externalPaymentType', active: 'true' }} labelKey="label" valueKey="code" /></Form.Item></Col>
                        <Col span={12}><Form.Item name="amount" label="Amount" rules={[{ required: true }]}><InputNumber min={0.01} className="w-full" /></Form.Item></Col>
                        <Col span={12}><Form.Item name="date" label="Date paid" rules={[{ required: true }]}><Input type="date" /></Form.Item></Col>
                        <Col span={12}><Form.Item name="paymentMethod" label="Method"><Select options={PAYMENT_METHODS} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="referenceNumber" label="Reference no."><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="period" label="Payroll month"><Input type="month" /></Form.Item></Col>
                    </Row>
                    <Form.Item name="payrollTreatment" label="In payroll">
                        <Select options={[{ value: 'none', label: 'Keep separate (not on payslip)' }, { value: 'earning', label: 'Add to this month’s pay (earning)' }, { value: 'paid_outside', label: 'Show on payslip as already paid (deduct from net)' }]} />
                    </Form.Item>
                    <Form.Item name="reason" label="Reason"><Input.TextArea rows={2} /></Form.Item>
                    <Upload beforeUpload={(f) => { setFiles(fs => [...fs, f]); return false; }} onRemove={(f) => setFiles(fs => fs.filter(x => x.name !== f.name))} accept=".pdf,.jpg,.jpeg,.png">
                        <Button icon={<UploadOutlined />}>Attach payment proof</Button>
                    </Upload>
                </Form>
            </Modal>
        </div>
    );
}
