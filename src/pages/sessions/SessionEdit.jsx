import {
    Alert,
    Button,
    Card,
    Col,
    DatePicker,
    Divider,
    Empty,
    Form,
    Input,
    InputNumber,
    Popconfirm,
    Row,
    Space,
    Spin,
    Switch,
    Tag,
    message,
} from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
    deleteSession,
    getSessionByOffer,
    upsertSession,
} from '../../api/sessions';

const STATUS_COLORS = {
    SCHEDULED: 'blue',
    ACTIVE: 'green',
    CLOSED: 'default',
};

const SessionEdit = () => {
    const { offerId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState({ offer: null, session: null, sessionStatus: null, tests: [] });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();
    const { t } = useTranslation();

    const load = async () => {
        try {
            setLoading(true);
            const res = await getSessionByOffer(offerId);
            setData(res.data);
            if (res.data.session) {
                form.setFieldsValue({
                    ...res.data.session,
                    range: [dayjs(res.data.session.startAt), dayjs(res.data.session.endAt)],
                });
            } else {
                form.resetFields();
                form.setFieldsValue({
                    randomizeQuestions: true,
                    preventCopyPaste: true,
                    requireFullscreen: true,
                    tabSwitchLimit: 3,
                    allowedAttempts: 1,
                });
            }
        } catch (error) {
            message.error(error?.response?.data?.message || 'Failed to load session');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [offerId]);

    async function handleSubmit(values) {
        try {
            setSaving(true);
            const [start, end] = values.range || [];
            if (!start || !end) {
                message.error('Pick a start and end date/time');
                return;
            }
            const payload = {
                startAt: start.toISOString(),
                endAt: end.toISOString(),
                instructions: values.instructions || '',
                randomizeQuestions: values.randomizeQuestions,
                tabSwitchLimit: values.tabSwitchLimit,
                preventCopyPaste: values.preventCopyPaste,
                requireFullscreen: values.requireFullscreen,
                allowedAttempts: values.allowedAttempts,
            };
            const res = await upsertSession(offerId, payload);
            message.success(res.data.message);
            load();
        } catch (error) {
            const errs = error?.response?.data?.errors;
            const msg =
                errs?.fieldErrors?.endAt?.[0] ||
                errs?.formErrors?.[0] ||
                error?.response?.data?.message ||
                'Failed to save';
            message.error(msg);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!data.session) return;
        try {
            await deleteSession(data.session._id);
            message.success('Session removed');
            load();
        } catch (error) {
            message.error(error?.response?.data?.message || 'Failed to delete');
        }
    }

    if (loading) {
        return <Spin />;
    }

    const { offer, session, sessionStatus, tests } = data;
    const totalDuration = tests.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);

    return (
        <div>
            <Button icon={<ArrowLeftOutlined />} type="link" onClick={() => navigate('/offers')}>
                {t('offers.backToOffers')}
            </Button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>
                    {t('session.title', { offerTitle: offer?.title ?? '' })}{' '}
                    {sessionStatus && <Tag color={STATUS_COLORS[sessionStatus]}>{sessionStatus}</Tag>}
                </h4>
                {session && (
                    <Popconfirm
                        title={t('session.deleteConfirm')}
                        onConfirm={handleDelete}
                        okText={t('common.delete')}
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger icon={<DeleteOutlined />}>
                            {t('session.deleteSession')}
                        </Button>
                    </Popconfirm>
                )}
            </div>
            <Divider />

            {tests.length === 0 && (
                <Alert
                    type="warning"
                    showIcon
                    message="No tests created for this offer yet"
                    description={t('session.addTestFirst')}
                    style={{ marginBottom: 16 }}
                    action={
                        <Button size="small" onClick={() => navigate(`/offers/${offerId}/tests`)}>
                            {t('session.manageTests')}
                        </Button>
                    }
                />
            )}

            <Row gutter={16}>
                <Col xs={24} md={14}>
                    <Card title={t('session.scheduleCard')}>
                        <Form form={form} layout="vertical" onFinish={handleSubmit}>
                            <Form.Item
                                label={t('session.window')}
                                name="range"
                                rules={[{ required: true, message: t('session.windowRequired') }]}
                            >
                                <DatePicker.RangePicker
                                    showTime={{ format: 'HH:mm' }}
                                    format="YYYY-MM-DD HH:mm"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                            <Form.Item label={t('session.instructions')} name="instructions">
                                <Input.TextArea rows={4} placeholder={t('session.instructionsPlaceholder')} />
                            </Form.Item>
                            <Row gutter={12}>
                                <Col span={12}>
                                    <Form.Item
                                        label={t('session.allowedAttempts')}
                                        name="allowedAttempts"
                                        tooltip={t('session.allowedAttemptsTooltip')}
                                    >
                                        <InputNumber min={1} style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label={t('session.tabSwitchLimit')}
                                        name="tabSwitchLimit"
                                        tooltip={t('session.tabSwitchTooltip')}
                                    >
                                        <InputNumber min={0} style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={12}>
                                <Col span={8}>
                                    <Form.Item
                                        label={t('session.randomize')}
                                        name="randomizeQuestions"
                                        valuePropName="checked"
                                    >
                                        <Switch />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label={t('session.preventCopy')}
                                        name="preventCopyPaste"
                                        valuePropName="checked"
                                    >
                                        <Switch />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label={t('session.requireFullscreen')}
                                        name="requireFullscreen"
                                        valuePropName="checked"
                                    >
                                        <Switch />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SaveOutlined />}
                                loading={saving}
                            >
                                {session ? t('session.saveChanges') : t('session.scheduleSession')}
                            </Button>
                        </Form>
                    </Card>
                </Col>
                <Col xs={24} md={10}>
                    <Card title={t('session.testsCard')}>
                        {tests.length === 0 ? (
                            <Empty description={t('session.noTestsYet')} />
                        ) : (
                            <Space direction="vertical" style={{ width: '100%' }}>
                                {tests.map((t, idx) => (
                                    <Card key={t._id} size="small">
                                        <Space>
                                            <Tag color="blue">{idx + 1}</Tag>
                                            <strong>{t.title}</strong>
                                        </Space>
                                        <div style={{ color: '#888', marginTop: 4 }}>
                                            {t.durationMinutes} min · {t.questionCount} questions ·{' '}
                                            {t.totalPoints} pts
                                        </div>
                                    </Card>
                                ))}
                                <div style={{ marginTop: 8 }}>
                                    <Tag color="purple">Total ~{totalDuration} min</Tag>
                                </div>
                            </Space>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default SessionEdit;
