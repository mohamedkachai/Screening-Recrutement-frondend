import {
    Button,
    Card,
    Descriptions,
    Divider,
    Modal,
    Form,
    Input,
    Spin,
    Tag,
    Space,
    message,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { getOffer } from '../../api/offers';
import { applyToOffer } from '../../api/applications';
import { AuthContext } from '../../contexts/AuthContext';
import { OFFER_STATUS_COLORS, OFFER_TYPE_OPTIONS, ROLES } from '../../constants/enums';

const typeLabel = (value) => OFFER_TYPE_OPTIONS.find((o) => o.value === value)?.label || value;

const OfferDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [offer, setOffer] = useState(null);
    const [alreadyApplied, setAlreadyApplied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [applyOpen, setApplyOpen] = useState(false);
    const [applying, setApplying] = useState(false);
    const [form] = Form.useForm();
    const { t } = useTranslation();

    const load = async () => {
        try {
            setLoading(true);
            const res = await getOffer(id);
            setOffer(res.data.offer);
            setAlreadyApplied(res.data.alreadyApplied);
        } catch (error) {
            message.error(error?.response?.data?.message || t('common.loadError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const isCandidate = user?.role === ROLES.CANDIDATE;
    const canApply = isCandidate && !alreadyApplied && offer?.status === 'OPEN';

    async function handleApply(values) {
        try {
            setApplying(true);
            await applyToOffer(id, values);
            message.success(t('offers.applicationSubmitted'));
            setApplyOpen(false);
            form.resetFields();
            load();
        } catch (error) {
            message.error(error?.response?.data?.message || t('offers.applyFailed'));
        } finally {
            setApplying(false);
        }
    }

    if (loading) {
        return <Spin />;
    }
    if (!offer) {
        return null;
    }

    return (
        <div>
            <Button icon={<ArrowLeftOutlined />} type="link" onClick={() => navigate(-1)}>
                {t('common.back')}
            </Button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>{offer.title}</h3>
                <Space>
                    <Tag color={OFFER_STATUS_COLORS[offer.status]}>{offer.status}</Tag>
                    {alreadyApplied && <Tag color="green">{t('offers.alreadyApplied')}</Tag>}
                    {canApply && (
                        <Button type="primary" onClick={() => setApplyOpen(true)}>
                            {t('offers.applyNow')}
                        </Button>
                    )}
                </Space>
            </div>
            <Divider />
            <Card>
                <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label={t('offers.type')}>{typeLabel(offer.type)}</Descriptions.Item>
                    <Descriptions.Item label={t('profile.workMode')}>{offer.workMode || '-'}</Descriptions.Item>
                    <Descriptions.Item label={t('offers.location')}>{offer.location || '-'}</Descriptions.Item>
                    <Descriptions.Item label={t('offers.salary')}>
                        {offer.salaryMin != null && offer.salaryMax != null
                            ? `${offer.salaryMin} - ${offer.salaryMax} ${offer.currency}`
                            : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('offerForm.requiredSkills')}>
                        {offer.requiredSkills?.length ? offer.requiredSkills.map((s) => <Tag key={s}>{s}</Tag>) : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('offers.deadline')}>
                        {offer.deadline ? format(new Date(offer.deadline), 'yyyy-MM-dd') : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('offerForm.description')}>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{offer.description}</div>
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Modal
                title={t('offers.applyModal', { title: offer.title })}
                open={applyOpen}
                onCancel={() => setApplyOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={applying}
                okText={t('offers.submitApplication')}
            >
                <Form form={form} layout="vertical" onFinish={handleApply}>
                    <Form.Item
                        label={t('offers.coverNote')}
                        name="coverNote"
                        rules={[{ max: 2000 }]}
                    >
                        <Input.TextArea rows={5} placeholder={t('offers.coverNotePlaceholder')} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default OfferDetail;
