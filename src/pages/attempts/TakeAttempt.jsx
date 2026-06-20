import {
    Alert,
    Button,
    Card,
    Checkbox,
    Divider,
    Input,
    Modal,
    Progress,
    Radio,
    Result,
    Space,
    Spin,
    Tag,
    message,
} from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
    getMyAttempt,
    recordEvent,
    saveAnswer,
    startAttempt,
    submitAttempt,
} from '../../api/attempts';
import { ATTEMPT_STATUSES, QUESTION_TYPES } from '../../constants/enums';

const STATUS_COLORS = {
    SCHEDULED: 'blue',
    ACTIVE: 'green',
    CLOSED: 'default',
};

function formatRemaining(ms) {
    if (ms <= 0) return '00:00';
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

const TakeAttempt = () => {
    const { offerId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [data, setData] = useState(null);
    const [answers, setAnswers] = useState({});
    const [currentIdx, setCurrentIdx] = useState(0);
    const [now, setNow] = useState(Date.now());

    const containerRef = useRef(null);
    const saveTimers = useRef({});

    const flatQuestions = useMemo(() => {
        if (!data?.plan) return [];
        return data.plan.flatMap((group) =>
            group.questions.map((q) => ({ ...q, _testTitle: group.test?.title }))
        );
    }, [data]);

    const inProgress = data?.attempt?.status === ATTEMPT_STATUSES.IN_PROGRESS;

    async function load() {
        try {
            setLoading(true);
            const res = await getMyAttempt(offerId);
            setData(res.data);
            setAnswers(res.data.answers || {});
        } catch (error) {
            message.error(error?.response?.data?.message || t('common.failedToLoad'));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [offerId]);

    // Timer tick
    useEffect(() => {
        if (!inProgress) return;
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, [inProgress]);

    // Auto-submit when expired
    const expiresAt = data?.attempt?.expiresAt
        ? new Date(data.attempt.expiresAt).getTime()
        : null;
    useEffect(() => {
        if (!inProgress || !expiresAt) return;
        if (now >= expiresAt) {
            handleSubmit(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [now, expiresAt, inProgress]);

    // Anti-cheat: tab switch detection
    useEffect(() => {
        if (!inProgress) return;
        const onVisibility = () => {
            if (document.hidden) {
                recordEvent(data.attempt._id, 'TAB_SWITCH').then((r) => {
                    if (r.data?.autoSubmitted) {
                        message.error(t('takeTest.tabLimitExceeded'));
                        load();
                    } else if (r.data?.tabSwitchCount) {
                        message.warning(t('takeTest.tabSwitchWarning', { n: r.data.tabSwitchCount }));
                    }
                });
            }
        };
        document.addEventListener('visibilitychange', onVisibility);
        return () => document.removeEventListener('visibilitychange', onVisibility);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inProgress, data?.attempt?._id]);

    // Anti-cheat: copy/paste blocking
    useEffect(() => {
        if (!inProgress || !data?.session?.preventCopyPaste) return;
        const block = (e) => {
            e.preventDefault();
            recordEvent(data.attempt._id, 'COPY_PASTE_BLOCKED').catch(() => {});
        };
        const node = containerRef.current;
        if (!node) return;
        node.addEventListener('copy', block);
        node.addEventListener('paste', block);
        node.addEventListener('cut', block);
        return () => {
            node.removeEventListener('copy', block);
            node.removeEventListener('paste', block);
            node.removeEventListener('cut', block);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inProgress, data?.session?.preventCopyPaste, data?.attempt?._id]);

    // Anti-cheat: fullscreen tracking
    useEffect(() => {
        if (!inProgress || !data?.session?.requireFullscreen) return;
        const onFsChange = () => {
            if (!document.fullscreenElement) {
                recordEvent(data.attempt._id, 'FULLSCREEN_EXIT').catch(() => {});
                message.warning(t('takeTest.fullscreenWarning'));
            }
        };
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inProgress, data?.session?.requireFullscreen, data?.attempt?._id]);

    const persistAnswer = useCallback(
        (questionId, value) => {
            if (!data?.attempt?._id) return;
            clearTimeout(saveTimers.current[questionId]);
            saveTimers.current[questionId] = setTimeout(() => {
                saveAnswer(data.attempt._id, questionId, value).catch((err) => {
                    message.error(err?.response?.data?.message || t('takeTest.failedToSaveAnswer'));
                });
            }, 400);
        },
        [data?.attempt?._id]
    );

    function setAnswer(questionId, value) {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
        persistAnswer(questionId, value);
    }

    async function handleStart() {
        try {
            setStarting(true);
            if (data?.session?.requireFullscreen) {
                try {
                    await document.documentElement.requestFullscreen();
                } catch {
                    // user can re-enter fullscreen later; backend will track exits
                }
            }
            const res = await startAttempt(offerId);
            setData((prev) => ({
                ...prev,
                attempt: res.data.attempt,
                plan: res.data.plan,
            }));
            setAnswers(res.data.answers || {});
            setCurrentIdx(0);
            message.success(t('takeTest.goodLuck'));
        } catch (error) {
            message.error(error?.response?.data?.message || t('takeTest.failedToStart'));
        } finally {
            setStarting(false);
        }
    }

    async function handleSubmit(auto = false) {
        if (!auto) {
            const ok = await new Promise((resolve) => {
                Modal.confirm({
                    title: t('takeTest.submitConfirmTitle'),
                    content: t('takeTest.submitConfirmBody'),
                    okText: t('common.submit'),
                    onOk: () => resolve(true),
                    onCancel: () => resolve(false),
                });
            });
            if (!ok) return;
        }
        try {
            setSubmitting(true);
            // flush pending answer saves
            for (const id of Object.keys(saveTimers.current)) {
                clearTimeout(saveTimers.current[id]);
            }
            await submitAttempt(data.attempt._id);
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
            }
            await load();
            message.success(auto ? t('takeTest.timeUp') : t('takeTest.submitted'));
        } catch (error) {
            message.error(error?.response?.data?.message || t('takeTest.failedToSubmit'));
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return <Spin />;
    }
    if (!data) {
        return null;
    }

    const { offer, session, sessionStatus, attempt } = data;

    // ===== Already submitted / graded =====
    if (
        attempt?.status === ATTEMPT_STATUSES.SUBMITTED ||
        attempt?.status === ATTEMPT_STATUSES.GRADED
    ) {
        const pct = attempt.maxScore
            ? Math.round((attempt.totalScore / attempt.maxScore) * 100)
            : 0;
        return (
            <Result
                status="success"
                title={t('takeTest.submitted')}
                subTitle={
                    attempt.status === ATTEMPT_STATUSES.GRADED
                        ? t('takeTest.scoreResult', { score: attempt.totalScore, max: attempt.maxScore, pct })
                        : t('takeTest.awaitingReview')
                }
                extra={[
                    <Button key="back" onClick={() => navigate('/my-applications')}>
                        {t('takeTest.backToApps')}
                    </Button>,
                ]}
            />
        );
    }

    // ===== Pre-start screen =====
    if (!attempt || attempt.status === ATTEMPT_STATUSES.NOT_STARTED || !inProgress) {
        const canStart = sessionStatus === 'ACTIVE';
        return (
            <div>
                <Button type="link" onClick={() => navigate('/my-applications')}>
                    {t('takeTest.previous').replace('←', '')} {t('takeTest.backToApps')}
                </Button>
                <h3>{offer.title}</h3>
                <Space>
                    <Tag color={STATUS_COLORS[sessionStatus] || 'default'}>{sessionStatus}</Tag>
                    <span>
                        {t('takeTest.window')} {new Date(session.startAt).toLocaleString()} →{' '}
                        {new Date(session.endAt).toLocaleString()}
                    </span>
                </Space>
                <Divider />
                <Card title={t('takeTest.instructions')} style={{ marginBottom: 16 }}>
                    <p style={{ whiteSpace: 'pre-wrap' }}>
                        {session.instructions || t('takeTest.noInstructions')}
                    </p>
                    <ul>
                        {session.tabSwitchLimit > 0 && (
                            <li>{t('takeTest.tabRule', { n: session.tabSwitchLimit })}</li>
                        )}
                        {session.preventCopyPaste && <li>{t('takeTest.copyPasteDisabled')}</li>}
                        {session.requireFullscreen && <li>{t('takeTest.fullscreenRequired')}</li>}
                        <li>{t('takeTest.timerCannotPause')}</li>
                    </ul>
                </Card>
                {sessionStatus === 'SCHEDULED' && (
                    <Alert type="info" message={t('takeTest.notStarted')} description={t('takeTest.comeBack')} showIcon />
                )}
                {sessionStatus === 'CLOSED' && (
                    <Alert type="error" message={t('takeTest.sessionClosed')} description={t('takeTest.windowPassed')} showIcon />
                )}
                {canStart && (
                    <Button type="primary" size="large" loading={starting} onClick={handleStart}>
                        {t('takeTest.startAttempt')}
                    </Button>
                )}
            </div>
        );
    }

    // ===== In-progress runner =====
    const remaining = expiresAt ? expiresAt - now : 0;
    const total = flatQuestions.length;
    const currentQ = flatQuestions[currentIdx];
    const answered = Object.keys(answers).filter(
        (k) => answers[k] != null && answers[k] !== ''
    ).length;

    return (
        <div ref={containerRef} style={{ userSelect: data.session.preventCopyPaste ? 'none' : 'auto' }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'sticky',
                    top: 0,
                    background: '#fff',
                    padding: '8px 0',
                    zIndex: 10,
                }}
            >
                <Space>
                    <Tag color="green">{t('takeTest.live')}</Tag>
                    <strong>{offer.title}</strong>
                </Space>
                <Space>
                    <Tag color={remaining < 60_000 ? 'red' : 'blue'}>
                        ⏱ {formatRemaining(remaining)}
                    </Tag>
                    <Tag>{t('takeTest.answered', { n: answered, total })}</Tag>
                </Space>
            </div>
            <Progress
                percent={total ? Math.round(((currentIdx + 1) / total) * 100) : 0}
                showInfo={false}
            />
            <Divider style={{ margin: '12px 0' }} />

            {currentQ && (
                <Card
                    title={
                        <Space>
                            <Tag>{currentQ._testTitle}</Tag>
                            <span>{t('takeTest.questionOf', { n: currentIdx + 1, total })}</span>
                            <Tag color="purple">{currentQ.points} pt</Tag>
                        </Space>
                    }
                >
                    <p style={{ whiteSpace: 'pre-wrap', fontSize: 16 }}>{currentQ.prompt}</p>

                    {currentQ.type === QUESTION_TYPES.MCQ_SINGLE ||
                    currentQ.type === QUESTION_TYPES.TRUE_FALSE ? (
                        <Radio.Group
                            value={answers[currentQ._id]}
                            onChange={(e) => setAnswer(currentQ._id, e.target.value)}
                        >
                            <Space direction="vertical">
                                {currentQ.options.map((o) => (
                                    <Radio key={o._id} value={o._id}>
                                        {o.text}
                                    </Radio>
                                ))}
                            </Space>
                        </Radio.Group>
                    ) : currentQ.type === QUESTION_TYPES.MCQ_MULTI ? (
                        <Checkbox.Group
                            value={answers[currentQ._id] || []}
                            onChange={(vals) => setAnswer(currentQ._id, vals)}
                        >
                            <Space direction="vertical">
                                {currentQ.options.map((o) => (
                                    <Checkbox key={o._id} value={o._id}>
                                        {o.text}
                                    </Checkbox>
                                ))}
                            </Space>
                        </Checkbox.Group>
                    ) : currentQ.type === QUESTION_TYPES.SHORT_TEXT ? (
                        <Input value={answers[currentQ._id] || ''} onChange={(e) => setAnswer(currentQ._id, e.target.value)} placeholder={t('takeTest.yourAnswer')} />
                    ) : (
                        <Input.TextArea
                            rows={currentQ.type === QUESTION_TYPES.CODE ? 12 : 6}
                            value={answers[currentQ._id] || ''}
                            onChange={(e) => setAnswer(currentQ._id, e.target.value)}
                            placeholder={
                                currentQ.type === QUESTION_TYPES.CODE
                                    ? t('takeTest.codeHere')
                                    : t('takeTest.essayHere')
                            }
                            style={
                                currentQ.type === QUESTION_TYPES.CODE
                                    ? { fontFamily: 'monospace' }
                                    : undefined
                            }
                        />
                    )}
                </Card>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                <Button disabled={currentIdx === 0} onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}>
                    {t('takeTest.previous')}
                </Button>
                <Space>
                    {currentIdx < total - 1 ? (
                        <Button type="primary" onClick={() => setCurrentIdx((i) => Math.min(total - 1, i + 1))}>
                                {t('takeTest.next')}
                            </Button>
                    ) : (
                        <Button type="primary" loading={submitting} onClick={() => handleSubmit(false)}>
                                {t('takeTest.submitAttempt')}
                            </Button>
                    )}
                </Space>
            </div>

            <Divider />
            <Card size="small" title={t('takeTest.navigator')}>
                <Space wrap>
                    {flatQuestions.map((q, idx) => {
                        const isAnswered = answers[q._id] != null && answers[q._id] !== '';
                        return (
                            <Button
                                key={q._id}
                                size="small"
                                type={idx === currentIdx ? 'primary' : isAnswered ? 'default' : 'dashed'}
                                onClick={() => setCurrentIdx(idx)}
                            >
                                {idx + 1}
                            </Button>
                        );
                    })}
                </Space>
            </Card>
        </div>
    );
};

export default TakeAttempt;
