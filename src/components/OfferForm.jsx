import {
    Form,
    Input,
    InputNumber,
    Select,
    DatePicker,
    Button,
    Space,
    Row,
    Col,
    Switch,
    Divider,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    OFFER_TYPE_OPTIONS,
    OFFER_STATUS_OPTIONS,
    WORK_MODE_OPTIONS,
} from '../constants/enums';
import { listUsers } from '../api/users';

const OfferForm = ({ initialValues, onSubmit, submitText, loading }) => {
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const resolvedSubmitText = submitText ?? t('common.save');
    const [candidateOptions, setCandidateOptions] = useState([]);

    useEffect(() => {
        listUsers().then((res) => {
            const candidates = (res.data?.users || []).filter((u) => u.role === 'CANDIDATE');
            setCandidateOptions(candidates.map((u) => ({
                value: u._id,
                label: `${u.firstName} ${u.lastName} (${u.email})`,
            })));
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue({
                ...initialValues,
                deadline: initialValues.deadline ? dayjs(initialValues.deadline) : undefined,
                allowedCandidates: initialValues.allowedCandidates?.map((c) => c._id ?? c) || [],
            });
        }
    }, [initialValues, form]);

    const handleFinish = (values) => {
        const payload = {
            ...values,
            deadline: values.deadline ? values.deadline.toISOString() : undefined,
        };
        onSubmit(payload);
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            initialValues={{ currency: 'USD', status: 'DRAFT', requiredSkills: [] }}
        >
            <Row gutter={16}>
                <Col xs={24} md={16}>
                    <Form.Item label={t('common.title')} name="title" rules={[{ required: true }]}><Input placeholder="Senior Frontend Engineer" /></Form.Item>
                </Col>
                <Col xs={24} md={8}>
                    <Form.Item label={t('common.status')} name="status"><Select options={OFFER_STATUS_OPTIONS} /></Form.Item>
                </Col>
                <Col xs={24}>
                    <Form.Item label={t('common.description')} name="description" rules={[{ required: true }]}><Input.TextArea rows={5} /></Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item label={t('common.type')} name="type" rules={[{ required: true }]}><Select options={OFFER_TYPE_OPTIONS} /></Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item label={t('offers.workMode')} name="workMode"><Select options={WORK_MODE_OPTIONS} allowClear /></Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item label={t('common.location')} name="location"><Input placeholder="Tunis, Tunisia" /></Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item label={t('common.deadline')} name="deadline"><DatePicker style={{ width: '100%' }} /></Form.Item>
                </Col>
                <Col xs={24}>
                    <Form.Item label={t('offers.requiredSkills')} name="requiredSkills"><Select mode="tags" placeholder={t('offers.skillsPlaceholder')} /></Form.Item>
                </Col>
                <Col xs={24} md={8}>
                    <Form.Item label={t('offers.salaryMin')} name="salaryMin"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
                </Col>
                <Col xs={24} md={8}>
                    <Form.Item label={t('offers.salaryMax')} name="salaryMax"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
                </Col>
                <Col xs={24} md={8}>
                    <Form.Item label={t('offers.currency')} name="currency"><Input /></Form.Item>
                </Col>
            </Row>

            <Divider>{t('offers.accessControl')}</Divider>
            <Row gutter={16}>
                <Col xs={24} md={8}>
                    <Form.Item label={t('offers.isHidden')} name="isHidden" valuePropName="checked">
                        <Switch checkedChildren={t('offers.hidden')} unCheckedChildren={t('offers.visible')} />
                    </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                    <Form.Item label={t('offers.autoRejectThreshold')} name="autoRejectThreshold" tooltip={t('offers.autoRejectTooltip')}>
                        <InputNumber min={0} max={100} addonAfter="%" style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
                <Col xs={24}>
                    <Form.Item label={t('offers.allowedCandidates')} name="allowedCandidates" tooltip={t('offers.allowedCandidatesTooltip')}>
                        <Select mode="multiple" options={candidateOptions} placeholder={t('offers.allowedCandidatesPlaceholder')} allowClear showSearch filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())} />
                    </Form.Item>
                </Col>
            </Row>

            <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                    {resolvedSubmitText}
                </Button>
            </Space>
        </Form>
    );
};

export default OfferForm;
