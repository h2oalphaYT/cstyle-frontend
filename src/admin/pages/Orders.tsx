import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { App, Button, Card, Descriptions, Drawer, Input, Select, Space, Table, Tag, Timeline } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined, PrinterOutlined, ReloadOutlined } from '@ant-design/icons';
import { errorMessage, ordersApi, type Order, type OrderStatus, type PaymentStatus } from '../../api';
import SafeImage from '../../components/SafeImage';

const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLOR: Record<OrderStatus, string> = {
    pending: 'orange', confirmed: 'cyan', processing: 'blue', shipped: 'purple', delivered: 'green', cancelled: 'red',
};
const PAYMENT_COLOR: Record<PaymentStatus, string> = { pending: 'default', paid: 'green', failed: 'red', refunded: 'volcano' };
const money = (n: number) => `Rs ${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const PAGE_SIZE = 20;

const OrdersPage = () => {
    const { message, modal } = App.useApp();
    const [searchParams] = useSearchParams();
    const [orders, setOrders] = useState<Order[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<string | undefined>(searchParams.get('status') || undefined);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Order | null>(null);
    const [updating, setUpdating] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await ordersApi.list({ page, limit: PAGE_SIZE, status, search: search || undefined });
            setOrders(res.data);
            setTotal(res.pagination?.total || 0);
        } catch (err) {
            message.error(errorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [page, status, search, message]);

    useEffect(() => {
        const t = setTimeout(load, 250);
        return () => clearTimeout(t);
    }, [load]);

    const update = async (order: Order, body: { orderStatus?: OrderStatus; paymentStatus?: PaymentStatus }) => {
        const go = async () => {
            setUpdating(true);
            try {
                const res = await ordersApi.updateStatus(order.id, body);
                message.success(`Order ${res.data.orderNumber} updated`);
                setSelected(prev => (prev?.id === res.data.id ? res.data : prev));
                load();
            } catch (err) {
                message.error(errorMessage(err));
            } finally {
                setUpdating(false);
            }
        };
        if (body.orderStatus === 'cancelled') {
            modal.confirm({
                title: `Cancel order ${order.orderNumber}?`,
                content: 'Items go back into stock and any coupon use is released. This cannot be undone.',
                okType: 'danger',
                okText: 'Cancel order',
                onOk: go,
            });
        } else {
            await go();
        }
    };

    // Statuses an order may move to from its current one.
    const nextStatuses = (o: Order) => {
        if (o.orderStatus === 'cancelled') return [];
        if (o.orderStatus === 'delivered') return ['cancelled'] as OrderStatus[];
        return STATUSES.filter(s => s === 'cancelled' || STATUSES.indexOf(s) > STATUSES.indexOf(o.orderStatus));
    };

    const columns: ColumnsType<Order> = [
        { title: 'Order', dataIndex: 'orderNumber', width: 120, render: (n: string) => <span className="font-semibold">{n}</span> },
        {
            title: 'Customer',
            render: (_, o) => <div><div className="font-medium">{o.customer.name}</div><div className="text-xs text-admin-muted">{o.customer.email}{o.user ? '' : ' · guest'}</div></div>,
        },
        { title: 'Date', dataIndex: 'createdAt', width: 120, render: (d: string) => new Date(d).toLocaleDateString() },
        { title: 'Items', width: 70, render: (_, o) => o.items.reduce((s, i) => s + i.quantity, 0) },
        { title: 'Total', dataIndex: 'total', width: 120, render: (t: number) => <span className="font-semibold">{money(t)}</span> },
        {
            title: 'Payment', width: 140,
            render: (_, o) => <Space direction="vertical" size={0}><Tag color={PAYMENT_COLOR[o.paymentStatus]}>{o.paymentStatus.toUpperCase()}</Tag><span className="text-xs text-admin-muted">{o.paymentMethod === 'cod' ? 'Cash on delivery' : 'Bank transfer'}</span></Space>,
        },
        {
            title: 'Status', width: 170,
            render: (_, o) => (
                <Select
                    size="small"
                    value={o.orderStatus}
                    disabled={!nextStatuses(o).length || updating}
                    onChange={(v) => update(o, { orderStatus: v })}
                    className="w-36"
                    options={[o.orderStatus, ...nextStatuses(o)].map(s => ({ value: s, label: <Tag color={STATUS_COLOR[s]} className="m-0">{s.toUpperCase()}</Tag> }))}
                />
            ),
        },
        { title: '', width: 60, render: (_, o) => <Button type="text" icon={<EyeOutlined />} onClick={() => setSelected(o)} aria-label="View order" /> },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-poppins m-0 text-admin-text">Orders</h1>
                    <p className="text-admin-muted m-0">{total} order{total === 1 ? '' : 's'}</p>
                </div>
                <Button icon={<ReloadOutlined />} onClick={load}>Refresh</Button>
            </div>

            <Card className="rounded-xl">
                <div className="flex flex-wrap gap-3 mb-4">
                    <Input.Search allowClear placeholder="Order number, name, email, phone" value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full md:w-80" />
                    <Select allowClear placeholder="All statuses" value={status} onChange={(v) => { setStatus(v); setPage(1); }} className="w-44"
                        options={STATUSES.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} />
                </div>
                <Table rowKey="id" columns={columns} dataSource={orders} loading={loading} scroll={{ x: 1000 }}
                    pagination={{ current: page, pageSize: PAGE_SIZE, total, onChange: setPage, showTotal: (t) => `${t} orders` }} />
            </Card>

            <Drawer
                title={selected ? `Order ${selected.orderNumber}` : ''}
                open={!!selected}
                onClose={() => setSelected(null)}
                width={Math.min(720, typeof window !== 'undefined' ? window.innerWidth : 720)}
                extra={<Button icon={<PrinterOutlined />} onClick={() => window.print()}>Print</Button>}
            >
                {selected && (
                    <div className="space-y-6">
                        <Space wrap>
                            <span>Status:</span>
                            <Select value={selected.orderStatus} disabled={!nextStatuses(selected).length || updating} className="w-40"
                                onChange={(v) => update(selected, { orderStatus: v })}
                                options={[selected.orderStatus, ...nextStatuses(selected)].map(s => ({ value: s, label: s.toUpperCase() }))} />
                            <span>Payment:</span>
                            <Select value={selected.paymentStatus} disabled={updating} className="w-36"
                                onChange={(v) => update(selected, { paymentStatus: v })}
                                options={(['pending', 'paid', 'failed', 'refunded'] as PaymentStatus[]).map(s => ({ value: s, label: s.toUpperCase() }))} />
                        </Space>

                        <Descriptions bordered size="small" column={1}>
                            <Descriptions.Item label="Customer">{selected.customer.name}</Descriptions.Item>
                            <Descriptions.Item label="Email">{selected.customer.email}</Descriptions.Item>
                            <Descriptions.Item label="Phone">{selected.customer.phone || '—'}</Descriptions.Item>
                            <Descriptions.Item label="Ship to">
                                {selected.shippingAddress.fullName}<br />
                                {selected.shippingAddress.line1}{selected.shippingAddress.line2 ? `, ${selected.shippingAddress.line2}` : ''}<br />
                                {[selected.shippingAddress.city, selected.shippingAddress.state, selected.shippingAddress.postalCode].filter(Boolean).join(', ')}, {selected.shippingAddress.country}
                            </Descriptions.Item>
                            <Descriptions.Item label="Payment">{selected.paymentMethod === 'cod' ? 'Cash on delivery' : 'Bank transfer'}</Descriptions.Item>
                            {selected.notes && <Descriptions.Item label="Notes">{selected.notes}</Descriptions.Item>}
                            <Descriptions.Item label="Placed">{new Date(selected.createdAt).toLocaleString()}</Descriptions.Item>
                        </Descriptions>

                        <Table
                            rowKey="_id"
                            size="small"
                            pagination={false}
                            dataSource={selected.items}
                            columns={[
                                { title: '', dataIndex: 'image', width: 56, render: (src: string) => <SafeImage src={src} alt="" wrapperClassName="w-10 h-12" className="w-full h-full object-cover" /> },
                                { title: 'Item', render: (_, i) => <div><div>{i.name}</div><div className="text-xs text-admin-muted">{[i.sku, i.size, i.color].filter(Boolean).join(' · ')}</div></div> },
                                { title: 'Qty', dataIndex: 'quantity', width: 50 },
                                { title: 'Price', dataIndex: 'unitPrice', width: 100, render: money },
                                { title: 'Total', dataIndex: 'lineTotal', width: 110, render: money },
                            ]}
                            summary={() => (
                                <>
                                    <Table.Summary.Row><Table.Summary.Cell index={0} colSpan={4} align="right">Subtotal</Table.Summary.Cell><Table.Summary.Cell index={1}>{money(selected.subtotal)}</Table.Summary.Cell></Table.Summary.Row>
                                    {selected.discount > 0 && <Table.Summary.Row><Table.Summary.Cell index={0} colSpan={4} align="right">Discount ({selected.coupon?.code})</Table.Summary.Cell><Table.Summary.Cell index={1}>−{money(selected.discount)}</Table.Summary.Cell></Table.Summary.Row>}
                                    <Table.Summary.Row><Table.Summary.Cell index={0} colSpan={4} align="right">Shipping</Table.Summary.Cell><Table.Summary.Cell index={1}>{money(selected.shipping)}</Table.Summary.Cell></Table.Summary.Row>
                                    <Table.Summary.Row><Table.Summary.Cell index={0} colSpan={4} align="right"><strong>Total</strong></Table.Summary.Cell><Table.Summary.Cell index={1}><strong>{money(selected.total)}</strong></Table.Summary.Cell></Table.Summary.Row>
                                </>
                            )}
                        />

                        <div>
                            <h4 className="font-semibold mb-3">History</h4>
                            <Timeline items={selected.statusHistory.map(h => ({
                                color: STATUS_COLOR[h.status],
                                children: <span><Tag color={STATUS_COLOR[h.status]}>{h.status.toUpperCase()}</Tag>{new Date(h.at).toLocaleString()}{h.note ? ` — ${h.note}` : ''}</span>,
                            }))} />
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default OrdersPage;
