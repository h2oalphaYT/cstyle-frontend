import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import {
    App, Button, Card, Col, DatePicker, Descriptions, Drawer, Empty, Form, Input, InputNumber, Popconfirm, Row, Select, Space, Switch, Table, Tabs, Tag, Upload,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, DownloadOutlined, EditOutlined, EyeOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { http } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
    cardClass, download, EmployeeSelect, label, OrgFilters, OrgSelect, PageHeader, PAYMENT_METHODS, RemoteSelect, rs, StatusTag, upload, useAction, useList,
} from './lib';

type Ref = { _id: string; name?: string; code?: string; fullName?: string; employeeCode?: string } | null;
export interface Employee {
    id: string;
    employeeCode: string;
    fullName: string;
    nic: string;
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
    email?: string;
    address?: string;
    emergencyContact?: { name?: string; relationship?: string; phone?: string };
    joiningDate: string;
    confirmationDate?: string;
    leavingDate?: string;
    employmentType: string;
    status: string;
    company?: Ref; branch?: Ref; hub?: Ref; location?: Ref; department?: Ref; costCenter?: Ref; project?: Ref; designation?: Ref; group?: Ref; manager?: Ref;
    paymentMethod: string;
    bank?: { bankName?: string; branchName?: string; branchCode?: string; accountNumber?: string; accountName?: string; masked?: boolean };
    workingHoursPerDay?: number | null;
    workingDaysPerMonth?: number | null;
    attendanceRequired?: boolean;
    tax?: { tin?: string; category?: string; exempt?: boolean };
    statutory?: { epfNumber?: string; etfNumber?: string; epfApplicable?: boolean; etfApplicable?: boolean };
    notes?: string;
    documents?: { _id: string; name: string; type: string; size: number; uploadedAt: string }[];
    user?: { name: string; email: string } | null;
    currentSalary?: { basicSalary: number; dailyRate?: number; hourlyRate?: number; effectiveFrom: string; structure?: { name: string; payBasis: string } } | null;
}

const STATUSES = ['active', 'probation', 'on_leave', 'suspended', 'resigned', 'terminated', 'retired'];
const refId = (r: Ref) => (r ? r._id : undefined);
const toDate = (v?: string | null) => (v ? dayjs(v) : null);

const EmployeeForm = ({ employee, onSaved, onClose }: { employee: Employee | null; onSaved: () => void; onClose: () => void }) => {
    const [form] = Form.useForm();
    const { can } = useAuth();
    const act = useAction();
    const [saving, setSaving] = useState(false);
    const initial = employee ? {
        ...employee,
        dateOfBirth: toDate(employee.dateOfBirth), joiningDate: toDate(employee.joiningDate), confirmationDate: toDate(employee.confirmationDate), leavingDate: toDate(employee.leavingDate),
        company: refId(employee.company ?? null), branch: refId(employee.branch ?? null), hub: refId(employee.hub ?? null), location: refId(employee.location ?? null),
        department: refId(employee.department ?? null), costCenter: refId(employee.costCenter ?? null), project: refId(employee.project ?? null),
        designation: refId(employee.designation ?? null), group: refId(employee.group ?? null), manager: refId(employee.manager ?? null),
        bank: employee.bank?.masked ? {} : employee.bank,
    } : { status: 'active', employmentType: 'permanent', paymentMethod: 'bank_transfer', attendanceRequired: true, statutory: { epfApplicable: true, etfApplicable: true }, joiningDate: dayjs() };

    const save = async () => {
        const v = await form.validateFields();
        const body = {
            ...v,
            dateOfBirth: v.dateOfBirth?.format('YYYY-MM-DD') || null, joiningDate: v.joiningDate?.format('YYYY-MM-DD'),
            confirmationDate: v.confirmationDate?.format('YYYY-MM-DD') || null, leavingDate: v.leavingDate?.format('YYYY-MM-DD') || null,
            employeeCode: String(v.employeeCode).toUpperCase(),
        };
        if (employee?.bank?.masked && !v.bank?.accountNumber) delete body.bank;
        setSaving(true);
        const r = await act(() => (employee ? http.put(`/employees/${employee.id}`, body) : http.post('/employees', body)), employee ? 'Employee updated' : 'Employee created');
        setSaving(false);
        if (r) onSaved();
    };

    const bankEditable = can('employee.bank.edit');
    return (
        <Form form={form} layout="vertical" initialValues={initial}>
            <Tabs items={[
                {
                    key: 'personal', label: 'Personal', forceRender: true, children: (
                        <Row gutter={16}>
                            <Col xs={24} md={8}><Form.Item name="employeeCode" label="Employee code" rules={[{ required: true }, { pattern: /^[A-Za-z0-9_-]+$/, message: 'Letters, numbers, - and _' }]}><Input style={{ textTransform: 'uppercase' }} /></Form.Item></Col>
                            <Col xs={24} md={16}><Form.Item name="fullName" label="Full name" rules={[{ required: true }]}><Input /></Form.Item></Col>
                            <Col xs={24} md={8}><Form.Item name="nic" label="NIC / National ID"><Input style={{ textTransform: 'uppercase' }} /></Form.Item></Col>
                            <Col xs={12} md={8}><Form.Item name="dateOfBirth" label="Date of birth"><DatePicker className="w-full" /></Form.Item></Col>
                            <Col xs={12} md={8}><Form.Item name="gender" label="Gender"><Select allowClear options={['male', 'female', 'other'].map(v => ({ value: v, label: label(v) }))} /></Form.Item></Col>
                            <Col xs={24} md={8}><Form.Item name="phone" label="Phone"><Input /></Form.Item></Col>
                            <Col xs={24} md={16}><Form.Item name="email" label="Email" rules={[{ type: 'email' }]}><Input /></Form.Item></Col>
                            <Col span={24}><Form.Item name="address" label="Address"><Input.TextArea rows={2} /></Form.Item></Col>
                            <Col xs={24} md={8}><Form.Item name={['emergencyContact', 'name']} label="Emergency contact"><Input /></Form.Item></Col>
                            <Col xs={12} md={8}><Form.Item name={['emergencyContact', 'relationship']} label="Relationship"><Input /></Form.Item></Col>
                            <Col xs={12} md={8}><Form.Item name={['emergencyContact', 'phone']} label="Emergency phone"><Input /></Form.Item></Col>
                        </Row>
                    ),
                },
                {
                    key: 'employment', label: 'Employment', forceRender: true, children: (
                        <Row gutter={16}>
                            <Col xs={12} md={8}><Form.Item name="joiningDate" label="Joining date" rules={[{ required: true }]}><DatePicker className="w-full" /></Form.Item></Col>
                            <Col xs={12} md={8}><Form.Item name="confirmationDate" label="Confirmation date"><DatePicker className="w-full" /></Form.Item></Col>
                            <Col xs={12} md={8}><Form.Item name="leavingDate" label="Leaving date"><DatePicker className="w-full" /></Form.Item></Col>
                            <Col xs={12} md={8}><Form.Item name="employmentType" label="Employment type"><RemoteSelect path="/hr/lookups" query={{ category: 'employmentType', active: 'true' }} labelKey="label" valueKey="code" /></Form.Item></Col>
                            <Col xs={12} md={8}><Form.Item name="status" label="Status"><Select options={STATUSES.map(s => ({ value: s, label: label(s) }))} /></Form.Item></Col>
                            <Col xs={12} md={8}><Form.Item name="group" label="Employee group"><RemoteSelect path="/hr/employee-groups" /></Form.Item></Col>
                            <Col xs={12} md={8}><Form.Item name="company" label="Company"><OrgSelect type="company" /></Form.Item></Col>
                            <Col xs={12} md={8}><Form.Item name="branch" label="Branch"><OrgSelect type="branch" /></Form.Item></Col>
                            <Col xs={12} md={8}><Form.Item name="hub" label="Hub / school / site"><OrgSelect type="hub" /></Form.Item></Col>
                            <Col xs={12} md={8}><Form.Item name="location" label="Work location"><OrgSelect type="location" /></Form.Item></Col>
                            <Col xs={12} md={8}><Form.Item name="department" label="Department"><OrgSelect type="department" /></Form.Item></Col>
                            <Col xs={12} md={8}><Form.Item name="designation" label="Designation"><RemoteSelect path="/hr/designations" /></Form.Item></Col>
                            <Col xs={12} md={8}><Form.Item name="costCenter" label="Cost center"><OrgSelect type="costCenter" /></Form.Item></Col>
                            <Col xs={12} md={8}><Form.Item name="project" label="Project"><OrgSelect type="project" /></Form.Item></Col>
                            <Col xs={24} md={8}><Form.Item name="manager" label="Manager / supervisor"><EmployeeSelect /></Form.Item></Col>
                            <Col xs={12} md={8}><Form.Item name="workingHoursPerDay" label="Working hours / day (override)"><InputNumber min={0} max={24} className="w-full" /></Form.Item></Col>
                            <Col xs={12} md={8}><Form.Item name="workingDaysPerMonth" label="Working days / month (override)"><InputNumber min={0} max={31} className="w-full" /></Form.Item></Col>
                            <Col xs={12} md={8}><Form.Item name="attendanceRequired" label="Attendance tracked" valuePropName="checked"><Switch /></Form.Item></Col>
                        </Row>
                    ),
                },
                {
                    key: 'pay', label: 'Payment & bank', forceRender: true, children: (
                        <Row gutter={16}>
                            <Col xs={24} md={8}><Form.Item name="paymentMethod" label="Payment method"><Select options={PAYMENT_METHODS} /></Form.Item></Col>
                            {bankEditable ? (<>
                                <Col xs={24} md={8}><Form.Item name={['bank', 'bankName']} label="Bank"><RemoteSelect path="/hr/lookups" query={{ category: 'bank', active: 'true' }} labelKey="label" valueKey="label" /></Form.Item></Col>
                                <Col xs={24} md={8}><Form.Item name={['bank', 'branchName']} label="Bank branch"><Input /></Form.Item></Col>
                                <Col xs={12} md={8}><Form.Item name={['bank', 'branchCode']} label="Branch code"><Input /></Form.Item></Col>
                                <Col xs={12} md={8}><Form.Item name={['bank', 'accountNumber']} label="Account number" extra={employee?.bank?.masked ? `Current: ${employee.bank.accountNumber}` : undefined}><Input /></Form.Item></Col>
                                <Col xs={24} md={8}><Form.Item name={['bank', 'accountName']} label="Account name"><Input /></Form.Item></Col>
                            </>) : <Col span={24}><p className="text-admin-muted">Your role cannot edit bank details.</p></Col>}
                            <Col xs={12} md={8}><Form.Item name={['statutory', 'epfNumber']} label="EPF number"><Input /></Form.Item></Col>
                            <Col xs={12} md={8}><Form.Item name={['statutory', 'etfNumber']} label="ETF number"><Input /></Form.Item></Col>
                            <Col xs={12} md={4}><Form.Item name={['statutory', 'epfApplicable']} label="EPF applies" valuePropName="checked"><Switch /></Form.Item></Col>
                            <Col xs={12} md={4}><Form.Item name={['statutory', 'etfApplicable']} label="ETF applies" valuePropName="checked"><Switch /></Form.Item></Col>
                            <Col xs={12} md={8}><Form.Item name={['tax', 'tin']} label="Tax ID (TIN)"><Input /></Form.Item></Col>
                            <Col xs={12} md={8}><Form.Item name={['tax', 'category']} label="Tax category"><Input /></Form.Item></Col>
                            <Col xs={12} md={8}><Form.Item name={['tax', 'exempt']} label="Tax exempt" valuePropName="checked"><Switch /></Form.Item></Col>
                            <Col span={24}><Form.Item name="notes" label="Notes"><Input.TextArea rows={3} /></Form.Item></Col>
                        </Row>
                    ),
                },
            ]} />
            <Space className="mt-2">
                <Button onClick={onClose}>Cancel</Button>
                <Button type="primary" loading={saving} onClick={save}>{employee ? 'Save changes' : 'Create employee'}</Button>
            </Space>
        </Form>
    );
};

const EmployeeDetail = ({ id, onEdit }: { id: string; onEdit: (e: Employee) => void }) => {
    const { can } = useAuth();
    const act = useAction();
    const { message } = App.useApp();
    const [emp, setEmp] = useState<Employee | null>(null);
    const [balances, setBalances] = useState<{ id: string; leaveType: { name: string }; opening: number; accrued: number; adjusted: number; used: number; pending: number; remaining: number }[]>([]);
    const [loginForm] = Form.useForm();
    const load = async () => {
        const r = await act(() => http.get<Employee>(`/employees/${id}`));
        if (r) setEmp(r.data);
        if (can('leave.view', 'employee.view')) {
            const b = await act(() => http.get<typeof balances>(`/employees/${id}/leave-balances`));
            if (b) setBalances(b.data);
        }
    };
    useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
    if (!emp) return <Card loading />;

    const docUpload = async (file: File) => {
        const form = new FormData();
        form.append('files', file);
        form.append('type', 'other');
        if (await act(() => upload(`/employees/${emp.id}/documents`, form), 'Document uploaded')) load();
        return false;
    };

    return (
        <div>
            <Space className="mb-3" wrap>
                {can('employee.edit') && <Button icon={<EditOutlined />} onClick={() => onEdit(emp)}>Edit</Button>}
                {can('salary.view') && <Link to={`/admin/hr/employee-salary?employee=${emp.id}`}><Button>Salary history</Button></Link>}
                <Link to={`/admin/hr/attendance?employee=${emp.id}`}><Button>Attendance</Button></Link>
            </Space>
            <Tabs items={[
                {
                    key: 'profile', label: 'Profile', children: (
                        <Descriptions bordered size="small" column={{ xs: 1, md: 2 }}>
                            <Descriptions.Item label="Code">{emp.employeeCode}</Descriptions.Item>
                            <Descriptions.Item label="Status"><StatusTag status={emp.status} /></Descriptions.Item>
                            <Descriptions.Item label="NIC">{emp.nic || '—'}</Descriptions.Item>
                            <Descriptions.Item label="Phone / email">{[emp.phone, emp.email].filter(Boolean).join(' · ') || '—'}</Descriptions.Item>
                            <Descriptions.Item label="Joined">{emp.joiningDate?.slice(0, 10)}</Descriptions.Item>
                            <Descriptions.Item label="Employment">{label(emp.employmentType)}</Descriptions.Item>
                            <Descriptions.Item label="Company / branch / hub">{[emp.company?.name, emp.branch?.name, emp.hub?.name].filter(Boolean).join(' / ') || '—'}</Descriptions.Item>
                            <Descriptions.Item label="Department">{emp.department?.name || '—'}</Descriptions.Item>
                            <Descriptions.Item label="Designation">{emp.designation?.name || '—'}</Descriptions.Item>
                            <Descriptions.Item label="Group">{emp.group?.name || '—'}</Descriptions.Item>
                            <Descriptions.Item label="Manager">{emp.manager ? `${emp.manager.employeeCode} — ${emp.manager.fullName}` : '—'}</Descriptions.Item>
                            <Descriptions.Item label="Payment">{label(emp.paymentMethod)}{emp.bank?.accountNumber ? ` · ${emp.bank.bankName || ''} ${emp.bank.accountNumber}` : ''}</Descriptions.Item>
                            {emp.currentSalary && <Descriptions.Item label="Current salary" span={2}>
                                {emp.currentSalary.structure?.name}: basic {rs(emp.currentSalary.basicSalary)}
                                {emp.currentSalary.dailyRate ? ` · daily ${rs(emp.currentSalary.dailyRate)}` : ''}{emp.currentSalary.hourlyRate ? ` · hourly ${rs(emp.currentSalary.hourlyRate)}` : ''} (from {emp.currentSalary.effectiveFrom})
                            </Descriptions.Item>}
                            <Descriptions.Item label="Login">{emp.user ? `${emp.user.email}` : 'No login'}</Descriptions.Item>
                            <Descriptions.Item label="EPF / ETF">{emp.statutory?.epfApplicable ? `EPF ${emp.statutory.epfNumber || '—'}` : 'EPF n/a'} · {emp.statutory?.etfApplicable ? `ETF ${emp.statutory.etfNumber || '—'}` : 'ETF n/a'}</Descriptions.Item>
                        </Descriptions>
                    ),
                },
                {
                    key: 'leave', label: 'Leave balances', children: balances.length ? (
                        <Table size="small" rowKey="id" pagination={false} dataSource={balances} columns={[
                            { title: 'Type', dataIndex: ['leaveType', 'name'] }, { title: 'Opening', dataIndex: 'opening' }, { title: 'Entitled', dataIndex: 'accrued' },
                            { title: 'Adjusted', dataIndex: 'adjusted' }, { title: 'Used', dataIndex: 'used' }, { title: 'Pending', dataIndex: 'pending' },
                            { title: 'Remaining', dataIndex: 'remaining', render: (v: number) => <b>{v}</b> },
                        ]} />
                    ) : <Empty description="No leave balances" />,
                },
                {
                    key: 'docs', label: `Documents (${emp.documents?.length || 0})`, children: (
                        <div>
                            {can('employee.edit') && <Upload beforeUpload={docUpload} showUploadList={false} accept=".pdf,.jpg,.jpeg,.png,.webp,.docx,.xlsx">
                                <Button icon={<UploadOutlined />} className="mb-3">Upload document</Button>
                            </Upload>}
                            <Table size="small" rowKey="_id" pagination={false} dataSource={emp.documents} columns={[
                                { title: 'File', dataIndex: 'name' }, { title: 'Type', dataIndex: 'type', render: label },
                                { title: 'Uploaded', dataIndex: 'uploadedAt', render: (d: string) => new Date(d).toLocaleDateString() },
                                {
                                    title: '', width: 100, render: (_, d) => <Space>
                                        <Button size="small" icon={<DownloadOutlined />} onClick={() => download(`/employees/${emp.id}/documents/${d._id}`, d.name).catch(e => message.error(e.message))} />
                                        {can('employee.edit') && <Popconfirm title="Delete document?" onConfirm={async () => { if (await act(() => http.delete(`/employees/${emp.id}/documents/${d._id}`), 'Deleted')) load(); }}>
                                            <Button size="small" danger icon={<DeleteOutlined />} />
                                        </Popconfirm>}
                                    </Space>,
                                },
                            ]} />
                        </div>
                    ),
                },
                ...(can('roles.manage') ? [{
                    key: 'login', label: 'Login access', children: (
                        <Form form={loginForm} layout="vertical" className="max-w-md" initialValues={{ email: emp.email }}
                            onFinish={async (v) => { if (await act(() => http.post(`/employees/${emp.id}/user`, v), 'Login linked')) load(); }}>
                            <p className="text-admin-muted">Gives this employee a login for self-service (own payslips and leave) or a back-office role.</p>
                            <Form.Item name="email" label="Login email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
                            <Form.Item name="password" label="Password (for a new login)" rules={[{ min: 8 }]}><Input.Password autoComplete="new-password" /></Form.Item>
                            <Form.Item name="staffRole" label="Role (default: Employee)"><RemoteSelect path="/payroll/roles" /></Form.Item>
                            <Button type="primary" htmlType="submit">{emp.user ? 'Update login' : 'Create login'}</Button>
                        </Form>
                    ),
                }] : []),
            ]} />
        </div>
    );
};

export default function EmployeesPage() {
    const { can } = useAuth();
    const { modal } = App.useApp();
    const act = useAction();
    const [filters, setFilters] = useState<Record<string, string | undefined>>({ status: 'active' });
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const { data, pagination, loading, reload } = useList<Employee>('/employees', { ...filters, search, page, limit: 25 });
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Employee | null>(null);
    const [viewing, setViewing] = useState<string | null>(null);

    const columns: ColumnsType<Employee> = [
        { title: 'Code', dataIndex: 'employeeCode', width: 110, fixed: 'left' },
        { title: 'Name', dataIndex: 'fullName', render: (n: string, e) => <a onClick={() => setViewing(e.id)}>{n}</a> },
        { title: 'Department', dataIndex: ['department', 'name'], render: (v) => v || '—' },
        { title: 'Designation', dataIndex: ['designation', 'name'], render: (v) => v || '—' },
        { title: 'Branch / Hub', render: (_, e) => [e.branch?.name, e.hub?.name].filter(Boolean).join(' / ') || '—' },
        { title: 'Group', dataIndex: ['group', 'name'], render: (v) => v || '—' },
        { title: 'Type', dataIndex: 'employmentType', render: label, width: 120 },
        { title: 'Joined', dataIndex: 'joiningDate', render: (d: string) => d?.slice(0, 10), width: 110 },
        { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusTag status={s} />, width: 110 },
        {
            title: '', key: 'a', width: 110, fixed: 'right', render: (_, e) => <Space size={0}>
                <Button type="text" icon={<EyeOutlined />} onClick={() => setViewing(e.id)} aria-label="View" />
                {can('employee.edit') && <Button type="text" icon={<EditOutlined />} onClick={() => { setEditing(e); setFormOpen(true); }} aria-label="Edit" />}
                {can('employee.delete') && <Button type="text" danger icon={<DeleteOutlined />} aria-label="Archive" onClick={() => modal.confirm({
                    title: `Archive ${e.fullName}?`, content: 'The employee is hidden from lists. Payroll history is kept.', okType: 'danger',
                    onOk: async () => { if (await act(() => http.delete(`/employees/${e.id}`), 'Employee archived')) reload(); },
                })} />}
            </Space>,
        },
    ];

    return (
        <div>
            <PageHeader title="Employees" subtitle={`${pagination?.total ?? 0} employee(s)`}
                extra={can('employee.create') && <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setFormOpen(true); }}>Add employee</Button>} />
            <Card className={cardClass()}>
                <Space wrap className="mb-3">
                    <Input.Search allowClear placeholder="Name, code, NIC, phone" onSearch={(v) => { setSearch(v); setPage(1); }} className="w-64" />
                    <Select allowClear placeholder="Status" value={filters.status} onChange={(v) => setFilters({ ...filters, status: v })} className="w-36"
                        options={STATUSES.map(s => ({ value: s, label: label(s) }))} />
                    <OrgFilters value={filters} onChange={(v) => { setFilters(v); setPage(1); }} show={['branch', 'hub', 'department', 'group']} />
                </Space>
                <Table rowKey="id" loading={loading} columns={columns} dataSource={data} scroll={{ x: 1200 }}
                    pagination={{ current: page, pageSize: 25, total: pagination?.total, onChange: setPage, showTotal: (t) => `${t} employees` }} />
            </Card>
            <Drawer title={editing ? `Edit ${editing.fullName}` : 'New employee'} open={formOpen} onClose={() => setFormOpen(false)} width={Math.min(900, window.innerWidth)} destroyOnClose>
                <EmployeeForm employee={editing} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); reload(); }} />
            </Drawer>
            <Drawer title="Employee" open={!!viewing} onClose={() => setViewing(null)} width={Math.min(900, window.innerWidth)} destroyOnClose>
                {viewing && <EmployeeDetail id={viewing} onEdit={(e) => { setViewing(null); setEditing(e); setFormOpen(true); }} />}
            </Drawer>
            {data.length === 0 && !loading && <Tag className="mt-2">No employees match the filters</Tag>}
        </div>
    );
}
