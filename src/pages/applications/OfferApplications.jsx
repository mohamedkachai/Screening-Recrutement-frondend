import { Avatar, Button, Divider, Popconfirm, Space, Table, Tag, Tooltip, message } from 'antd';
import {
    ArrowLeftOutlined,
    CheckOutlined,
    CloseOutlined,
    DownloadOutlined,
    FilePdfOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { listOfferApplications, updateApplicationStatus } from '../../api/applications';
import { downloadAttemptReport } from '../../api/exports';
import { getOffer } from '../../api/offers';
import { fileUrl } from '../../utils/files';
import {
    APPLICATION_STATUSES,
    APPLICATION_STATUS_COLORS,
    ATTEMPT_STATUSES,
} from '../../constants/enums';
import InviteCandidateButton from '../../components/InviteCandidateButton';

// An attempt whose report can be downloaded (test has been submitted).
const REPORTABLE_ATTEMPT_STATUSES = [
    ATTEMPT_STATUSES.SUBMITTED,
    ATTEMPT_STATUSES.GRADED,
];

// Percentage used for ranking; candidates with no final score rank last (-1).
function scorePct(attempt) {
    if (!attempt || attempt.status !== ATTEMPT_STATUSES.GRADED || !attempt.maxScore) {
        return -1;
    }
    return (attempt.totalScore / attempt.maxScore) * 100;
}

const OfferApplications = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [offer, setOffer] = useState(null);
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState(null);
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

    async function handleDownload(attemptId) {
        try {
            setDownloadingId(attemptId);
            await downloadAttemptReport(attemptId);
        } catch (error) {
            message.error(error?.response?.data?.message || t('common.downloadError'));
        } finally {
            setDownloadingId(null);
        }
    }

    const hiredCount = apps.filter((a) => a.status === APPLICATION_STATUSES.HIRED).length;

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
        {
            title: t('common.score'),
            key: 'score',
            defaultSortOrder: 'descend',
            sorter: (a, b) => scorePct(a.attempt) - scorePct(b.attempt),
            render: (_, r) => {
                const att = r.attempt;
                if (!att) return <Tag>{t('applications.notTaken')}</Tag>;
                if (att.status === ATTEMPT_STATUSES.GRADED) {
                    const pct = att.maxScore ? Math.round((att.totalScore / att.maxScore) * 100) : 0;
                    return (
                        <Space size={4}>
                            <strong>{att.totalScore}/{att.maxScore}</strong>
                            <Tag color={pct >= 50 ? 'green' : 'red'}>{pct}%</Tag>
                        </Space>
                    );
                }
                if (att.status === ATTEMPT_STATUSES.SUBMITTED) {
                    return <Tag color="gold">{t('applications.pendingReview')}</Tag>;
                }
                if (att.status === ATTEMPT_STATUSES.IN_PROGRESS) {
                    return <Tag color="processing">{t('applications.inProgress')}</Tag>;
                }
                if (att.status === ATTEMPT_STATUSES.EXPIRED) {
                    return <Tag color="red">{t('applications.expired')}</Tag>;
                }
                return <Tag>{t('applications.notTaken')}</Tag>;
            },
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
            title: t('applications.status'),
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={APPLICATION_STATUS_COLORS[status]}>{status}</Tag>
            ),
        },
        {
            title: t('common.actions'),
            key: 'actions',
            render: (_, r) => {
                const att = r.attempt;
                const canDownload = att && REPORTABLE_ATTEMPT_STATUSES.includes(att.status);
                const pendingReview = att && att.status === ATTEMPT_STATUSES.SUBMITTED;
                const isHired = r.status === APPLICATION_STATUSES.HIRED;
                const isRejected = r.status === APPLICATION_STATUSES.REJECTED;
                return (
                    <Space>
                        <Tooltip title={canDownload ? t('applications.downloadResult') : t('applications.noResultYet')}>
                            <Button
                                size="small"
                                icon={<DownloadOutlined />}
                                disabled={!canDownload}
                                loading={downloadingId === att?._id}
                                onClick={() => handleDownload(att._id)}
                            />
                        </Tooltip>
                        <Tooltip title={pendingReview ? t('applications.hireBlockedPending') : t('applications.hire')}>
                            <Popconfirm
                                title={t('applications.hireConfirm', {
                                    name: `${r.candidateId?.firstName || ''} ${r.candidateId?.lastName || ''}`.trim(),
                                })}
                                onConfirm={() => handleStatusChange(r._id, APPLICATION_STATUSES.HIRED)}
                                okText={t('applications.hire')}
                                disabled={isHired || pendingReview}
                            >
                                <Button
                                    size="small"
                                    type="primary"
                                    icon={<CheckOutlined />}
                                    disabled={isHired || pendingReview}
                                    style={!isHired && !pendingReview ? { background: '#52c41a' } : undefined}
                                >
                                    {t('applications.hire')}
                                </Button>
                            </Popconfirm>
                        </Tooltip>
                        <Button
                            size="small"
                            danger
                            icon={<CloseOutlined />}
                            disabled={isRejected}
                            onClick={() => handleStatusChange(r._id, APPLICATION_STATUSES.REJECTED)}
                        >
                            {t('applications.reject')}
                        </Button>
                    </Space>
                );
            },
        },
    ];

    return (
        <div>
            <Button icon={<ArrowLeftOutlined />} type="link" onClick={() => navigate('/offers')}>
                {t('offers.backToOffers')}
            </Button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h4 style={{ marginBottom: 4 }}>{t('nav.applications')}{offer ? ` — ${offer.title}` : ''}</h4>
                    <Space size={4}>
                        <Tag>{t('applications.totalCount', { n: apps.length })}</Tag>
                        <Tag color="green">{t('applications.hiredCount', { n: hiredCount })}</Tag>
                    </Space>
                </div>
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
