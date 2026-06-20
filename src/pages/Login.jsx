import { Button, Col, Divider, Form, Input, message, Row } from "antd";
import { useContext } from "react";
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { loginUser } from "../api/auth";

function Login() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const { t } = useTranslation();

    async function onFinish(values) {
        try {
            const response = await loginUser(values);
            login(response.data.token);
            message.success(response.data.message);
            navigate("/");
        } catch (error) {
            message.error(error.response.data.message);
        }
    };
    return (
        <div style={{ minHeight: "100vh", width: "100%" }}>
            <Row justify="center" align='middle' style={{height: "100vh"}}>
                <Col span={6} style={{borderRadius: "13px", backgroundColor: "#FAFAFA", padding: 24, boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px"}}>
                   <Divider>{t('auth.login')}</Divider>
                    <Form layout="vertical" onFinish={onFinish}>
                        <Form.Item label={t('common.email')} name='email' rules={[{ required: true, message: t('auth.emailRequired') }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label={t('common.password')} name='password' rules={[{ required: true, message: t('auth.passwordRequired') }]}>
                            <Input.Password />
                        </Form.Item>
                        <div style={{display: "flex", flexDirection: 'column', gap: 14}}>
                            <Link to='/forgot-password'>{t('auth.forgotPassword')}</Link>
                            <Button type="primary" htmlType="submit">{t('auth.login')}</Button>
                            <div style={{ textAlign: 'center' }}>
                                {t('auth.dontHaveAccount')} <Link to='/signup'>{t('auth.signUp')}</Link>
                            </div>
                        </div>
                    </Form>
                </Col>
            </Row>
        </div>
    );
}

export default Login;