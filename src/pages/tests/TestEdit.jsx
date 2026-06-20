import {
    Button,
    Card,
    Col,
    Divider,
    Empty,
    Form,
    Input,
    InputNumber,
    Modal,
    Popconfirm,
    Row,
    Select,
    Space,
    Spin,
    Tag,
    message,
} from 'antd';
import {
    ArrowLeftOutlined,
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    RobotOutlined,
    SaveOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteQuestion, generateAiQuestions, getTest, updateTest } from '../../api/tests';
import QuestionEditorModal from '../../components/QuestionEditorModal';
import { QUESTION_TYPE_LABELS, QUESTION_TYPES } from '../../constants/enums';

const TestEdit = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [test, setTest] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editorOpen, setEditorOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [aiModalOpen, setAiModalOpen] = useState(false);
    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiForm] = Form.useForm();
    const [form] = Form.useForm();
    const { t } = useTranslation();

    const load = async () => {
        try {
            setLoading(true);
            const res = await getTest(testId);
            setTest(res.data.test);
            setQuestions(res.data.questions);
            form.setFieldsValue(res.data.test);
        } catch (error) {
            message.error(error?.response?.data?.message || t('common.failedToLoad'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [testId]);

    async function handleSaveSettings(values) {
        try {
            setSaving(true);
            await updateTest(testId, values);
            message.success(t('tests.testUpdated'));
            load();
        } catch (error) {
            message.error(error?.response?.data?.message || t('common.error'));
        } finally {
            setSaving(false);
        }
    }

    function openCreate() {
        setEditingQuestion(null);
        setEditorOpen(true);
    }

    function openEdit(q) {
        setEditingQuestion(q);
        setEditorOpen(true);
    }

    const handleAiGenerate = async () => {
        try {
            const values = await aiForm.validateFields();
            setAiGenerating(true);
            await generateAiQuestions(testId, values);
            message.success(t('tests.aiGenerated'));
            setAiModalOpen(false);
            aiForm.resetFields();
            await load();
        } catch (error) {
            if (error?.errorFields) return;
            message.error(error?.response?.data?.message || t('common.error'));
        } finally {
            setAiGenerating(false);
        }
    };

    async function handleDelete(q) {
        try {
            await deleteQuestion(testId, q._id);
            message.success(t('tests.questionDeleted'));
            load();
        } catch (error) {
            message.error(error?.response?.data?.message || t('common.error'));
        }
    }

    if (loading) {
        return <Spin />;
    }
    if (!test) {
        return null;
    }

    return (
        <div>
            <Button icon={<ArrowLeftOutlined />} type="link" onClick={() => navigate('/tests')}>
                {t('tests.backToLibrary')}
            </Button>
            <h4>{t('tests.editTest')}</h4>
            <Divider />

            <Row gutter={16}>
                <Col xs={24} md={10}>
                    <Card title={t('tests.settings')}>
                        <Form form={form} layout="vertical" onFinish={handleSaveSettings}>
                            <Form.Item label={t('common.title')} name="title" rules={[{ required: true }]}><Input /></Form.Item>
                            <Form.Item label={t('common.description')} name="description"><Input.TextArea rows={3} /></Form.Item>
                            <Form.Item label={t('tests.durationMinutes')} name="durationMinutes" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
                            <Form.Item label={t('tests.passingScore')} name="passingScore"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
                            <Space>
                                <span>
                                    <strong>{test.questionCount}</strong> {t('common.questions')} ·{' '}
                                    <strong>{test.totalPoints}</strong> {t('common.score').toLowerCase()} pts
                                </span>
                            </Space>
                            <div style={{ marginTop: 16 }}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<SaveOutlined />}
                                    loading={saving}>
                                    {t('common.save')}
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </Col>
                <Col xs={24} md={14}>
                    <Card
                        title={t('common.questions')}
                        extra={
                            <Space>
                                <Button icon={<RobotOutlined />} onClick={() => setAiModalOpen(true)}>{t('tests.generateWithAi')}</Button>
                                <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('tests.addQuestion')}</Button>
                            </Space>
                        }
                    >
                        {questions.length === 0 ? (
                            <Empty description={t('tests.noQuestions')} />
                        ) : (
                            <Space direction="vertical" style={{ width: '100%' }}>
                                {questions.map((q, idx) => (
                                    <Card
                                        key={q._id}
                                        size="small"
                                        title={
                                            <Space>
                                                <Tag color="blue">{idx + 1}</Tag>
                                                <Tag>{QUESTION_TYPE_LABELS[q.type]}</Tag>
                                                <Tag color="purple">{q.points} pt</Tag>
                                            </Space>
                                        }
                                        extra={
                                            <Space>
                                                <Button
                                                    size="small"
                                                    icon={<EditOutlined />}
                                                    onClick={() => openEdit(q)}
                                                />
                                                <Popconfirm title={t('tests.deleteQuestionConfirm')} onConfirm={() => handleDelete(q)} okText={t('common.delete')} okButtonProps={{ danger: true }}>
                                                    <Button size="small" danger icon={<DeleteOutlined />} />
                                                </Popconfirm>
                                            </Space>
                                        }
                                    >
                                        <div style={{ whiteSpace: 'pre-wrap', marginBottom: 8 }}>
                                            {q.prompt}
                                        </div>
                                        {q.options?.length > 0 && (
                                            <ul style={{ paddingLeft: 20, margin: 0 }}>
                                                {q.options.map((o) => (
                                                    <li
                                                        key={o._id}
                                                        style={{ color: o.isCorrect ? '#13c2c2' : 'inherit' }}
                                                    >
                                                        {o.text} {o.isCorrect && <Tag color="green">correct</Tag>}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        {q.type === QUESTION_TYPES.SHORT_TEXT && q.expectedAnswer && (
                                            <div style={{ color: '#888' }}>
                                                {t('tests.expected')}: <code>{q.expectedAnswer}</code>
                                                {q.caseSensitive && <Tag style={{ marginLeft: 8 }}>{t('tests.caseSensitive')}</Tag>}
                                            </div>
                                        )}
                                    </Card>
                                ))}
                            </Space>
                        )}
                    </Card>
                </Col>
            </Row>

            <QuestionEditorModal
                open={editorOpen}
                onClose={() => setEditorOpen(false)}
                testId={testId}
                question={editingQuestion}
                onSaved={load}
            />

            <Modal
                open={aiModalOpen}
                title={t('tests.generateWithAi')}
                onCancel={() => setAiModalOpen(false)}
                onOk={handleAiGenerate}
                confirmLoading={aiGenerating}
                okText={t('tests.generate')}
            >
                <Form form={aiForm} layout="vertical" initialValues={{ count: 5, difficulty: 'medium', types: ['MCQ_SINGLE'] }}>
                    <Form.Item name="topic" label={t('tests.aiTopic')} rules={[{ required: true }]}>
                        <Input.TextArea rows={2} placeholder={t('tests.aiTopicPlaceholder')} />
                    </Form.Item>
                    <Form.Item name="count" label={t('tests.aiCount')}>
                        <InputNumber min={1} max={20} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="difficulty" label={t('tests.aiDifficulty')}>
                        <Select options={[
                            { value: 'easy', label: t('tests.easy') },
                            { value: 'medium', label: t('tests.medium') },
                            { value: 'hard', label: t('tests.hard') },
                        ]} />
                    </Form.Item>
                    <Form.Item name="types" label={t('tests.aiTypes')}>
                        <Select mode="multiple" options={[
                            { value: 'MCQ_SINGLE', label: 'MCQ (single answer)' },
                            { value: 'MCQ_MULTI', label: 'MCQ (multiple answers)' },
                            { value: 'TRUE_FALSE', label: 'True / False' },
                            { value: 'SHORT_ANSWER', label: 'Short Answer' },
                            { value: 'LONG_ANSWER', label: 'Long Answer' },
                        ]} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TestEdit;
