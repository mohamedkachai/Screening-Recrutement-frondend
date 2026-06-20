import { Button, Col, Divider, Form, Input, message, Row } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from '../api/auth';

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
        <div style={{ minHeight: '100vh', width: '100%' }}>
            <Row justify="center" align="middle" style={{ height: '100vh' }}>
                <Col span={8} style={{ borderRadius: '13px', backgroundColor: '#FAFAFA', padding: 24, boxShadow: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px' }}>
                    <Divider>{t('auth.signUp')}</Divider>
                    <Form layout="vertical" onFinish={onFinish}>
                        <Row gutter={12}>
                            <Col span={12}>
                                <Form.Item label={t('common.firstName')} name="firstName" rules={[{ required: true, message: t('common.required') }]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={t('common.lastName')} name="lastName" rules={[{ required: true, message: t('common.required') }]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item label={t('common.email')} name="email" rules={[{ required: true, type: 'email', message: t('auth.emailRequired') }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label={t('common.password')} name="password" rules={[{ required: true, min: 8, message: t('auth.passwordRequired') }]}>
                            <Input.Password />
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
                            <Input.Password />
                        </Form.Item>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <Button type="primary" htmlType="submit" block>
                                {t('auth.signUp')}
                            </Button>
                            <div style={{ textAlign: 'center' }}>
                                {t('auth.alreadyHaveAccount')} <Link to="/login">{t('auth.login')}</Link>
                            </div>
                        </div>
                    </Form>
                </Col>
            </Row>
        </div>
    );
}

export default SignUp;
