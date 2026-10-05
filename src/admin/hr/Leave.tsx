import { useState } from 'react';
import { App, Button, Card, Checkbox, Col, Form, Input, InputNumber, Modal, Row, Select, Space, Table, Tabs, Tag, Upload } from 'antd';
import { CheckOutlined, CloseOutlined, PlusOutlined, StopOutlined, UploadOutlined } from '@ant-design/icons';
import { http } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { cardClass, EmployeeSelect, label, PageHeader, RemoteSelect, StatusTag, today, upload, useAction, useList } from './lib';

interface LeaveRow {
    id: string; employee: { _id: string; fullName: string; employeeCode: string }; leaveType: { name: string; code: string; paid: boolean; color: string };
    fromDate: string; toDate: string; days: number; halfDay: boolean; reason: string; status: string;
    approvals: { level: string; decision: string; by?: { name: string }; at: string; note: string }[]; documents: { _id: string; name: string }[]; createdAt: string;
}

export const LeaveRequestForm = ({ open, onClose, onSaved, self = false }: { open: boolean; onClose: () => void; onSaved: () => void; self?: boolean }) => {
    const [form] = Form.useForm();
    const act = useAction();
    const [files, setFiles] = useState<File[]>([]);
    const save = async () => {
        const v = await form.validateFields();
        const fd = new FormData();
        Object.entries({ ...v, toDate: v.halfDay ? v.fromDate : v.toDate }).forEach(([k, val]) => { if (val !== undefined && val !== null) fd.append(k, String(val)); });
        files.forEach(f => fd.append('documents', f));
        const r = await act(() => upload('/leave-requests', fd), 'Leave request submitted');
        if (r) { form.resetFields(); setFiles([]); onSaved(); }
    };
    const halfDay = Form.useWatch('halfDay', form);
    return (
        <Modal title="Request leave" open={open} onCancel={onClose} onOk={save} okText="Submit" destroyOnClose>
            <Form form={form} layout="vertical" initialValues={{ fromDate: today(), toDate: today(), halfDay: false }}>
                {!self && <Form.Item name="employee" label="Employee" rules={[{ required: true }]}><EmployeeSelect /></Form.Item>}
                <Form.Item name="leaveType" label="Leave type" rules={[{ required: true }]}><RemoteSelect path="/leave-types" query={{ active: 'true' }} /></Form.Item>
                <Row gutter={12}>
                    <Col span={12}><Form.Item name="fromDate" label="From" rules={[{ required: true }]}><Input type="date" /></Form.Item></Col>
                    <Col span={12}><Form.Item name="toDate" label="To" rules={[{ required: !halfDay }]}><Input type="date" disabled={halfDay} /></Form.Item></Col>
                </Row>
                <Form.Item name="halfDay" valuePropName="checked"><Checkbox>Half day</Checkbox></Form.Item>
                <Form.Item name="reason" label="Reason"><Input.TextArea rows={2} /></Form.Item>
                <Upload beforeUpload={(f) => { setFiles(fs => [...fs, f]); return false; }} onRemove={(f) => setFiles(fs => fs.filter(x => x.name !== f.name))} accept=".pdf,.jpg,.jpeg,.png">
                    <Button icon={<UploadOutlined />}>Attach document (e.g. medical certificate)</Button>
                </Upload>
            </Form>
        </Modal>
    );
};

export function LeavePage() {
    const { can } = useAuth();
    const { modal } = App.useApp();
    const act = useAction();
    const [status, setStatus] = useState<string | undefined>('pending');
    const [employee, setEmployee] = useState<string | undefined>();
    const { data, loading, reload } = useList<LeaveRow>('/leave-requests', { status: status === 'pending' ? undefined : status, employee, limit: 200 });
    const rows = status === 'pending' ? data.filter(r => ['pending', 'supervisor_approved'].includes(r.status)) : data;
    const [open, setOpen] = useState(false);
    const [balEmployee, setBalEmployee] = useState<string | undefined>();
    const balances = useList<{ id: string; leaveType: { name: string; code: string }; year: number; opening: number; accrued: number; adjusted: number; used: number; pending: number; remaining: number }>(balEmployee ? `/employees/${balEmployee}/leave-balances` : null);

    const decide = (r: LeaveRow, decision: 'approve' | 'reject') => {
        let note = '';
        modal.confirm({
            title: `${decision === 'approve' ? 'Approve' : 'Reject'} ${r.days} day(s) of ${r.leaveType.name} for ${r.employee.fullName}?`,
            content: <Input placeholder="Note (optional)" onChange={(e) => { note = e.target.value; }} />,
            okType: decision === 'reject' ? 'danger' : 'primary',
            onOk: async () => { if (await act(() => http.patch(`/leave-requests/${r.id}/${decision}`, { note }), decision === 'approve' ? 'Approved' : 'Rejected')) reload(); },
        });
    };
    const cancel = (r: LeaveRow) => modal.confirm({
        title: 'Cancel this leave?', content: 'Attendance written for the leave is removed and the balance restored.', okType: 'danger',
        onOk: async () => { if (await act(() => http.patch(`/leave-requests/${r.id}/cancel`, {}), 'Leave cancelled')) reload(); },
    });
    const adjust = (b: { id: string; adjusted: number }) => {
        let value = b.adjusted;
        let notes = '';
        modal.confirm({
            title: 'Adjust leave balance',
            content: <Space direction="vertical" className="w-full"><InputNumber className="w-full" defaultValue={b.adjusted} onChange={(v) => { value = Number(v); }} addonBefore="Adjustment (days)" /><Input placeholder="Reason" onChange={(e) => { notes = e.target.value; }} /></Space>,
            onOk: async () => { if (await act(() => http.patch(`/leave-balances/${b.id}`, { adjusted: value, notes }), 'Balance updated')) balances.reload(); },
        });
    };

    return (
        <div>
            <PageHeader title="Leave Management" subtitle="Request → supervisor approval → HR approval → attendance updated → payroll"
                extra={can('leave.request', 'leave.approve') && <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>New leave request</Button>} />
            <Tabs items={[
                {
                    key: 'requests', label: 'Requests', children: (
                        <Card className={cardClass()}>
                            <Space wrap className="mb-3">
                                <Select className="w-48" value={status} onChange={setStatus} allowClear placeholder="All" options={[
                                    { value: 'pending', label: 'Waiting for approval' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }, { value: 'cancelled', label: 'Cancelled' }]} />
                                <EmployeeSelect className="w-60" value={employee} onChange={(v) => setEmployee(v as string)} />
                            </Space>
                            <Table rowKey="id" loading={loading} dataSource={rows} scroll={{ x: 1000 }} pagination={{ pageSize: 25 }} columns={[
                                { title: 'Employee', render: (_, r) => `${r.employee.employeeCode} — ${r.employee.fullName}` },
                                { title: 'Type', render: (_, r) => <Tag color={r.leaveType.color}>{r.leaveType.name}{r.leaveType.paid ? '' : ' (unpaid)'}</Tag> },
                                { title: 'Dates', render: (_, r) => (r.fromDate === r.toDate ? r.fromDate : `${r.fromDate} → ${r.toDate}`), width: 200 },
                                { title: 'Days', dataIndex: 'days', width: 70 },
                                { title: 'Reason', dataIndex: 'reason' },
                                { title: 'Status', dataIndex: 'status', width: 150, render: (s: string) => <StatusTag status={s} /> },
                                { title: 'Approvals', render: (_, r) => <span className="text-xs">{r.approvals.map(a => `${label(a.level)} ${a.decision} by ${a.by?.name || '?'}`).join(', ')}</span> },
                                {
                                    title: '', width: 130, render: (_, r) => <Space size={0}>
                                        {['pending', 'supervisor_approved'].includes(r.status) && can('leave.approve', 'leave.approve.supervisor') && <>
                                            <Button type="text" icon={<CheckOutlined className="text-green-600" />} onClick={() => decide(r, 'approve')} title="Approve" />
                                            <Button type="text" danger icon={<CloseOutlined />} onClick={() => decide(r, 'reject')} title="Reject" />
                                        </>}
                                        {!['rejected', 'cancelled'].includes(r.status) && can('leave.approve') && <Button type="text" icon={<StopOutlined />} onClick={() => cancel(r)} title="Cancel" />}
                                    </Space>,
                                },
                            ]} />
                        </Card>
                    ),
                },
                {
                    key: 'balances', label: 'Balances', children: (
                        <Card className={cardClass()}>
                            <EmployeeSelect className="w-72 mb-3" value={balEmployee} onChange={(v) => setBalEmployee(v as string)} />
                            <Table rowKey="id" loading={balances.loading} dataSource={balances.data} pagination={false} columns={[
                                { title: 'Leave type', dataIndex: ['leaveType', 'name'] }, { title: 'Year', dataIndex: 'year', width: 80 },
                                { title: 'Opening', dataIndex: 'opening' }, { title: 'Entitled', dataIndex: 'accrued' }, { title: 'Adjusted', dataIndex: 'adjusted' },
                                { title: 'Used', dataIndex: 'used' }, { title: 'Pending', dataIndex: 'pending' }, { title: 'Remaining', dataIndex: 'remaining', render: (v: number) => <b>{v}</b> },
                                ...(can('leave.manage') ? [{ title: '', width: 90, render: (_: unknown, b: { id: string; adjusted: number }) => <Button size="small" onClick={() => adjust(b)}>Adjust</Button> }] : []),
                            ]} />
                        </Card>
                    ),
                },
            ]} />
            <LeaveRequestForm open={open} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); reload(); }} />
        </div>
    );
}

// ── Overtime ────────────────────────────────────────────────────────
interface OtRow { id: string; employee: { fullName: string; employeeCode: string }; date: string; overtimeType: { name: string; code: string; multiplier: number }; hours: number; requestedHours?: number; source: string; status: string; approvedBy?: { name: string }; remarks: string }

export function OvertimePage() {
    const { can } = useAuth();
    const act = useAction();
    const [filters, setFilters] = useState<Record<string, string | undefined>>({ status: 'pending' });
    const { data, loading, reload } = useList<OtRow>('/overtime', { ...filters, limit: 500 });
    const [selected, setSelected] = useState<string[]>([]);
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();
    const save = async () => {
        const v = await form.validateFields();
        if (await act(() => http.post('/overtime', v), 'Overtime recorded')) { setOpen(false); reload(); }
    };
    return (
        <div>
            <PageHeader title="Overtime" subtitle="Hours beyond the normal day are picked up from attendance automatically; only approved overtime is paid."
                extra={<>
                    {can('overtime.approve') && selected.length > 0 && <Button onClick={async () => { if (await act(() => http.post('/overtime/bulk-approve', { ids: selected }), 'Approved')) { setSelected([]); reload(); } }}>Approve {selected.length} selected</Button>}
                    {can('overtime.edit') && <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); form.setFieldsValue({ date: today() }); setOpen(true); }}>Record overtime</Button>}
                </>} />
            <Card className={cardClass()}>
                <Space wrap className="mb-3">
                    <Select className="w-40" allowClear placeholder="Status" value={filters.status} onChange={(v) => setFilters({ ...filters, status: v })} options={['pending', 'approved', 'rejected'].map(s => ({ value: s, label: label(s) }))} />
                    <Input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
                    <Input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
                    <EmployeeSelect className="w-60" value={filters.employee} onChange={(v) => setFilters({ ...filters, employee: v as string })} />
                </Space>
                <Table rowKey="id" loading={loading} dataSource={data} scroll={{ x: 900 }} pagination={{ pageSize: 50 }}
                    rowSelection={can('overtime.approve') ? { selectedRowKeys: selected, onChange: (k) => setSelected(k as string[]), getCheckboxProps: (r) => ({ disabled: r.status !== 'pending' }) } : undefined}
                    columns={[
                        { title: 'Date', dataIndex: 'date', width: 110 },
                        { title: 'Employee', render: (_, r) => `${r.employee.employeeCode} — ${r.employee.fullName}` },
                        { title: 'Type', render: (_, r) => <Tag>{r.overtimeType.name}</Tag>, width: 140 },
                        { title: 'Hours', dataIndex: 'hours', width: 80, render: (h: number, r) => (r.requestedHours != null && r.requestedHours !== h ? <span title={`Recorded ${r.requestedHours}h, rounded`}>{h}*</span> : h) },
                        { title: 'Source', dataIndex: 'source', render: label, width: 100 },
                        { title: 'Status', dataIndex: 'status', width: 110, render: (s: string) => <StatusTag status={s} /> },
                        { title: 'Remarks', dataIndex: 'remarks' },
                        ...(can('overtime.approve') ? [{
                            title: '', width: 100, render: (_: unknown, r: OtRow) => r.status === 'pending' && <Space size={0}>
                                <Button type="text" icon={<CheckOutlined className="text-green-600" />} onClick={async () => { if (await act(() => http.patch(`/overtime/${r.id}/approve`, {}), 'Approved')) reload(); }} />
                                <Button type="text" danger icon={<CloseOutlined />} onClick={async () => { if (await act(() => http.patch(`/overtime/${r.id}/reject`, {}), 'Rejected')) reload(); }} />
                            </Space>,
                        }] : []),
                    ]} />
            </Card>
            <Modal title="Record overtime" open={open} onCancel={() => setOpen(false)} onOk={save} destroyOnClose>
                <Form form={form} layout="vertical">
                    <Form.Item name="employee" label="Employee" rules={[{ required: true }]}><EmployeeSelect /></Form.Item>
                    <Row gutter={12}>
                        <Col span={12}><Form.Item name="date" label="Date" rules={[{ required: true }]}><Input type="date" /></Form.Item></Col>
                        <Col span={12}><Form.Item name="hours" label="Hours" rules={[{ required: true }]}><InputNumber min={0.25} max={24} step={0.25} className="w-full" /></Form.Item></Col>
                    </Row>
                    <Form.Item name="overtimeType" label="Overtime type" rules={[{ required: true }]}><RemoteSelect path="/overtime-types" query={{ active: 'true' }} /></Form.Item>
                    <Form.Item name="remarks" label="Remarks"><Input /></Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
