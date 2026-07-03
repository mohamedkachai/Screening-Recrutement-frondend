import { Button, Form, Input, message } from "antd";
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useContext } from "react";
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { loginUser } from "../api/auth";
import AuthLayout from "../layouts/AuthLayout";

function Login() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const { t } = useTranslation();

    async function onFinish(values) {
        try {
            const response = await loginUser(values);
            login(response.data.token);
            message.success(response.data.message);
            navigate("/");
        } catch (error) {
            message.error(error.response.data.message);
        }
    };
    return (
        <AuthLayout title={t('auth.login')} subtitle={t('auth.loginSubtitle')}>
            <Form layout="vertical" size="large" onFinish={onFinish} requiredMark={false}>
                <Form.Item label={t('common.email')} name='email' rules={[{ required: true, message: t('auth.emailRequired') }]}>
                    <Input prefix={<MailOutlined />} placeholder="you@example.com" />
                </Form.Item>
                <Form.Item label={t('common.password')} name='password' rules={[{ required: true, message: t('auth.passwordRequired') }]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
                </Form.Item>
                <div style={{ display: "flex", justifyContent: 'flex-end', marginBottom: 12 }}>
                    <Link to='/forgot-password'>{t('auth.forgotPassword')}</Link>
                </div>
                <Button type="primary" htmlType="submit" block>{t('auth.login')}</Button>
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    {t('auth.dontHaveAccount')} <Link to='/signup'>{t('auth.signUp')}</Link>
                </div>
            </Form>
        </AuthLayout>
    );
}

export default Login;