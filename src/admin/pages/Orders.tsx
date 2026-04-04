import { useState } from 'react';
import { motion } from 'framer-motion';
import { Table, Tag, Space, Button, Input, Select, Modal, Descriptions, Badge } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, EyeOutlined, PrinterOutlined } from '@ant-design/icons';

const { Option } = Select;

interface Order {
    key: string;
    orderId: string;
    customer: string;
    date: string;
    status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
    amount: number;
    items: number;
}

const OrdersPage = () => {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const isDarkMode = document.documentElement.classList.contains('dark');

    const orders: Order[] = [
        {
            key: '1',
            orderId: 'ORD-2024-001',
            customer: 'John Doe',
            date: '2024-11-06',
            status: 'completed',
            amount: 15750,
            items: 3,
        },
        {
            key: '2',
            orderId: 'ORD-2024-002',
            customer: 'Jane Smith',
            date: '2024-11-06',
            status: 'processing',
            amount: 8500,
            items: 2,
        },
        {
            key: '3',
            orderId: 'ORD-2024-003',
            customer: 'Bob Wilson',
            date: '2024-11-05',
            status: 'shipped',
            amount: 12000,
            items: 4,
        },
        {
            key: '4',
            orderId: 'ORD-2024-004',
            customer: 'Alice Brown',
            date: '2024-11-05',
            status: 'pending',
            amount: 4500,
            items: 1,
        },
        {
            key: '5',
            orderId: 'ORD-2024-005',
            customer: 'Charlie Davis',
            date: '2024-11-04',
            status: 'cancelled',
            amount: 9800,
            items: 2,
        },
    ];

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'orange',
            processing: 'blue',
            shipped: 'cyan',
            completed: 'green',
            cancelled: 'red',
        };
        return colors[status] || 'default';
    };

    const columns: ColumnsType<Order> = [
        {
            title: 'Order ID',
            dataIndex: 'orderId',
            key: 'orderId',
            render: (text: string) => <span className="font-mono font-bold">{text}</span>,
        },
        {
            title: 'Customer',
            dataIndex: 'customer',
            key: 'customer',
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            filters: [
                { text: 'Pending', value: 'pending' },
                { text: 'Processing', value: 'processing' },
                { text: 'Shipped', value: 'shipped' },
                { text: 'Completed', value: 'completed' },
                { text: 'Cancelled', value: 'cancelled' },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
            ),
        },
        {
            title: 'Items',
            dataIndex: 'items',
            key: 'items',
        },
        {
            title: 'Total Amount',
            dataIndex: 'amount',
            key: 'amount',
            sorter: (a, b) => a.amount - b.amount,
            render: (amount: number) => <span className="font-bold">Rs {amount.toLocaleString()}</span>,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        className="text-brand-gold hover:text-brand-gold-dark"
                        onClick={() => setSelectedOrder(record)}
                    >
                        View
                    </Button>
                    <Button
                        type="text"
                        icon={<PrinterOutlined />}
                        className="text-blue-500 hover:text-blue-600"
                    >
                        Print
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`text-3xl font-bold font-poppins ${isDarkMode ? 'text-white' : 'text-brand-black'}`}
                >
                    Orders Management
                </motion.h1>
                <div className="flex items-center space-x-3">
                    <Badge count={orders.filter(o => o.status === 'pending').length} className="mr-2">
                        <Button size="large">Pending Orders</Button>
                    </Badge>
                </div>
            </div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } border rounded-xl p-4 shadow-lg`}
            >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                        placeholder="Search orders..."
                        prefix={<SearchOutlined />}
                        size="large"
                        className={isDarkMode ? 'bg-gray-900 border-gray-600' : ''}
                    />
                    <Select placeholder="Status" size="large" className="w-full">
                        <Option value="">All Status</Option>
                        <Option value="pending">Pending</Option>
                        <Option value="processing">Processing</Option>
                        <Option value="shipped">Shipped</Option>
                        <Option value="completed">Completed</Option>
                        <Option value="cancelled">Cancelled</Option>
                    </Select>
                    <Select placeholder="Date Range" size="large" className="w-full">
                        <Option value="today">Today</Option>
                        <Option value="week">This Week</Option>
                        <Option value="month">This Month</Option>
                    </Select>
                    <Select placeholder="Sort By" size="large" className="w-full">
                        <Option value="date">Date</Option>
                        <Option value="amount">Amount</Option>
                        <Option value="status">Status</Option>
                    </Select>
                </div>
            </motion.div>

            {/* Orders Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Table
                    columns={columns}
                    dataSource={orders}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} orders`,
                    }}
                    className={`${isDarkMode ? 'dark-table' : ''}`}
                />
            </motion.div>

            {/* Order Detail Modal */}
            <Modal
                title={<span className="text-xl font-bold">Order Details</span>}
                open={!!selectedOrder}
                onCancel={() => setSelectedOrder(null)}
                footer={[
                    <Button key="close" onClick={() => setSelectedOrder(null)}>
                        Close
                    </Button>,
                    <Button
                        key="print"
                        type="primary"
                        icon={<PrinterOutlined />}
                        className="bg-brand-gold hover:bg-brand-gold-dark border-0 text-brand-black"
                    >
                        Print Invoice
                    </Button>,
                ]}
                width={700}
            >
                {selectedOrder && (
                    <Descriptions bordered column={2} className="mt-4">
                        <Descriptions.Item label="Order ID" span={2}>
                            <span className="font-mono font-bold">{selectedOrder.orderId}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Customer">{selectedOrder.customer}</Descriptions.Item>
                        <Descriptions.Item label="Date">{selectedOrder.date}</Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Tag color={getStatusColor(selectedOrder.status)}>
                                {selectedOrder.status.toUpperCase()}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Items">{selectedOrder.items}</Descriptions.Item>
                        <Descriptions.Item label="Total Amount" span={2}>
                            <span className="text-lg font-bold text-brand-gold">
                                Rs {selectedOrder.amount.toLocaleString()}
                            </span>
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default OrdersPage;
