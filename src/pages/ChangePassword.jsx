import { Button, Divider, Form, Input, message } from 'antd'
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { changePassword } from '../api/auth';

const ChangePassword = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { t } = useTranslation();

    async function onFinish(values) {
        try {
            const response = await changePassword(values);
            message.success(response.data.message);
            form.resetFields();
            navigate("/profile");
        } catch (error) {
            message.error(error?.response?.data?.message);
        }
    }

    return (
        <div>
            <h4>{t('changePassword.title')}</h4>
            <Divider />
            <Form form={form} onFinish={onFinish} layout='vertical' style={{ maxWidth: 400 }}>
                <Form.Item name='currentPassword' label={t('changePassword.currentPassword')} rules={[
                    { required: true, message: t('changePassword.currentPasswordRequired') },
                    { min: 8, message: t('auth.passwordMin') },
                    { max: 32, message: t('auth.passwordMax') },
                ]}>
                    <Input.Password placeholder={t('changePassword.currentPasswordPlaceholder')} />
                </Form.Item>
                <Form.Item name='newPassword' label={t('changePassword.newPassword')} rules={[
                    { required: true, message: t('changePassword.currentPasswordRequired') },
                    { min: 8, message: t('auth.passwordMin') },
                    { max: 32, message: t('auth.passwordMax') },
                ]}>
                    <Input.Password placeholder={t('changePassword.newPasswordPlaceholder')} />
                </Form.Item>
                <Form.Item name='confirmNewPassword' label={t('changePassword.confirmNewPassword')} rules={[
                    { required: true, message: t('changePassword.currentPasswordRequired') },
                    { min: 8, message: t('auth.passwordMin') },
                    { max: 32, message: t('auth.passwordMax') },
                ]}>
                    <Input.Password placeholder={t('changePassword.confirmNewPasswordPlaceholder')} />
                </Form.Item>
                <Form.Item>
                    <Button type='primary' htmlType='submit'>{t('changePassword.btn')}</Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default ChangePassword
