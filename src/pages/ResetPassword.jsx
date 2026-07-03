import { Button, Form, Input, message } from "antd";
import { LockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../api/auth";
import AuthLayout from "../layouts/AuthLayout";

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    async function onFinish(values) {
        try {
            const response = await resetPassword(token, values);
            message.success(response.data.message);
            navigate("/login");
        } catch (error) {
            message.error(error.response.data.message);
        }
    };
    return (
        <AuthLayout title={t('auth.resetPassword')} subtitle={t('auth.resetSubtitle')}>
            <Form layout="vertical" size="large" onFinish={onFinish} requiredMark={false}>
                <Form.Item label={t('common.password')} name='newPassword' rules={[
                    { required: true, message: t('auth.passwordRequired') },
                    { min: 8, message: t('auth.passwordMin') },
                ]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
                </Form.Item>
                <Form.Item label={t('auth.confirmPassword')} name='confirmNewPassword' rules={[
                    { required: true, message: t('auth.confirmPasswordRequired') },
                    { min: 8, message: t('auth.passwordMin') },
                ]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
                </Form.Item>
                <Button type="primary" htmlType="submit" block>{t('auth.resetBtn')}</Button>
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Link to='/login'>{t('auth.goToLogin')}</Link>
                </div>
            </Form>
        </AuthLayout>
    );
}

export default ResetPassword;
