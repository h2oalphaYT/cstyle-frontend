import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Row, Col, Select, Progress, Table, Tag, Avatar } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    ArrowUpOutlined,
    ArrowDownOutlined,
    ShoppingOutlined,
    DollarOutlined,
    UserOutlined,
    TrophyOutlined,
    RiseOutlined,
    FallOutlined,
} from '@ant-design/icons';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const { Option } = Select;

const AdminDashboard = () => {
    const [currency, setCurrency] = useState('LKR');
    const [timeRange, setTimeRange] = useState('week');
    const isDarkMode = document.documentElement.classList.contains('dark');

    // Mock data for charts
    const salesData = [
        { name: 'Mon', sales: 4000, revenue: 2400 },
        { name: 'Tue', sales: 3000, revenue: 1398 },
        { name: 'Wed', sales: 2000, revenue: 9800 },
        { name: 'Thu', sales: 2780, revenue: 3908 },
        { name: 'Fri', sales: 1890, revenue: 4800 },
        { name: 'Sat', sales: 2390, revenue: 3800 },
        { name: 'Sun', sales: 3490, revenue: 4300 },
    ];

    const categoryData = [
        { name: 'Men', value: 4500 },
        { name: 'Women', value: 3200 },
        { name: 'Kids', value: 1800 },
        { name: 'Accessories', value: 2100 },
    ];

    const revenueData = [
        { name: 'Products', value: 45000 },
        { name: 'Shipping', value: 8000 },
        { name: 'Services', value: 5000 },
    ];

    const COLORS = ['#D4AF37', '#F59E0B', '#EAB308', '#FBBF24'];

    // Top selling products mock data
    const topProducts = [
        { key: '1', name: 'Classic Black Shirt', sales: 324, revenue: 1134000, trend: 'up', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=50' },
        { key: '2', name: 'Summer Dress', sales: 289, revenue: 1300500, trend: 'up', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=50' },
        { key: '3', name: 'Denim Jeans', sales: 256, revenue: 1280000, trend: 'down', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=50' },
        { key: '4', name: 'Leather Jacket', sales: 187, revenue: 2244000, trend: 'up', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=50' },
        { key: '5', name: 'Kids T-Shirt', sales: 412, revenue: 618000, trend: 'up', image: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=50' },
    ];

    // Recent orders mock data
    const recentOrders = [
        { key: '1', orderId: 'ORD-2024-156', customer: 'John Doe', amount: 15750, status: 'completed', time: '5 mins ago' },
        { key: '2', orderId: 'ORD-2024-157', customer: 'Jane Smith', amount: 8500, status: 'processing', time: '12 mins ago' },
        { key: '3', orderId: 'ORD-2024-158', customer: 'Bob Wilson', amount: 12000, status: 'pending', time: '18 mins ago' },
        { key: '4', orderId: 'ORD-2024-159', customer: 'Alice Brown', amount: 4500, status: 'shipped', time: '25 mins ago' },
        { key: '5', orderId: 'ORD-2024-160', customer: 'Charlie Davis', amount: 19800, status: 'completed', time: '32 mins ago' },
    ];

    const productColumns: ColumnsType<any> = [
        {
            title: 'Product',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: any) => (
                <div className="flex items-center space-x-3">
                    <Avatar src={record.image} size={40} shape="square" />
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-brand-black'}`}>{text}</span>
                </div>
            ),
        },
        {
            title: 'Sales',
            dataIndex: 'sales',
            key: 'sales',
            render: (sales: number) => <span className="font-bold">{sales}</span>,
        },
        {
            title: 'Revenue',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (revenue: number) => (
                <span className="text-brand-gold font-bold">Rs {revenue.toLocaleString()}</span>
            ),
        },
        {
            title: 'Trend',
            dataIndex: 'trend',
            key: 'trend',
            render: (trend: string) => (
                trend === 'up' ? (
                    <Tag color="success" icon={<RiseOutlined />}>Rising</Tag>
                ) : (
                    <Tag color="error" icon={<FallOutlined />}>Falling</Tag>
                )
            ),
        },
    ];

    const orderColumns: ColumnsType<any> = [
        {
            title: 'Order ID',
            dataIndex: 'orderId',
            key: 'orderId',
            render: (text: string) => <span className="font-mono text-xs">{text}</span>,
        },
        {
            title: 'Customer',
            dataIndex: 'customer',
            key: 'customer',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount: number) => (
                <span className="font-bold">Rs {amount.toLocaleString()}</span>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const colors: Record<string, string> = {
                    completed: 'success',
                    processing: 'processing',
                    pending: 'warning',
                    shipped: 'cyan',
                };
                return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Time',
            dataIndex: 'time',
            key: 'time',
            render: (text: string) => <span className="text-gray-500 text-xs">{text}</span>,
        },
    ];

    const statsCards = [
        {
            title: 'Total Revenue',
            value: currency === 'LKR' ? 'Rs 5,680,000' : '$17,477',
            prefix: currency === 'LKR' ? '₨' : '$',
            change: 18.7,
            icon: <DollarOutlined />,
            color: 'from-yellow-400 to-yellow-600',
            description: 'Total earnings this month',
        },
        {
            title: 'Total Products',
            value: '1,254',
            change: 8.2,
            icon: <ShoppingOutlined />,
            color: 'from-blue-400 to-blue-600',
            description: 'Active products in catalog',
        },
        {
            title: 'Total Orders',
            value: '892',
            change: 24.5,
            icon: <TrophyOutlined />,
            color: 'from-green-400 to-green-600',
            description: 'Orders this month',
        },
        {
            title: 'Total Customers',
            value: '3,456',
            change: 12.8,
            icon: <UserOutlined />,
            color: 'from-purple-400 to-purple-600',
            description: 'Registered customers',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`text-3xl font-bold font-poppins ${isDarkMode ? 'text-white' : 'text-brand-black'}`}
                    >
                        Dashboard Overview
                    </motion.h1>
                    <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Select value={currency} onChange={setCurrency} className="w-24">
                        <Option value="LKR">LKR</Option>
                        <Option value="USD">USD</Option>
                    </Select>
                    <Select value={timeRange} onChange={setTimeRange} className="w-32">
                        <Option value="today">Today</Option>
                        <Option value="week">This Week</Option>
                        <Option value="month">This Month</Option>
                        <Option value="year">This Year</Option>
                    </Select>
                </div>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]}>
                {statsCards.map((stat, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                        >
                            <Card
                                className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                                    } border rounded-xl shadow-lg overflow-hidden`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                                        <h3 className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-brand-black'}`}>
                                            {stat.value}
                                        </h3>
                                        <p className="text-xs text-gray-500 mb-3">{stat.description}</p>
                                        <div className="flex items-center mt-2">
                                            {stat.change > 0 ? (
                                                <ArrowUpOutlined className="text-green-500 mr-1" />
                                            ) : (
                                                <ArrowDownOutlined className="text-red-500 mr-1" />
                                            )}
                                            <span className={`text-sm font-bold ${stat.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {Math.abs(stat.change)}%
                                            </span>
                                            <span className="text-gray-500 text-xs ml-2">vs last {timeRange}</span>
                                        </div>
                                        {/* Progress Bar */}
                                        <Progress
                                            percent={Math.min(stat.change + 50, 100)}
                                            strokeColor={stat.change > 0 ? '#10B981' : '#EF4444'}
                                            showInfo={false}
                                            className="mt-3"
                                            size="small"
                                        />
                                    </div>
                                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white text-3xl shadow-lg`}>
                                        {stat.icon}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </Col>
                ))}
            </Row>

            {/* Quick Stats Row */}
            <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-lg`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Conversion Rate</p>
                                    <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-brand-black'}`}>3.24%</h3>
                                    <Progress percent={32} strokeColor="#D4AF37" size="small" className="mt-2" />
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center text-white text-xl">
                                    📊
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </Col>

                <Col xs={24} md={8}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-lg`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Avg. Order Value</p>
                                    <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-brand-black'}`}>
                                        {currency === 'LKR' ? 'Rs 6,370' : '$19.60'}
                                    </h3>
                                    <Progress percent={64} strokeColor="#10B981" size="small" className="mt-2" />
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-white text-xl">
                                    💰
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </Col>

                <Col xs={24} md={8}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-lg`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Items Sold Today</p>
                                    <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-brand-black'}`}>284</h3>
                                    <Progress percent={71} strokeColor="#3B82F6" size="small" className="mt-2" />
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white text-xl">
                                    📦
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </Col>
            </Row>

            {/* Top Products & Recent Orders */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 }}
                    >
                        <Card
                            title={
                                <div className="flex items-center space-x-2">
                                    <TrophyOutlined className="text-brand-gold" />
                                    <span className={isDarkMode ? 'text-white' : 'text-brand-black'}>Top Selling Products</span>
                                </div>
                            }
                            className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl shadow-lg`}
                        >
                            <Table
                                columns={productColumns}
                                dataSource={topProducts}
                                pagination={false}
                                size="small"
                                className={isDarkMode ? 'dark-table' : ''}
                            />
                        </Card>
                    </motion.div>
                </Col>

                <Col xs={24} lg={12}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        <Card
                            title={
                                <div className="flex items-center space-x-2">
                                    <ShoppingOutlined className="text-brand-gold" />
                                    <span className={isDarkMode ? 'text-white' : 'text-brand-black'}>Recent Orders</span>
                                </div>
                            }
                            className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl shadow-lg`}
                        >
                            <Table
                                columns={orderColumns}
                                dataSource={recentOrders}
                                pagination={false}
                                size="small"
                                className={isDarkMode ? 'dark-table' : ''}
                            />
                        </Card>
                    </motion.div>
                </Col>
            </Row>

            {/* Charts Row 1 */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.9 }}
                    >
                        <Card
                            title={<span className={isDarkMode ? 'text-white' : 'text-brand-black'}>Sales Trend</span>}
                            className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl shadow-lg`}
                        >
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
                                    <XAxis dataKey="name" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                    <YAxis stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                                            border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="sales"
                                        stroke="#D4AF37"
                                        strokeWidth={3}
                                        dot={{ fill: '#D4AF37', r: 5 }}
                                        activeDot={{ r: 8 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#F59E0B"
                                        strokeWidth={3}
                                        dot={{ fill: '#F59E0B', r: 5 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                    </motion.div>
                </Col>

                <Col xs={24} lg={8}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.0 }}
                    >
                        <Card
                            title={<span className={isDarkMode ? 'text-white' : 'text-brand-black'}>Revenue Distribution</span>}
                            className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl shadow-lg`}
                        >
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={revenueData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={90}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {revenueData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                                            border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
                                            borderRadius: '8px',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>
                    </motion.div>
                </Col>
            </Row>

            {/* Charts Row 2 */}
            <Row gutter={[16, 16]}>
                <Col xs={24}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.1 }}
                    >
                        <Card
                            title={<span className={isDarkMode ? 'text-white' : 'text-brand-black'}>Top-Selling Categories</span>}
                            className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl shadow-lg`}
                        >
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={categoryData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
                                    <XAxis dataKey="name" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                    <YAxis stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                                            border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="value" fill="#D4AF37" radius={[8, 8, 0, 0]}>
                                        {categoryData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </motion.div>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;
