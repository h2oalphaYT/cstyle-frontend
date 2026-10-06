import { useState, useEffect, useMemo } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ordersApi } from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { App as AntApp, ConfigProvider, Layout, Badge, Dropdown, Avatar, Input, Menu, Switch, Tooltip } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    ShoppingOutlined,
    TagOutlined,
    ShoppingCartOutlined,
    InboxOutlined,
    UserOutlined,
    BarChartOutlined,
    SettingOutlined,
    BellOutlined,
    SearchOutlined,
    LogoutOutlined,
    MoonOutlined,
    SunOutlined,
    AppstoreOutlined,
    ShopOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { HR_NAV } from '../hr/nav';
import { AdminThemeProvider, useAdminTheme } from '../theme';

const { Header, Sider, Content } = Layout;

type NavItem = Required<MenuProps>['items'][number];

interface StoreLink { path: string; label: string; icon: React.ReactNode }

/** Store administration menu, admins only. Grouped by what people come to do. */
const STORE_GROUPS: { key: string; title: string; items: StoreLink[] }[] = [
    {
        key: 'store', title: 'Store', items: [
            { path: '/admin', label: 'Dashboard', icon: <DashboardOutlined /> },
            { path: '/admin/orders', label: 'Orders', icon: <ShoppingCartOutlined /> },
            { path: '/admin/customers', label: 'Customers', icon: <UserOutlined /> },
            { path: '/admin/analytics', label: 'Analytics', icon: <BarChartOutlined /> },
        ],
    },
    {
        key: 'catalog', title: 'Catalog', items: [
            { path: '/admin/products', label: 'Products', icon: <ShoppingOutlined /> },
            { path: '/admin/categories', label: 'Categories', icon: <AppstoreOutlined /> },
            { path: '/admin/inventory', label: 'Stock / Inventory', icon: <InboxOutlined /> },
            { path: '/admin/offers', label: 'Coupons & Banners', icon: <TagOutlined /> },
        ],
    },
];
const SYSTEM_LINKS: StoreLink[] = [{ path: '/admin/settings', label: 'Store Settings', icon: <SettingOutlined /> }];

const hrPath = (p: string) => `/admin/hr${p ? `/${p}` : ''}`;

/** The menu entry for a URL: an exact match, else the longest entry the URL sits under (e.g. a payroll run). */
const activeEntry = (pathname: string, paths: string[]) => {
    let best: string | undefined;
    for (const p of paths) {
        const hit = pathname === p || (p !== '/admin' && p !== '/admin/hr' && pathname.startsWith(`${p}/`));
        if (hit && (!best || p.length > best.length)) best = p;
    }
    return best;
};

const AdminShell = () => {
    const [collapsed, setCollapsed] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);
    const { isDark, setDark, antd } = useAdminTheme();
    const [pendingOrders, setPendingOrders] = useState(0);
    const [search, setSearch] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, isAdmin, can } = useAuth();

    // Payroll & HR menu, limited to what the user's role allows.
    const hrNav = useMemo(() => HR_NAV
        .map(s => ({ ...s, items: s.items.filter(i => !i.perms.length || can(...i.perms)) }))
        .filter(s => s.items.length), [can]);

    // Bell badge shows orders waiting to be confirmed (store admins only).
    useEffect(() => {
        if (!isAdmin) return;
        ordersApi.list({ status: 'pending', limit: 1 })
            .then(res => setPendingOrders(res.pagination?.total || 0))
            .catch(() => setPendingOrders(0));
    }, [location.pathname, isAdmin]);

    const allPaths = useMemo(() => [
        ...(isAdmin ? [...STORE_GROUPS.flatMap(g => g.items), ...SYSTEM_LINKS].map(i => i.path) : []),
        ...hrNav.flatMap(s => s.items.map(i => hrPath(i.path))),
    ], [isAdmin, hrNav]);
    const selected = activeEntry(location.pathname, allPaths);
    const selectedSection = hrNav.find(s => s.items.some(i => hrPath(i.path) === selected))?.title;

    // Open the group holding the current page; the user can open or close the others freely.
    const [openKeys, setOpenKeys] = useState<string[]>(() => (selectedSection ? [`hr:${selectedSection}`] : []));
    useEffect(() => {
        if (selectedSection) setOpenKeys(keys => (keys.includes(`hr:${selectedSection}`) ? keys : [...keys, `hr:${selectedSection}`]));
    }, [selectedSection]);

    const menuItems = useMemo<NavItem[]>(() => {
        const link = (i: StoreLink): NavItem => ({
            key: i.path,
            icon: i.icon,
            label: i.path === '/admin/orders' && pendingOrders > 0
                ? <Link to={i.path} className="flex items-center justify-between gap-2">{i.label}<Badge count={pendingOrders} size="small" /></Link>
                : <Link to={i.path}>{i.label}</Link>,
        });
        // Collapsed, group titles have no room, so groups are separated by a thin divider instead.
        const group = (key: string, title: string, children: NavItem[]): NavItem[] => (collapsed
            ? [{ type: 'divider', key: `${key}:div` }, ...children]
            : [{ type: 'group', key, label: title, children }]);

        const items: NavItem[] = [];
        if (isAdmin) STORE_GROUPS.forEach(g => items.push(...group(g.key, g.title, g.items.map(link))));
        if (hrNav.length) {
            const hrChildren: NavItem[] = hrNav.flatMap((s): NavItem[] => {
                const links = s.items.map(i => link({ path: hrPath(i.path), label: i.label, icon: i.icon }));
                return s.title === 'Overview' ? links : [{ key: `hr:${s.title}`, icon: s.icon, label: s.title, children: links }];
            });
            items.push(...group('hr', 'Payroll & HR', hrChildren));
        }
        if (isAdmin) items.push(...group('system', 'System', SYSTEM_LINKS.map(link)));
        return collapsed ? items.slice(1) : items;
    }, [isAdmin, hrNav, collapsed, pendingOrders]);

    const onProfileMenu: MenuProps['onClick'] = async ({ key }) => {
        if (key === 'logout') {
            await logout();
            navigate('/auth');
        } else if (key === 'settings') {
            navigate(isAdmin ? '/admin/settings' : '/admin/hr/me');
        } else if (key === 'store') {
            navigate('/');
        }
    };

    const profileMenuItems: MenuProps['items'] = [
        { key: 'store', icon: <ShopOutlined />, label: 'View Store' },
        { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
        { type: 'divider' },
        { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true },
    ];

    return (
        <ConfigProvider theme={antd}>
        <AntApp>
        <Layout className="min-h-screen">
            {/* Sidebar */}
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                collapsedWidth={72}
                width={260}
                className="!fixed !h-screen z-50 border-r border-admin-border"
            >
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <Link
                        to={isAdmin ? '/admin' : '/admin/hr'}
                        className={`h-16 shrink-0 flex items-center ${collapsed ? 'justify-center' : 'px-5'} border-b border-admin-border`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-brand-gold to-brand-gold-dark flex items-center justify-center rounded-lg">
                                <span className="text-brand-black font-bold text-lg font-poppins">C</span>
                            </div>
                            {!collapsed && (
                                <div className="leading-tight">
                                    <span className="text-lg font-bold font-poppins text-admin-text">Cstyle</span>
                                    <p className="text-[10px] text-admin-accent uppercase tracking-[0.2em] m-0">Admin</p>
                                </div>
                            )}
                        </div>
                    </Link>

                    {/* Menu */}
                    <nav className="admin-nav flex-1 overflow-y-auto overflow-x-hidden py-2" aria-label="Admin navigation">
                        <Menu
                            mode="inline"
                            inlineCollapsed={collapsed}
                            items={menuItems}
                            selectedKeys={selected ? [selected] : []}
                            openKeys={collapsed ? undefined : openKeys}
                            onOpenChange={keys => setOpenKeys(keys as string[])}
                            className="!border-e-0"
                        />
                    </nav>
                </div>
            </Sider>

            {/* Main Layout */}
            <Layout className={`${collapsed ? 'ml-[72px]' : 'ml-[260px]'} transition-all duration-300`}>
                {/* Header */}
                <Header className="border-b border-admin-border flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center space-x-4">
                        <button
                            type="button"
                            onClick={() => setCollapsed(!collapsed)}
                            aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
                            className="text-xl text-admin-muted hover:text-admin-text transition-colors"
                        >
                            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        </button>

                        {/* Search Bar */}
                        {isAdmin && <Input
                            prefix={<SearchOutlined className="text-admin-muted" />}
                            placeholder="Search products by name or SKU…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onPressEnter={() => {
                                if (search.trim()) navigate(`/admin/products?search=${encodeURIComponent(search.trim())}`);
                            }}
                            className="hidden md:flex w-80"
                        />}
                    </div>

                    <div className="flex items-center space-x-6">
                        {/* Theme Toggle */}
                        <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
                            <div className="flex items-center space-x-2">
                                <SunOutlined className={isDark ? 'text-admin-muted' : 'text-admin-accent'} />
                                <Switch checked={isDark} onChange={setDark} size="small" aria-label="Dark mode" />
                                <MoonOutlined className={isDark ? 'text-admin-accent' : 'text-admin-muted'} />
                            </div>
                        </Tooltip>

                        {/* Notifications */}
                        {isAdmin && <Link to="/admin/orders?status=pending" aria-label={`${pendingOrders} pending orders`} className="flex items-center">
                            <Badge count={pendingOrders} offset={[-5, 5]}>
                                <BellOutlined className="text-xl text-admin-muted hover:text-admin-text cursor-pointer transition-colors" />
                            </Badge>
                        </Link>}

                        {/* Profile Dropdown */}
                        <Dropdown menu={{ items: profileMenuItems, onClick: onProfileMenu }} placement="bottomRight" arrow>
                            <div className="flex items-center space-x-3 cursor-pointer">
                                <Avatar size={36} className="bg-brand-gold text-brand-black font-bold">
                                    {(user?.name || 'A').charAt(0).toUpperCase()}
                                </Avatar>
                                <div className="hidden md:block leading-tight">
                                    <p className="text-sm font-medium m-0 text-admin-text">{user?.name}</p>
                                    <p className="text-xs text-admin-muted m-0">{user?.email}</p>
                                </div>
                            </div>
                        </Dropdown>
                    </div>
                </Header>

                {/* Content */}
                <Content className="admin-content p-6 min-h-[calc(100vh-64px)] text-admin-text">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </Content>
            </Layout>
        </Layout>
        </AntApp>
        </ConfigProvider>
    );
};

const AdminLayout = () => (
    <AdminThemeProvider>
        <AdminShell />
    </AdminThemeProvider>
);

export default AdminLayout;
