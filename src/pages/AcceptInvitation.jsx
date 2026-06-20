import { Alert, Button, Card, DatePicker, Form, Input, Result, Spin, Tag, message } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { acceptInvitation, getInvitationByToken } from '../api/invitations';
import { AuthContext } from '../contexts/AuthContext';

const AcceptInvitation = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { setToken } = useContext(AuthContext);
    const [invitation, setInvitation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();
    const { t } = useTranslation();

    useEffect(() => {
        async function fetchInvitation() {
            try {
                const res = await getInvitationByToken(token);
                setInvitation(res.data.invitation);
            } catch (err) {
                setError(err?.response?.data?.message || t('acceptInvitation.notFound'));
            } finally {
                setLoading(false);
            }
        }
        fetchInvitation();
    }, [token]);

    async function handleAccept(values) {
        try {
            setSubmitting(true);
            const payload = {
                ...values,
                dob: values.dob ? format(values.dob.toDate(), 'yyyy-MM-dd') : undefined,
            };
            const res = await acceptInvitation(token, payload);
            message.success(res.data.message || t('acceptInvitation.welcomeMsg'));
            setToken(res.data.token);
            navigate(invitation?.offer ? `/offers/${invitation.offer._id}` : '/');
        } catch (err) {
            message.error(err?.response?.data?.message || t('acceptInvitation.failedMsg'));
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <Result
                status="error"
                title={t('acceptInvitation.unavailable')}
                subTitle={error}
                extra={<Button onClick={() => navigate('/login')}>{t('auth.goToLogin')}</Button>}
            />
        );
    }

    return (
        <div style={{ maxWidth: 560, margin: '40px auto', padding: 16 }}>
            <Card>
                <h3 style={{ marginTop: 0 }}>{t('acceptInvitation.title')}</h3>
                {invitation.invitedBy && (
                    <p style={{ marginBottom: 4 }}>
                        {t('acceptInvitation.from')}{' '}
                        <strong>
                            {invitation.invitedBy.firstName} {invitation.invitedBy.lastName}
                        </strong>
                    </p>
                )}
                {invitation.offer && (
                    <Alert
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                        message={
                            <>
                                {t('acceptInvitation.offer')}: <strong>{invitation.offer.title}</strong>{' '}
                                <Tag>{invitation.offer.type}</Tag>
                            </>
                        }
                        description={t('acceptInvitation.offerDesc')}
                    />
                )}
                {invitation.message && (
                    <Alert
                        type="default"
                        style={{ marginBottom: 16, whiteSpace: 'pre-wrap' }}
                        message={t('acceptInvitation.personalMessage')}
                        description={invitation.message}
                    />
                )}
                <Form form={form} layout="vertical" onFinish={handleAccept}>
                    <Form.Item label={t('common.email')}>
                        <Input value={invitation.email} disabled />
                    </Form.Item>
                    <Form.Item label={t('profile.firstName')} name="firstName" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label={t('profile.lastName')} name="lastName" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label={t('profile.dob')} name="dob">
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        label={t('common.password')}
                        name="password"
                        rules={[
                            { required: true },
                            { min: 8, message: t('auth.passwordMin') },
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        label={t('auth.confirmPassword')}
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            { required: true },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error(t('auth.passwordMismatch')));
                                },
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block loading={submitting}>
                        {t('acceptInvitation.acceptBtn')}
                    </Button>
                </Form>
            </Card>
        </div>
    );
};

export default AcceptInvitation;
