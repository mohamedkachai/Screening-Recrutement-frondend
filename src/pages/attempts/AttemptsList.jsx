import {
    Button,
    Card,
    Divider,
    Empty,
    Space,
    Table,
    Tag,
    message,
} from 'antd';
import { ArrowLeftOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { listAttemptsByOffer } from '../../api/attempts';
import { getOffer } from '../../api/offers';
import { downloadAttemptReport, downloadOfferRecap } from '../../api/exports';
import { ATTEMPT_STATUS_COLORS } from '../../constants/enums';

const AttemptsList = () => {
    const { offerId } = useParams();
    const navigate = useNavigate();
    const [offer, setOffer] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                const [offerRes, attemptsRes] = await Promise.all([
                    getOffer(offerId),
                    listAttemptsByOffer(offerId),
                ]);
                setOffer(offerRes.data.offer);
                setAttempts(attemptsRes.data.attempts);
            } catch (error) {
                message.error(error?.response?.data?.message || t('common.loadError'));
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [offerId]);

    const columns = [
        {
            title: t('applications.candidate'),
            key: 'candidate',
            render: (_, r) =>
                r.candidateId
                    ? `${r.candidateId.firstName || ''} ${r.candidateId.lastName || ''}`.trim() || r.candidateId.email
                    : t('applications.deletedOffer'),
        },
        { title: t('common.email'), key: 'email', render: (_, r) => r.candidateId?.email || '-' },
        {
            title: t('applications.status'),
            dataIndex: 'status',
            key: 'status',
            render: (s) => <Tag color={ATTEMPT_STATUS_COLORS[s]}>{s}</Tag>,
        },
        {
            title: t('attempts.score'),
            key: 'score',
            render: (_, r) => r.maxScore ? `${r.totalScore} / ${r.maxScore} (${Math.round((r.totalScore / r.maxScore) * 100)}%)` : '-',
        },
        {
            title: t('attempts.tabSwitches'),
            dataIndex: 'tabSwitchCount',
            key: 'tabSwitchCount',
            render: (n, r) => (
                <Tag color={r.autoSubmitted ? 'red' : n > 0 ? 'orange' : 'default'}>
                    {n}{r.autoSubmitted ? ` • ${t('attempts.auto')}` : ''}
                </Tag>
            ),
        },
        {
            title: t('attempts.submitted'),
            dataIndex: 'submittedAt',
            key: 'submittedAt',
            render: (d) => (d ? format(new Date(d), 'yyyy-MM-dd HH:mm') : '-'),
        },
        {
            title: t('common.actions'),
            key: 'actions',
            render: (_, r) => (
                <Space>
                    <Button size="small" type="primary" icon={<EyeOutlined />} onClick={() => navigate(`/attempts/${r._id}`)}>
                        {t('common.view')}
                    </Button>
                    <Button
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={() => downloadAttemptReport(r._id).catch((err) => message.error(err?.response?.data?.message || t('common.downloadError')))}
                    >
                        PDF
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Button icon={<ArrowLeftOutlined />} type="link" onClick={() => navigate('/offers')}>
                {t('offers.backToOffers')}
            </Button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>{t('attempts.title')} {offer && `— ${offer.title}`}</h4>
                <Button
                    icon={<DownloadOutlined />}
                    onClick={() => downloadOfferRecap(offerId).catch((err) => message.error(err?.response?.data?.message || t('common.downloadError')))}
                >
                    {t('attempts.downloadRecap')}
                </Button>
            </div>
            <Divider />
            <Card>
                {attempts.length === 0 && !loading ? (
                    <Empty description={t('attempts.noAttempts')} />
                ) : (
                    <Table rowKey="_id" columns={columns} dataSource={attempts} loading={loading} pagination={{ pageSize: 20 }} />
                )}
            </Card>
        </div>
    );
};

export default AttemptsList;
