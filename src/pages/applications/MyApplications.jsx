import { Button, Divider, Space, Table, Tag, message } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { listMyApplications } from '../../api/applications';
import { APPLICATION_STATUS_COLORS, APPLICATION_STATUSES, OFFER_STATUS_COLORS } from '../../constants/enums';

const MyApplications = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await listMyApplications();
                setApps(res.data.applications);
            } catch (error) {
                message.error(error?.response?.data?.message || t('common.loadError'));
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const columns = [
        {
            title: t('offers.pageTitle'),
            key: 'offer',
            render: (_, record) =>
                record.offerId ? (
                    <Link to={`/offers/${record.offerId._id}`}>{record.offerId.title}</Link>
                ) : (
                    t('applications.deletedOffer')
                ),
        },
        { title: t('offers.type'), key: 'type', render: (_, r) => r.offerId?.type || '-' },
        {
            title: t('applications.offerStatus'),
            key: 'offerStatus',
            render: (_, r) => r.offerId?.status ? (
                <Tag color={OFFER_STATUS_COLORS[r.offerId.status]}>{r.offerId.status}</Tag>
            ) : '-',
        },
        {
            title: t('applications.myStatus'),
            dataIndex: 'status',
            key: 'status',
            render: (s) => <Tag color={APPLICATION_STATUS_COLORS[s]}>{s}</Tag>,
        },
        {
            title: t('applications.appliedAt'),
            dataIndex: 'appliedAt',
            key: 'appliedAt',
            render: (d) => format(new Date(d), 'yyyy-MM-dd HH:mm'),
        },
        {
            title: t('common.actions'),
            key: 'action',
            render: (_, r) => {
                if (!r.offerId) return null;
                const canTake =
                    r.status === APPLICATION_STATUSES.APPLIED ||
                    r.status === APPLICATION_STATUSES.INVITED ||
                    r.status === APPLICATION_STATUSES.IN_PROGRESS;
                if (!canTake) return null;
                return (
                    <Space>
                        <Button
                            size="small"
                            type="primary"
                            onClick={() => navigate(`/take/${r.offerId._id}`)}
                        >
                            {r.status === APPLICATION_STATUSES.IN_PROGRESS ? t('applications.resume') : t('applications.takeTest')}
                        </Button>
                    </Space>
                );
            },
        },
    ];

    return (
        <div>
            <h4>{t('applications.myTitle')}</h4>
            <Divider />
            <Table rowKey="_id" columns={columns} dataSource={apps} loading={loading} />
        </div>
    );
};

export default MyApplications;
