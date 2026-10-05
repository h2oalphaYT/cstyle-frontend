import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Empty, Row, Select, Spin, Statistic } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { adminApi, errorMessage } from '../../api';

type Point = { date: string; revenue: number; orders: number };
const money = (n: number) => `Rs ${Math.round(n).toLocaleString()}`;

const AnalyticsPage = () => {
    const [range, setRange] = useState('month');
    const [data, setData] = useState<Point[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isDarkMode = document.documentElement.classList.contains('dark');

    useEffect(() => {
        setLoading(true);
        setError(null);
        adminApi.sales(range)
            .then(res => setData(res.data))
            .catch(err => setError(errorMessage(err)))
            .finally(() => setLoading(false));
    }, [range]);

    // Year view is grouped by month so the chart stays readable.
    const series = useMemo(() => {
        if (range !== 'year') return data.map(d => ({ ...d, label: d.date.slice(5) }));
        const byMonth = new Map<string, Point>();
        data.forEach(d => {
            const key = d.date.slice(0, 7);
            const cur = byMonth.get(key) || { date: key, revenue: 0, orders: 0 };
            byMonth.set(key, { date: key, revenue: cur.revenue + d.revenue, orders: cur.orders + d.orders });
        });
        return [...byMonth.values()].map(d => ({ ...d, label: d.date }));
    }, [data, range]);

    const totals = useMemo(() => {
        const revenue = data.reduce((s, d) => s + d.revenue, 0);
        const orders = data.reduce((s, d) => s + d.orders, 0);
        return { revenue, orders, aov: orders ? revenue / orders : 0 };
    }, [data]);

    const exportCsv = () => {
        const rows = [['date', 'orders', 'revenue_lkr'], ...data.map(d => [d.date, d.orders, d.revenue])];
        const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `cstyle-sales-${range}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
    };

    const cardClass = `${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl`;
    const titleClass = isDarkMode ? 'text-white' : 'text-brand-black';

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className={`text-3xl font-bold font-poppins m-0 ${titleClass}`}>Sales Analytics</h1>
                <div className="flex gap-3">
                    <Select value={range} onChange={setRange} className="w-40" options={[
                        { value: 'week', label: 'Last 7 days' }, { value: 'month', label: 'Last 30 days' }, { value: 'year', label: 'Last 12 months' },
                    ]} />
                    <Button icon={<DownloadOutlined />} onClick={exportCsv} disabled={!data.length}>Export CSV</Button>
                </div>
            </div>

            {error && <Alert type="error" showIcon message={error} />}
            {loading ? <div className="flex justify-center py-24"><Spin size="large" /></div> : (
                <>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={8}><Card className={cardClass}><Statistic title="Revenue" value={money(totals.revenue)} /></Card></Col>
                        <Col xs={24} md={8}><Card className={cardClass}><Statistic title="Orders" value={totals.orders} /></Card></Col>
                        <Col xs={24} md={8}><Card className={cardClass}><Statistic title="Average order value" value={money(totals.aov)} /></Card></Col>
                    </Row>
                    <Card title={<span className={titleClass}>Revenue</span>} className={cardClass}>
                        {!totals.orders ? <Empty description="No orders in this period" /> : (
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={series}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
                                    <XAxis dataKey="label" stroke="#9CA3AF" fontSize={12} />
                                    <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                                    <Tooltip formatter={(v: number) => money(v)} />
                                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.35} />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </Card>
                    <Card title={<span className={titleClass}>Orders</span>} className={cardClass}>
                        {!totals.orders ? <Empty /> : (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={series}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
                                    <XAxis dataKey="label" stroke="#9CA3AF" fontSize={12} />
                                    <YAxis allowDecimals={false} stroke="#9CA3AF" fontSize={12} />
                                    <Tooltip />
                                    <Bar dataKey="orders" name="Orders" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Card>
                </>
            )}
        </div>
    );
};

export default AnalyticsPage;
