import { Button, Divider, message, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeftOutlined } from '@ant-design/icons';
import OfferForm from '../../components/OfferForm';
import { getOffer, updateOffer } from '../../api/offers';

const OfferEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [offer, setOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        async function fetchOffer() {
            try {
                const res = await getOffer(id);
                setOffer(res.data.offer);
            } catch (error) {
                message.error(error?.response?.data?.message || t('common.loadError'));
            } finally {
                setLoading(false);
            }
        }
        fetchOffer();
    }, [id]);

    async function handleSubmit(payload) {
        try {
            setSaving(true);
            const res = await updateOffer(id, payload);
            message.success(res.data.message);
            navigate('/offers');
        } catch (error) {
            message.error(error?.response?.data?.message || t('common.errorOccurred'));
        } finally {
            setSaving(false);
        }
    }

    return (
        <div>
            <Button icon={<ArrowLeftOutlined />} type="link" onClick={() => navigate('/offers')}>
                {t('offers.backToOffers')}
            </Button>
            <h4>{t('offers.editTitle')}</h4>
            <Divider />
            {loading ? <Spin /> : <OfferForm initialValues={offer} onSubmit={handleSubmit} submitText={t('common.save')} loading={saving} />}
        </div>
    );
};

export default OfferEdit;
