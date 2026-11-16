import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AutoComplete, Button, Card, Col, Drawer, Empty, Form, Input, InputNumber, Popconfirm, Progress, Row, Segmented, Space, Statistic, Table, Tag, Typography } from 'antd';
import { CheckCircleOutlined, ExportOutlined, ImportOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { errorMessage, http } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { cardClass, PageHeader, today, useAction } from '../hr/lib';
import { GARMENT_TYPES, JOB_STATE, qty, type DesignJob } from './types';

interface Summary { open: number; overdue: number; dueToday: number; toComplete: number }
interface Movement { id: string; number: string; bookNo?: string; date: string; direction: 'in' | 'out'; status: string; qty: number | null; lines: number | string }
type JobDetail = DesignJob & { movements: Movement[] };

const fmtDate = (d?: string | null) => (d ? new Date(`${d}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const daysLeft = (d?: string | null) => (d ? Math.round((Date.parse(`${d}T00:00:00Z`) - Date.parse(`${today()}T00:00:00Z`)) / 86400000) : null);
const StateTag = ({ job }: { job: DesignJob }) => <Tag color={JOB_STATE[job.state].color} className="m-0">{JOB_STATE[job.state].label}</Tag>;

const Due = ({ job }: { job: DesignJob }) => {
    if (!job.dueDate) return <Typography.Text type="secondary">Not set</Typography.Text>;
    const left = daysLeft(job.dueDate)!;
    const open = ['in_progress', 'due_today', 'overdue'].includes(job.state);
    return (
        <span>
            <b>{fmtDate(job.dueDate)}</b>{job.dueTime && <span> {job.dueTime}</span>}
            {open && <Typography.Text type={left < 0 ? 'danger' : left <= 1 ? 'warning' : 'secondary'} className="block text-xs">
                {left < 0 ? `${-left} day${left === -1 ? '' : 's'} late` : left === 0 ? 'Today' : `${left} day${left === 1 ? '' : 's'} left`}
            </Typography.Text>}
        </span>
    );
};

const JobDrawer = ({ id, onClose, onChanged }: { id: string | null; onClose: () => void; onChanged: () => void }) => {
    const { can } = useAuth();
    const act = useAction();
    const navigate = useNavigate();
    const [job, setJob] = useState<JobDetail | null>(null);
    const [error, setError] = useState('');
    const [form] = Form.useForm();
    const canEdit = can('stores.edit', 'stores.manage');
    const load = () => id && http.get<JobDetail>(`/stores/jobs/${id}`).then(r => { setJob(r.data); form.setFieldsValue(r.data); }).catch(e => setError(errorMessage(e)));
    useEffect(() => { setJob(null); setError(''); load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
    const save = async (extra: Record<string, unknown> = {}) => {
        const v = await form.validateFields();
        if (await act(() => http.put(`/stores/jobs/${id}`, { ...v, ...extra }), extra.closed === true ? 'Job closed' : extra.closed === false ? 'Job reopened' : 'Saved')) { load(); onChanged(); }
    };
    const pct = job && job.target ? Math.min(100, Math.round((job.completed / job.target) * 100)) : 0;
    return (
        <Drawer open={!!id} onClose={onClose} width={820} loading={!job && !error}
            title={job ? <Space>Design {job.designNo}{job.garmentType && <span>· {job.garmentType}</span>}<StateTag job={job} /></Space> : 'Job'}
            extra={job && canEdit && job.balance > 0 && !job.closed && (
                <Button type="primary" icon={<ExportOutlined />} onClick={() => navigate(`/admin/hr/gate-pass-out?job=${job.id}&party=${encodeURIComponent(job.party)}`)}>Send completed</Button>
            )}>
            {error && <Alert type="error" message={error} />}
            {job && (
                <>
                    <Typography.Paragraph type="secondary" className="!mb-3">From <b>{job.party}</b> · cut received {fmtDate(job.receivedDate)}</Typography.Paragraph>
                    <Row gutter={16} className="mb-2">
                        <Col span={6}><Statistic title="Cut received (garments)" value={job.received} /></Col>
                        <Col span={6}><Statistic title="Completed & sent" value={job.completed} valueStyle={{ color: '#10b981' }} /></Col>
                        <Col span={6}><Statistic title="Left to complete" value={job.balance} valueStyle={job.balance ? { color: '#B8941F', fontWeight: 700 } : undefined} /></Col>
                        <Col span={6}><div className="text-admin-muted text-sm mb-1">Due</div><div className="text-base"><Due job={job} /></div></Col>
                    </Row>
                    <Progress percent={pct} strokeColor={pct >= 100 ? '#10b981' : '#D4AF37'} className="mb-4" />
                    {job.extra > 0 && <Alert type="warning" showIcon className="mb-4" message={`${qty(job.extra)} more sent than received. Check the garment counts on the gate passes.`} />}

                    <Card size="small" className={`${cardClass()} mb-4`} title="Job details">
                        <Form form={form} layout="vertical" disabled={!canEdit}>
                            <Row gutter={12}>
                                <Col span={6}><Form.Item name="designNo" label="Design no" rules={[{ required: true }]}><Input maxLength={40} /></Form.Item></Col>
                                <Col span={6}><Form.Item name="garmentType" label="Garment"><AutoComplete options={GARMENT_TYPES.map(g => ({ value: g }))} /></Form.Item></Col>
                                <Col span={6}><Form.Item name="dueDate" label="Due date"><Input type="date" /></Form.Item></Col>
                                <Col span={6}><Form.Item name="dueTime" label="Due time"><Input type="time" /></Form.Item></Col>
                                <Col span={8}><Form.Item name="orderQty" label="Order quantity" tooltip="Total the customer expects, if more cut is still to come. Empty = what has been received."><InputNumber min={0} className="w-full" placeholder={String(job.received)} /></Form.Item></Col>
                                <Col span={16}><Form.Item name="note" label="Note"><Input maxLength={300} /></Form.Item></Col>
                            </Row>
                            {canEdit && (
                                <Space>
                                    <Button type="primary" onClick={() => save()}>Save</Button>
                                    {job.closed
                                        ? <Button onClick={() => save({ closed: false })}>Reopen job</Button>
                                        : <Popconfirm title="Close this job?" description="Use this when the rest will not be made (short cut, order dropped)." onConfirm={() => save({ closed: true })}><Button icon={<CheckCircleOutlined />}>Close job</Button></Popconfirm>}
                                </Space>
                            )}
                        </Form>
                    </Card>

                    <Typography.Title level={5}>Gate passes</Typography.Title>
                    <Table<Movement> rowKey="id" size="small" pagination={false} dataSource={job.movements} locale={{ emptyText: <Empty description="No gate passes" /> }}
                        columns={[
                            { title: 'Date', dataIndex: 'date', width: 110, render: fmtDate },
                            { title: '', dataIndex: 'direction', width: 110, render: (d: string) => (d === 'in' ? <Tag color="green" icon={<ImportOutlined />}>Cut in</Tag> : <Tag color="volcano" icon={<ExportOutlined />}>Completed out</Tag>) },
                            { title: 'Gate pass', render: (_, m) => <span><b>{m.number}</b>{m.bookNo && <Typography.Text type="secondary"> · Book #{m.bookNo}</Typography.Text>}{m.status === 'cancelled' && <Tag color="red" className="ml-2">Cancelled</Tag>}</span> },
                            { title: 'Detail', render: (_, m) => (m.direction === 'in' ? `${m.lines} cut line${m.lines === 1 ? '' : 's'}` : m.lines || '') },
                            { title: 'Garments', dataIndex: 'qty', width: 100, align: 'right', render: (n: number | null, m) => <b style={{ color: m.status === 'cancelled' ? undefined : m.direction === 'in' ? '#10b981' : '#ef4444' }}>{m.direction === 'in' ? '+' : '−'}{qty(n ?? 0)}</b> },
                        ]} />
                </>
            )}
        </Drawer>
    );
};

/** Sewing jobs: cut pieces received by design number, completed garments sent back, what is left and when it is due. */
export function JobsPage() {
    const act = useAction();
    const [status, setStatus] = useState('open');
    const [search, setSearch] = useState('');
    const [rows, setRows] = useState<DesignJob[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(false);
    const [openId, setOpenId] = useState<string | null>(null);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const t = setTimeout(async () => {
            setLoading(true);
            const res = await act(() => http.get<DesignJob[]>('/stores/jobs', { status, search }));
            setLoading(false);
            if (res) { setRows(res.data); setSummary((res as unknown as { summary: Summary }).summary); }
        }, 200);
        return () => clearTimeout(t);
    }, [status, search, tick, act]);

    return (
        <div>
            <PageHeader title="Design Jobs" subtitle="Cut pieces received by design number, garments completed and sent back, and what is left before the due date. Jobs start from a gate pass in."
                extra={<Button icon={<ReloadOutlined />} onClick={() => setTick(t => t + 1)} aria-label="Refresh" />} />
            <Row gutter={[16, 16]} className="mb-4">
                <Col xs={12} md={6}><Card className={cardClass()} size="small"><Statistic title="Open jobs" value={summary?.open ?? 0} /></Card></Col>
                <Col xs={12} md={6}><Card className={cardClass()} size="small"><Statistic title="Garments left to complete" value={summary?.toComplete ?? 0} /></Card></Col>
                <Col xs={12} md={6}><Card className={cardClass()} size="small"><Statistic title="Due today" value={summary?.dueToday ?? 0} valueStyle={summary?.dueToday ? { color: '#f59e0b' } : undefined} /></Card></Col>
                <Col xs={12} md={6}><Card className={cardClass()} size="small"><Statistic title="Overdue" value={summary?.overdue ?? 0} valueStyle={summary?.overdue ? { color: '#ef4444' } : undefined} /></Card></Col>
            </Row>
            <Card className={cardClass()}>
                <Space wrap className="mb-4">
                    <Input allowClear prefix={<SearchOutlined />} placeholder="Design no, customer, garment" className="w-72" value={search} onChange={e => setSearch(e.target.value)} />
                    <Segmented value={status} onChange={v => setStatus(v as string)}
                        options={[{ value: 'open', label: 'Open' }, { value: 'overdue', label: 'Overdue' }, { value: 'completed', label: 'Completed' }, { value: 'closed', label: 'Closed' }, { value: 'all', label: 'All' }]} />
                </Space>
                <Table<DesignJob> rowKey="id" loading={loading} dataSource={rows} size="middle" pagination={{ pageSize: 50, hideOnSinglePage: true }}
                    onRow={r => ({ onClick: () => setOpenId(r.id), className: 'cursor-pointer' })}
                    locale={{ emptyText: <Empty description={status === 'open' ? 'No open jobs. Record cut pieces with a design number on a gate pass in.' : 'No jobs'} /> }}
                    columns={[
                        { title: 'Due', width: 150, render: (_, j) => <Due job={j} /> },
                        { title: 'Design no', dataIndex: 'designNo', width: 110, render: (d: string) => <b className="text-base">{d}</b> },
                        { title: 'Garment', dataIndex: 'garmentType', width: 110, render: (g: string) => g || '—' },
                        { title: 'Customer', dataIndex: 'party' },
                        { title: 'Cut received', dataIndex: 'received', width: 110, align: 'right', render: (n: number, j) => <span>{qty(n)}{j.orderQty ? <Typography.Text type="secondary" className="block text-xs">of {qty(j.orderQty)} ordered</Typography.Text> : null}</span> },
                        { title: 'Sent', dataIndex: 'completed', width: 80, align: 'right', render: qty },
                        { title: 'Left', dataIndex: 'balance', width: 80, align: 'right', render: (n: number) => <b>{qty(n)}</b> },
                        { title: 'Progress', width: 150, render: (_, j) => <Progress percent={j.target ? Math.min(100, Math.round((j.completed / j.target) * 100)) : 0} size="small" strokeColor={j.state === 'overdue' ? '#ef4444' : undefined} /> },
                        { title: 'Status', width: 110, render: (_, j) => <StateTag job={j} /> },
                    ]} />
            </Card>
            <JobDrawer id={openId} onClose={() => setOpenId(null)} onChanged={() => setTick(t => t + 1)} />
        </div>
    );
}
