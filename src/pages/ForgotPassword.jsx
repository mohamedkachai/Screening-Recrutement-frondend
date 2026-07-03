import { Button, Form, Input, message } from "antd";
import { MailOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "../api/auth";
import AuthLayout from "../layouts/AuthLayout";

function ForgotPassword() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    async function onFinish(values) {
        try {
            const response = await forgotPassword(values.email);
            message.success(response.data.message);
            navigate("/login");
        } catch (error) {
            message.error(error.response.data.message);
        }
    };
    return (
        <AuthLayout title={t('auth.forgotPasswordTitle')} subtitle={t('auth.forgotSubtitle')}>
            <Form layout="vertical" size="large" onFinish={onFinish} requiredMark={false}>
                <Form.Item label={t('common.email')} name='email' rules={[{ required: true, message: t('auth.emailRequired') }]}>
                    <Input prefix={<MailOutlined />} placeholder="you@example.com" />
                </Form.Item>
                <Button type="primary" htmlType="submit" block>{t('auth.sendResetLink')}</Button>
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Link to='/login'>{t('auth.loginAgain')}</Link>
                </div>
            </Form>
        </AuthLayout>
    );
}

export default ForgotPassword;
