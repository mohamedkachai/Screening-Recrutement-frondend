import { Button, Col, Form, Input, message, Row } from 'antd';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from '../api/auth';
import AuthLayout from '../layouts/AuthLayout';

function SignUp() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    async function onFinish(values) {
        try {
            const res = await signUp(values);
            message.success(res.data.message);
            navigate('/login');
        } catch (error) {
            message.error(error?.response?.data?.message || t('common.errorOccurred'));
        }
    }

    return (
        <AuthLayout title={t('auth.signUp')} subtitle={t('auth.signupSubtitle')}>
            <Form layout="vertical" size="large" onFinish={onFinish} requiredMark={false}>
                <Row gutter={12}>
                    <Col span={12}>
                        <Form.Item label={t('common.firstName')} name="firstName" rules={[{ required: true, message: t('common.required') }]}>
                            <Input prefix={<UserOutlined />} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label={t('common.lastName')} name="lastName" rules={[{ required: true, message: t('common.required') }]}>
                            <Input prefix={<UserOutlined />} />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item label={t('common.email')} name="email" rules={[{ required: true, type: 'email', message: t('auth.emailRequired') }]}>
                    <Input prefix={<MailOutlined />} placeholder="you@example.com" />
                </Form.Item>
                <Form.Item label={t('common.password')} name="password" rules={[{ required: true, min: 8, message: t('auth.passwordRequired') }]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
                </Form.Item>
                <Form.Item
                    label={t('auth.confirmPassword')}
                    name="confirmPassword"
                    dependencies={['password']}
                    rules={[
                        { required: true, message: t('common.required') },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error(t('auth.passwordsMustMatch')));
                            },
                        }),
                    ]}
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
                </Form.Item>
                <Button type="primary" htmlType="submit" block>
                    {t('auth.signUp')}
                </Button>
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    {t('auth.alreadyHaveAccount')} <Link to="/login">{t('auth.login')}</Link>
                </div>
            </Form>
        </AuthLayout>
    );
}

export default SignUp;
