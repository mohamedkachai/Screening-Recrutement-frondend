import {
    Alert,
    Button,
    Card,
    Col,
    Descriptions,
    Divider,
    Empty,
    Input,
    InputNumber,
    Progress,
    Row,
    Space,
    Spin,
    Tag,
    message,
} from 'antd';
import { ArrowLeftOutlined, DownloadOutlined, SaveOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAttemptDetail, gradeAttempt } from '../../api/attempts';
import { downloadAttemptReport } from '../../api/exports';
import UserDetailsDrawer from '../../components/UserDetailsDrawer';
import {
    ATTEMPT_STATUSES,
    ATTEMPT_STATUS_COLORS,
    QUESTION_TYPE_LABELS,
    QUESTION_TYPES,
} from '../../constants/enums';

function renderAnswerValue(question, value) {
    if (value == null || value === '') {
        return <em style={{ color: '#999' }}>—</em>;
    }
    switch (question.type) {
        case QUESTION_TYPES.MCQ_SINGLE:
        case QUESTION_TYPES.TRUE_FALSE: {
            const opt = question.options.find((o) => String(o._id) === String(value));
            return opt ? opt.text : String(value);
        }
        case QUESTION_TYPES.MCQ_MULTI: {
            const ids = Array.isArray(value) ? value.map(String) : [];
            return (
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {question.options
                        .filter((o) => ids.includes(String(o._id)))
                        .map((o) => (
                            <li key={o._id}>{o.text}</li>
                        ))}
                </ul>
            );
        }
        case QUESTION_TYPES.CODE:
            return (
                <pre
                    style={{
                        background: '#f6f8fa',
                        padding: 12,
                        borderRadius: 4,
                        whiteSpace: 'pre-wrap',
                    }}
                >
                    {String(value)}
                </pre>
            );
        default:
            return <div style={{ whiteSpace: 'pre-wrap' }}>{String(value)}</div>;
    }
}

const AttemptDetail = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [grades, setGrades] = useState({}); // questionId -> { points, feedback }
    const { t } = useTranslation();

    async function load() {
        try {
            setLoading(true);
            const res = await getAttemptDetail(attemptId);
            setData(res.data);
            const initial = {};
            for (const a of res.data.attempt.answers || []) {
                if (a.needsManualGrading) {
                    initial[String(a.questionId)] = {
                        points: a.manualPoints,
                        feedback: a.manualFeedback || '',
                    };
                }
            }
            setGrades(initial);
        } catch (error) {
            message.error(error?.response?.data?.message || 'Failed to load');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [attemptId]);

    const questionMap = useMemo(() => {
        if (!data) return new Map();
        return new Map(data.questions.map((q) => [String(q._id), q]));
    }, [data]);

    const testMap = useMemo(() => {
        if (!data) return new Map();
        return new Map(data.tests.map((t) => [String(t._id), t]));
    }, [data]);

    async function handleSaveGrades() {
        try {
            setSaving(true);
            const payload = Object.entries(grades)
                .filter(([, g]) => typeof g.points === 'number')
                .map(([questionId, g]) => ({
                    questionId,
                    points: g.points,
                    feedback: g.feedback || '',
                }));
            const res = await gradeAttempt(attemptId, payload);
            message.success(res.data.message);
            load();
        } catch (error) {
            message.error(error?.response?.data?.message || 'Failed to save grades');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <Spin />;
    }
    if (!data) {
        return null;
    }

    const { attempt } = data;
    const candidate = attempt.candidateId;
    const offer = attempt.offerId;
    const pct = attempt.maxScore
        ? Math.round((attempt.totalScore / attempt.maxScore) * 100)
        : 0;

    const manualAnswers = attempt.answers.filter((a) => a.needsManualGrading);
    const pendingManual = manualAnswers.filter((a) => a.manualPoints == null).length;

    return (
        <div>
            <Button icon={<ArrowLeftOutlined />} type="link" onClick={() => navigate(-1)}>
                {t('common.back')}
            </Button>
            <Space style={{ marginBottom: 8, justifyContent: 'space-between', display: 'flex', width: '100%' }}>
                <Space>
                    <h4 style={{ margin: 0 }}>{t('attempts.attemptDetail')}</h4>
                    <Tag color={ATTEMPT_STATUS_COLORS[attempt.status]}>{attempt.status}</Tag>
                    {attempt.autoSubmitted && <Tag color="red">AUTO-SUBMITTED</Tag>}
                </Space>
                <Button
                    icon={<DownloadOutlined />}
                    onClick={() =>
                        downloadAttemptReport(attempt._id).catch((err) =>
                            message.error(err?.response?.data?.message || t('common.downloadError'))
                        )
                    }
                >
                    {t('attempts.downloadPdf')}
                </Button>
            </Space>
            <Divider />

            <Row gutter={16}>
                <Col xs={24} md={8}>
                    <Card title={t('attempts.summary')} style={{ marginBottom: 16 }}>
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label={t('applications.candidate')}>
                                <Space>
                                  {candidate
                                    ? `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() ||
                                      candidate.email
                                    : '-'}
                                  {candidate && <UserDetailsDrawer userDetails={candidate} triggerText={t('attempts.viewCandidateDetails')} />}
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label={t('common.email')}>
                                {candidate?.email || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label={t('offers.pageTitle')}>{offer?.title || '-'}</Descriptions.Item>
                            <Descriptions.Item label={t('attempts.started')}>
                                {attempt.startedAt
                                    ? format(new Date(attempt.startedAt), 'yyyy-MM-dd HH:mm')
                                    : '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label={t('attempts.submitted')}>
                                {attempt.submittedAt
                                    ? format(new Date(attempt.submittedAt), 'yyyy-MM-dd HH:mm')
                                    : '-'}
                            </Descriptions.Item>
                        </Descriptions>
                        <Divider style={{ margin: '12px 0' }} />
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label={t('attempts.autoScore')}>
                                {attempt.autoScore}
                            </Descriptions.Item>
                            <Descriptions.Item label={t('attempts.manualScore')}>
                                {attempt.manualScore}
                            </Descriptions.Item>
                            <Descriptions.Item label={t('attempts.total')}>
                                <strong>
                                    {attempt.totalScore} / {attempt.maxScore}
                                </strong>
                            </Descriptions.Item>
                        </Descriptions>
                        <Progress percent={pct} style={{ marginTop: 8 }} />
                    </Card>

                    <Card title={t('attempts.antiCheat')} size="small">
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label={t('attempts.tabSwitches')}>
                                <Tag color={attempt.tabSwitchCount > 0 ? 'orange' : 'default'}>
                                    {attempt.tabSwitchCount}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label={t('attempts.fullscreenExits')}>
                                <Tag color={attempt.fullscreenExitCount > 0 ? 'orange' : 'default'}>
                                    {attempt.fullscreenExitCount}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label={t('attempts.events')}>
                                {attempt.events?.length || 0}
                            </Descriptions.Item>
                        </Descriptions>
                        {attempt.events?.length > 0 && (
                            <div style={{ maxHeight: 200, overflow: 'auto', marginTop: 8 }}>
                                {attempt.events.map((e, i) => (
                                    <div key={i} style={{ fontSize: 12, color: '#666' }}>
                                        {format(new Date(e.at), 'HH:mm:ss')} — {e.type}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </Col>

                <Col xs={24} md={16}>
                    {pendingManual > 0 && (
                        <Alert
                            type="warning"
                            showIcon
                            message={`${pendingManual} ${t('attempts.pendingGrading')}`}
                            style={{ marginBottom: 16 }}
                            action={
                                <Button
                                    size="small"
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    loading={saving}
                                    onClick={handleSaveGrades}
                                >
                                    {t('attempts.saveGrades')}
                                </Button>
                            }
                        />
                    )}

                    {attempt.answers.length === 0 ? (
                        <Empty description="No answers" />
                    ) : (
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {attempt.plan.flatMap((group) => {
                                const test = testMap.get(String(group.testId));
                                return [
                                    <Divider key={`t-${group.testId}`} orientation="left">
                                        {test?.title || 'Test'}
                                    </Divider>,
                                    ...group.questionIds.map((qid, idx) => {
                                        const q = questionMap.get(String(qid));
                                        if (!q) return null;
                                        const answer = attempt.answers.find(
                                            (a) => String(a.questionId) === String(qid)
                                        );
                                        const grade = grades[String(qid)] || {};
                                        const earned =
                                            (answer?.autoPoints || 0) +
                                            (answer?.manualPoints || 0);

                                        return (
                                            <Card
                                                key={String(qid)}
                                                size="small"
                                                title={
                                                    <Space>
                                                        <Tag color="blue">{idx + 1}</Tag>
                                                        <Tag>{QUESTION_TYPE_LABELS[q.type]}</Tag>
                                                        <Tag color="purple">
                                                            {earned} / {q.points} pt
                                                        </Tag>
                                                        {answer?.needsManualGrading &&
                                                            answer.manualPoints == null && (
                                                                <Tag color="gold">Pending</Tag>
                                                            )}
                                                    </Space>
                                                }
                                            >
                                                <p style={{ whiteSpace: 'pre-wrap', marginTop: 0 }}>
                                                    {q.prompt}
                                                </p>
                                                <strong>{t('attempts.candidateAnswer')}:</strong>
                                                <div style={{ marginTop: 4 }}>
                                                    {renderAnswerValue(q, answer?.value)}
                                                </div>

                                                {!answer?.needsManualGrading && (
                                                    <div
                                                        style={{
                                                            marginTop: 12,
                                                            color:
                                                                (answer?.autoPoints || 0) > 0
                                                                    ? '#52c41a'
                                                                    : '#cf1322',
                                                        }}
                                                    >
                                                        Auto-graded: {answer?.autoPoints || 0} /{' '}
                                                        {q.points}
                                                    </div>
                                                )}

                                                {answer?.needsManualGrading && (
                                                    <>
                                                        <Divider style={{ margin: '12px 0' }} />
                                                        <Row gutter={12}>
                                                            <Col span={8}>
                                                                <div
                                                                    style={{
                                                                        marginBottom: 4,
                                                                        fontSize: 12,
                                                                    }}
                                                                >
                                                                    Points (max {q.points})
                                                                </div>
                                                                <InputNumber
                                                                    min={0}
                                                                    max={q.points}
                                                                    value={grade.points}
                                                                    onChange={(v) =>
                                                                        setGrades((prev) => ({
                                                                            ...prev,
                                                                            [String(qid)]: {
                                                                                ...prev[
                                                                                    String(qid)
                                                                                ],
                                                                                points: v,
                                                                            },
                                                                        }))
                                                                    }
                                                                    style={{ width: '100%' }}
                                                                />
                                                            </Col>
                                                            <Col span={16}>
                                                                <div
                                                                    style={{
                                                                        marginBottom: 4,
                                                                        fontSize: 12,
                                                                    }}
                                                                >
                                                                    Feedback (optional)
                                                                </div>
                                                                <Input
                                                                    value={grade.feedback || ''}
                                                                    onChange={(e) =>
                                                                        setGrades((prev) => ({
                                                                            ...prev,
                                                                            [String(qid)]: {
                                                                                ...prev[
                                                                                    String(qid)
                                                                                ],
                                                                                feedback:
                                                                                    e.target
                                                                                        .value,
                                                                            },
                                                                        }))
                                                                    }
                                                                />
                                                            </Col>
                                                        </Row>
                                                    </>
                                                )}
                                            </Card>
                                        );
                                    }),
                                ];
                            })}

                            {manualAnswers.length > 0 && (
                                <div style={{ textAlign: 'right', marginTop: 8 }}>
                                    <Button
                                        type="primary"
                                        icon={<SaveOutlined />}
                                        loading={saving}
                                        onClick={handleSaveGrades}
                                    >
                                        {t('attempts.saveGrades')}
                                    </Button>
                                </div>
                            )}
                        </Space>
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default AttemptDetail;
