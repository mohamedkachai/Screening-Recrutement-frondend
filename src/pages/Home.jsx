import {
    BarChartOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    RightOutlined,
    SolutionOutlined,
    TeamOutlined,
    TrophyOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Card, Col, List, Row, Spin, Statistic, Tag, Typography } from 'antd';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { listMyApplications } from '../api/applications';
import { listAllAttempts } from '../api/attempts';
import { listOffers } from '../api/offers';
import { listUsers } from '../api/users';
import {
    APPLICATION_STATUS_COLORS,
    APPLICATION_STATUSES,
    ATTEMPT_STATUSES,
    OFFER_STATUS_COLORS,
    OFFER_STATUSES,
} from '../constants/enums';
import { AuthContext } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const OFFER_PIE_COLORS = {
    [OFFER_STATUSES.OPEN]: '#52c41a',
    [OFFER_STATUSES.DRAFT]: '#8c8c8c',
    [OFFER_STATUSES.CLOSED]: '#ff4d4f',
};

const APP_BAR_COLORS = {
    [APPLICATION_STATUSES.APPLIED]: '#1677ff',
    [APPLICATION_STATUSES.INVITED]: '#13c2c2',
    [APPLICATION_STATUSES.IN_PROGRESS]: '#faad14',
    [APPLICATION_STATUSES.COMPLETED]: '#597ef7',
    [APPLICATION_STATUSES.REJECTED]: '#ff4d4f',
    [APPLICATION_STATUSES.HIRED]: '#52c41a',
};

// ── HR / Admin dashboard ─────────────────────────────────────────────────────

function HRDashboard({ user }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [offers, setOffers] = useState([]);
    const [attempts, setAttempts] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [o, a, u] = await Promise.all([
                    listOffers(),
                    listAllAttempts(),
                    listUsers(),
                ]);
                setOffers(o.data.offers ?? []);
                setAttempts(a.data.attempts ?? []);
                setUsers(u.data.users ?? []);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const offerPieData = useMemo(
        () =>
            Object.values(OFFER_STATUSES).map((s) => ({
                name: s,
                value: offers.filter((o) => o.status === s).length,
            })).filter((d) => d.value > 0),
        [offers],
    );

    const appBarData = useMemo(
        () =>
            Object.values(APPLICATION_STATUSES).map((s) => ({
                name: s.replace('_', ' '),
                count: attempts.filter((a) => {
                    // proxy: map attempt statuses loosely
                    if (s === APPLICATION_STATUSES.IN_PROGRESS)
                        return a.status === ATTEMPT_STATUSES.IN_PROGRESS;
                    if (s === APPLICATION_STATUSES.COMPLETED)
                        return (
                            a.status === ATTEMPT_STATUSES.SUBMITTED ||
                            a.status === ATTEMPT_STATUSES.GRADED
                        );
                    return false;
                }).length,
                fill: APP_BAR_COLORS[s],
            })).filter((d) => d.count > 0),
        [attempts],
    );

    const pendingGrade = useMemo(
        () => attempts.filter((a) => a.status === ATTEMPT_STATUSES.SUBMITTED).length,
        [attempts],
    );

    const recentOffers = useMemo(
        () => [...offers].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
        [offers],
    );

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 80 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Greeting */}
            <div>
                <Title level={3} style={{ margin: 0 }}>
                    {t('home.welcomeBack', { name: user?.firstName })} 👋
                </Title>
                <Text type="secondary">{t('home.subtitle')}</Text>
            </div>

            {/* KPI cards */}
            <Row gutter={[16, 16]}>
                {[
                    { title: t('home.totalOffers'), value: offers.length, icon: <FileTextOutlined />, color: '#1677ff', onClick: () => navigate('/offers') },
                    { title: t('home.openOffers'), value: offers.filter((o) => o.status === OFFER_STATUSES.OPEN).length, icon: <CheckCircleOutlined />, color: '#52c41a', onClick: () => navigate('/offers') },
                    { title: t('home.totalAttempts'), value: attempts.length, icon: <SolutionOutlined />, color: '#722ed1', onClick: () => navigate('/results') },
                    { title: t('home.pendingReview'), value: pendingGrade, icon: <ClockCircleOutlined />, color: '#fa8c16', onClick: () => navigate('/results') },
                    { title: t('home.totalUsers'), value: users.length, icon: <TeamOutlined />, color: '#13c2c2', onClick: () => navigate('/user/list') },
                ].map((card) => (
                    <Col key={card.title} xs={12} sm={8} md={8} lg={4} xl={4}>
                        <Card
                            hoverable
                            onClick={card.onClick}
                            style={{ borderRadius: 12, cursor: 'pointer' }}
                            styles={{ body: { padding: '16px 20px' } }}
                        >
                            <div
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 8,
                                    background: card.color + '1a',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 18,
                                    color: card.color,
                                    marginBottom: 12,
                                }}
                            >
                                {card.icon}
                            </div>
                            <Statistic
                                title={<span style={{ fontSize: 12 }}>{card.title}</span>}
                                value={card.value}
                                valueStyle={{ fontSize: 28, fontWeight: 700, color: card.color }}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Charts row */}
            <Row gutter={[16, 16]}>
                <Col xs={24} md={10}>
                    <Card title={t('home.offersByStatus')} style={{ borderRadius: 12, height: '100%' }}>
                        {offerPieData.length === 0 ? (
                            <Text type="secondary">{t('home.noOffersYet')}</Text>
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={offerPieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={90}
                                        paddingAngle={3}
                                        dataKey="value"
                                        label={({ name, value }) => `${name} (${value})`}
                                        labelLine={false}
                                    >
                                        {offerPieData.map((entry) => (
                                            <Cell
                                                key={entry.name}
                                                fill={OFFER_PIE_COLORS[entry.name] ?? '#aaa'}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </Card>
                </Col>
                <Col xs={24} md={14}>
                    <Card title={t('home.attemptsByStatus')} style={{ borderRadius: 12, height: '100%' }}>
                        {appBarData.length === 0 ? (
                            <Text type="secondary">{t('home.noAttemptData')}</Text>
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={appBarData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {appBarData.map((entry) => (
                                            <Cell key={entry.name} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Recent offers */}
            <Card
                title={t('home.recentOffers')}
                style={{ borderRadius: 12 }}
                extra={
                    <Button type="link" onClick={() => navigate('/offers')} icon={<RightOutlined />}>
                        {t('common.viewAll')}
                    </Button>
                }
            >
                <List
                    dataSource={recentOffers}
                    renderItem={(offer) => (
                        <List.Item
                            style={{ cursor: 'pointer', padding: '10px 0' }}
                            onClick={() => navigate(`/offers/${offer._id}`)}
                            extra={
                                <Tag color={OFFER_STATUS_COLORS[offer.status]}>{offer.status}</Tag>
                            }
                        >
                            <List.Item.Meta
                                avatar={
                                    <Avatar
                                        style={{ background: '#1677ff1a', color: '#1677ff' }}
                                        icon={<FileTextOutlined />}
                                    />
                                }
                                title={<span style={{ fontWeight: 600 }}>{offer.title}</span>}
                                description={
                                    <span style={{ fontSize: 12 }}>
                                        {offer.location ?? 'Remote'} &middot; {offer.type?.replace('_', ' ')}
                                    </span>
                                }
                            />
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    );
}

// ── Reviewer dashboard ───────────────────────────────────────────────────────

function ReviewerDashboard({ user }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await listAllAttempts();
                setAttempts(res.data.attempts ?? []);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const pending = useMemo(
        () => attempts.filter((a) => a.status === ATTEMPT_STATUSES.SUBMITTED),
        [attempts],
    );
    const graded = useMemo(
        () => attempts.filter((a) => a.status === ATTEMPT_STATUSES.GRADED).length,
        [attempts],
    );

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 80 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
                <Title level={3} style={{ margin: 0 }}>
                    {t('home.welcomeBack', { name: user?.firstName })} 👋
                </Title>
                <Text type="secondary">{t('home.reviewerSubtitle')}</Text>
            </div>
            <Row gutter={[16, 16]}>
                {[
                    { title: t('home.pendingReview'), value: pending.length, icon: <ClockCircleOutlined />, color: '#fa8c16' },
                    { title: t('home.graded'), value: graded, icon: <TrophyOutlined />, color: '#52c41a' },
                    { title: t('home.totalAssigned'), value: attempts.length, icon: <BarChartOutlined />, color: '#1677ff' },
                ].map((c) => (
                    <Col key={c.title} xs={24} sm={8}>
                        <Card hoverable onClick={() => navigate('/results')} style={{ borderRadius: 12, cursor: 'pointer' }} styles={{ body: { padding: '16px 20px' } }}>
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: c.color + '1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: c.color, marginBottom: 12 }}>
                                {c.icon}
                            </div>
                            <Statistic title={<span style={{ fontSize: 12 }}>{c.title}</span>} value={c.value} valueStyle={{ fontSize: 28, fontWeight: 700, color: c.color }} />
                        </Card>
                    </Col>
                ))}
            </Row>
            <Card
                title={`${t('home.gradingQueue', { count: pending.length })}`}
                style={{ borderRadius: 12 }}
                extra={<Button type="link" onClick={() => navigate('/results')} icon={<RightOutlined />}>{t('common.viewAll')}</Button>}
            >
                <List
                    dataSource={pending.slice(0, 6)}
                    locale={{ emptyText: t('home.noPending') }}
                    renderItem={(a) => (
                        <List.Item
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate(`/attempts/${a._id}`)}
                            extra={<Tag color="blue">{t('home.submitted')}</Tag>}
                        >
                            <List.Item.Meta
                                avatar={<Avatar style={{ background: '#722ed11a', color: '#722ed1' }} icon={<SolutionOutlined />} />}
                                title={<span style={{ fontWeight: 600 }}>{a.candidateId?.firstName} {a.candidateId?.lastName}</span>}
                                description={<span style={{ fontSize: 12 }}>{a.testId?.title ?? 'Test'}</span>}
                            />
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    );
}

// ── Candidate dashboard ──────────────────────────────────────────────────────

function CandidateDashboard({ user }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await listMyApplications();
                setApps(res.data.applications ?? []);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const inProgress = useMemo(
        () => apps.filter((a) => a.status === APPLICATION_STATUSES.IN_PROGRESS),
        [apps],
    );
    const hired = useMemo(
        () => apps.filter((a) => a.status === APPLICATION_STATUSES.HIRED).length,
        [apps],
    );

    const appStatusData = useMemo(
        () =>
            Object.values(APPLICATION_STATUSES)
                .map((s) => ({ name: s.replace('_', ' '), value: apps.filter((a) => a.status === s).length }))
                .filter((d) => d.value > 0),
        [apps],
    );

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 80 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
                <Title level={3} style={{ margin: 0 }}>
                    {t('home.welcomeBack', { name: user?.firstName })} 👋
                </Title>
                <Text type="secondary">{t('home.candidateSubtitle')}</Text>
            </div>
            <Row gutter={[16, 16]}>
                {[
                    { title: t('home.totalApplied'), value: apps.length, icon: <SolutionOutlined />, color: '#1677ff', onClick: () => navigate('/my-applications') },
                    { title: t('home.inProgress'), value: inProgress.length, icon: <ClockCircleOutlined />, color: '#fa8c16', onClick: () => navigate('/my-applications') },
                    { title: t('home.hired'), value: hired, icon: <TrophyOutlined />, color: '#52c41a', onClick: () => navigate('/my-applications') },
                ].map((c) => (
                    <Col key={c.title} xs={24} sm={8}>
                        <Card hoverable onClick={c.onClick} style={{ borderRadius: 12, cursor: 'pointer' }} styles={{ body: { padding: '16px 20px' } }}>
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: c.color + '1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: c.color, marginBottom: 12 }}>
                                {c.icon}
                            </div>
                            <Statistic title={<span style={{ fontSize: 12 }}>{c.title}</span>} value={c.value} valueStyle={{ fontSize: 28, fontWeight: 700, color: c.color }} />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row gutter={[16, 16]}>
                {appStatusData.length > 0 && (
                    <Col xs={24} md={10}>
                        <Card title={t('home.myAppsByStatus')} style={{ borderRadius: 12 }}>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={appStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                                        {appStatusData.map((entry) => (
                                            <Cell key={entry.name} fill={APP_BAR_COLORS[entry.name.replace(' ', '_')] ?? '#aaa'} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                )}
                <Col xs={24} md={appStatusData.length > 0 ? 14 : 24}>
                    <Card
                        title={t('home.testsToResume')}
                        style={{ borderRadius: 12 }}
                        extra={<Button type="link" onClick={() => navigate('/my-applications')} icon={<RightOutlined />}>{t('home.allApplications')}</Button>}
                    >
                        <List
                            dataSource={inProgress.slice(0, 5)}
                            locale={{ emptyText: t('home.noTestsInProgress') }}
                            renderItem={(a) => (
                                <List.Item
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => navigate(`/take/${a.offerId?._id}`)}
                                    extra={
                                        <Button size="small" type="primary">{t('home.resumeBtn')}</Button>
                                    }
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar style={{ background: '#fa8c161a', color: '#fa8c16' }} icon={<ClockCircleOutlined />} />}
                                        title={<span style={{ fontWeight: 600 }}>{a.offerId?.title ?? 'Offer'}</span>}
                                        description={<span style={{ fontSize: 12 }}>{a.offerId?.type?.replace('_', ' ')}</span>}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>

            <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg,#1677ff,#69c0ff)', border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <Title level={4} style={{ color: '#fff', margin: 0 }}>{t('home.browseTitle')}</Title>
                        <Text style={{ color: 'rgba(255,255,255,0.8)' }}>{t('home.browseSubtitle')}</Text>
                    </div>
                    <Button size="large" style={{ background: '#fff', color: '#1677ff', border: 'none', fontWeight: 600 }} onClick={() => navigate('/browse')}>{t('home.exploreBtn')}</Button>
                </div>
            </Card>
        </div>
    );
}

// ── Root ─────────────────────────────────────────────────────────────────────

function Home() {
    const { user, isAdmin, isHR, isReviewer, isCandidate } = useContext(AuthContext);

    if (isAdmin || isHR) return <HRDashboard user={user} />;
    if (isReviewer) return <ReviewerDashboard user={user} />;
    if (isCandidate) return <CandidateDashboard user={user} />;

    return (
        <div style={{ textAlign: 'center', padding: 80 }}>
            <Spin size="large" />
        </div>
    );
}

export default Home;
