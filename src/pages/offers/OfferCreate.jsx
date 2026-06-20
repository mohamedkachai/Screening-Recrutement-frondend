import { Button, Divider, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeftOutlined } from '@ant-design/icons';
import OfferForm from '../../components/OfferForm';
import { createOffer } from '../../api/offers';

const OfferCreate = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    async function handleSubmit(payload) {
        try {
            setLoading(true);
            const res = await createOffer(payload);
            message.success(res.data.message);
            navigate('/offers');
        } catch (error) {
            message.error(error?.response?.data?.message || t('common.errorOccurred'));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <Button icon={<ArrowLeftOutlined />} type="link" onClick={() => navigate('/offers')}>
                {t('offers.backToOffers')}
            </Button>
            <h4>{t('offers.createTitle')}</h4>
            <Divider />
            <OfferForm onSubmit={handleSubmit} submitText={t('common.create')} loading={loading} />
        </div>
    );
};

export default OfferCreate;
