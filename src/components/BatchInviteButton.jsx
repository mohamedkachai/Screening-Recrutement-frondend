import { Alert, Button, Form, Input, InputNumber, Modal, Space, Tag, message } from 'antd';
import { DeleteOutlined, PlusOutlined, TeamOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createBatchInvitations } from '../api/invitations';

/**
 * Button + modal for sending invitations to multiple candidates at once.
 * `offerId` is optional — omit to invite to platform only.
 */
const BatchInviteButton = ({ offerId, onSent, buttonProps }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [form] = Form.useForm();
    const { t } = useTranslation();

    function handleOpen() {
        setResult(null);
        form.resetFields();
        setOpen(true);
    }

    async function handleSubmit(values) {
        const emails = (values.emails ?? [])
            .map((e) => e?.email?.trim().toLowerCase())
            .filter(Boolean);

        if (emails.length === 0) {
            message.warning(t('invitation.batchNoEmails'));
            return;
        }

        try {
            setLoading(true);
            const res = await createBatchInvitations({
                emails,
                offerId: offerId || undefined,
                message: values.message,
                ttlDays: values.ttlDays,
            });
            setResult(res.data);
            if (onSent) onSent();
        } catch (error) {
            message.error(error?.response?.data?.message || t('invitation.sendFailed'));
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Button icon={<TeamOutlined />} onClick={handleOpen} {...buttonProps}>
                {t('invitation.batchInviteBtn')}
            </Button>

            <Modal
                open={open}
                title={offerId ? t('invitation.batchInviteToOffer') : t('invitation.batchInviteToPlatform')}
                onCancel={() => setOpen(false)}
                footer={
                    result
                        ? [<Button key="close" onClick={() => setOpen(false)}>{t('common.close')}</Button>]
                        : [
                            <Button key="cancel" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>,
                            <Button key="send" type="primary" loading={loading} onClick={() => form.submit()}>{t('invitation.sendInvitation')}</Button>,
                          ]
                }
                width={560}
            >
                {result ? (
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Alert
                            type="success"
                            showIcon
                            message={t('invitation.batchResult', { sent: result.sent.length, total: result.sent.length + result.failed.length })}
                        />
                        {result.failed.length > 0 && (
                            <Alert
                                type="warning"
                                showIcon
                                message={t('invitation.batchFailed')}
                                description={
                                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                                        {result.failed.map((f) => (
                                            <li key={f.email}><Tag color="red">{f.email}</Tag> {f.reason}</li>
                                        ))}
                                    </ul>
                                }
                            />
                        )}
                    </Space>
                ) : (
                    <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ ttlDays: 7, emails: [{}] }}>
                        <Form.List name="emails">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name }) => (
                                        <Form.Item
                                            key={key}
                                            name={[name, 'email']}
                                            label={fields.length === 1 ? t('common.email') : `${t('common.email')} ${name + 1}`}
                                            rules={[{ type: 'email', message: t('invitation.invalidEmail') }]}
                                        >
                                            <Input
                                                placeholder={t('invitation.emailPlaceholder')}
                                                addonAfter={
                                                    fields.length > 1 && (
                                                        <DeleteOutlined
                                                            onClick={() => remove(name)}
                                                            style={{ cursor: 'pointer', color: '#ff4d4f' }}
                                                        />
                                                    )
                                                }
                                            />
                                        </Form.Item>
                                    ))}
                                    <Button
                                        type="dashed"
                                        onClick={() => add()}
                                        icon={<PlusOutlined />}
                                        style={{ width: '100%', marginBottom: 12 }}
                                    >
                                        {t('invitation.addEmail')}
                                    </Button>
                                </>
                            )}
                        </Form.List>

                        <Form.Item label={t('invitation.personalMessage')} name="message" rules={[{ max: 2000 }]}>
                            <Input.TextArea rows={3} placeholder={t('invitation.messagePlaceholder')} />
                        </Form.Item>
                        <Form.Item label={t('invitation.validDays')} name="ttlDays">
                            <InputNumber min={1} max={60} style={{ width: '100%' }} />
                        </Form.Item>
                    </Form>
                )}
            </Modal>
        </>
    );
};

export default BatchInviteButton;
