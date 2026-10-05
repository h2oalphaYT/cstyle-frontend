import { useState, useEffect } from 'react';
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
    const { user, logout } = useAuth();

    // Bell badge shows orders waiting to be confirmed.
    useEffect(() => {
        ordersApi.list({ status: 'pending', limit: 1 })
            .then(res => setPendingOrders(res.pagination?.total || 0))
            .catch(() => setPendingOrders(0));
    }, [location.pathname]);

    const onProfileMenu: MenuProps['onClick'] = async ({ key }) => {
        if (key === 'logout') {
            await logout();
            navigate('/auth');
        } else if (key === 'settings') {
            navigate('/admin/settings');
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

    const menuItems: MenuItem[] = [
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
                        <Input
                            prefix={<SearchOutlined className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />}
                            placeholder="Search products by name or SKU…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onPressEnter={() => {
                                if (search.trim()) navigate(`/admin/products?search=${encodeURIComponent(search.trim())}`);
                            }}
                            className={`hidden md:flex w-80 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300'
                                }`}
                        />
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
                        <Link to="/admin/orders?status=pending" aria-label={`${pendingOrders} pending orders`}>
                            <Badge count={pendingOrders} offset={[-5, 5]}>
                                <BellOutlined className={`text-xl ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-brand-black'} cursor-pointer transition-colors`} />
                            </Badge>
                        </Link>

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
