import { motion } from 'framer-motion';
import { Card, Empty } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const CustomersPage = () => {
    const isDarkMode = document.documentElement.classList.contains('dark');

    return (
        <div className="space-y-6">
            <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`text-3xl font-bold font-poppins ${isDarkMode ? 'text-white' : 'text-brand-black'}`}
            >
                Customers Management
            </motion.h1>

            <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl text-center py-12`}>
                <UserOutlined className="text-6xl text-brand-gold mb-4" />
                <Empty description="Customer management coming soon" />
            </Card>
        </div>
    );
};

export default CustomersPage;
