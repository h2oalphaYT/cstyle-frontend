import { useEffect, useMemo, useState } from 'react';
import {
    Alert, Button, Card, Checkbox, Col, Collapse, Divider, Drawer, Form, Input, InputNumber, Modal, Popconfirm, Row, Select, Space, Switch, Table, Tabs, Tag, Typography,
} from 'antd';
import { DeleteOutlined, EditOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { http } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { cardClass, EmployeeSelect, label, OrgSelect, PageHeader, PAYMENT_METHODS, RemoteSelect, StatusTag, useAction, useList } from './lib';

type Values = Record<string, unknown>;
interface SettingsData { defaults: Values; global: Values; companies: { _id: string; scopeRef: { _id: string; name: string; code: string }; values: Values }[] }

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d, i) => ({ value: i, label: d }));

/** Settings fields shared by the global form and company overrides. */
const SettingFields = ({ override = false }: { override?: boolean }) => {
    const num = (name: string, text: string, extra: { min?: number; max?: number; help?: string; step?: number } = {}) => (
        <Col xs={24} md={8}><Form.Item name={name} label={text} help={extra.help}><InputNumber className="w-full" min={extra.min ?? 0} max={extra.max} step={extra.step} placeholder={override ? 'Use global' : undefined} /></Form.Item></Col>
    );
    const sw = (name: string, text: string) => (
        <Col xs={24} md={8}><Form.Item name={name} label={text} valuePropName="checked"><Switch /></Form.Item></Col>
    );
    return (
        <Collapse defaultActiveKey={['work', 'pay']} items={[
            {
                key: 'work', label: 'Working time & attendance', children: <Row gutter={12}>
                    {num('workingDaysPerMonth', 'Working days per month', { min: 1, max: 31, help: 'Daily rate = basic ÷ this' })}
                    {num('workingHoursPerDay', 'Working hours per day', { min: 1, max: 24, step: 0.5 })}
                    <Col xs={24} md={8}><Form.Item name="weeklyOffDays" label="Weekly off days"><Select mode="multiple" options={DAYS} placeholder={override ? 'Use global' : undefined} /></Form.Item></Col>
                    <Col xs={12} md={4}><Form.Item name="workdayStart" label="Day starts"><Input type="time" /></Form.Item></Col>
                    <Col xs={12} md={4}><Form.Item name="workdayEnd" label="Day ends"><Input type="time" /></Form.Item></Col>
                    {num('defaultBreakMinutes', 'Break (minutes)')}
                    {num('lateGraceMinutes', 'Late grace (minutes)')}
                    {num('earlyLeaveGraceMinutes', 'Early-leave grace (minutes)')}
                    {num('attendanceRoundingMinutes', 'Round worked time down to (minutes)')}
                    {num('halfDayMinHours', 'Half day if worked at least (hours)', { step: 0.5 })}
                    <Col xs={24} md={8}><Form.Item name="missingAttendance" label="Scheduled day with no record"><Select options={[{ value: 'ignore', label: 'Ignore (count as worked)' }, { value: 'absent', label: 'Treat as absent / no pay' }]} allowClear={override} /></Form.Item></Col>
                    {sw('allowLeaveBeyondBalance', 'Allow leave beyond balance')}
                    {num('leaveYearStartMonth', 'Leave year starts (month)', { min: 1, max: 12 })}
                </Row>,
            },
            {
                key: 'ot', label: 'Overtime', children: <Row gutter={12}>
                    {sw('autoOvertimeFromAttendance', 'Create OT from attendance automatically')}
                    {num('otMinimumMinutes', 'Minimum OT (minutes)')}
                    {num('defaultOtMultiplier', 'Default OT multiplier', { step: 0.25 })}
                </Row>,
            },
            {
                key: 'pay', label: 'Pay & statutory', children: <Row gutter={12}>
                    {num('epfEmployeeRate', 'EPF employee %', { max: 100, step: 0.5 })}
                    {num('epfEmployerRate', 'EPF employer %', { max: 100, step: 0.5 })}
                    {num('etfRate', 'ETF %', { max: 100, step: 0.5 })}
                    <Col xs={24} md={8}><Form.Item name="roundNetTo" label="Round net pay to"><Select allowClear={override} options={[{ value: 0, label: 'Cents' }, { value: 1, label: 'Nearest rupee' }, { value: 10, label: 'Nearest 10' }, { value: 100, label: 'Nearest 100' }]} /></Form.Item></Col>
                    {num('payrollDay', 'Pay day of month', { min: 1, max: 31 })}
                    <Col xs={24} md={8}><Form.Item name="payFrequency" label="Pay frequency"><Select allowClear={override} options={['monthly', 'weekly', 'biweekly', 'daily'].map(v => ({ value: v, label: label(v) }))} /></Form.Item></Col>
                    <Col xs={24} md={8}><Form.Item name="defaultPaymentMethod" label="Default payment method"><Select allowClear={override} options={PAYMENT_METHODS} /></Form.Item></Col>
                    {sw('requireBankForBankTransfer', 'Block payroll if bank details are missing')}
                    <Col xs={24} md={8}><Form.Item name="currency" label="Currency"><Input maxLength={3} /></Form.Item></Col>
                </Row>,
            },
            {
                key: 'payslip', label: 'Company details & payslip', children: <Row gutter={12}>
                    <Col xs={24} md={12}><Form.Item name="companyName" label="Name on payslip"><Input /></Form.Item></Col>
                    <Col xs={24} md={12}><Form.Item name="companyAddress" label="Address on payslip"><Input /></Form.Item></Col>
                    <Col xs={24}><Form.Item name="payslipFooter" label="Payslip footer"><Input /></Form.Item></Col>
                </Row>,
            },
            {
                key: 'validation', label: 'Validation', children: <Row gutter={12}>
                    <Col xs={24} md={12}><Form.Item name="nicPattern" label="NIC pattern (regular expression)"><Input /></Form.Item></Col>
                    <Col xs={24} md={12}><Form.Item name="bankAccountPattern" label="Bank account pattern (regular expression)"><Input /></Form.Item></Col>
                </Row>,
            },
        ]} />
    );
};

const clean = (v: Values) => Object.fromEntries(Object.entries(v).filter(([, x]) => x !== undefined && x !== null && x !== ''));

const GeneralSettings = () => {
    const act = useAction();
    const [form] = Form.useForm();
    const [data, setData] = useState<SettingsData | null>(null);
    const [company, setCompany] = useState<string | undefined>();
    const [companyForm] = Form.useForm();
    const load = () => act(() => http.get<SettingsData>('/payroll/settings')).then(r => { if (r) { setData(r.data); form.setFieldsValue(r.data.global); } });
    useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        companyForm.resetFields();
        if (company && data) companyForm.setFieldsValue(data.companies.find(c => c.scopeRef?._id === company)?.values || {});
    }, [company, data]); // eslint-disable-line react-hooks/exhaustive-deps

    const saveGlobal = async () => { if (await act(() => http.put('/payroll/settings', { scope: 'global', values: clean(form.getFieldsValue(true)) }), 'Settings saved')) load(); };
    const saveCompany = async () => { if (await act(() => http.put('/payroll/settings', { scope: 'company', scopeRef: company, values: clean(companyForm.getFieldsValue(true)) }), 'Company settings saved')) load(); };

    if (!data) return <Card loading />;
    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} xl={14}>
                <Card className={cardClass()} title="Global defaults" extra={<Button type="primary" onClick={saveGlobal}>Save</Button>}>
                    <Alert type="info" showIcon className="mb-3" message="Order of precedence: global → company → employee group → employee. Changes apply to payroll calculated from now on; finalized payroll is never recalculated." />
                    <Form form={form} layout="vertical"><SettingFields /></Form>
                </Card>
            </Col>
            <Col xs={24} xl={10}>
                <Card className={cardClass()} title="Company overrides" extra={company && <Button type="primary" onClick={saveCompany}>Save</Button>}>
                    <OrgSelect type="company" className="w-full mb-3" value={company} onChange={(v) => setCompany(v as string)} placeholder="Choose a company" />
                    {data.companies.length > 0 && <div className="mb-3">{data.companies.map(c => <Tag key={c._id} className="cursor-pointer" onClick={() => setCompany(c.scopeRef?._id)}>{c.scopeRef?.name}: {Object.keys(c.values).length} override(s)</Tag>)}</div>}
                    {company ? <Form form={companyForm} layout="vertical"><Typography.Paragraph type="secondary">Leave a field empty to use the global value.</Typography.Paragraph><SettingFields override /></Form>
                        : <Typography.Text type="secondary">Pick a company to override settings for it only. Employee groups have their own overrides on the Groups page.</Typography.Text>}
                </Card>
            </Col>
        </Row>
    );
};

// ── Roles ───────────────────────────────────────────────────────────
interface Role { id: string; code: string; name: string; description: string; permissions: string[]; dataScope: string; active: boolean; system: boolean }
interface Perm { key: string; label: string }

const RolesTab = () => {
    const act = useAction();
    const roles = useList<Role>('/payroll/roles', { limit: 100 });
    const perms = useList<Perm>('/payroll/permissions');
    const [editing, setEditing] = useState<Role | 'new' | null>(null);
    const [form] = Form.useForm();
    const groups = useMemo(() => {
        const g = new Map<string, Perm[]>();
        perms.data.forEach(p => { const k = p.key.split('.')[0]; g.set(k, [...(g.get(k) || []), p]); });
        return [...g.entries()];
    }, [perms.data]);
    const open = (r: Role | 'new') => {
        setEditing(r);
        form.resetFields();
        form.setFieldsValue(r === 'new' ? { dataScope: 'all', active: true, permissions: [] } : r);
    };
    const save = async () => {
        const v = await form.validateFields();
        const ok = editing === 'new' ? await act(() => http.post('/payroll/roles', v), 'Role created') : await act(() => http.put(`/payroll/roles/${(editing as Role).id}`, v), 'Role saved');
        if (ok) { setEditing(null); roles.reload(); }
    };
    return (
        <Card className={cardClass()} extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => open('new')}>New role</Button>} title="Roles & permissions">
            <Table rowKey="id" loading={roles.loading} dataSource={roles.data} pagination={false} columns={[
                { title: 'Role', render: (_, r) => <div><b>{r.name}</b> {r.system && <Tag>built-in</Tag>}<div className="text-xs text-admin-muted">{r.description}</div></div> },
                { title: 'Sees', dataIndex: 'dataScope', render: (s: string) => ({ all: 'All employees', department: 'Own department', team: 'Own team', own: 'Only themselves' } as Record<string, string>)[s] || s, width: 140 },
                { title: 'Permissions', render: (_, r) => r.permissions.length, width: 110 },
                { title: 'Status', render: (_, r) => <StatusTag status={r.active ? 'active' : 'inactive'} />, width: 100 },
                {
                    title: '', width: 100, render: (_, r) => <Space>
                        <Button type="text" icon={<EditOutlined />} onClick={() => open(r)} />
                        {!r.system && <Popconfirm title="Delete role?" onConfirm={async () => { if (await act(() => http.delete(`/payroll/roles/${r.id}`), 'Deleted')) roles.reload(); }}><Button type="text" danger icon={<DeleteOutlined />} /></Popconfirm>}
                    </Space>,
                },
            ]} />
            <Drawer title={editing === 'new' ? 'New role' : `Edit ${(editing as Role)?.name || ''}`} open={!!editing} onClose={() => setEditing(null)} width={Math.min(720, window.innerWidth)}
                extra={<Button type="primary" onClick={save}>Save</Button>}>
                <Form form={form} layout="vertical">
                    <Row gutter={12}>
                        <Col span={8}><Form.Item name="code" label="Code" rules={[{ required: true }]}><Input disabled={editing !== 'new' && (editing as Role)?.system} /></Form.Item></Col>
                        <Col span={16}><Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={24}><Form.Item name="description" label="Description"><Input /></Form.Item></Col>
                        <Col span={16}><Form.Item name="dataScope" label="Which employees can they see?"><Select options={[{ value: 'all', label: 'All employees' }, { value: 'department', label: 'Their own department' }, { value: 'team', label: 'People who report to them' }, { value: 'own', label: 'Only themselves' }]} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="active" label="Active" valuePropName="checked"><Switch /></Form.Item></Col>
                    </Row>
                    <Form.Item name="permissions">
                        <Checkbox.Group className="w-full">
                            {groups.map(([g, list]) => (
                                <div key={g} className="mb-3">
                                    <Divider orientation="left" plain className="!my-2">{label(g.replace(/([A-Z])/g, ' $1'))}</Divider>
                                    <Row>{list.map(p => <Col xs={24} md={12} key={p.key}><Checkbox value={p.key}>{p.label}</Checkbox></Col>)}</Row>
                                </div>
                            ))}
                        </Checkbox.Group>
                    </Form.Item>
                </Form>
            </Drawer>
        </Card>
    );
};

// ── Staff users ─────────────────────────────────────────────────────
interface StaffUser { id: string; name: string; email: string; role: string; active: boolean; staffRole?: { _id: string; name: string }; employee?: { fullName: string; employeeCode: string }; lastLoginAt?: string }

const StaffUsersTab = () => {
    const act = useAction();
    const { user } = useAuth();
    const { data, loading, reload } = useList<StaffUser>('/payroll/staff-users');
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();
    const create = async () => {
        const v = await form.validateFields();
        if (await act(() => http.post('/payroll/staff-users', v), 'Access granted')) { setOpen(false); reload(); }
    };
    const patch = async (u: StaffUser, body: object, msg: string) => { if (await act(() => http.patch(`/payroll/staff-users/${u.id}`, body), msg)) reload(); };
    return (
        <Card className={cardClass()} title="Back-office users" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setOpen(true); }}>Give access</Button>}>
            <Alert type="info" showIcon className="mb-3" message="Staff users only see the Payroll & HR section, limited by their role. Store administration stays with administrators." />
            <Table rowKey="id" loading={loading} dataSource={data} pagination={false} columns={[
                { title: 'User', render: (_, u) => <div>{u.name}<div className="text-xs text-admin-muted">{u.email}</div></div> },
                {
                    title: 'Role', render: (_, u) => u.role === 'admin' ? <Tag color="gold">Administrator</Tag>
                        : <RemoteSelect path="/payroll/roles" size="small" className="w-48" value={u.staffRole?._id} onChange={(v) => patch(u, { staffRole: v }, 'Role changed')} />,
                },
                { title: 'Employee', render: (_, u) => (u.employee ? `${u.employee.employeeCode} — ${u.employee.fullName}` : '—') },
                { title: 'Last login', render: (_, u) => (u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : '—') },
                { title: 'Active', render: (_, u) => u.role !== 'admin' && u.id !== user?.id && <Switch size="small" checked={u.active} onChange={(v) => patch(u, { active: v }, v ? 'Enabled' : 'Disabled')} /> },
                { title: '', render: (_, u) => u.role !== 'admin' && <Popconfirm title="Remove back-office access?" onConfirm={() => patch(u, { revoke: true }, 'Access removed')}><Button size="small" danger>Remove</Button></Popconfirm> },
            ]} />
            <Modal title="Give back-office access" open={open} onCancel={() => setOpen(false)} onOk={create} destroyOnClose>
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]} help="If this email already has a customer account, it is upgraded and keeps its password."><Input /></Form.Item>
                    <Form.Item name="password" label="Password for a new account" rules={[{ min: 8 }]}><Input.Password autoComplete="new-password" /></Form.Item>
                    <Form.Item name="staffRole" label="Role" rules={[{ required: true }]}><RemoteSelect path="/payroll/roles" /></Form.Item>
                    <Form.Item name="employee" label="Linked employee (for self-service)"><EmployeeSelect /></Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

// ── Tax tables ──────────────────────────────────────────────────────
interface TaxTable { id: string; code: string; name: string; brackets: { from: number; to: number | null; rate: number }[]; notes: string; active: boolean }

const TaxTablesTab = () => {
    const act = useAction();
    const { data, loading, reload } = useList<TaxTable>('/tax-tables');
    const [editing, setEditing] = useState<TaxTable | 'new' | null>(null);
    const [form] = Form.useForm();
    const open = (t: TaxTable | 'new') => { setEditing(t); form.resetFields(); form.setFieldsValue(t === 'new' ? { active: true, brackets: [{ from: 0, to: null, rate: 0 }] } : t); };
    const save = async () => {
        const v = await form.validateFields();
        const ok = editing === 'new' ? await act(() => http.post('/tax-tables', v), 'Saved') : await act(() => http.put(`/tax-tables/${(editing as TaxTable).id}`, v), 'Saved');
        if (ok) { setEditing(null); reload(); }
    };
    return (
        <Card className={cardClass()} title="Tax tables" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => open('new')}>New table</Button>}>
            <Alert type="info" showIcon className="mb-3" message={<span>Use a table in a component formula with <code>slab(TaxableGross, "CODE")</code>. Each bracket taxes only the part of income between From and To.</span>} />
            <Table rowKey="id" loading={loading} dataSource={data} pagination={false} columns={[
                { title: 'Code', dataIndex: 'code', render: (c: string) => <code>{c}</code> }, { title: 'Name', dataIndex: 'name' },
                { title: 'Brackets', render: (_, t) => t.brackets.map(b => `${b.from.toLocaleString()}–${b.to == null ? '∞' : b.to.toLocaleString()} @ ${b.rate}%`).join(', ') },
                { title: 'Status', render: (_, t) => <StatusTag status={t.active ? 'active' : 'inactive'} /> },
                { title: '', render: (_, t) => <Button type="text" icon={<EditOutlined />} onClick={() => open(t)} /> },
            ]} />
            <Modal title="Tax table" open={!!editing} onCancel={() => setEditing(null)} onOk={save} width={640} destroyOnClose>
                <Form form={form} layout="vertical">
                    <Row gutter={12}>
                        <Col span={8}><Form.Item name="code" label="Code" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={4}><Form.Item name="active" label="Active" valuePropName="checked"><Switch /></Form.Item></Col>
                    </Row>
                    <Form.List name="brackets">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(f => (
                                    <Space key={f.key} align="baseline">
                                        <Form.Item name={[f.name, 'from']} rules={[{ required: true }]}><InputNumber min={0} placeholder="From" /></Form.Item>
                                        <Form.Item name={[f.name, 'to']}><InputNumber min={0} placeholder="To (empty = no limit)" className="w-44" /></Form.Item>
                                        <Form.Item name={[f.name, 'rate']} rules={[{ required: true }]}><InputNumber min={0} max={100} addonAfter="%" /></Form.Item>
                                        <MinusCircleOutlined onClick={() => remove(f.name)} />
                                    </Space>
                                ))}
                                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add()}>Add bracket</Button>
                            </>
                        )}
                    </Form.List>
                    <Form.Item name="notes" label="Notes" className="mt-3"><Input.TextArea rows={2} /></Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

// ── Audit log ───────────────────────────────────────────────────────
interface AuditRow { id: string; at: string; userName: string; action: string; entity: string; label: string; note: string; ip: string; changes: { field: string; from: unknown; to: unknown }[] }
const show = (v: unknown) => (v == null || v === '' ? '—' : typeof v === 'object' ? JSON.stringify(v) : String(v));

export const AuditLogTab = () => {
    const [filters, setFilters] = useState<Record<string, string | undefined>>({});
    const { data, loading } = useList<AuditRow>('/payroll/audit-logs', { ...filters, limit: 300 });
    return (
        <Card className={cardClass()} title="Audit log">
            <Space wrap className="mb-3">
                <Input.Search allowClear placeholder="Record (employee code, run no.)" onSearch={(v) => setFilters({ ...filters, search: v || undefined })} className="w-64" />
                <Select allowClear placeholder="Record type" className="w-48" onChange={(v) => setFilters({ ...filters, entity: v })}
                    options={['Employee', 'EmployeeSalary', 'Attendance', 'LeaveRequest', 'OvertimeEntry', 'Advance', 'PayrollEntry', 'ExternalPayment', 'PayrollRun', 'PayrollPeriod', 'PayrollRunEmployee', 'SalaryComponent', 'SalaryStructure', 'PayrollSetting', 'StaffRole', 'User', 'BiometricDevice', 'Report'].map(v => ({ value: v, label: v }))} />
                <Input type="date" onChange={(e) => setFilters({ ...filters, from: e.target.value || undefined })} />
                <Input type="date" onChange={(e) => setFilters({ ...filters, to: e.target.value || undefined })} />
            </Space>
            <Table rowKey="id" size="small" loading={loading} dataSource={data} pagination={{ pageSize: 50 }}
                expandable={{
                    rowExpandable: (r) => r.changes?.length > 0,
                    expandedRowRender: (r) => <Table size="small" rowKey="field" pagination={false} dataSource={r.changes} columns={[
                        { title: 'Field', dataIndex: 'field' }, { title: 'Before', dataIndex: 'from', render: show }, { title: 'After', dataIndex: 'to', render: show },
                    ]} />,
                }}
                columns={[
                    { title: 'When', dataIndex: 'at', render: (d: string) => new Date(d).toLocaleString(), width: 170 },
                    { title: 'User', dataIndex: 'userName', width: 150 },
                    { title: 'Action', dataIndex: 'action', render: (a: string) => <Tag>{a}</Tag>, width: 130 },
                    { title: 'Record', render: (_, r) => <span>{r.entity} <b>{r.label}</b></span> },
                    { title: 'Note', dataIndex: 'note', ellipsis: true },
                    { title: 'IP', dataIndex: 'ip', width: 120 },
                ]} />
        </Card>
    );
};

export default function PayrollSettingsPage() {
    const { can } = useAuth();
    const items = [
        can('settings.manage') && { key: 'general', label: 'General', children: <GeneralSettings /> },
        can('roles.manage') && { key: 'roles', label: 'Roles & permissions', children: <RolesTab /> },
        can('roles.manage') && { key: 'users', label: 'Back-office users', children: <StaffUsersTab /> },
        can('salaryConfig.manage') && { key: 'tax', label: 'Tax tables', children: <TaxTablesTab /> },
        can('audit.view') && { key: 'audit', label: 'Audit log', children: <AuditLogTab /> },
    ].filter(Boolean) as { key: string; label: string; children: React.ReactNode }[];
    return (
        <div>
            <PageHeader title="Payroll Settings" />
            <Tabs items={items} destroyInactiveTabPane />
        </div>
    );
}
