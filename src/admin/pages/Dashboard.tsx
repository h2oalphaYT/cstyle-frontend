import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Alert, Button, Card, Col, Empty, Row, Select, Spin, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    ArrowDownOutlined, ArrowUpOutlined, ClockCircleOutlined, DollarOutlined, ReloadOutlined,
    ShoppingCartOutlined, ShoppingOutlined, UserOutlined, WarningOutlined,
} from '@ant-design/icons';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { adminApi, errorMessage, type DashboardData, type Order, type OrderStatus } from '../../api';
import SafeImage from '../../components/SafeImage';

const STATUS_COLOR: Record<OrderStatus, string> = {
    pending: '#F59E0B', confirmed: '#06B6D4', processing: '#3B82F6', shipped: '#8B5CF6', delivered: '#10B981', cancelled: '#EF4444',
};
const money = (n: number) => `Rs ${Math.round(n).toLocaleString()}`;
const RANGE_LABEL: Record<string, string> = { day: 'last 24 hours', week: 'last 7 days', month: 'last 30 days', year: 'last 12 months' };

const AdminDashboard = () => {
    const [range, setRange] = useState('week');
    const [data, setData] = useState<DashboardData | null>(null);
    const [sales, setSales] = useState<{ date: string; revenue: number; orders: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [d, s] = await Promise.all([adminApi.dashboard(range), adminApi.sales(range === 'day' ? 'week' : range)]);
            setData(d.data);
            setSales(s.data.map(x => ({ ...x, label: x.date.slice(5) })));
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [range]);

    useEffect(() => { load(); }, [load]);

    const cardClass = 'rounded-xl h-full';

    if (error) return <Alert type="error" showIcon message="Could not load the dashboard" description={error} action={<Button onClick={load}>Retry</Button>} />;
    if (loading && !data) return <div className="flex justify-center py-24"><Spin size="large" /></div>;
    if (!data) return null;

    const change = data.range.revenueChange;
    const stats = [
        { title: 'Revenue', value: money(data.totals.revenue), sub: `${money(data.range.revenue)} in the ${RANGE_LABEL[range]}`, icon: <DollarOutlined />, color: 'from-yellow-500 to-yellow-600', link: '/admin/analytics' },
        { title: 'Total Orders', value: data.totals.orders, sub: `${data.range.orders} in the ${RANGE_LABEL[range]}`, icon: <ShoppingCartOutlined />, color: 'from-blue-500 to-blue-600', link: '/admin/orders' },
        { title: 'Pending Orders', value: data.totals.pendingOrders, sub: 'Waiting for confirmation', icon: <ClockCircleOutlined />, color: 'from-orange-500 to-orange-600', link: '/admin/orders?status=pending' },
        { title: 'Customers', value: data.totals.customers, sub: 'Registered accounts', icon: <UserOutlined />, color: 'from-purple-500 to-purple-600', link: '/admin/customers' },
        { title: 'Products', value: data.totals.products, sub: `${data.totals.activeProducts} active in store`, icon: <ShoppingOutlined />, color: 'from-green-500 to-green-600', link: '/admin/products' },
        { title: 'Low Stock', value: data.totals.lowStock, sub: 'At or below alert level', icon: <WarningOutlined />, color: 'from-red-500 to-red-600', link: '/admin/inventory' },
    ];

    const statusData = Object.entries(data.ordersByStatus).map(([name, value]) => ({ name, value: value || 0 }));

    const orderColumns: ColumnsType<Order> = [
        { title: 'Order', dataIndex: 'orderNumber', render: (n: string) => <span className="font-semibold">{n}</span> },
        { title: 'Customer', render: (_, o) => o.customer.name },
        { title: 'Total', dataIndex: 'total', render: money },
        { title: 'Status', dataIndex: 'orderStatus', render: (s: OrderStatus) => <Tag color={STATUS_COLOR[s]}>{s.toUpperCase()}</Tag> },
        { title: 'Date', dataIndex: 'createdAt', render: (d: string) => new Date(d).toLocaleDateString() },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-3xl font-bold font-poppins m-0 text-admin-text">
                        Dashboard
                    </motion.h1>
                    <p className="text-admin-muted m-0">Live figures from MongoDB · cancelled orders are excluded from revenue</p>
                </div>
                <div className="flex gap-3">
                    <Select value={range} onChange={setRange} className="w-40" options={[
                        { value: 'day', label: 'Last 24 hours' }, { value: 'week', label: 'Last 7 days' },
                        { value: 'month', label: 'Last 30 days' }, { value: 'year', label: 'Last 12 months' },
                    ]} />
                    <Button icon={<ReloadOutlined />} onClick={load} loading={loading} />
                </div>
            </div>

            <Row gutter={[16, 16]}>
                {stats.map((s, i) => (
                    <Col xs={24} sm={12} xl={8} key={s.title}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="h-full">
                            <Link to={s.link}>
                                <Card className={`${cardClass} hover:shadow-lg transition-shadow`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-admin-muted text-sm m-0">{s.title}</p>
                                            <p className="text-2xl font-bold m-0 mt-1 text-admin-text">{s.value}</p>
                                            <p className="text-xs text-admin-muted m-0 mt-1">{s.sub}</p>
                                        </div>
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white text-xl`}>{s.icon}</div>
                                    </div>
                                    {s.title === 'Revenue' && change != null && (
                                        <p className={`text-xs mt-2 mb-0 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(change)}% vs previous period
                                        </p>
                                    )}
                                </Card>
                            </Link>
                        </motion.div>
                    </Col>
                ))}
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                    <Card title="Revenue & Orders" className={cardClass}>
                        {sales.every(s => !s.orders) ? <Empty description="No orders in this period" /> : (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={sales}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="label" fontSize={12} />
                                    <YAxis yAxisId="rev" fontSize={12} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                                    <YAxis yAxisId="ord" orientation="right" fontSize={12} allowDecimals={false} />
                                    <Tooltip formatter={(v: number, n: string) => (n === 'Revenue' ? money(v) : v)} />
                                    <Legend />
                                    <Line yAxisId="rev" type="monotone" dataKey="revenue" name="Revenue" stroke="#D4AF37" strokeWidth={2} dot={false} />
                                    <Line yAxisId="ord" type="monotone" dataKey="orders" name="Orders" stroke="#3B82F6" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Orders by Status" className={cardClass}>
                        {statusData.length === 0 ? <Empty /> : (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                                        {statusData.map(d => <Cell key={d.name} fill={STATUS_COLOR[d.name as OrderStatus]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={14}>
                    <Card title="Recent Orders" extra={<Link to="/admin/orders">View all</Link>} className={cardClass}>
                        <Table rowKey="id" size="small" columns={orderColumns} dataSource={data.recentOrders} pagination={false} scroll={{ x: 500 }} />
                    </Card>
                </Col>
                <Col xs={24} lg={10}>
                    <Card title="Top Products" className={cardClass}>
                        {data.topProducts.length === 0 ? <Empty description="No sales yet" /> : (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={data.topProducts} layout="vertical" margin={{ left: 20 }}>
                                    <XAxis type="number" allowDecimals={false} fontSize={12} />
                                    <YAxis type="category" dataKey="name" width={130} fontSize={11} />
                                    <Tooltip formatter={(v: number, n: string) => (n === 'revenue' ? money(v) : v)} />
                                    <Bar dataKey="quantity" name="Units sold" fill="#D4AF37" radius={[0, 6, 6, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Card>
                </Col>
            </Row>

            <Card title="Low Stock Products" extra={<Link to="/admin/inventory">Manage stock</Link>} className={cardClass}>
                {data.lowStockProducts.length === 0 ? <Empty description="Everything is well stocked" /> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.lowStockProducts.map(p => (
                            <div key={p.id} className="flex items-center gap-3">
                                <SafeImage src={p.thumbnail} alt="" wrapperClassName="w-10 h-12 rounded" className="w-full h-full object-cover" />
                                <div className="flex-1 min-w-0">
                                    <p className="m-0 truncate text-admin-text">{p.name}</p>
                                    <p className="m-0 text-xs text-admin-muted">{p.sku}</p>
                                </div>
                                <Tag color={p.stock === 0 ? 'red' : 'orange'}>{p.stock} left</Tag>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AdminDashboard;
