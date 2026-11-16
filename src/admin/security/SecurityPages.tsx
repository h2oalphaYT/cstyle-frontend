import { useEffect, useMemo, useState } from 'react';
import { Alert, App, Button, Card, Col, Drawer, Empty, Form, Input, Popconfirm, Radio, Row, Select, Space, Switch, Table, Tag, Tooltip, Typography } from 'antd';
import { CopyOutlined, DeleteOutlined, EditOutlined, KeyOutlined, LockOutlined, PlusOutlined, SearchOutlined, UserAddOutlined } from '@ant-design/icons';
import { http } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { cardClass, EmployeeSelect, PageHeader, useAction, useList } from '../hr/lib';
import RightsMatrix, { LevelTag } from './RightsMatrix';
import { levelOf, SCREENS, SECTIONS } from './screens';

interface Role { id: string; code: string; name: string; description?: string; permissions: string[]; dataScope: string; active: boolean; system?: boolean }
interface SecUser {
    id: string; name: string; email: string; phone?: string; role: 'staff' | 'admin'; active: boolean;
    staffRole: { id: string; name: string; code: string } | null; employee: { id: string; fullName: string; employeeCode: string } | null;
    customRights: boolean; permissions: string[] | null; dataScope: string | null; lastLoginAt: string | null;
}
interface Holders { roles: { id: string; name: string; code: string; permissions: string[]; users: number }[]; users: { id: string; name: string; email: string; permissions: string[] }[] }

const SCOPES = [
    { value: 'all', label: 'All employees' }, { value: 'department', label: 'Own department' },
    { value: 'team', label: 'Own team (people they manage)' }, { value: 'own', label: 'Only themselves' },
];
const screensOpen = (perms: string[]) => { const set = new Set(perms); return SCREENS.filter(s => !s.adminOnly && levelOf(s, set) !== 'none').length; };
const fmtWhen = (d: string | null) => (d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never');

const useRoles = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const load = () => http.get<Role[]>('/payroll/roles', { limit: 200 }).then(r => setRoles(r.data)).catch(() => undefined);
    useEffect(() => { load(); }, []);
    return { roles, reload: load };
};

// ── Users & Logins ─────────────────────────────────────────────────
const UserDrawer = ({ open, user, roles, onClose, onSaved }: { open: boolean; user: SecUser | null; roles: Role[]; onClose: () => void; onSaved: () => void }) => {
    const [form] = Form.useForm();
    const act = useAction();
    const [saving, setSaving] = useState(false);
    const mode: 'role' | 'custom' = Form.useWatch('mode', form) || 'role';
    const roleId: string | undefined = Form.useWatch('staffRole', form);
    const role = roles.find(r => r.id === roleId);
    useEffect(() => {
        if (!open) return;
        form.resetFields();
        form.setFieldsValue(user ? {
            name: user.name, email: user.email, phone: user.phone, employee: user.employee?.id, active: user.active,
            mode: user.customRights ? 'custom' : 'role', staffRole: user.staffRole?.id, permissions: user.permissions || [], dataScope: user.dataScope || undefined,
        } : { active: true, mode: 'role', permissions: [] });
    }, [open, user, form]);
    const save = async () => {
        const v = await form.validateFields();
        const body = {
            name: v.name, phone: v.phone, employee: v.employee || null, active: v.active,
            customRights: v.mode === 'custom', staffRole: v.staffRole || null,
            permissions: v.mode === 'custom' ? v.permissions : undefined, dataScope: v.mode === 'custom' ? (v.dataScope || null) : undefined,
            ...(user ? {} : { email: v.email, password: v.password }),
        };
        setSaving(true);
        const ok = await act(() => (user ? http.put(`/security/users/${user.id}`, body) : http.post('/security/users', body)), user ? 'User saved' : 'Login created');
        setSaving(false);
        if (ok) onSaved();
    };
    return (
        <Drawer open={open} onClose={onClose} width={Math.min(980, window.innerWidth)} destroyOnHidden title={user ? `Edit ${user.name}` : 'New login'}
            extra={<Space><Button onClick={onClose}>Close</Button><Button type="primary" loading={saving} onClick={save}>{user ? 'Save' : 'Create login'}</Button></Space>}>
            <Form form={form} layout="vertical">
                <Row gutter={12}>
                    <Col xs={24} md={8}><Form.Item name="name" label="Name" rules={[{ required: true }]}><Input maxLength={120} /></Form.Item></Col>
                    <Col xs={24} md={8}><Form.Item name="email" label="Login (email)" rules={[{ required: true, type: 'email' }]}><Input disabled={!!user} autoComplete="off" /></Form.Item></Col>
                    {!user && <Col xs={24} md={8}><Form.Item name="password" label="Password" rules={[{ required: true, min: 8, message: 'At least 8 characters' }]}><Input.Password autoComplete="new-password" /></Form.Item></Col>}
                    <Col xs={24} md={8}><Form.Item name="phone" label="Phone"><Input maxLength={30} /></Form.Item></Col>
                    <Col xs={24} md={8}><Form.Item name="employee" label="Employee record" tooltip="Links the login to an employee for My HR (own payslips, leave)"><EmployeeSelect /></Form.Item></Col>
                    <Col xs={24} md={8}><Form.Item name="active" label="Can log in" valuePropName="checked"><Switch /></Form.Item></Col>
                </Row>
                <Form.Item name="mode" label="Rights">
                    <Radio.Group optionType="button" buttonStyle="solid" options={[{ value: 'role', label: 'From a role' }, { value: 'custom', label: 'Own screen rights' }]} />
                </Form.Item>
                <Row gutter={12}>
                    <Col xs={24} md={12}>
                        <Form.Item name="staffRole" label={mode === 'role' ? 'Role' : 'Role (optional, for the data scope)'} rules={mode === 'role' ? [{ required: true, message: 'Choose a role' }] : []}>
                            <Select allowClear showSearch optionFilterProp="label" options={roles.filter(r => r.active !== false).map(r => ({ value: r.id, label: r.name }))} />
                        </Form.Item>
                    </Col>
                    {mode === 'custom' && (
                        <Col xs={24} md={12}>
                            <Form.Item name="dataScope" label="Which employees they can see" tooltip="Empty = the role's setting, or only themselves without a role">
                                <Select allowClear options={SCOPES} placeholder={role ? `As role: ${SCOPES.find(s => s.value === role.dataScope)?.label}` : 'Only themselves'} />
                            </Form.Item>
                        </Col>
                    )}
                </Row>
                {mode === 'custom' ? (
                    <>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <Typography.Text strong>Screen rights</Typography.Text>
                            <Space>
                                <Typography.Text type="secondary">Start from</Typography.Text>
                                <Select size="small" className="w-56" placeholder="Copy a role's rights" value={null}
                                    onChange={(id) => form.setFieldValue('permissions', [...(roles.find(r => r.id === id)?.permissions || [])])}
                                    options={roles.map(r => ({ value: r.id, label: r.name }))} />
                                <Button size="small" onClick={() => form.setFieldValue('permissions', [])}>Clear</Button>
                            </Space>
                        </div>
                        <Form.Item name="permissions" rules={[{ validator: (_, v) => (v?.length ? Promise.resolve() : Promise.reject(new Error('Give access to at least one screen'))) }]}>
                            <RightsMatrix />
                        </Form.Item>
                    </>
                ) : role && (
                    <>
                        <Typography.Paragraph type="secondary">Rights of the <b>{role.name}</b> role (change them on Roles & Rights, or switch to own screen rights):</Typography.Paragraph>
                        <RightsMatrix value={role.permissions} disabled />
                    </>
                )}
            </Form>
        </Drawer>
    );
};

export function SecurityUsersPage() {
    const { user: me } = useAuth();
    const act = useAction();
    const { modal } = App.useApp();
    const [search, setSearch] = useState('');
    const list = useList<SecUser>('/security/users', { search });
    const { roles } = useRoles();
    const [editing, setEditing] = useState<SecUser | null | 'new'>(null);
    const [pwFor, setPwFor] = useState<SecUser | null>(null);
    const [pw, setPw] = useState('');

    const patch = async (u: SecUser, body: object, msg: string) => { if (await act(() => http.put(`/security/users/${u.id}`, body), msg)) list.reload(); };
    const remove = (u: SecUser) => modal.confirm({
        title: `Remove ${u.name}'s back-office access?`, content: 'They can no longer log in to the admin. Their history stays.', okButtonProps: { danger: true }, okText: 'Remove access',
        onOk: async () => { if (await act(() => http.delete(`/security/users/${u.id}`), 'Access removed')) list.reload(); },
    });
    const resetPw = async () => {
        if (pwFor && await act(() => http.post(`/security/users/${pwFor.id}/password`, { password: pw }), 'Password changed')) { setPwFor(null); setPw(''); }
    };

    return (
        <div>
            <PageHeader title="Users & Logins" subtitle="Create logins for staff and decide which screens each one can open: give a role, or set rights screen by screen."
                extra={<Button type="primary" icon={<UserAddOutlined />} onClick={() => setEditing('new')}>New login</Button>} />
            <Card className={cardClass()}>
                <Input allowClear prefix={<SearchOutlined />} placeholder="Name or email" className="w-72 mb-4" value={search} onChange={e => setSearch(e.target.value)} />
                <Table<SecUser> rowKey="id" loading={list.loading} dataSource={list.data} pagination={false} size="middle"
                    columns={[
                        { title: 'User', render: (_, u) => <span><b>{u.name}</b>{u.id === me?.id && <Tag className="ml-2">You</Tag>}<Typography.Text type="secondary" className="block text-xs">{u.email}</Typography.Text></span> },
                        {
                            title: 'Rights', render: (_, u) => (u.role === 'admin' ? <Tag color="gold" icon={<LockOutlined />}>Administrator · everything</Tag>
                                : u.customRights ? <Space size={4}><Tag color="purple">Own rights</Tag><Typography.Text type="secondary">{screensOpen(u.permissions || [])} screens</Typography.Text></Space>
                                    : <Tag color="blue">{u.staffRole?.name || 'No role'}</Tag>),
                        },
                        { title: 'Employee', render: (_, u) => (u.employee ? `${u.employee.employeeCode} · ${u.employee.fullName}` : '—') },
                        { title: 'Last login', dataIndex: 'lastLoginAt', width: 170, render: fmtWhen },
                        { title: 'Can log in', width: 100, render: (_, u) => u.role !== 'admin' && <Switch size="small" checked={u.active} disabled={u.id === me?.id} onChange={(v) => patch(u, { active: v }, v ? 'Login enabled' : 'Login disabled')} /> },
                        {
                            title: '', width: 130, render: (_, u) => u.role !== 'admin' && (
                                <Space size={0}>
                                    <Tooltip title="Edit rights"><Button type="text" icon={<EditOutlined />} onClick={() => setEditing(u)} /></Tooltip>
                                    <Tooltip title="Set a new password"><Button type="text" icon={<KeyOutlined />} onClick={() => { setPwFor(u); setPw(''); }} /></Tooltip>
                                    {u.id !== me?.id && <Tooltip title="Remove access"><Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(u)} /></Tooltip>}
                                </Space>
                            ),
                        },
                    ]} />
            </Card>
            <UserDrawer open={!!editing} user={editing === 'new' ? null : editing} roles={roles} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); list.reload(); }} />
            <Drawer open={!!pwFor} onClose={() => setPwFor(null)} title={`New password · ${pwFor?.name || ''}`} width={420}
                extra={<Button type="primary" disabled={pw.length < 8} onClick={resetPw}>Save password</Button>}>
                <Input.Password value={pw} onChange={e => setPw(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" />
                <Typography.Paragraph type="secondary" className="mt-3">The user is signed out and logs in with the new password.</Typography.Paragraph>
            </Drawer>
        </div>
    );
}

// ── Roles & Rights ─────────────────────────────────────────────────
export function SecurityRolesPage() {
    const act = useAction();
    const { roles, reload } = useRoles();
    const [holders, setHolders] = useState<Holders | null>(null);
    const [editing, setEditing] = useState<Partial<Role> | null>(null);
    const [form] = Form.useForm();
    useEffect(() => { http.get<Holders>('/security/holders').then(r => setHolders(r.data)).catch(() => undefined); }, [roles]);
    useEffect(() => { if (editing) { form.resetFields(); form.setFieldsValue({ dataScope: 'own', active: true, permissions: [], ...editing }); } }, [editing, form]);
    const save = async () => {
        const v = await form.validateFields();
        const ok = editing?.id ? await act(() => http.put(`/payroll/roles/${editing.id}`, v), 'Role saved') : await act(() => http.post('/payroll/roles', v), 'Role created');
        if (ok) { setEditing(null); reload(); }
    };
    const usersOf = (id: string) => holders?.roles.find(r => r.id === id)?.users ?? 0;
    return (
        <div>
            <PageHeader title="Roles & Rights" subtitle="A role is a set of screen rights you give to many users (Stores Keeper, Security Gate, HR Officer…). Set each screen, or a whole menu section at once."
                extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing({})}>New role</Button>} />
            <Card className={cardClass()}>
                <Table<Role> rowKey="id" dataSource={roles} pagination={false} size="middle" onRow={r => ({ onDoubleClick: () => setEditing(r) })}
                    columns={[
                        { title: 'Role', render: (_, r) => <span><b>{r.name}</b> <Typography.Text type="secondary" className="text-xs">{r.code}</Typography.Text>{r.system && <Tag className="ml-2">built-in</Tag>}{r.active === false && <Tag color="red" className="ml-1">inactive</Tag>}<Typography.Text type="secondary" className="block text-xs">{r.description}</Typography.Text></span> },
                        { title: 'Screens', width: 100, render: (_, r) => screensOpen(r.permissions) },
                        { title: 'Sees employees', width: 180, render: (_, r) => SCOPES.find(s => s.value === r.dataScope)?.label },
                        { title: 'Users', width: 80, render: (_, r) => usersOf(r.id) },
                        {
                            title: '', width: 130, render: (_, r) => (
                                <Space size={0}>
                                    <Tooltip title="Edit rights"><Button type="text" icon={<EditOutlined />} onClick={() => setEditing(r)} /></Tooltip>
                                    <Tooltip title="Copy as a new role"><Button type="text" icon={<CopyOutlined />} onClick={() => setEditing({ ...r, id: undefined, system: false, code: `${r.code}_COPY`, name: `${r.name} (copy)` })} /></Tooltip>
                                    {!r.system && (
                                        <Popconfirm title="Delete this role?" onConfirm={async () => { if (await act(() => http.delete(`/payroll/roles/${r.id}`), 'Role deleted')) reload(); }}>
                                            <Button type="text" danger icon={<DeleteOutlined />} />
                                        </Popconfirm>
                                    )}
                                </Space>
                            ),
                        },
                    ]} />
            </Card>
            <Drawer open={!!editing} onClose={() => setEditing(null)} width={Math.min(980, window.innerWidth)} destroyOnHidden title={editing?.id ? `Edit role · ${editing.name}` : 'New role'}
                extra={<Space><Button onClick={() => setEditing(null)}>Close</Button><Button type="primary" onClick={save}>Save role</Button></Space>}>
                <Form form={form} layout="vertical">
                    <Row gutter={12}>
                        <Col xs={24} md={8}><Form.Item name="name" label="Role name" rules={[{ required: true }]}><Input maxLength={80} /></Form.Item></Col>
                        <Col xs={12} md={5}><Form.Item name="code" label="Code" rules={[{ required: true, pattern: /^[A-Za-z0-9_-]+$/, message: 'Letters, numbers, - and _' }]}><Input disabled={!!editing?.system} className="uppercase" /></Form.Item></Col>
                        <Col xs={12} md={7}><Form.Item name="dataScope" label="Sees employees"><Select options={SCOPES} /></Form.Item></Col>
                        <Col xs={12} md={4}><Form.Item name="active" label="Active" valuePropName="checked"><Switch /></Form.Item></Col>
                        <Col span={24}><Form.Item name="description" label="Description"><Input maxLength={300} /></Form.Item></Col>
                    </Row>
                    {usersOf(editing?.id || '') > 0 && <Alert type="info" showIcon className="mb-3" message={`${usersOf(editing!.id!)} user(s) have this role. Changes apply to them straight away.`} />}
                    <Form.Item name="permissions" label="Screen rights"><RightsMatrix /></Form.Item>
                </Form>
            </Drawer>
        </div>
    );
}

// ── Screen Codes ───────────────────────────────────────────────────
export function ScreenCodesPage() {
    const [holders, setHolders] = useState<Holders | null>(null);
    const [search, setSearch] = useState('');
    useEffect(() => { http.get<Holders>('/security/holders').then(r => setHolders(r.data)).catch(() => undefined); }, []);
    const rows = useMemo(() => SECTIONS.flatMap(s => s.screens).filter(s => !search || `${s.code} ${s.label} ${s.section}`.toLowerCase().includes(search.toLowerCase())), [search]);
    return (
        <div>
            <PageHeader title="Screen Codes" subtitle="Every screen has a security code (also shown in the menu). See which roles and users can open each one." />
            <Card className={cardClass()}>
                <Input allowClear prefix={<SearchOutlined />} placeholder="Code or screen" className="w-72 mb-4" value={search} onChange={e => setSearch(e.target.value)} />
                <Table rowKey="code" dataSource={rows} size="small" pagination={false} loading={!holders} locale={{ emptyText: <Empty /> }}
                    columns={[
                        { title: 'Code', dataIndex: 'code', width: 90, render: (c: string) => <code className="font-semibold">{c}</code> },
                        { title: 'Screen', dataIndex: 'label', width: 200 },
                        { title: 'Section', dataIndex: 'section', width: 150 },
                        {
                            title: 'Who can open it', render: (_, s) => {
                                if (s.adminOnly) return <Tag icon={<LockOutlined />}>Administrators only</Tag>;
                                const tags = [
                                    ...(holders?.roles || []).map(r => ({ key: `r${r.id}`, name: `${r.name}${r.users ? ` (${r.users})` : ''}`, level: levelOf(s, new Set(r.permissions)), color: 'blue' })),
                                    ...(holders?.users || []).map(u => ({ key: `u${u.id}`, name: u.name, level: levelOf(s, new Set(u.permissions)), color: 'purple' })),
                                ].filter(t => t.level !== 'none');
                                return tags.length ? (
                                    <Space size={[4, 4]} wrap>{tags.map(t => <Tooltip key={t.key} title={t.color === 'purple' ? 'User with own rights' : 'Role (users)'}><span className="inline-flex items-center gap-1 mr-2"><Tag color={t.color} className="m-0">{t.name}</Tag><LevelTag level={t.level} /></span></Tooltip>)}</Space>
                                ) : <Typography.Text type="secondary">Administrators only</Typography.Text>;
                            },
                        },
                    ]} />
            </Card>
        </div>
    );
}
