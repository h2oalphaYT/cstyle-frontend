import { useCallback, useEffect, useState } from 'react';
import { App, Card, Input, Select, Switch, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { adminApi, errorMessage, http, type Customer } from '../../api';
import { useAuth } from '../../context/AuthContext';

const PAGE_SIZE = 20;

const CustomersPage = () => {
    const { message, modal } = App.useApp();
    const { user: me } = useAuth();
    const [rows, setRows] = useState<Customer[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [role, setRole] = useState<string | undefined>();
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminApi.customers({ page, limit: PAGE_SIZE, search: search || undefined, role });
            setRows(res.data);
            setTotal(res.pagination?.total || 0);
        } catch (err) {
            message.error(errorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [page, search, role, message]);

    useEffect(() => {
        const t = setTimeout(load, 250);
        return () => clearTimeout(t);
    }, [load]);

    const update = (c: Customer, body: { role?: string; active?: boolean }, confirmText: string) => modal.confirm({
        title: confirmText,
        content: 'They will need to log in again.',
        onOk: async () => {
            try {
                await adminApi.updateCustomer(c.id, body);
                message.success('User updated');
                load();
            } catch (err) {
                message.error(errorMessage(err));
            }
        },
    });

    const columns: ColumnsType<Customer> = [
        { title: 'Name', dataIndex: 'name', render: (n: string, c) => <div><div className="font-medium">{n}</div><div className="text-xs text-admin-muted">{c.email}</div></div> },
        { title: 'Phone', dataIndex: 'phone', render: (p?: string) => p || '—' },
        { title: 'Orders', dataIndex: 'orders', width: 80 },
        { title: 'Spent', dataIndex: 'totalSpent', width: 130, render: (s: number) => `Rs ${Math.round(s).toLocaleString()}` },
        { title: 'Last order', dataIndex: 'lastOrderAt', width: 120, render: (d: string | null) => (d ? new Date(d).toLocaleDateString() : '—') },
        { title: 'Joined', dataIndex: 'createdAt', width: 120, render: (d: string) => new Date(d).toLocaleDateString() },
        {
            title: 'Role', dataIndex: 'role', width: 130, render: (r: string, c) => (
                <Select size="small" value={r} disabled={c.id === me?.id} className="w-28"
                    onChange={(v) => update(c, { role: v }, `Make ${c.name} ${v === 'admin' ? 'an admin' : 'a customer'}?`)}
                    options={[{ value: 'customer', label: 'Customer' }, { value: 'admin', label: 'Admin' }]} />
            ),
        },
        {
            title: 'Active', dataIndex: 'active', width: 90, render: (a: boolean, c) => (
                c.id === me?.id ? <Tag color="gold">You</Tag> : (
                    <Switch size="small" checked={a} onChange={(v) => update(c, { active: v }, v ? `Re-enable ${c.name}?` : `Disable ${c.name}'s account?`)} />
                )
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-poppins m-0 text-admin-text">Customers</h1>
                <p className="text-admin-muted m-0">{total} registered user{total === 1 ? '' : 's'}. Guest checkouts appear in Orders.</p>
            </div>
            <Card className="rounded-xl">
                <div className="flex flex-wrap gap-3 mb-4">
                    <Input.Search allowClear placeholder="Name, email or phone" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full md:w-80" />
                    <Select allowClear placeholder="All roles" value={role} onChange={(v) => { setRole(v); setPage(1); }} className="w-36"
                        options={[{ value: 'customer', label: 'Customers' }, { value: 'admin', label: 'Admins' }]} />
                </div>
                <Table rowKey="id" columns={columns} dataSource={rows} loading={loading} scroll={{ x: 900 }}
                    pagination={{ current: page, pageSize: PAGE_SIZE, total, onChange: setPage }} />
            </Card>
            <Messages cardClass="rounded-xl" />
        </div>
    );
};

interface ContactMessage { id: string; name: string; email: string; phone: string; subject: string; message: string; handled: boolean; createdAt: string }

/** Contact-form messages and newsletter sign-up count. */
const Messages = ({ cardClass }: { cardClass: string }) => {
    const { message } = App.useApp();
    const [items, setItems] = useState<ContactMessage[]>([]);
    const [subscribers, setSubscribers] = useState(0);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await http.get<ContactMessage[]>('/admin/messages', { limit: 50 });
            setItems(res.data);
            setSubscribers((res as unknown as { subscribers: number }).subscribers || 0);
        } catch (err) {
            message.error(errorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [message]);
    useEffect(() => { load(); }, [load]);

    const toggle = async (m: ContactMessage) => {
        try {
            await http.patch(`/admin/messages/${m.id}`, { handled: !m.handled });
            load();
        } catch (err) {
            message.error(errorMessage(err));
        }
    };

    return (
        <Card title={`Contact messages · ${subscribers} newsletter subscriber${subscribers === 1 ? '' : 's'}`} className={cardClass}>
            <Table
                rowKey="id"
                loading={loading}
                dataSource={items}
                scroll={{ x: 800 }}
                pagination={{ pageSize: 10 }}
                columns={[
                    { title: 'From', render: (_, m) => <div><div className="font-medium">{m.name}</div><div className="text-xs text-admin-muted">{m.email}</div></div> },
                    { title: 'Subject', dataIndex: 'subject', width: 160 },
                    { title: 'Message', dataIndex: 'message', render: (t: string) => <span className="whitespace-pre-line">{t}</span> },
                    { title: 'Received', dataIndex: 'createdAt', width: 120, render: (d: string) => new Date(d).toLocaleDateString() },
                    { title: 'Handled', dataIndex: 'handled', width: 90, render: (h: boolean, m) => <Switch size="small" checked={h} onChange={() => toggle(m)} /> },
                ]}
            />
        </Card>
    );
};

export default CustomersPage;
