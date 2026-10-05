import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    Alert, App, Button, Card, Checkbox, Col, Form, Input, InputNumber, Modal, Row, Select, Space, Statistic, Steps, Table, Tag, Upload, Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CloudUploadOutlined, DeleteOutlined, DownloadOutlined, EditOutlined, InboxOutlined, PlusOutlined, SyncOutlined } from '@ant-design/icons';
import { http } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { cardClass, download, EmployeeSelect, label, OrgFilters, PageHeader, RemoteSelect, StatusTag, today, upload, useAction, useList } from './lib';

const STATUSES = ['present', 'absent', 'half_day', 'late', 'early_leave', 'leave', 'holiday', 'off_day', 'remote'];
interface AttRow {
    id: string; employee: { _id: string; fullName: string; employeeCode: string; department?: { name: string } }; date: string; inTime: string; outTime: string;
    workedHours: number; normalHours: number; otHours: number; lateMinutes: number; earlyLeaveMinutes: number; status: string; source: string; remarks: string; reason: string;
    missingCheckout: boolean; leaveRequest?: string; updatedBy?: { name: string };
}

export function AttendancePage() {
    const { can } = useAuth();
    const { modal, message } = App.useApp();
    const act = useAction();
    const [params] = useSearchParams();
    const [filters, setFilters] = useState<Record<string, string | undefined>>({ from: today().slice(0, 8) + '01', to: today(), employee: params.get('employee') || undefined });
    const [page, setPage] = useState(1);
    const { data, pagination, loading, reload } = useList<AttRow>('/attendance', { ...filters, page, limit: 50 });
    const [summary, setSummary] = useState<Record<string, number> | null>(null);
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => { http.get<Record<string, number>>('/attendance/today').then(r => setSummary(r.data)).catch(() => undefined); }, [data]);

    const openForm = (row?: AttRow) => {
        form.resetFields();
        form.setFieldsValue(row ? { employee: row.employee._id, date: row.date, inTime: row.inTime, outTime: row.outTime, status: undefined, remarks: row.remarks }
            : { date: today(), inTime: '08:30', outTime: '17:00' });
        setOpen(true);
    };
    const save = async () => {
        const v = await form.validateFields();
        const r = await act(() => http.post('/attendance', { ...v, source: 'manual' }), 'Attendance saved');
        if (r) { setOpen(false); reload(); }
    };
    const remove = (row: AttRow) => {
        let reason = '';
        modal.confirm({
            title: `Delete attendance for ${row.employee.employeeCode} on ${row.date}?`,
            content: <Input placeholder="Reason (required)" onChange={(e) => { reason = e.target.value; }} />,
            okType: 'danger',
            onOk: async () => {
                if (!reason) { message.error('Give a reason'); throw new Error('reason'); }
                if (await act(() => http.delete(`/attendance/${row.id}`, { reason }), 'Deleted')) reload();
            },
        });
    };

    const columns: ColumnsType<AttRow> = [
        { title: 'Date', dataIndex: 'date', width: 110, fixed: 'left' },
        { title: 'Employee', render: (_, r) => <span>{r.employee?.employeeCode} — {r.employee?.fullName}</span> },
        { title: 'In', dataIndex: 'inTime', width: 70 },
        { title: 'Out', dataIndex: 'outTime', width: 70, render: (t: string, r) => (r.missingCheckout ? <Tag color="orange">missing</Tag> : t) },
        { title: 'Worked', dataIndex: 'workedHours', width: 80, align: 'right' },
        { title: 'OT', dataIndex: 'otHours', width: 60, align: 'right', render: (v: number) => (v ? <b>{v}</b> : 0) },
        { title: 'Late', dataIndex: 'lateMinutes', width: 70, align: 'right', render: (v: number) => (v ? `${v}m` : '') },
        { title: 'Status', dataIndex: 'status', width: 110, render: (s: string) => <StatusTag status={s} /> },
        { title: 'Source', dataIndex: 'source', width: 100, render: label },
        { title: 'Remarks', render: (_, r) => <span className="text-xs">{[r.remarks, r.reason].filter(Boolean).join(' · ')}</span> },
        ...(can('attendance.edit') ? [{
            title: '', width: 90, fixed: 'right' as const, render: (_: unknown, r: AttRow) => !r.leaveRequest && <Space size={0}>
                <Button type="text" icon={<EditOutlined />} onClick={() => openForm(r)} />
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(r)} />
            </Space>,
        }] : []),
    ];

    return (
        <div>
            <PageHeader title="Attendance" subtitle="Fingerprint, Excel, web and manual office-sheet entries in one place"
                extra={<>
                    <Button icon={<DownloadOutlined />} onClick={() => download(`/attendance/export?${new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][])}&format=xlsx`).catch(e => message.error(e.message))}>Export Excel</Button>
                    {can('attendance.import') && <Link to="/admin/hr/import"><Button icon={<CloudUploadOutlined />}>Import Excel</Button></Link>}
                    {can('attendance.edit') && <Button type="primary" icon={<PlusOutlined />} onClick={() => openForm()}>Record attendance</Button>}
                </>} />
            {summary && (
                <Row gutter={[12, 12]} className="mb-4">
                    {[['Active employees', summary.activeEmployees], ['Present today', summary.present], ['Late today', summary.late], ['On leave', summary.onLeave], ['Absent', summary.absent], ['Not recorded', summary.notRecorded]].map(([t, v]) => (
                        <Col xs={12} md={4} key={t as string}><Card size="small" className={cardClass()}><Statistic title={t} value={v as number} /></Card></Col>
                    ))}
                </Row>
            )}
            <Card className={cardClass()}>
                <Space wrap className="mb-3">
                    <Input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} className="w-40" />
                    <Input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} className="w-40" />
                    <EmployeeSelect className="w-60" value={filters.employee} onChange={(v) => setFilters({ ...filters, employee: v as string })} />
                    <Select allowClear placeholder="Status" className="w-36" value={filters.status} onChange={(v) => setFilters({ ...filters, status: v })} options={STATUSES.map(s => ({ value: s, label: label(s) }))} />
                    <Select allowClear placeholder="Source" className="w-36" value={filters.source} onChange={(v) => setFilters({ ...filters, source: v })} options={['fingerprint', 'manual', 'excel', 'web', 'mobile', 'api', 'leave'].map(s => ({ value: s, label: label(s) }))} />
                    <OrgFilters value={filters} onChange={setFilters} show={['branch', 'hub', 'department']} />
                    <Checkbox checked={filters.late === 'true'} onChange={(e) => setFilters({ ...filters, late: e.target.checked ? 'true' : undefined })}>Late only</Checkbox>
                    <Checkbox checked={filters.missingCheckout === 'true'} onChange={(e) => setFilters({ ...filters, missingCheckout: e.target.checked ? 'true' : undefined })}>Missing check-out</Checkbox>
                </Space>
                <Table rowKey="id" size="small" loading={loading} columns={columns} dataSource={data} scroll={{ x: 1250 }}
                    pagination={{ current: page, pageSize: 50, total: pagination?.total, onChange: setPage, showTotal: t => `${t} records` }} />
            </Card>
            <Modal title="Record attendance" open={open} onCancel={() => setOpen(false)} onOk={save} okText="Save" destroyOnClose>
                <Alert type="info" showIcon className="mb-3" message="Use this for signed paper attendance sheets and corrections. Every manual change is logged with your name and the reason." />
                <Form form={form} layout="vertical">
                    <Form.Item name="employee" label="Employee" rules={[{ required: true }]}><EmployeeSelect /></Form.Item>
                    <Row gutter={12}>
                        <Col span={8}><Form.Item name="date" label="Date" rules={[{ required: true }]}><Input type="date" max={today()} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="inTime" label="In time"><Input type="time" /></Form.Item></Col>
                        <Col span={8}><Form.Item name="outTime" label="Out time"><Input type="time" /></Form.Item></Col>
                        <Col span={8}><Form.Item name="status" label="Status" extra="Empty = from times"><Select allowClear options={STATUSES.map(s => ({ value: s, label: label(s) }))} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="breakMinutes" label="Break (min)"><InputNumber min={0} className="w-full" /></Form.Item></Col>
                        <Col span={8}><Form.Item name="otHours" label="OT hours" extra="Empty = automatic"><InputNumber min={0} max={16} className="w-full" /></Form.Item></Col>
                    </Row>
                    <Form.Item name="reason" label="Reason" rules={[{ required: true }]}><Input placeholder="e.g. Signed office attendance sheet" /></Form.Item>
                    <Form.Item name="remarks" label="Remarks"><Input /></Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

// ── Excel import / export ───────────────────────────────────────────
interface Batch { _id: string; fileName: string; status: string; totalRows: number; validRows: number; errorRows: number; rows: { row: number; data: Record<string, string | number | null>; problems: string[]; warnings: string[] }[] }

export function ImportExportPage() {
    const { can } = useAuth();
    const { message } = App.useApp();
    const act = useAction();
    const [batch, setBatch] = useState<Batch | null>(null);
    const [overwrite, setOverwrite] = useState(false);
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState<{ imported: number } | null>(null);
    const [exportRange, setExportRange] = useState({ from: today().slice(0, 8) + '01', to: today() });
    const [period, setPeriod] = useState(today().slice(0, 7));
    const step = done ? 3 : batch ? 2 : 1;

    const validate = async (file: File) => {
        const form = new FormData();
        form.append('file', file);
        form.append('overwrite', String(overwrite));
        setBusy(true);
        const r = await act(() => upload<Batch>('/attendance/import/validate', form));
        setBusy(false);
        if (r) { setBatch(r.data); setDone(null); }
        return false;
    };
    const commit = async () => {
        if (!batch) return;
        setBusy(true);
        const r = await act(() => http.post<{ imported: number }>(`/attendance/import/${batch._id}/commit`), 'Import complete');
        setBusy(false);
        if (r) setDone(r.data);
    };
    const dl = (path: string) => download(path).catch(e => message.error(e.message));

    return (
        <div>
            <PageHeader title="Excel Import / Export" subtitle="Bring attendance in from spreadsheets and take payroll and attendance out to Excel" />
            {can('attendance.import') && (
                <Card className={cardClass()} title="Import attendance">
                    <Steps current={step} className="mb-6" items={[{ title: 'Download template' }, { title: 'Upload & validate' }, { title: 'Review' }, { title: 'Imported' }]} />
                    <Space wrap className="mb-4">
                        <Button icon={<DownloadOutlined />} onClick={() => dl('/attendance/import/template')}>Download template</Button>
                        <Checkbox checked={overwrite} onChange={(e) => setOverwrite(e.target.checked)}>Replace existing attendance for the same day</Checkbox>
                    </Space>
                    <Upload.Dragger accept=".xlsx,.csv" beforeUpload={validate} showUploadList={false} disabled={busy}>
                        <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                        <p>Drop the filled template (.xlsx or .csv) here, or click to choose</p>
                        <p className="text-xs text-gray-500">Columns: Employee Code, Employee Name, Date, In Time, Out Time, Status, OT Hours, Remarks</p>
                    </Upload.Dragger>
                    {batch && (
                        <div className="mt-6">
                            <Space wrap className="mb-3">
                                <Tag>{batch.fileName}</Tag><Tag color="green">{batch.validRows} valid</Tag><Tag color={batch.errorRows ? 'red' : 'default'}>{batch.errorRows} with errors</Tag>
                                {batch.errorRows > 0 && <Button size="small" icon={<DownloadOutlined />} onClick={() => dl(`/attendance/import/${batch._id}/errors`)}>Download error report</Button>}
                                {!done && <Button type="primary" loading={busy} disabled={!batch.validRows} onClick={commit}>Import {batch.validRows} valid row(s)</Button>}
                                <Button onClick={() => { setBatch(null); setDone(null); }}>Start over</Button>
                            </Space>
                            {done && <Alert type="success" showIcon className="mb-3" message={`${done.imported} attendance record(s) imported. Rows with errors were skipped.`} />}
                            <Table size="small" rowKey="row" dataSource={batch.rows} pagination={{ pageSize: 20 }} scroll={{ x: 900 }} columns={[
                                { title: 'Row', dataIndex: 'row', width: 60 },
                                { title: 'Employee', render: (_, r) => `${r.data.employeeCode} ${r.data.employeeName || ''}` },
                                { title: 'Date', render: (_, r) => r.data.date, width: 110 },
                                { title: 'In / Out', render: (_, r) => `${r.data.inTime || '—'} / ${r.data.outTime || '—'}`, width: 120 },
                                { title: 'Status', render: (_, r) => r.data.status || 'auto', width: 100 },
                                { title: 'Result', render: (_, r) => r.problems.length ? <Typography.Text type="danger">{r.problems.join('; ')}</Typography.Text>
                                    : r.warnings.length ? <Typography.Text type="warning">{r.warnings.join('; ')}</Typography.Text> : <Typography.Text type="success">OK</Typography.Text> },
                            ]} />
                        </div>
                    )}
                </Card>
            )}
            <Row gutter={[16, 16]} className="mt-4">
                <Col xs={24} md={12}>
                    <Card className={cardClass()} title="Export attendance">
                        <Space wrap>
                            <Input type="date" value={exportRange.from} onChange={(e) => setExportRange({ ...exportRange, from: e.target.value })} />
                            <Input type="date" value={exportRange.to} onChange={(e) => setExportRange({ ...exportRange, to: e.target.value })} />
                            <Button icon={<DownloadOutlined />} onClick={() => dl(`/attendance/export?from=${exportRange.from}&to=${exportRange.to}&format=xlsx`)}>Excel</Button>
                            <Button onClick={() => dl(`/attendance/export?from=${exportRange.from}&to=${exportRange.to}&format=csv`)}>CSV</Button>
                        </Space>
                    </Card>
                </Col>
                {can('payroll.export', 'reports.view') && (
                    <Col xs={24} md={12}>
                        <Card className={cardClass()} title="Export payroll">
                            <Space wrap>
                                <Input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} />
                                <Button icon={<DownloadOutlined />} onClick={() => dl(`/payroll/reports/monthly-payroll?from=${period}-01&to=${period}-28&format=xlsx`)}>Payroll Excel</Button>
                                <Button onClick={() => dl(`/payroll/reports/bank-payment?from=${period}-01&to=${period}-28&format=xlsx`)}>Bank payment file</Button>
                            </Space>
                            <p className="text-xs text-gray-500 mt-2">Per-run exports with every component are on the payroll run page.</p>
                        </Card>
                    </Col>
                )}
            </Row>
        </div>
    );
}

// ── Biometric events ────────────────────────────────────────────────
interface EventRow { id: string; device?: { deviceCode: string }; employee?: { fullName: string; employeeCode: string }; biometricUserId: string; timestamp: string; localTime: string; eventType: string; status: string; error: string; source: string }

export function BiometricEventsPage() {
    const { message } = App.useApp();
    const act = useAction();
    const [status, setStatus] = useState<string | undefined>();
    const [page, setPage] = useState(1);
    const { data, pagination, loading, reload } = useList<EventRow>('/biometric/events', { status, page, limit: 50 });
    const [device, setDevice] = useState<string | undefined>();
    const process = async () => {
        const r = await act(() => http.post<{ events: number; attendanceUpdated: number; errors: number }>('/biometric/process', { device }));
        if (r) { message.success(`${r.data.events} event(s) → ${r.data.attendanceUpdated} attendance day(s) updated, ${r.data.errors} problem(s)`); reload(); }
    };
    const uploadLog = async (file: File) => {
        const form = new FormData();
        form.append('file', file);
        if (device) form.append('device', device);
        const r = await act(() => upload<{ stored: number; duplicates: number }>('/biometric/events/upload', form));
        if (r) { message.success(`${r.data.stored} punch(es) stored, ${r.data.duplicates} duplicate(s) ignored`); reload(); }
        return false;
    };
    return (
        <div>
            <PageHeader title="Biometric Events" subtitle="Raw fingerprint punches. Each employee's first valid punch of the day becomes check-in and the last becomes check-out (or the device's IN/OUT flags)."
                extra={<>
                    <RemoteSelect path="/biometric/devices" className="w-56" placeholder="All devices" value={device} onChange={(v) => setDevice(v as string)} labelKey="name" />
                    <Upload accept=".csv,.xlsx" beforeUpload={uploadLog} showUploadList={false}><Button icon={<CloudUploadOutlined />}>Upload device log</Button></Upload>
                    <Button type="primary" icon={<SyncOutlined />} onClick={process}>Process pending</Button>
                </>} />
            <Alert type="info" showIcon className="mb-4" message="Device integration"
                description={<span>Devices (or a small push service next to them) send <code>POST /api/biometric/events</code> with headers <code>X-Device-Code</code> and <code>X-Device-Key</code> (issue a key on the Devices page) and a body like <code>{'{ "events": [{ "biometricUserId": "1001", "timestamp": "2026-10-05T08:29:00+05:30", "eventType": "in" }] }'}</code>. Log files exported from a device can be uploaded here with columns <i>User ID, Timestamp, Type</i>.</span>} />
            <Card className={cardClass()}>
                <Select allowClear placeholder="Status" className="w-40 mb-3" value={status} onChange={setStatus} options={['pending', 'processed', 'error', 'ignored', 'duplicate'].map(s => ({ value: s, label: label(s) }))} />
                <Table rowKey="id" size="small" loading={loading} dataSource={data} scroll={{ x: 900 }}
                    pagination={{ current: page, pageSize: 50, total: pagination?.total, onChange: setPage }}
                    columns={[
                        { title: 'Time', render: (_, r) => `${new Date(r.timestamp).toLocaleDateString()} ${r.localTime}`, width: 170 },
                        { title: 'Device', render: (_, r) => r.device?.deviceCode || label(r.source), width: 120 },
                        { title: 'Bio ID', dataIndex: 'biometricUserId', width: 90 },
                        { title: 'Employee', render: (_, r) => (r.employee ? `${r.employee.employeeCode} — ${r.employee.fullName}` : <Tag color="red">unmapped</Tag>) },
                        { title: 'Type', dataIndex: 'eventType', width: 90, render: label },
                        { title: 'Status', dataIndex: 'status', width: 110, render: (s: string) => <StatusTag status={s} /> },
                        { title: 'Note', dataIndex: 'error', render: (e: string) => <span className="text-xs">{e}</span> },
                    ]} />
            </Card>
        </div>
    );
}
