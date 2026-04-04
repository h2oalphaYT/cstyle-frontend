import { motion } from 'framer-motion';
import { Card, Empty } from 'antd';
import { TagOutlined } from '@ant-design/icons';

const OffersPage = () => {
    const isDarkMode = document.documentElement.classList.contains('dark');

    return (
        <div className="space-y-6">
            <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`text-3xl font-bold font-poppins ${isDarkMode ? 'text-white' : 'text-brand-black'}`}
            >
                Offers Management
            </motion.h1>

            <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl text-center py-12`}>
                <TagOutlined className="text-6xl text-brand-gold mb-4" />
                <Empty description="Offers management coming soon" />
            </Card>
        </div>
    );
};

export default OffersPage;
