import { Button, Form, Input, InputNumber, Modal, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createInvitation } from '../api/invitations';

/**
 * Reusable button + modal that lets HR send an invitation.
 * If `offerId` is provided, the invitation is tied to that offer
 * and the candidate will be auto-applied on accept.
 */
const InviteCandidateButton = ({ offerId, onSent, buttonText, buttonProps }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const defaultButtonText = buttonText ?? t('invitation.inviteBtn');

    async function handleSubmit(values) {
        try {
            setLoading(true);
            await createInvitation({
                ...values,
                offerId: offerId || undefined,
            });
            message.success(t('invitation.sent_success'));
            form.resetFields();
            setOpen(false);
            if (onSent) {
                onSent();
            }
        } catch (error) {
            message.error(error?.response?.data?.message || t('invitation.sendFailed'));
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Button icon={<MailOutlined />} onClick={() => setOpen(true)} {...buttonProps}>
                {defaultButtonText}
            </Button>
            <Modal title={offerId ? t('invitation.inviteToOffer') : t('invitation.inviteToPlatform')} open={open} onCancel={() => setOpen(false)} onOk={() => form.submit()} confirmLoading={loading} okText={t('invitation.sendInvitation')}>
                <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ ttlDays: 7 }}>
                    <Form.Item label={t('common.email')} name="email" rules={[{ required: true, message: t('auth.emailRequired') }, { type: 'email', message: t('invitation.invalidEmail') }]}><Input placeholder={t('invitation.emailPlaceholder')} /></Form.Item>
                    <Form.Item label={t('invitation.personalMessage')} name="message" rules={[{ max: 2000 }]}><Input.TextArea rows={4} placeholder={t('invitation.messagePlaceholder')} /></Form.Item>
                    <Form.Item label={t('invitation.validDays')} name="ttlDays"><InputNumber min={1} max={60} style={{ width: '100%' }} /></Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default InviteCandidateButton;
