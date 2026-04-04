import { motion } from 'framer-motion';
import { Card, Form, Input, Button, Switch, Select, Space } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const { Option } = Select;

const SettingsPage = () => {
    const isDarkMode = document.documentElement.classList.contains('dark');

    return (
        <div className="space-y-6">
            <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`text-3xl font-bold font-poppins ${isDarkMode ? 'text-white' : 'text-brand-black'}`}
            >
                Settings
            </motion.h1>

            <Card
                title={<span className={isDarkMode ? 'text-white' : 'text-brand-black'}>General Settings</span>}
                className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl`}
            >
                <Form layout="vertical">
                    <Form.Item label="Default Currency" name="currency">
                        <Select size="large" defaultValue="LKR">
                            <Option value="LKR">LKR - Sri Lankan Rupee</Option>
                            <Option value="USD">USD - US Dollar</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Store Name" name="storeName">
                        <Input size="large" placeholder="Cstyle" />
                    </Form.Item>

                    <Form.Item label="Email Notifications" name="emailNotifications" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Card>

            <Card
                title={<span className={isDarkMode ? 'text-white' : 'text-brand-black'}>Admin Profile</span>}
                className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl`}
            >
                <Form layout="vertical">
                    <Form.Item label="Name" name="name">
                        <Input size="large" placeholder="Admin User" />
                    </Form.Item>

                    <Form.Item label="Email" name="email">
                        <Input size="large" type="email" placeholder="admin@cstyle.lk" />
                    </Form.Item>

                    <Form.Item label="Current Password" name="currentPassword">
                        <Input.Password size="large" />
                    </Form.Item>

                    <Form.Item label="New Password" name="newPassword">
                        <Input.Password size="large" />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                size="large"
                                icon={<SaveOutlined />}
                                className="bg-brand-gold hover:bg-brand-gold-dark border-0 text-brand-black"
                            >
                                Save Changes
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default SettingsPage;
