import { useCallback, useEffect, useState } from 'react';
import { App, Button, Card, Col, Empty, Form, Input, InputNumber, Progress, Row, Space, Statistic, Table, Tag, Typography } from 'antd';
import { DeleteOutlined, DesktopOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Bar, CartesianGrid, Cell, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { errorMessage, http } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { cardClass, PageHeader, today, useAction, useList } from './lib';
import { shortDay, type DayTotal, type ProductionBoardData, type ProductionSettings } from './productionTypes';

interface LogRow { id: string; date: string; time: string | null; item: string; quantity: number; note: string; createdBy?: { name: string } }

const axis = { fontSize: 11 };
const addDays = (day: string, n: number) => { const d = new Date(`${day}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const nowTime = () => new Date().toTimeString().slice(0, 5);

/** Daily target tracking: supervisors add finished pieces through the day; the TV board shows the result. */
export function ProductionPage() {
    const { can } = useAuth();
    const { message } = App.useApp();
    const act = useAction();
    const [date, setDate] = useState(today());
    const [board, setBoard] = useState<ProductionBoardData | null>(null);
    const [summary, setSummary] = useState<DayTotal[]>([]);
    const logs = useList<LogRow>('/production/logs', { date });
    const [form] = Form.useForm();
    const [targetForm] = Form.useForm();
    const [settingsForm] = Form.useForm();
    const canEdit = can('production.edit', 'production.manage');
    const canManage = can('production.manage');
    const isToday = date === today();

    const loadBoard = useCallback(async () => {
        try {
            const [b, s] = await Promise.all([
                http.get<ProductionBoardData>('/production/board', { date }),
                http.get<DayTotal[]>('/production/summary', { from: addDays(date, -29), to: date }),
            ]);
            setBoard(b.data);
            setSummary(s.data.filter(d => d.achieved > 0 || d.custom || d.date === date));
            targetForm.setFieldsValue({ target: b.data.target, note: b.data.targetNote });
        } catch (err) { message.error(errorMessage(err)); }
    }, [date, message, targetForm]);
    useEffect(() => { loadBoard(); }, [loadBoard]);
    useEffect(() => {
        if (!canManage) return;
        http.get<ProductionSettings>('/production/settings').then(r => settingsForm.setFieldsValue(r.data)).catch(() => undefined);
    }, [canManage, settingsForm]);
    const reload = () => { logs.reload(); loadBoard(); };

    const add = async (quantity?: number) => {
        const v = quantity ? { quantity } : await form.validateFields();
        const body = { date, time: isToday ? (v.time || nowTime()) : v.time || null, item: v.item || form.getFieldValue('item') || '', quantity: v.quantity, note: v.note || '' };
        if (await act(() => http.post('/production/logs', body), `${v.quantity} piece(s) added`)) {
            form.setFieldsValue({ quantity: null, note: '', time: undefined });
            reload();
        }
    };
    const remove = async (row: LogRow) => { if (await act(() => http.delete(`/production/logs/${row.id}`), 'Entry removed')) reload(); };
    const saveTarget = async () => {
        const v = await targetForm.validateFields();
        if (await act(() => http.put(`/production/targets/${date}`, v), 'Target saved for this day')) loadBoard();
    };
    const resetTarget = async () => { if (await act(() => http.delete(`/production/targets/${date}`), 'Back to the default target')) loadBoard(); };
    const saveSettings = async () => {
        const v = await settingsForm.validateFields();
        if (await act(() => http.put('/production/settings', v), 'Saved')) loadBoard();
    };

    const percent = board?.percent ?? 0;
    return (
        <div>
            <PageHeader title="Daily Production Target" subtitle="Add finished pieces during the day. The factory TV board updates every 30 seconds."
                extra={<>
                    <Input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value || today())} className="w-40" />
                    <Button icon={<ReloadOutlined />} onClick={reload} aria-label="Refresh" />
                    <Button type="primary" icon={<DesktopOutlined />} onClick={() => window.open(`/factory-board${isToday ? '' : `?date=${date}`}`, '_blank', 'noopener')}>Open TV board</Button>
                </>} />

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                    <Card className={cardClass()}>
                        <Row gutter={16} align="middle">
                            <Col xs={24} md={8} className="text-center">
                                <Progress type="dashboard" percent={Math.min(100, percent)} format={() => `${percent}%`} size={170}
                                    strokeColor={percent >= 100 ? '#10b981' : { '0%': '#B8941F', '100%': '#E8C35A' }} />
                            </Col>
                            <Col xs={24} md={16}>
                                <Row gutter={[16, 16]}>
                                    <Col span={12}><Statistic title={`Finished ${board?.item || ''}`} value={board?.achieved ?? 0} /></Col>
                                    <Col span={12}><Statistic title={`Target${board?.customTarget ? ' (this day)' : ''}`} value={board?.target ?? 0} /></Col>
                                    <Col span={12}><Statistic title="Still to go" value={board?.remaining ?? 0} /></Col>
                                    <Col span={12}>
                                        <Statistic title={isToday ? 'Needed per hour' : 'Result'} value={isToday ? (board?.pace.neededPerHour || '—') : (board && board.achieved >= board.target ? 'Target met' : 'Missed')} />
                                    </Col>
                                </Row>
                                {board && board.streak > 1 && <Tag color="orange" className="mt-3">🔥 {board.streak} days in a row on target</Tag>}
                            </Col>
                        </Row>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card className={cardClass()} title="Target for this day" size="small">
                        <Form form={targetForm} layout="vertical" disabled={!canManage}>
                            <Form.Item name="target" label="Finished pieces" rules={[{ required: true }]} extra={board?.customTarget ? 'Set for this day only' : 'Default target'}>
                                <InputNumber min={0} max={100000} precision={0} className="w-full" />
                            </Form.Item>
                            <Form.Item name="note" label="Note (shown on the TV)"><Input placeholder="e.g. Rush order for Kandy shop" maxLength={300} /></Form.Item>
                            {canManage && <Space><Button type="primary" onClick={saveTarget}>Save for {shortDay(date)}</Button>{board?.customTarget && <Button onClick={resetTarget}>Use default</Button>}</Space>}
                        </Form>
                    </Card>
                </Col>

                {canEdit && (
                    <Col xs={24} lg={10}>
                        <Card className={cardClass()} title="Add finished pieces" size="small">
                            <Form form={form} layout="vertical" initialValues={{ item: '' }}>
                                <Space wrap className="mb-3">
                                    {[5, 10, 20, 50].map(n => <Button key={n} size="large" onClick={() => add(n)}>+{n}</Button>)}
                                </Space>
                                <Row gutter={12}>
                                    <Col span={12}><Form.Item name="quantity" label="Pieces" rules={[{ required: true, message: 'How many?' }]}><InputNumber min={1} max={100000} precision={0} className="w-full" /></Form.Item></Col>
                                    <Col span={12}><Form.Item name="time" label="Time" extra={isToday ? 'Empty = now' : undefined} rules={[{ required: !isToday, message: 'Time for a past day' }]}><Input type="time" /></Form.Item></Col>
                                </Row>
                                <Form.Item name="item" label="Item / style"><Input placeholder={board?.item || 'e.g. Pants'} maxLength={80} /></Form.Item>
                                <Form.Item name="note" label="Note"><Input maxLength={300} /></Form.Item>
                                <Button type="primary" icon={<PlusOutlined />} onClick={() => add()}>Add</Button>
                            </Form>
                        </Card>
                    </Col>
                )}
                <Col xs={24} lg={canEdit ? 14 : 24}>
                    <Card className={cardClass()} title={`Entries · ${shortDay(date)}`} size="small">
                        <Table<LogRow> rowKey="id" size="small" loading={logs.loading} dataSource={logs.data} pagination={false}
                            locale={{ emptyText: <Empty description="No pieces recorded yet" /> }}
                            columns={[
                                { title: 'Time', dataIndex: 'time', width: 80, render: (t: string | null) => t || '—' },
                                { title: 'Pieces', dataIndex: 'quantity', width: 80, render: (q: number) => <b>{q}</b> },
                                { title: 'Item', dataIndex: 'item', render: (i: string) => i || board?.item },
                                { title: 'Note', dataIndex: 'note' },
                                { title: 'By', render: (_, r) => r.createdBy?.name || '—', width: 130 },
                                ...(canEdit ? [{ title: '', width: 50, render: (_: unknown, r: LogRow) => <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(r)} aria-label="Remove" /> }] : []),
                            ]} />
                    </Card>
                </Col>

                <Col xs={24}>
                    <Card className={cardClass()} title="Last 30 days" size="small">
                        {summary.length ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <ComposedChart data={summary}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                    <XAxis dataKey="date" tick={axis} tickFormatter={(d: string) => d.slice(5)} />
                                    <YAxis tick={axis} allowDecimals={false} />
                                    <Tooltip labelFormatter={(d) => shortDay(String(d))} />
                                    <Legend />
                                    <Bar dataKey="achieved" name="Finished" radius={[4, 4, 0, 0]}>
                                        {summary.map(d => <Cell key={d.date} fill={d.met ? '#10b981' : '#D4AF37'} />)}
                                    </Bar>
                                    <Line dataKey="target" name="Target" stroke="#ef4444" strokeDasharray="5 4" dot={false} type="stepAfter" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        ) : <Empty description="No production recorded in the last 30 days" />}
                    </Card>
                </Col>

                {canManage && (
                    <Col xs={24}>
                        <Card className={cardClass()} title="Board settings" size="small">
                            <Form form={settingsForm} layout="vertical">
                                <Row gutter={12}>
                                    <Col xs={12} md={4}><Form.Item name="dailyProductionTarget" label="Default daily target" rules={[{ required: true }]}><InputNumber min={0} precision={0} className="w-full" /></Form.Item></Col>
                                    <Col xs={12} md={4}><Form.Item name="productionItem" label="What is counted"><Input placeholder="pieces" maxLength={40} /></Form.Item></Col>
                                    <Col xs={12} md={4}><Form.Item name="productionShiftStart" label="Shift starts"><Input type="time" /></Form.Item></Col>
                                    <Col xs={12} md={4}><Form.Item name="productionShiftEnd" label="Shift ends"><Input type="time" /></Form.Item></Col>
                                    <Col xs={24} md={8}><Form.Item name="productionBoardMessage" label="Message on the TV"><Input maxLength={200} /></Form.Item></Col>
                                </Row>
                                <Space>
                                    <Button type="primary" onClick={saveSettings}>Save settings</Button>
                                    <Typography.Text type="secondary">Weekly off days have no target unless you set one for that day.</Typography.Text>
                                </Space>
                            </Form>
                        </Card>
                    </Col>
                )}
            </Row>
        </div>
    );
}
