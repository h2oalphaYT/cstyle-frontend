import { useState, useEffect, useMemo } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ordersApi } from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { App as AntApp, ConfigProvider, Layout, Badge, Dropdown, Avatar, Input, Switch, theme as antTheme } from 'antd';
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
import { DownOutlined, RightOutlined, SolutionOutlined } from '@ant-design/icons';
import { HR_NAV } from '../hr/nav';

const { Header, Sider, Content } = Layout;

interface MenuItem {
    key: string;
    icon: React.ReactNode;
    label: string;
    path: string;
}

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('admin-theme') === 'dark';
    });
    const [pendingOrders, setPendingOrders] = useState(0);
    const [search, setSearch] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, isAdmin, can } = useAuth();
    const inHr = location.pathname.startsWith('/admin/hr');
    const [hrOpen, setHrOpen] = useState(true);
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

    useEffect(() => {
        localStorage.setItem('admin-theme', isDarkMode ? 'dark' : 'light');
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        // Leaving the admin restores the storefront's own theme.
        return () => {
            const storeTheme = localStorage.getItem('cstyle-theme') || 'dark';
            document.documentElement.classList.toggle('dark', storeTheme === 'dark');
        };
    }, [isDarkMode]);

    const storeItems: MenuItem[] = [
        { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard', path: '/admin' },
        { key: 'products', icon: <ShoppingOutlined />, label: 'Products', path: '/admin/products' },
        { key: 'categories', icon: <AppstoreOutlined />, label: 'Categories', path: '/admin/categories' },
        { key: 'offers', icon: <TagOutlined />, label: 'Coupons & Banners', path: '/admin/offers' },
        { key: 'orders', icon: <ShoppingCartOutlined />, label: 'Orders', path: '/admin/orders' },
        { key: 'inventory', icon: <InboxOutlined />, label: 'Stock / Inventory', path: '/admin/inventory' },
        { key: 'customers', icon: <UserOutlined />, label: 'Customers', path: '/admin/customers' },
        { key: 'analytics', icon: <BarChartOutlined />, label: 'Analytics', path: '/admin/analytics' },
        { key: 'settings', icon: <SettingOutlined />, label: 'Settings', path: '/admin/settings' },
    ];
    const menuItems = isAdmin ? storeItems : [];

    const profileMenuItems: MenuProps['items'] = [
        {
            key: 'store',
            icon: <ShopOutlined />,
            label: 'View Store',
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Settings',
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            danger: true,
        },
    ];

    return (
        <ConfigProvider
            theme={{
                algorithm: isDarkMode ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
                token: { colorPrimary: '#D4AF37', fontFamily: 'Inter, sans-serif' },
            }}
        >
        <AntApp>
        <Layout className="min-h-screen">
            {/* Sidebar */}
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                className={`${isDarkMode ? 'bg-brand-black' : 'bg-white'
                    } border-r ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} !fixed !h-screen z-50 overflow-auto`}
                width={260}
            >
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`h-16 flex items-center ${collapsed ? 'justify-center' : 'justify-start px-6'} border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'
                        }`}
                >
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-brand-gold to-brand-gold-dark flex items-center justify-center rounded">
                            <span className="text-brand-black font-bold text-lg font-poppins">C</span>
                        </div>
                        {!collapsed && (
                            <div>
                                <span className={`text-xl font-bold font-poppins ${isDarkMode ? 'text-white' : 'text-brand-black'}`}>
                                    Cstyle
                                </span>
                                <p className="text-xs text-brand-gold uppercase tracking-wider">Admin</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Menu Items */}
                <nav className="mt-4">
                    {menuItems.map((item, index) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <motion.div
                                key={item.key}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link to={item.path}>
                                    <div
                                        className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start px-6'
                                            } py-4 mx-2 my-1 rounded-lg transition-all cursor-pointer group ${isActive
                                                ? 'bg-brand-gold text-brand-black'
                                                : `${isDarkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-brand-black'}`
                                            }`}
                                    >
                                        <span className={`text-xl ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                                            {item.icon}
                                        </span>
                                        {!collapsed && <span className="ml-4 font-medium">{item.label}</span>}
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}

                    {hrNav.length > 0 && (
                        <div className="mt-2 pb-6">
                            {isAdmin && (
                                <button type="button" onClick={() => setHrOpen(!hrOpen)}
                                    className={`w-[calc(100%-1rem)] flex items-center ${collapsed ? 'justify-center' : 'justify-between px-6'} py-3 mx-2 rounded-lg ${inHr ? 'text-brand-gold' : isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}>
                                    <span className="flex items-center"><SolutionOutlined className="text-xl" />{!collapsed && <span className="ml-4 font-semibold">Payroll &amp; HR</span>}</span>
                                    {!collapsed && (hrOpen ? <DownOutlined className="text-xs" /> : <RightOutlined className="text-xs" />)}
                                </button>
                            )}
                            {(hrOpen || !isAdmin) && hrNav.map(section => (
                                <div key={section.title} className="mt-1">
                                    {!collapsed && <p className="px-8 pt-3 pb-1 text-[10px] uppercase tracking-wider text-gray-500 m-0">{section.title}</p>}
                                    {section.items.map(item => {
                                        const to = `/admin/hr${item.path ? `/${item.path}` : ''}`;
                                        const isActive = location.pathname === to || (item.path === 'payroll' && location.pathname.startsWith('/admin/hr/payroll/'));
                                        return (
                                            <Link to={to} key={to} title={collapsed ? item.label : undefined}>
                                                <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start pl-8 pr-4'} py-2 mx-2 rounded-lg text-sm transition-all ${isActive
                                                    ? 'bg-brand-gold text-brand-black'
                                                    : isDarkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-brand-black'}`}>
                                                    <span className="text-base">{item.icon}</span>
                                                    {!collapsed && <span className="ml-3">{item.label}</span>}
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    )}
                </nav>
            </Sider>

            {/* Main Layout */}
            <Layout className={`${collapsed ? 'ml-20' : 'ml-[260px]'} transition-all duration-300`}>
                {/* Header */}
                <Header
                    className={`${isDarkMode ? 'bg-brand-black border-gray-800' : 'bg-white border-gray-200'
                        } border-b !px-6 flex items-center justify-between sticky top-0 z-40`}
                >
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className={`text-xl ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-brand-black'} transition-colors`}
                        >
                            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        </button>

                        {/* Search Bar */}
                        {isAdmin && <Input
                            prefix={<SearchOutlined className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />}
                            placeholder="Search products by name or SKU…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onPressEnter={() => {
                                if (search.trim()) navigate(`/admin/products?search=${encodeURIComponent(search.trim())}`);
                            }}
                            className={`hidden md:flex w-80 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300'
                                }`}
                        />}
                    </div>

                    <div className="flex items-center space-x-6">
                        {/* Theme Toggle */}
                        <div className="flex items-center space-x-2">
                            <SunOutlined className={isDarkMode ? 'text-gray-500' : 'text-brand-gold'} />
                            <Switch
                                checked={isDarkMode}
                                onChange={setIsDarkMode}
                                className="bg-gray-300"
                            />
                            <MoonOutlined className={isDarkMode ? 'text-brand-gold' : 'text-gray-500'} />
                        </div>

                        {/* Notifications */}
                        {isAdmin && <Link to="/admin/orders?status=pending" aria-label={`${pendingOrders} pending orders`}>
                            <Badge count={pendingOrders} offset={[-5, 5]}>
                                <BellOutlined className={`text-xl ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-brand-black'} cursor-pointer transition-colors`} />
                            </Badge>
                        </Link>}

                        {/* Profile Dropdown */}
                        <Dropdown menu={{ items: profileMenuItems, onClick: onProfileMenu }} placement="bottomRight" arrow>
                            <div className="flex items-center space-x-3 cursor-pointer">
                                <Avatar size={40} className="bg-brand-gold text-brand-black font-bold">
                                    {(user?.name || 'A').charAt(0).toUpperCase()}
                                </Avatar>
                                <div className="hidden md:block leading-tight">
                                    <p className={`text-sm font-medium m-0 ${isDarkMode ? 'text-white' : 'text-brand-black'}`}>{user?.name}</p>
                                    <p className="text-xs text-gray-500 m-0">{user?.email}</p>
                                </div>
                            </div>
                        </Dropdown>
                    </div>
                </Header>

                {/* Content */}
                <Content className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6 min-h-[calc(100vh-64px)]`}>
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

export default AdminLayout;
