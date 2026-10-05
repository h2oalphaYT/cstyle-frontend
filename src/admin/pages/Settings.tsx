import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { App, Button, Card, Descriptions, Form, Input } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { authApi, configApi, errorMessage, tokenStore, type StoreConfig } from '../../api';
import { useAuth } from '../../context/AuthContext';

const SettingsPage = () => {
    const { message } = App.useApp();
    const { user, setUser } = useAuth();
    const [config, setConfig] = useState<StoreConfig | null>(null);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [passwordForm] = Form.useForm();
    const isDarkMode = document.documentElement.classList.contains('dark');

    useEffect(() => { configApi.get().then(r => setConfig(r.data)).catch(() => undefined); }, []);

    const saveProfile = async (values: { name: string; phone?: string }) => {
        setSavingProfile(true);
        try {
            setUser((await authApi.updateMe(values)).data);
            message.success('Profile saved');
        } catch (err) {
            message.error(errorMessage(err));
        } finally {
            setSavingProfile(false);
        }
    };

    const changePassword = async (values: { currentPassword: string; newPassword: string }) => {
        setSavingPassword(true);
        try {
            const res = await authApi.changePassword(values.currentPassword, values.newPassword);
            tokenStore.set(res.data.token);
            passwordForm.resetFields();
            message.success('Password changed. Other sessions were signed out.');
        } catch (err) {
            message.error(errorMessage(err));
        } finally {
            setSavingPassword(false);
        }
    };

    const cardClass = `${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl`;
    const titleClass = isDarkMode ? 'text-white' : 'text-brand-black';

    return (
        <div className="space-y-6 max-w-3xl">
            <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`text-3xl font-bold font-poppins ${titleClass}`}>
                Settings
            </motion.h1>

            <Card title={<span className={titleClass}>Store Settings</span>} className={cardClass}>
                <p className="text-gray-500">These values come from the backend <code>.env</code> file (see README) and apply to every order.</p>
                <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="Currency">{config?.currency || '…'}</Descriptions.Item>
                    <Descriptions.Item label="Shipping fee">{config ? `Rs ${config.shippingFee.toLocaleString()}` : '…'}</Descriptions.Item>
                    <Descriptions.Item label="Free shipping from">{config ? `Rs ${config.freeShippingThreshold.toLocaleString()}` : '…'}</Descriptions.Item>
                    <Descriptions.Item label="Max image upload">{config ? `${(config.maxUploadSize / 1024 / 1024).toFixed(0)} MB` : '…'}</Descriptions.Item>
                    <Descriptions.Item label="Payment methods">Cash on delivery, Bank transfer</Descriptions.Item>
                </Descriptions>
            </Card>

            <Card title={<span className={titleClass}>Admin Profile</span>} className={cardClass}>
                <Form layout="vertical" initialValues={{ name: user?.name, phone: user?.phone }} onFinish={saveProfile}>
                    <Form.Item label="Email"><Input value={user?.email} disabled /></Form.Item>
                    <Form.Item label="Name" name="name" rules={[{ required: true }]}><Input size="large" /></Form.Item>
                    <Form.Item label="Phone" name="phone"><Input size="large" /></Form.Item>
                    <Button type="primary" htmlType="submit" size="large" icon={<SaveOutlined />} loading={savingProfile}
                        className="bg-brand-gold hover:bg-brand-gold-dark border-0 text-brand-black">Save Profile</Button>
                </Form>
            </Card>

            <Card title={<span className={titleClass}>Change Password</span>} className={cardClass}>
                <Form form={passwordForm} layout="vertical" onFinish={changePassword}>
                    <Form.Item label="Current Password" name="currentPassword" rules={[{ required: true }]}><Input.Password size="large" autoComplete="current-password" /></Form.Item>
                    <Form.Item label="New Password" name="newPassword" rules={[{ required: true }, { min: 8, message: 'At least 8 characters' }]}><Input.Password size="large" autoComplete="new-password" /></Form.Item>
                    <Button type="primary" htmlType="submit" size="large" loading={savingPassword}
                        className="bg-brand-gold hover:bg-brand-gold-dark border-0 text-brand-black">Change Password</Button>
                </Form>
            </Card>
        </div>
    );
};

export default SettingsPage;
