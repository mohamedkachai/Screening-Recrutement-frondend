import { Avatar, Button, Divider, Select, Space, Table, Tag, message } from 'antd';
import { ArrowLeftOutlined, FilePdfOutlined, UserOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { listOfferApplications, updateApplicationStatus } from '../../api/applications';
import { getOffer } from '../../api/offers';
import { fileUrl } from '../../utils/files';
import { APPLICATION_STATUS_COLORS, APPLICATION_STATUS_OPTIONS } from '../../constants/enums';
import InviteCandidateButton from '../../components/InviteCandidateButton';

const OfferApplications = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [offer, setOffer] = useState(null);
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    const load = async () => {
        try {
            setLoading(true);
            const [offerRes, appsRes] = await Promise.all([getOffer(id), listOfferApplications(id)]);
            setOffer(offerRes.data.offer);
            setApps(appsRes.data.applications);
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

    async function handleStatusChange(applicationId, status) {
        try {
            await updateApplicationStatus(applicationId, status);
            message.success(t('applications.statusUpdated'));
            setApps((prev) => prev.map((a) => (a._id === applicationId ? { ...a, status } : a)));
        } catch (error) {
            message.error(error?.response?.data?.message || t('applications.updateFailed'));
        }
    }

    const columns = [
        {
            title: t('applications.candidate'),
            key: 'candidate',
            render: (_, r) => (
                <Space>
                    <Avatar src={fileUrl(r.candidateId?.avatar)} icon={!r.candidateId?.avatar && <UserOutlined />} />
                    <div>
                        <div>{r.candidateId?.firstName} {r.candidateId?.lastName}</div>
                        <small style={{ color: '#888' }}>{r.candidateId?.email}</small>
                    </div>
                </Space>
            ),
        },
        { title: t('profile.country'), key: 'country', render: (_, r) => r.candidateId?.country || '-' },
        {
            title: t('profile.yearsOfExperience'),
            key: 'exp',
            render: (_, r) => r.candidateId?.yearsOfExperience != null ? `${r.candidateId.yearsOfExperience} yrs` : '-',
        },
        {
            title: t('profile.skills'),
            key: 'skills',
            render: (_, r) => (r.candidateId?.skills || []).slice(0, 4).map((s) => <Tag key={s}>{s}</Tag>),
        },
        {
            title: t('profile.cv'),
            key: 'cv',
            render: (_, r) => r.candidateId?.cv ? (
                <a href={fileUrl(r.candidateId.cv)} target="_blank" rel="noreferrer">
                    <FilePdfOutlined /> {t('common.view')}
                </a>
            ) : '-',
        },
        {
            title: t('applications.appliedAt'),
            dataIndex: 'appliedAt',
            key: 'appliedAt',
            render: (d) => format(new Date(d), 'yyyy-MM-dd HH:mm'),
        },
        {
            title: t('applications.status'),
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => (
                <Select
                    value={status}
                    options={APPLICATION_STATUS_OPTIONS}
                    onChange={(v) => handleStatusChange(record._id, v)}
                    style={{ width: 160 }}
                    suffixIcon={<Tag color={APPLICATION_STATUS_COLORS[status]} style={{ marginRight: 0 }}>{status[0]}</Tag>}
                />
            ),
        },
    ];

    return (
        <div>
            <Button icon={<ArrowLeftOutlined />} type="link" onClick={() => navigate('/offers')}>
                {t('offers.backToOffers')}
            </Button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>{t('applications.title')} {offer && `— ${offer.title}`}</h4>
                {offer && (
                    <InviteCandidateButton
                        offerId={offer._id}
                        onSent={load}
                        buttonProps={{ type: 'primary' }}
                    />
                )}
            </div>
            <Divider />
            <Table rowKey="_id" columns={columns} dataSource={apps} loading={loading} scroll={{ x: 'max-content' }} />
        </div>
    );
};

export default OfferApplications;
