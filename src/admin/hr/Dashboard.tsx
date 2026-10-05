import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, App, Button, Card, Col, Descriptions, Empty, Progress, Row, Space, Statistic, Table, Tag } from 'antd';
import {
    CalendarOutlined, ClockCircleOutlined, DollarOutlined, FieldTimeOutlined, FilePdfOutlined, PlusOutlined, TeamOutlined, UploadOutlined, UserAddOutlined,
} from '@ant-design/icons';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { http } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { cardClass, download, PageHeader, rs, StatusTag, useAction, useList } from './lib';
import { LeaveRequestForm } from './Leave';

interface DashboardData {
    employees: { total: number; active: number; presentToday: number; absentToday: number; lateToday: number; onLeaveToday: number; notMarkedToday: number };
    pending: { leave: number; overtime: number };
    attendanceTrend: { date: string; present: number; absent: number; leave: number; late: number }[];
    leaveStats: { type: string; days: number }[];
    overtimeStats: { type: string; hours: number }[];
    payroll?: {
        period: string; gross: number; net: number; overtime: number; deductions: number; allowances: number; pendingRuns: number; pendingPayments: number;
        monthly: { period: string; gross: number; net: number; employer: number }[];
        byDepartment: { department: string; net: number }[];
        distribution: { range: string; employees: number }[];
    };
}

const COLORS = ['#c9a227', '#1f2937', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#f97316', '#14b8a6'];
const axis = { fontSize: 11 };

const Stat = ({ title, value, icon, money, to }: { title: string; value: number; icon?: React.ReactNode; money?: boolean; to?: string }) => {
    const body = <Card size="small" className={`${cardClass()} h-full`} hoverable={!!to}><Statistic title={title} value={value} precision={money ? 2 : 0} prefix={money ? 'Rs' : icon} /></Card>;
    return to ? <Link to={to}>{body}</Link> : body;
};

export function HrDashboard() {
    const { can } = useAuth();
    const act = useAction();
    const [data, setData] = useState<DashboardData | null>(null);
    useEffect(() => { act(() => http.get<DashboardData>('/payroll/dashboard')).then(r => r && setData(r.data)); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (!data) return <Card loading />;
    const e = data.employees;
    const p = data.payroll;
    const attendanceRate = e.active ? Math.round((e.presentToday / e.active) * 100) : 0;

    return (
        <div>
            <PageHeader title="Payroll & HR Dashboard" subtitle={p ? `Latest payroll: ${p.period}` : undefined} extra={<Space wrap>
                {can('employee.create') && <Link to="/admin/hr/employees?new=1"><Button icon={<UserAddOutlined />}>Add employee</Button></Link>}
                {can('attendance.import') && <Link to="/admin/hr/import"><Button icon={<UploadOutlined />}>Import attendance</Button></Link>}
                {can('attendance.edit') && <Link to="/admin/hr/attendance"><Button icon={<CalendarOutlined />}>Mark attendance</Button></Link>}
                {can('payroll.process') && <Link to="/admin/hr/payroll"><Button type="primary" icon={<PlusOutlined />}>Process payroll</Button></Link>}
                {can('reports.view') && <Link to="/admin/hr/reports"><Button>Reports</Button></Link>}
            </Space>} />

            <Row gutter={[12, 12]} className="mb-4">
                <Col xs={12} md={6} xl={3}><Stat title="Employees" value={e.total} icon={<TeamOutlined />} to="/admin/hr/employees" /></Col>
                <Col xs={12} md={6} xl={3}><Stat title="Active" value={e.active} /></Col>
                <Col xs={12} md={6} xl={3}><Stat title="Present today" value={e.presentToday} to="/admin/hr/attendance" /></Col>
                <Col xs={12} md={6} xl={3}><Stat title="Absent today" value={e.absentToday} /></Col>
                <Col xs={12} md={6} xl={3}><Stat title="Late today" value={e.lateToday} icon={<ClockCircleOutlined />} /></Col>
                <Col xs={12} md={6} xl={3}><Stat title="On leave today" value={e.onLeaveToday} /></Col>
                <Col xs={12} md={6} xl={3}><Stat title="Pending leave" value={data.pending.leave} to="/admin/hr/leave" /></Col>
                <Col xs={12} md={6} xl={3}><Stat title="Pending overtime" value={data.pending.overtime} icon={<FieldTimeOutlined />} to="/admin/hr/overtime" /></Col>
            </Row>
            {e.notMarkedToday > 0 && <Alert className="mb-4" type="info" showIcon message={`${e.notMarkedToday} active employee(s) have no attendance record today yet.`} />}

            {p && (
                <Row gutter={[12, 12]} className="mb-4">
                    <Col xs={12} md={8} xl={4}><Stat title={`Gross (${p.period})`} value={p.gross} money /></Col>
                    <Col xs={12} md={8} xl={4}><Stat title="Net pay" value={p.net} money /></Col>
                    <Col xs={12} md={8} xl={4}><Stat title="Overtime" value={p.overtime} money /></Col>
                    <Col xs={12} md={8} xl={4}><Stat title="Allowances" value={p.allowances} money /></Col>
                    <Col xs={12} md={8} xl={4}><Stat title="Deductions" value={p.deductions} money /></Col>
                    <Col xs={12} md={8} xl={2}><Stat title="Runs pending" value={p.pendingRuns} to="/admin/hr/payroll" /></Col>
                    <Col xs={12} md={8} xl={2}><Stat title="Unpaid" value={p.pendingPayments} icon={<DollarOutlined />} /></Col>
                </Row>
            )}

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                    <Card className={cardClass()} title="Attendance — last 14 days" size="small">
                        {data.attendanceTrend.length ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={data.attendanceTrend}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                    <XAxis dataKey="date" tick={axis} tickFormatter={(d: string) => d.slice(5)} /><YAxis tick={axis} allowDecimals={false} />
                                    <Tooltip /><Legend />
                                    <Bar dataKey="present" stackId="a" fill="#10b981" name="Present" />
                                    <Bar dataKey="leave" stackId="a" fill="#3b82f6" name="Leave" />
                                    <Bar dataKey="absent" stackId="a" fill="#ef4444" name="Absent" />
                                    <Bar dataKey="late" fill="#f59e0b" name="Late" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <Empty description="No attendance recorded in the last 14 days" />}
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card className={cardClass()} title="Today" size="small">
                        <div className="flex justify-center"><Progress type="dashboard" percent={attendanceRate} format={(v) => `${v}% present`} /></div>
                        <Descriptions size="small" column={1} className="mt-2">
                            <Descriptions.Item label="Present">{e.presentToday}</Descriptions.Item>
                            <Descriptions.Item label="Absent">{e.absentToday}</Descriptions.Item>
                            <Descriptions.Item label="On leave">{e.onLeaveToday}</Descriptions.Item>
                            <Descriptions.Item label="Not yet marked">{e.notMarkedToday}</Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>
                {p && <>
                    <Col xs={24} lg={12}>
                        <Card className={cardClass()} title="Monthly payroll cost" size="small">
                            {p.monthly.length ? (
                                <ResponsiveContainer width="100%" height={260}>
                                    <LineChart data={p.monthly}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                        <XAxis dataKey="period" tick={axis} /><YAxis tick={axis} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
                                        <Tooltip formatter={(v) => rs(Number(v))} /><Legend />
                                        <Line dataKey="gross" stroke="#c9a227" name="Gross" />
                                        <Line dataKey="net" stroke="#10b981" name="Net" />
                                        <Line dataKey="employer" stroke="#3b82f6" name="Employer contributions" />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : <Empty description="No payroll processed yet" />}
                        </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card className={cardClass()} title={`Net pay by department (${p.period})`} size="small">
                            {p.byDepartment.length ? (
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={p.byDepartment} layout="vertical" margin={{ left: 40 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                        <XAxis type="number" tick={axis} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} /><YAxis type="category" dataKey="department" tick={axis} width={110} />
                                        <Tooltip formatter={(v) => rs(Number(v))} />
                                        <Bar dataKey="net" fill="#c9a227" name="Net pay" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <Empty />}
                        </Card>
                    </Col>
                    <Col xs={24} lg={8}>
                        <Card className={cardClass()} title="Salary distribution (net)" size="small">
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={p.distribution}>
                                    <XAxis dataKey="range" tick={axis} /><YAxis tick={axis} allowDecimals={false} /><Tooltip />
                                    <Bar dataKey="employees" fill="#1f2937" name="Employees" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </>}
                <Col xs={24} lg={8}>
                    <Card className={cardClass()} title="Leave taken this year" size="small">
                        {data.leaveStats.length ? (
                            <ResponsiveContainer width="100%" height={240}>
                                <PieChart>
                                    <Pie data={data.leaveStats} dataKey="days" nameKey="type" outerRadius={80} label>
                                        {data.leaveStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip /><Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <Empty description="No approved leave this year" />}
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card className={cardClass()} title="Overtime hours this month" size="small">
                        {data.overtimeStats.length ? (
                            <ResponsiveContainer width="100%" height={240}>
                                <PieChart>
                                    <Pie data={data.overtimeStats} dataKey="hours" nameKey="type" outerRadius={80} label>
                                        {data.overtimeStats.map((_, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip /><Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <Empty description="No approved overtime this month" />}
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

// ── Employee self-service ───────────────────────────────────────────
interface Me {
    employee: { fullName: string; employeeCode: string; department?: { name: string }; designation?: { name: string }; branch?: { name: string }; joinDate?: string; email?: string } | null;
    leaveBalances: { id?: string; _id: string; leaveType: { name: string; code: string }; year: number; opening: number; accrued: number; used: number; pending: number; remaining: number }[];
    roleName?: string;
}
interface MyLeave { id: string; leaveType: { name: string }; fromDate: string; toDate: string; days: number; status: string; reason: string }
interface MySlip { id: string; periodCode: string; payslipNumber: string; net: number; payment: { status: string } }

export function MyHrPage() {
    const { can, user } = useAuth();
    const { message } = App.useApp();
    const act = useAction();
    const [me, setMe] = useState<Me | null>(null);
    const [leaveOpen, setLeaveOpen] = useState(false);
    const leaves = useList<MyLeave>(me?.employee && can('leave.request') ? '/leave-requests' : null, { mine: 'true', limit: 50 });
    const slips = useList<MySlip>(me?.employee && can('payslip.view.own', 'payslip.view') ? '/payslips' : null, { mine: 'true' });
    const load = () => act(() => http.get<Me>('/payroll/me')).then(r => r && setMe(r.data));
    useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (!me) return <Card loading />;
    if (!me.employee) {
        return <div><PageHeader title="My HR" /><Alert type="info" showIcon message={`Your login (${user?.email}) is not linked to an employee record.`} description="Ask HR to link your account from the employee's profile (Login access)." /></div>;
    }
    const emp = me.employee;
    return (
        <div>
            <PageHeader title={`Hello, ${emp.fullName.split(' ')[0]}`} subtitle={`${emp.employeeCode} · ${emp.designation?.name || ''} ${emp.department?.name ? `· ${emp.department.name}` : ''}`}
                extra={can('leave.request') && <Button type="primary" icon={<PlusOutlined />} onClick={() => setLeaveOpen(true)}>Request leave</Button>} />
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card className={cardClass()} title={`Leave balance ${new Date().getFullYear()}`} size="small">
                        <Table size="small" rowKey="_id" pagination={false} dataSource={me.leaveBalances} columns={[
                            { title: 'Type', render: (_, b) => b.leaveType?.name }, { title: 'Entitled', render: (_, b) => b.opening + b.accrued },
                            { title: 'Used', dataIndex: 'used' }, { title: 'Pending', dataIndex: 'pending' }, { title: 'Remaining', dataIndex: 'remaining', render: (v: number) => <b>{v}</b> },
                        ]} />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card className={cardClass()} title="My payslips" size="small">
                        <Table size="small" rowKey="id" loading={slips.loading} dataSource={slips.data} pagination={{ pageSize: 6, hideOnSinglePage: true }} locale={{ emptyText: 'No payslips yet' }} columns={[
                            { title: 'Month', dataIndex: 'periodCode' }, { title: 'Net pay', dataIndex: 'net', render: rs, align: 'right' },
                            { title: 'Status', render: (_, s) => <StatusTag status={s.payment?.status} /> },
                            { title: '', render: (_, s) => <Button size="small" icon={<FilePdfOutlined />} onClick={() => download(`/payslips/${s.id}/pdf`).catch(err => message.error(err.message))}>PDF</Button> },
                        ]} />
                    </Card>
                </Col>
                <Col xs={24}>
                    <Card className={cardClass()} title="My leave requests" size="small">
                        <Table size="small" rowKey="id" loading={leaves.loading} dataSource={leaves.data} pagination={{ pageSize: 10, hideOnSinglePage: true }} columns={[
                            { title: 'Type', render: (_, l) => l.leaveType?.name }, { title: 'From', dataIndex: 'fromDate' }, { title: 'To', dataIndex: 'toDate' },
                            { title: 'Days', dataIndex: 'days' }, { title: 'Reason', dataIndex: 'reason' },
                            { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusTag status={s} /> },
                            {
                                title: '', render: (_, l) => ['pending', 'supervisor_approved'].includes(l.status) && <Button size="small" danger
                                    onClick={async () => { if (await act(() => http.patch(`/leave-requests/${l.id}/cancel`, { reason: 'Cancelled by employee' }), 'Cancelled')) { leaves.reload(); load(); } }}>Cancel</Button>,
                            },
                        ]} />
                    </Card>
                </Col>
            </Row>
            <LeaveRequestForm self open={leaveOpen} onClose={() => setLeaveOpen(false)} onSaved={() => { setLeaveOpen(false); leaves.reload(); load(); }} />
            {!can('leave.request') && <Tag className="mt-3">Your role ({me.roleName}) cannot request leave online.</Tag>}
        </div>
    );
}
