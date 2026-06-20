import { Button, Col, Divider, Form, Input, message, Row } from "antd";
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "../api/auth";

function ForgotPassword() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    async function onFinish(values) {
        try {
            const response = await forgotPassword(values.email);
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
                    <Divider>{t('auth.forgotPasswordTitle')}</Divider>
                    <Form layout="vertical" onFinish={onFinish}>
                        <Form.Item label={t('common.email')} name='email' rules={[{ required: true, message: t('auth.emailRequired') }]}>
                            <Input />
                        </Form.Item>
                        <div style={{ display: "flex", flexDirection: 'column', gap: 14 }}>
                            <Link to='/login'>{t('auth.loginAgain')}</Link>
                            <Button type="primary" htmlType="submit">{t('auth.sendResetLink')}</Button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </div>
    );
}

export default ForgotPassword;
