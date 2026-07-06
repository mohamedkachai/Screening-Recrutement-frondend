import { Button, Divider, Space, Table, Tag, Tooltip, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { listMyApplications } from '../../api/applications';
import { downloadAttemptReport } from '../../api/exports';
import {
    APPLICATION_STATUS_COLORS,
    APPLICATION_STATUSES,
    ATTEMPT_STATUSES,
    OFFER_STATUS_COLORS,
} from '../../constants/enums';

// An attempt that reached one of these is finished — the candidate can no longer take the test.
const FINISHED_ATTEMPT_STATUSES = [
    ATTEMPT_STATUSES.SUBMITTED,
    ATTEMPT_STATUSES.GRADED,
    ATTEMPT_STATUSES.EXPIRED,
];

const MyApplications = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState(null);
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

    async function handleExport(attemptId) {
        try {
            setDownloadingId(attemptId);
            await downloadAttemptReport(attemptId);
        } catch (error) {
            message.error(error?.response?.data?.message || t('common.downloadError'));
        } finally {
            setDownloadingId(null);
        }
    }

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
            title: t('applications.result'),
            key: 'result',
            render: (_, r) => {
                const att = r.attempt;
                if (!att) return '-';
                if (att.status === ATTEMPT_STATUSES.GRADED) {
                    const pct = att.maxScore
                        ? Math.round((att.totalScore / att.maxScore) * 100)
                        : 0;
                    const color = pct >= 50 ? 'green' : 'red';
                    return (
                        <Tag color={color}>
                            {att.totalScore}/{att.maxScore} · {pct}%
                        </Tag>
                    );
                }
                if (att.status === ATTEMPT_STATUSES.SUBMITTED) {
                    return <Tag color="gold">{t('applications.pendingReview')}</Tag>;
                }
                if (att.status === ATTEMPT_STATUSES.EXPIRED) {
                    return <Tag color="red">{t('applications.expired')}</Tag>;
                }
                return '-';
            },
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

                const att = r.attempt;
                const finished =
                    att && FINISHED_ATTEMPT_STATUSES.includes(att.status);
                const canTake =
                    !finished &&
                    (r.status === APPLICATION_STATUSES.APPLIED ||
                        r.status === APPLICATION_STATUSES.INVITED ||
                        r.status === APPLICATION_STATUSES.IN_PROGRESS);
                // Report is available once the attempt is submitted or graded.
                const canExport =
                    att &&
                    (att.status === ATTEMPT_STATUSES.SUBMITTED ||
                        att.status === ATTEMPT_STATUSES.GRADED);

                if (!canTake && !canExport) return null;

                return (
                    <Space>
                        {canTake && (
                            <Button
                                size="small"
                                type="primary"
                                onClick={() => navigate(`/take/${r.offerId._id}`)}
                            >
                                {r.status === APPLICATION_STATUSES.IN_PROGRESS
                                    ? t('applications.resume')
                                    : t('applications.takeTest')}
                            </Button>
                        )}
                        {canExport && (
                            <Tooltip title={t('applications.exportReport')}>
                                <Button
                                    size="small"
                                    icon={<DownloadOutlined />}
                                    loading={downloadingId === att._id}
                                    onClick={() => handleExport(att._id)}
                                >
                                    {t('common.pdf')}
                                </Button>
                            </Tooltip>
                        )}
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
