import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Alert, App, Button, Card, Col, Drawer, Form, Input, InputNumber, Popconfirm, Row, Select, Space, Switch, Table, Tag, Tooltip, Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined, ExperimentOutlined, PlusOutlined } from '@ant-design/icons';
import { http } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { cardClass, EmployeeSelect, label, PageHeader, RemoteSelect, rs, StatusTag, today, useAction, useList } from './lib';

export interface Component {
    id: string; name: string; code: string; type: 'earning' | 'deduction' | 'employer'; category: string; calculationType: string; value: number;
    percentageBase: string; baseComponent: string; formula: string; taxable: boolean; epfApplicable: boolean; etfApplicable: boolean;
    includeInGross: boolean; includeInNet: boolean; showOnPayslip: boolean; skipIfZero: boolean; displayOrder: number; description: string; system: boolean; active: boolean;
}

const CALC_TYPES = [
    { value: 'fixed', label: 'Fixed amount' }, { value: 'percentage', label: 'Percentage' }, { value: 'perDay', label: 'Per paid day' },
    { value: 'perAttendanceDay', label: 'Per day present' }, { value: 'perHour', label: 'Per hour worked' }, { value: 'formula', label: 'Formula' },
    { value: 'manual', label: 'Manual (entered each period)' }, { value: 'external', label: 'External / adjustment' },
];
const CATEGORIES = ['basic', 'allowance', 'overtime', 'bonus', 'commission', 'serviceCharge', 'external', 'noPay', 'late', 'loan', 'advance', 'statutory', 'tax', 'insurance', 'adjustment', 'other'];
const BASES = [{ value: 'basic', label: 'Basic salary' }, { value: 'gross', label: 'Gross salary' }, { value: 'component', label: 'Another component' }, { value: 'epfBase', label: 'EPF base' }, { value: 'taxableGross', label: 'Taxable gross' }];

/** Live formula check with sample values. */
export const FormulaTester = ({ formula }: { formula?: string }) => {
    const [result, setResult] = useState<{ ok: boolean; value?: number; expression?: string; error?: string } | null>(null);
    const [vars, setVars] = useState<{ name: string; description: string; kind: string }[]>([]);
    const [fns, setFns] = useState<string[]>([]);
    useEffect(() => {
        http.get<typeof vars>('/salary-components/variables').then((r) => { setVars(r.data); setFns((r as unknown as { functions: string[] }).functions || []); }).catch(() => undefined);
    }, []);
    const test = async () => {
        try {
            setResult((await http.post<NonNullable<typeof result>>('/salary-components/test-formula', { formula })).data);
        } catch (err) { setResult({ ok: false, error: (err as Error).message }); }
    };
    return (
        <div className="space-y-2">
            <Space>
                <Button size="small" icon={<ExperimentOutlined />} onClick={test} disabled={!formula}>Test formula</Button>
                {result && (result.ok
                    ? <Typography.Text type="success">= {result.value?.toLocaleString()} <Typography.Text type="secondary">({result.expression}, sample values)</Typography.Text></Typography.Text>
                    : <Typography.Text type="danger">{result.error}</Typography.Text>)}
            </Space>
            <details>
                <summary className="cursor-pointer text-xs text-admin-muted">Available variables and functions</summary>
                <div className="max-h-56 overflow-auto text-xs mt-2 space-y-1">
                    <div>{fns.map(f => <Tag key={f}>{f}</Tag>)}</div>
                    <div>Operators: + − × ÷ ( ) &lt; &gt; &lt;= &gt;= == != &amp;&amp; || condition ? a : b</div>
                    {vars.map(v => <div key={v.name}><code>{v.name}</code> — {v.description}</div>)}
                </div>
            </details>
        </div>
    );
};

export function SalaryComponentsPage() {
    const { can } = useAuth();
    const { modal } = App.useApp();
    const act = useAction();
    const [type, setType] = useState<string | undefined>();
    const { data, loading, reload } = useList<Component>('/salary-components', { type, limit: 200 });
    const [editing, setEditing] = useState<Component | null>(null);
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();
    const calcType = Form.useWatch('calculationType', form);
    const base = Form.useWatch('percentageBase', form);
    const formula = Form.useWatch('formula', form);
    const writable = can('salaryConfig.manage');

    const openForm = (c: Component | null) => {
        setEditing(c);
        form.resetFields();
        form.setFieldsValue(c || { type: 'earning', category: 'allowance', calculationType: 'fixed', value: 0, percentageBase: 'basic', taxable: true, includeInGross: true, includeInNet: true, showOnPayslip: true, skipIfZero: true, active: true, displayOrder: 30 });
        setOpen(true);
    };
    const save = async () => {
        const v = await form.validateFields();
        const r = await act(() => (editing ? http.put(`/salary-components/${editing.id}`, v) : http.post('/salary-components', v)), 'Component saved');
        if (r) { setOpen(false); reload(); }
    };

    const columns: ColumnsType<Component> = [
        { title: 'Order', dataIndex: 'displayOrder', width: 70 },
        { title: 'Code', dataIndex: 'code', width: 150, render: (c: string, r) => <Space><code>{c}</code>{r.system && <Tag>system</Tag>}</Space> },
        { title: 'Name', dataIndex: 'name' },
        { title: 'Type', dataIndex: 'type', width: 100, render: (t: string) => <Tag color={t === 'earning' ? 'green' : t === 'deduction' ? 'red' : 'blue'}>{label(t)}</Tag> },
        { title: 'Calculation', render: (_, c) => (c.calculationType === 'formula' ? <code className="text-xs">{c.formula}</code>
            : c.calculationType === 'percentage' ? `${c.value}% of ${c.percentageBase === 'component' ? c.baseComponent : label(c.percentageBase)}`
            : c.calculationType === 'fixed' ? rs(c.value) : `${CALC_TYPES.find(t => t.value === c.calculationType)?.label}${c.value ? ` (${c.value})` : ''}`) },
        { title: 'Flags', width: 200, render: (_, c) => <Space size={2} wrap>
            {c.taxable && <Tag>Taxable</Tag>}{c.epfApplicable && <Tag>EPF</Tag>}{c.etfApplicable && <Tag>ETF</Tag>}{!c.includeInGross && c.type === 'earning' && <Tag>Not in gross</Tag>}
        </Space> },
        { title: 'Status', dataIndex: 'active', width: 90, render: (a: boolean) => <StatusTag status={a ? 'active' : 'inactive'} /> },
        ...(writable ? [{
            title: '', width: 90, render: (_: unknown, c: Component) => <Space size={0}>
                <Button type="text" icon={<EditOutlined />} onClick={() => openForm(c)} />
                {!c.system && <Button type="text" danger icon={<DeleteOutlined />} onClick={() => modal.confirm({ title: `Delete ${c.code}?`, okType: 'danger', onOk: async () => { if (await act(() => http.delete(`/salary-components/${c.id}`), 'Deleted')) reload(); } })} />}
            </Space>,
        }] : []),
    ];

    return (
        <div>
            <PageHeader title="Salary Components" subtitle="Earnings, deductions and employer contributions. A component's code is also a formula variable."
                extra={writable && <Button type="primary" icon={<PlusOutlined />} onClick={() => openForm(null)}>Add component</Button>} />
            <Card className={cardClass()}>
                <Select allowClear placeholder="All types" className="w-40 mb-3" value={type} onChange={setType} options={['earning', 'deduction', 'employer'].map(v => ({ value: v, label: label(v) }))} />
                <Table rowKey="id" size="middle" loading={loading} columns={columns} dataSource={data} pagination={false} scroll={{ x: 1000 }} />
            </Card>
            <Drawer title={editing ? `Edit ${editing.code}` : 'New salary component'} open={open} onClose={() => setOpen(false)} width={Math.min(720, window.innerWidth)} destroyOnClose
                extra={<Button type="primary" onClick={save}>Save</Button>}>
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col xs={24} md={14}><Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col xs={24} md={10}><Form.Item name="code" label="Code" rules={[{ required: true }, { pattern: /^[A-Z][A-Z0-9_]*$/, message: 'Upper-case letters, numbers and _' }]}><Input disabled={editing?.system} /></Form.Item></Col>
                        <Col xs={12} md={8}><Form.Item name="type" label="Type"><Select options={[{ value: 'earning', label: 'Earning' }, { value: 'deduction', label: 'Deduction' }, { value: 'employer', label: 'Employer contribution' }]} /></Form.Item></Col>
                        <Col xs={12} md={8}><Form.Item name="category" label="Report category"><Select options={CATEGORIES.map(c => ({ value: c, label: label(c) }))} /></Form.Item></Col>
                        <Col xs={12} md={8}><Form.Item name="displayOrder" label="Order" extra="Lower first. Formulas can use components calculated before them."><InputNumber className="w-full" /></Form.Item></Col>
                        <Col xs={12} md={12}><Form.Item name="calculationType" label="Calculation"><Select options={CALC_TYPES} /></Form.Item></Col>
                        {['fixed', 'percentage', 'perDay', 'perAttendanceDay', 'perHour', 'manual'].includes(calcType) && (
                            <Col xs={12} md={12}><Form.Item name="value" label={calcType === 'percentage' ? 'Percentage %' : calcType === 'manual' ? 'Default amount' : 'Amount / rate'}><InputNumber className="w-full" min={0} /></Form.Item></Col>
                        )}
                        {calcType === 'percentage' && <>
                            <Col xs={12}><Form.Item name="percentageBase" label="Percentage of"><Select options={BASES} /></Form.Item></Col>
                            {base === 'component' && <Col xs={12}><Form.Item name="baseComponent" label="Component code"><Input /></Form.Item></Col>}
                        </>}
                        {calcType === 'formula' && <Col span={24}>
                            <Form.Item name="formula" label="Formula" rules={[{ required: true }]} extra="e.g. BasicSalary * 0.08, OTHours * OTRate, NoPayDays * DailyRate">
                                <Input.TextArea rows={2} className="font-mono" />
                            </Form.Item>
                            <FormulaTester formula={formula} />
                        </Col>}
                        {[['taxable', 'Taxable'], ['epfApplicable', 'EPF applicable'], ['etfApplicable', 'ETF applicable'], ['includeInGross', 'Include in gross'], ['includeInNet', 'Include in net'], ['showOnPayslip', 'Show on payslip'], ['skipIfZero', 'Hide when zero'], ['active', 'Active']].map(([k, l]) => (
                            <Col xs={12} md={6} key={k}><Form.Item name={k} label={l} valuePropName="checked"><Switch /></Form.Item></Col>
                        ))}
                        <Col span={24}><Form.Item name="description" label="Description"><Input.TextArea rows={2} /></Form.Item></Col>
                    </Row>
                </Form>
            </Drawer>
        </div>
    );
}

// ── Salary structures ───────────────────────────────────────────────
interface Line { _id?: string; component: Component | string; calculationType?: string | null; value?: number | null; formula?: string | null; percentageBase?: string | null; employeeEditable?: boolean }
interface Structure { id: string; name: string; code: string; description: string; payBasis: string; payFrequency: string; lines: Line[]; active: boolean }

export function SalaryStructuresPage() {
    const { can } = useAuth();
    const act = useAction();
    const { modal } = App.useApp();
    const { data, loading, reload } = useList<Structure>('/salary-structures', { limit: 200 });
    const { data: components } = useList<Component>('/salary-components', { active: 'true', limit: 300 });
    const [editing, setEditing] = useState<Structure | null>(null);
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();
    const [lines, setLines] = useState<Line[]>([]);
    const writable = can('salaryConfig.manage');
    const compById = useMemo(() => new Map(components.map(c => [c.id, c])), [components]);

    const openForm = (s: Structure | null) => {
        setEditing(s);
        form.resetFields();
        form.setFieldsValue(s || { payBasis: 'monthly', payFrequency: 'monthly', active: true });
        setLines((s?.lines || []).map(l => ({ ...l, component: typeof l.component === 'string' ? l.component : (l.component as Component).id || (l.component as unknown as { _id: string })._id })));
        setOpen(true);
    };
    const save = async () => {
        const v = await form.validateFields();
        const body = { ...v, lines: lines.map(l => ({ ...l, value: l.value ?? null, formula: l.formula || null, calculationType: l.calculationType || null })) };
        const r = await act(() => (editing ? http.put(`/salary-structures/${editing.id}`, body) : http.post('/salary-structures', body)), 'Structure saved');
        if (r) { setOpen(false); reload(); }
    };
    const setLine = (i: number, patch: Partial<Line>) => setLines(ls => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));

    return (
        <div>
            <PageHeader title="Salary Structures" subtitle="Templates such as monthly office, hourly restaurant or daily worker pay. Employees pick a structure and can override values."
                extra={writable && <Button type="primary" icon={<PlusOutlined />} onClick={() => openForm(null)}>Add structure</Button>} />
            <Row gutter={[16, 16]}>
                {data.map(s => (
                    <Col xs={24} lg={12} key={s.id}>
                        <Card className={cardClass()} loading={loading} title={<Space>{s.name}<Tag>{label(s.payBasis)}</Tag>{!s.active && <Tag>inactive</Tag>}</Space>}
                            extra={writable && <Space><Button size="small" icon={<EditOutlined />} onClick={() => openForm(s)}>Edit</Button>
                                <Button size="small" danger icon={<DeleteOutlined />} onClick={() => modal.confirm({ title: `Delete ${s.name}?`, okType: 'danger', onOk: async () => { if (await act(() => http.delete(`/salary-structures/${s.id}`), 'Deleted')) reload(); } })} /></Space>}>
                            <Typography.Paragraph type="secondary" className="text-xs">{s.description}</Typography.Paragraph>
                            <Table size="small" rowKey={(l) => String(l._id)} pagination={false} dataSource={s.lines} columns={[
                                { title: 'Component', render: (_, l) => { const c = l.component as Component; return <Space><Tag color={c.type === 'earning' ? 'green' : c.type === 'deduction' ? 'red' : 'blue'}>{c.code}</Tag>{c.name}</Space>; } },
                                { title: 'Calculation', render: (_, l) => { const c = l.component as Component; const f = l.formula || (l.calculationType ? null : c.formula); const t = l.calculationType || c.calculationType; const val = l.value ?? c.value;
                                    return f && t === 'formula' ? <code className="text-xs">{f}</code> : t === 'fixed' ? rs(val) : `${label(t)}${val ? ` ${val}` : ''}`; } },
                            ]} />
                        </Card>
                    </Col>
                ))}
            </Row>
            <Drawer title={editing ? `Edit ${editing.name}` : 'New salary structure'} open={open} onClose={() => setOpen(false)} width={Math.min(980, window.innerWidth)} destroyOnClose
                extra={<Button type="primary" onClick={save}>Save structure</Button>}>
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col xs={24} md={10}><Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col xs={12} md={6}><Form.Item name="code" label="Code" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col xs={12} md={4}><Form.Item name="payBasis" label="Pay basis"><Select options={['monthly', 'daily', 'hourly'].map(v => ({ value: v, label: label(v) }))} /></Form.Item></Col>
                        <Col xs={12} md={4}><Form.Item name="active" label="Active" valuePropName="checked"><Switch /></Form.Item></Col>
                        <Col span={24}><Form.Item name="description" label="Description"><Input /></Form.Item></Col>
                    </Row>
                </Form>
                <Alert type="info" showIcon className="mb-3" message="Leave value/formula empty to use the component's default. Earnings are calculated first, then deductions, then employer contributions; within each, by order." />
                <Table size="small" rowKey={(_, i) => String(i)} pagination={false} dataSource={lines} columns={[
                    { title: 'Component', width: 240, render: (_, l, i) => <Select className="w-full" showSearch optionFilterProp="label" value={l.component as string}
                        onChange={(v) => setLine(i, { component: v })} options={components.map(c => ({ value: c.id, label: `${c.code} — ${c.name}` }))} /> },
                    { title: 'Calculation', width: 170, render: (_, l, i) => <Select className="w-full" allowClear placeholder={label(compById.get(l.component as string)?.calculationType)}
                        value={l.calculationType || undefined} onChange={(v) => setLine(i, { calculationType: v || null })} options={CALC_TYPES} /> },
                    { title: 'Value', width: 120, render: (_, l, i) => <InputNumber className="w-full" placeholder={String(compById.get(l.component as string)?.value ?? '')} value={l.value ?? undefined} onChange={(v) => setLine(i, { value: v ?? null })} /> },
                    { title: 'Formula override', render: (_, l, i) => <Input className="font-mono" placeholder={compById.get(l.component as string)?.formula || ''} value={l.formula || ''} onChange={(e) => setLine(i, { formula: e.target.value || null })} /> },
                    { title: 'Per-employee', width: 100, render: (_, l, i) => <Tooltip title="Can be overridden on an employee's salary"><Switch checked={l.employeeEditable !== false} onChange={(v) => setLine(i, { employeeEditable: v })} /></Tooltip> },
                    { title: '', width: 50, render: (_, __, i) => <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setLines(ls => ls.filter((_x, j) => j !== i))} /> },
                ]} />
                <Button className="mt-3" icon={<PlusOutlined />} onClick={() => setLines(ls => [...ls, { component: '' }])}>Add component</Button>
                <div className="mt-4"><FormulaTester formula={lines.map(l => l.formula).filter(Boolean).slice(-1)[0] || ''} /></div>
            </Drawer>
        </div>
    );
}

// ── Employee salary revisions ──────────────────────────────────────
interface Revision {
    id: string; employee: { _id: string; fullName: string; employeeCode: string }; structure: { _id: string; name: string; payBasis: string };
    effectiveFrom: string; effectiveTo: string | null; basicSalary: number; dailyRate: number | null; hourlyRate: number | null; otRate: number | null;
    payFrequency: string; overrides: { component: { _id: string; code: string; name: string }; calculationType?: string; value?: number; formula?: string; enabled: boolean }[];
    additionalComponents: Revision['overrides']; reason: string; status: string; usedInPayroll: boolean; createdBy?: { name: string }; createdAt: string;
}

export function EmployeeSalaryPage() {
    const { can } = useAuth();
    const act = useAction();
    const [params, setParams] = useSearchParams();
    const employee = params.get('employee') || undefined;
    const { data, loading, reload } = useList<Revision>('/employee-salaries', employee ? { employee, limit: 100 } : { current: 'true', limit: 200 });
    const { data: components } = useList<Component>('/salary-components', { active: 'true', limit: 300 });
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();
    const [preview, setPreview] = useState<{ period: string; data?: { gross: number; net: number; items: { code: string; name: string; amount: number; type: string; calculation: { explanation: string } }[]; warnings: string[]; blockers: string[] } } | null>(null);
    const current = data.find(r => r.status === 'active' && !r.effectiveTo);

    const openForm = () => {
        form.resetFields();
        form.setFieldsValue({
            employee, effectiveFrom: today(), structure: current?.structure?._id, basicSalary: current?.basicSalary, dailyRate: current?.dailyRate, hourlyRate: current?.hourlyRate,
            otRate: current?.otRate, payFrequency: current?.payFrequency || 'monthly',
            overrides: current?.overrides.map(o => ({ ...o, component: o.component?._id })) || [],
            additionalComponents: current?.additionalComponents.map(o => ({ ...o, component: o.component?._id })) || [],
        });
        setOpen(true);
    };
    const save = async () => {
        const v = await form.validateFields();
        const r = await act(() => http.post('/employee-salaries', { ...v, employee: v.employee || employee }), 'Salary revision saved');
        if (r) { setOpen(false); reload(); }
    };
    const runPreview = async (period: string) => {
        const r = await act(() => http.post<NonNullable<typeof preview>['data']>('/payroll/preview', { employee, period }));
        setPreview({ period, data: r?.data });
    };

    const columns: ColumnsType<Revision> = [
        ...(!employee ? [{ title: 'Employee', render: (_: unknown, r: Revision) => <a onClick={() => setParams({ employee: r.employee._id })}>{r.employee.employeeCode} — {r.employee.fullName}</a> }] : []),
        { title: 'Structure', render: (_, r) => <Space>{r.structure?.name}<Tag>{label(r.structure?.payBasis)}</Tag></Space> },
        { title: 'Effective', render: (_, r) => `${r.effectiveFrom} → ${r.effectiveTo || 'current'}`, width: 210 },
        { title: 'Basic', dataIndex: 'basicSalary', render: rs, align: 'right' },
        { title: 'Rates (day / hour / OT)', render: (_, r) => [r.dailyRate, r.hourlyRate, r.otRate].map(x => (x == null ? '—' : x.toLocaleString())).join(' / '), width: 190 },
        { title: 'Overrides', render: (_, r) => <Space size={2} wrap>{[...r.overrides, ...r.additionalComponents].map((o, i) => <Tag key={i} color={o.enabled === false ? 'default' : 'gold'}>{o.component?.code}{o.enabled === false ? ' off' : o.value != null ? ` ${o.value}` : o.formula ? ' ƒ' : ''}</Tag>)}</Space> },
        { title: 'Status', render: (_, r) => <Space><StatusTag status={r.status} />{r.usedInPayroll && <Tag>used in payroll</Tag>}</Space>, width: 200 },
        { title: 'Reason', dataIndex: 'reason' },
        ...(employee && can('salary.edit') ? [{
            title: '', width: 60, render: (_: unknown, r: Revision) => !r.usedInPayroll && r.status !== 'cancelled' && (
                <Popconfirm title="Cancel this revision? The previous one becomes current again." onConfirm={async () => { if (await act(() => http.delete(`/employee-salaries/${r.id}`), 'Revision cancelled')) reload(); }}>
                    <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
            ),
        }] : []),
    ];

    const overrideList = (name: string, title: string) => (
        <Form.List name={name}>
            {(fields, { add, remove }) => (
                <div>
                    <Typography.Text strong>{title}</Typography.Text>
                    {fields.map(f => (
                        <Row gutter={8} key={f.key} className="mt-2">
                            <Col span={8}><Form.Item name={[f.name, 'component']} noStyle rules={[{ required: true }]}><Select className="w-full" showSearch optionFilterProp="label" options={components.map(c => ({ value: c.id, label: `${c.code} — ${c.name}` }))} placeholder="Component" /></Form.Item></Col>
                            <Col span={5}><Form.Item name={[f.name, 'value']} noStyle><InputNumber className="w-full" placeholder="Value" /></Form.Item></Col>
                            <Col span={7}><Form.Item name={[f.name, 'formula']} noStyle><Input placeholder="or formula" className="font-mono" /></Form.Item></Col>
                            <Col span={3}><Form.Item name={[f.name, 'enabled']} noStyle valuePropName="checked" initialValue><Switch checkedChildren="on" unCheckedChildren="off" /></Form.Item></Col>
                            <Col span={1}><Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(f.name)} /></Col>
                        </Row>
                    ))}
                    <Button size="small" className="mt-2" icon={<PlusOutlined />} onClick={() => add({ enabled: true })}>Add</Button>
                </div>
            )}
        </Form.List>
    );

    return (
        <div>
            <PageHeader title="Employee Salary" subtitle={employee ? 'Salary history — revisions are never overwritten; payroll uses the revision effective in each period' : 'Current salary of every employee'}
                extra={<>
                    <EmployeeSelect className="w-72" value={employee} onChange={(v) => setParams(v ? { employee: v as string } : {})} placeholder="Choose an employee" />
                    {employee && can('salary.edit') && <Button type="primary" icon={<PlusOutlined />} onClick={openForm}>New revision</Button>}
                </>} />
            <Card className={cardClass()}>
                <Table rowKey="id" loading={loading} columns={columns} dataSource={data} scroll={{ x: 1100 }} pagination={{ pageSize: 50, hideOnSinglePage: true }} />
            </Card>
            {employee && can('payroll.process', 'salary.view') && (
                <Card className={`${cardClass()} mt-4`} title="Calculation preview" extra={<Space>
                    <Input type="month" defaultValue={today().slice(0, 7)} onChange={(e) => e.target.value && runPreview(e.target.value)} className="w-40" />
                    <Button onClick={() => runPreview(preview?.period || today().slice(0, 7))}>Preview</Button>
                </Space>}>
                    {preview?.data ? <>
                        {preview.data.blockers.map(b => <Alert key={b} type="error" message={b} className="mb-2" />)}
                        {preview.data.warnings.map(w => <Alert key={w} type="warning" message={w} className="mb-2" />)}
                        <Table size="small" rowKey="code" pagination={false} dataSource={preview.data.items} columns={[
                            { title: 'Component', render: (_, i) => <Space><Tag color={i.type === 'earning' ? 'green' : i.type === 'deduction' ? 'red' : 'blue'}>{i.code}</Tag>{i.name}</Space> },
                            { title: 'How', render: (_, i) => <span className="text-xs whitespace-pre-line">{i.calculation?.explanation}</span> },
                            { title: 'Amount', dataIndex: 'amount', align: 'right', render: rs },
                        ]} footer={() => <b>Gross {rs(preview.data!.gross)} · Net {rs(preview.data!.net)}</b>} />
                    </> : <Typography.Text type="secondary">Pick a month to see how this employee's pay would be calculated from current data (nothing is saved).</Typography.Text>}
                </Card>
            )}
            <Drawer title="New salary revision" open={open} onClose={() => setOpen(false)} width={Math.min(820, window.innerWidth)} destroyOnClose extra={<Button type="primary" onClick={save}>Save revision</Button>}>
                <Alert className="mb-4" type="info" showIcon message="The current revision is closed the day before the new effective date. History is kept and earlier payrolls keep using the old salary." />
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col xs={24} md={12}><Form.Item name="structure" label="Salary structure" rules={[{ required: true }]}><RemoteSelect path="/salary-structures" query={{ active: 'true' }} /></Form.Item></Col>
                        <Col xs={12} md={6}><Form.Item name="effectiveFrom" label="Effective from" rules={[{ required: true }]}><Input type="date" /></Form.Item></Col>
                        <Col xs={12} md={6}><Form.Item name="payFrequency" label="Pay frequency"><Select options={['monthly', 'semi_monthly', 'weekly', 'daily'].map(v => ({ value: v, label: label(v) }))} /></Form.Item></Col>
                        <Col xs={12} md={6}><Form.Item name="basicSalary" label="Basic salary (monthly)" rules={[{ type: 'number', min: 0 }]}><InputNumber className="w-full" min={0} /></Form.Item></Col>
                        <Col xs={12} md={6}><Form.Item name="dailyRate" label="Daily rate" extra="Empty = basic ÷ working days"><InputNumber className="w-full" min={0} /></Form.Item></Col>
                        <Col xs={12} md={6}><Form.Item name="hourlyRate" label="Hourly rate" extra="Empty = daily ÷ hours"><InputNumber className="w-full" min={0} /></Form.Item></Col>
                        <Col xs={12} md={6}><Form.Item name="otRate" label="OT rate / hour" extra="Empty = hourly × OT multiplier"><InputNumber className="w-full" min={0} /></Form.Item></Col>
                        <Col span={24}>{overrideList('overrides', 'Override structure components (value, formula, or switch off)')}</Col>
                        <Col span={24} className="mt-4">{overrideList('additionalComponents', 'Extra components for this employee only')}</Col>
                        <Col span={24} className="mt-4"><Form.Item name="reason" label="Reason" rules={[{ required: true }]}><Input placeholder="e.g. Annual increment 2026" /></Form.Item></Col>
                    </Row>
                </Form>
            </Drawer>
        </div>
    );
}
