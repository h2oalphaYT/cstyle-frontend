import { motion } from 'framer-motion';
import { Card, Row, Col, Button } from 'antd';
import { DownloadOutlined, BarChartOutlined } from '@ant-design/icons';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const AnalyticsPage = () => {
    const isDarkMode = document.documentElement.classList.contains('dark');

    const conversionData = [
        { month: 'Jan', rate: 2.4 },
        { month: 'Feb', rate: 3.1 },
        { month: 'Mar', rate: 2.8 },
        { month: 'Apr', rate: 3.5 },
        { month: 'May', rate: 4.2 },
        { month: 'Jun', rate: 3.9 },
    ];

    const customerData = [
        { month: 'Jan', new: 120, returning: 80 },
        { month: 'Feb', new: 150, returning: 95 },
        { month: 'Mar', new: 180, returning: 110 },
        { month: 'Apr', new: 160, returning: 125 },
        { month: 'May', new: 200, returning: 140 },
        { month: 'Jun', new: 220, returning: 160 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`text-3xl font-bold font-poppins ${isDarkMode ? 'text-white' : 'text-brand-black'}`}
                >
                    Analytics Dashboard
                </motion.h1>
                <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    size="large"
                    className="bg-brand-gold hover:bg-brand-gold-dark border-0 text-brand-black"
                >
                    Export Report
                </Button>
            </div>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card
                        title={<span className={isDarkMode ? 'text-white' : 'text-brand-black'}>Conversion Rate Trend</span>}
                        className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl`}
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={conversionData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
                                <XAxis dataKey="month" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                <YAxis stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                <Tooltip />
                                <Area type="monotone" dataKey="rate" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.6} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card
                        title={<span className={isDarkMode ? 'text-white' : 'text-brand-black'}>New vs Returning Customers</span>}
                        className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl`}
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={customerData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
                                <XAxis dataKey="month" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                <YAxis stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                <Tooltip />
                                <Line type="monotone" dataKey="new" stroke="#D4AF37" strokeWidth={2} />
                                <Line type="monotone" dataKey="returning" stroke="#F59E0B" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            <Card
                className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl text-center py-12`}
            >
                <BarChartOutlined className="text-6xl text-brand-gold mb-4" />
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-brand-black'}`}>
                    Advanced Analytics Coming Soon
                </h3>
                <p className="text-gray-500 mt-2">More detailed insights and reports will be available here.</p>
            </Card>
        </div>
    );
};

export default AnalyticsPage;
