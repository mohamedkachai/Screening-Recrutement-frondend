import { Button, Col, Divider, Form, Input, message, Row } from "antd";
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../api/auth";

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
        <div style={{ minHeight: "100vh", width: "100%" }}>
            <Row justify="center" align='middle' style={{ height: "100vh" }}>
                <Col span={6} style={{ borderRadius: "13px", backgroundColor: "#FAFAFA", padding: 24, boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px" }}>
                    <Divider>{t('auth.resetPassword')}</Divider>
                    <Form layout="vertical" onFinish={onFinish}>
                        <Form.Item label={t('common.password')} name='newPassword' rules={[
                            { required: true, message: t('auth.passwordRequired') },
                            { min: 8, message: t('auth.passwordMin') },
                        ]}>
                            <Input.Password />
                        </Form.Item>
                        <Form.Item label={t('auth.confirmPassword')} name='confirmNewPassword' rules={[
                            { required: true, message: t('auth.confirmPasswordRequired') },
                            { min: 8, message: t('auth.passwordMin') },
                        ]}>
                            <Input.Password />
                        </Form.Item>
                        <div style={{ display: "flex", flexDirection: 'column', gap: 14 }}>
                            <Button type="primary" htmlType="submit">{t('auth.resetBtn')}</Button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </div>
    );
}

export default ResetPassword;
