import {
    Button,
    Card,
    Col,
    Divider,
    Empty,
    Input,
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tag,
    message,
} from 'antd';
import { DownloadOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { listAllAttempts } from '../../api/attempts';
import { downloadAttemptReport } from '../../api/exports';
import { ATTEMPT_STATUSES, ATTEMPT_STATUS_COLORS } from '../../constants/enums';

const STATUS_OPTIONS = [
    { value: '', label: 'All statuses' },
    ...Object.values(ATTEMPT_STATUSES).map((s) => ({ value: s, label: s })),
];

const ResultsList = () => {
    const navigate = useNavigate();
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');
    const [q, setQ] = useState('');
    const { t } = useTranslation();

    const STATUS_OPTIONS_TRANSLATED = [
        { value: '', label: t('results.allStatuses') },
        ...Object.values(ATTEMPT_STATUSES).map((s) => ({ value: s, label: s })),
    ];

    async function load() {
        try {
            setLoading(true);
            const params = {};
            if (status) params.status = status;
            if (q) params.q = q;
            const res = await listAllAttempts(params);
            setAttempts(res.data.attempts);
        } catch (error) {
            message.error(error?.response?.data?.message || 'Failed to load');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    const stats = useMemo(() => {
        const total = attempts.length;
        const submitted = attempts.filter(
            (a) => a.status === ATTEMPT_STATUSES.SUBMITTED || a.status === ATTEMPT_STATUSES.GRADED
        ).length;
        const graded = attempts.filter((a) => a.status === ATTEMPT_STATUSES.GRADED).length;
        const inProgress = attempts.filter((a) => a.status === ATTEMPT_STATUSES.IN_PROGRESS).length;
        const scored = attempts.filter((a) => a.maxScore);
        const avg = scored.length
            ? Math.round(
                  (scored.reduce((s, a) => s + (a.totalScore / a.maxScore) * 100, 0) /
                      scored.length) *
                      10
              ) / 10
            : 0;
        return { total, submitted, graded, inProgress, avg };
    }, [attempts]);

    const columns = [
        {
            title: t('common.candidate'),
            key: 'candidate',
            render: (_, r) =>
                r.candidateId ? (
                    <div>
                        <div style={{ fontWeight: 500 }}>
                            {`${r.candidateId.firstName || ''} ${r.candidateId.lastName || ''}`.trim() ||
                                r.candidateId.email}
                        </div>
                        <div style={{ fontSize: 12, color: '#888' }}>{r.candidateId.email}</div>
                    </div>
                ) : (
                    '(deleted)'
                ),
        },
        {
            title: t('offers.pageTitle'),
            key: 'offer',
            render: (_, r) =>
                r.offerId ? (
                    <Space direction="vertical" size={0}>
                        <a onClick={() => navigate(`/offers/${r.offerId._id}`)}>{r.offerId.title}</a>
                        {r.offerId.type && <Tag style={{ width: 'fit-content' }}>{r.offerId.type}</Tag>}
                    </Space>
                ) : (
                    '-'
                ),
        },
        {
            title: t('common.status'),
            dataIndex: 'status',
            key: 'status',
            render: (s, r) => (
                <Space>
                    <Tag color={ATTEMPT_STATUS_COLORS[s]}>{s}</Tag>
                    {r.autoSubmitted && <Tag color="red">AUTO</Tag>}
                </Space>
            ),
        },
        {
            title: t('common.score'),
            key: 'score',
            sorter: (a, b) => {
                const ap = a.maxScore ? a.totalScore / a.maxScore : 0;
                const bp = b.maxScore ? b.totalScore / b.maxScore : 0;
                return ap - bp;
            },
            render: (_, r) =>
                r.maxScore ? (
                    <span>
                        {r.totalScore} / {r.maxScore}{' '}
                        <Tag color="blue">{Math.round((r.totalScore / r.maxScore) * 100)}%</Tag>
                    </span>
                ) : (
                    '-'
                ),
        },
        {
            title: t('attempts.antiCheat'),
            key: 'cheat',
            render: (_, r) => (
                <Space size={4}>
                    <Tag color={r.tabSwitchCount > 0 ? 'orange' : 'default'}>
                        Tab: {r.tabSwitchCount}
                    </Tag>
                    <Tag color={r.fullscreenExitCount > 0 ? 'orange' : 'default'}>
                        FS: {r.fullscreenExitCount}
                    </Tag>
                </Space>
            ),
        },
        {
            title: t('attempts.submitted'),
            dataIndex: 'submittedAt',
            key: 'submittedAt',
            sorter: (a, b) =>
                new Date(a.submittedAt || 0).getTime() - new Date(b.submittedAt || 0).getTime(),
            render: (d) => (d ? format(new Date(d), 'yyyy-MM-dd HH:mm') : '-'),
        },
        {
            title: t('common.actions'),
            key: 'actions',
            render: (_, r) => (
                <Space>
                    <Button
                        size="small"
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/attempts/${r._id}`)}
                    >View</Button>
                    <Button
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={() =>
                            downloadAttemptReport(r._id).catch((err) =>
                                message.error(err?.response?.data?.message || 'Download failed')
                            )
                        }
                    />
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: 0 }}>{t('results.title')}</h3>
                    <span style={{ color: '#888' }}>{t('results.subtitle')}</span>
                </div>
                <Button icon={<ReloadOutlined />} onClick={load}>{t('common.refresh')}</Button>
            </div>

            <Row gutter={16} style={{ marginTop: 16 }}>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic title={t('results.totalAttempts')} value={stats.total} />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic title={t('results.inProgress')} value={stats.inProgress} valueStyle={{ color: '#fa8c16' }} />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic title={t('results.graded')} value={stats.graded} valueStyle={{ color: '#52c41a' }} />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic title={t('results.avgScore')} value={`${stats.avg}%`} />
                    </Card>
                </Col>
            </Row>

            <Divider />

            <Card>
                <Space style={{ marginBottom: 16 }} wrap>
                    <Input.Search
                        placeholder={t('results.searchPlaceholder')}
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        onSearch={load}
                        allowClear
                        style={{ width: 320 }}
                    />
                    <Select value={status} onChange={setStatus} options={STATUS_OPTIONS_TRANSLATED} style={{ width: 200 }} />
                </Space>

                {attempts.length === 0 && !loading ? (
                    <Empty description={t('results.noAttempts')} />
                ) : (
                    <Table
                        rowKey="_id"
                        columns={columns}
                        dataSource={attempts}
                        loading={loading}
                        pagination={{ pageSize: 20, showSizeChanger: true }}
                    />
                )}
            </Card>
        </div>
    );
};

export default ResultsList;
