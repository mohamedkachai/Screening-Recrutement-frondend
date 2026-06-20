import {
    Button,
    Form,
    Input,
    InputNumber,
    Modal,
    Radio,
    Select,
    Space,
    Switch,
    message,
} from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    QUESTION_TYPES,
    QUESTION_TYPE_OPTIONS,
} from '../constants/enums';
import { createQuestion, updateQuestion } from '../api/tests';

const TYPE_NEEDS_OPTIONS = [
    QUESTION_TYPES.MCQ_SINGLE,
    QUESTION_TYPES.MCQ_MULTI,
    QUESTION_TYPES.TRUE_FALSE,
];

const initialOptionsForType = (type) => {
    if (type === QUESTION_TYPES.TRUE_FALSE) {
        return [
            { text: 'True', isCorrect: false },
            { text: 'False', isCorrect: false },
        ];
    }
    if (type === QUESTION_TYPES.MCQ_SINGLE || type === QUESTION_TYPES.MCQ_MULTI) {
        return [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
        ];
    }
    return [];
};

const QuestionEditorModal = ({ open, onClose, testId, question, onSaved }) => {
    const [form] = Form.useForm();
    const isEdit = Boolean(question);
    const { t } = useTranslation();

    useEffect(() => {
        if (!open) {
            return;
        }
        if (question) {
            form.setFieldsValue({
                ...question,
                options: question.options?.map((o) => ({ text: o.text, isCorrect: o.isCorrect })) || [],
            });
        } else {
            form.setFieldsValue({
                type: QUESTION_TYPES.MCQ_SINGLE,
                prompt: '',
                points: 1,
                caseSensitive: false,
                options: initialOptionsForType(QUESTION_TYPES.MCQ_SINGLE),
                expectedAnswer: '',
            });
        }
    }, [open, question, form]);

    const type = Form.useWatch('type', form);

    const handleTypeChange = (value) => {
        form.setFieldsValue({ options: initialOptionsForType(value) });
    };

    async function handleFinish(values) {
        try {
            const payload = { ...values };
            const formOptions = form.getFieldValue('options') || [];

            if (!TYPE_NEEDS_OPTIONS.includes(values.type)) {
                payload.options = [];
            } else {
                payload.options = formOptions.map((option) => ({
                    text: option?.text || '',
                    isCorrect: Boolean(option?.isCorrect),
                }));
            }

            // Enforce minimum 2 options for MCQ types
            if (
                (values.type === QUESTION_TYPES.MCQ_SINGLE ||
                    values.type === QUESTION_TYPES.MCQ_MULTI) &&
                payload.options.length < 2
            ) {
                message.error(t('question.minTwoOptions'));
                return;
            }

            // Enforce single-correct for MCQ_SINGLE & TRUE_FALSE on the client (UX safety)
            if (
                (values.type === QUESTION_TYPES.MCQ_SINGLE ||
                    values.type === QUESTION_TYPES.TRUE_FALSE) &&
                payload.options.filter((o) => o.isCorrect).length !== 1
            ) {
                message.error(t('question.selectOneCorrect'));
                return;
            }

            if (isEdit) {
                await updateQuestion(testId, question._id, payload);
                message.success(t('question.updated'));
            } else {
                await createQuestion(testId, payload);
                message.success(t('question.added'));
            }
            onSaved();
            onClose();
        } catch (error) {
            const msg =
                error?.response?.data?.errors?.formErrors?.[0] ||
                error?.response?.data?.message ||
                t('question.failedToSave');
            message.error(msg);
        }
    }

    return (
        <Modal title={isEdit ? t('question.editTitle') : t('question.addTitle')} open={open} onCancel={onClose} onOk={() => form.submit()} okText={isEdit ? t('question.saveBtn') : t('question.addBtn')} width={720} destroyOnClose>
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item label={t('question.type')} name="type" rules={[{ required: true }]}><Select options={QUESTION_TYPE_OPTIONS} onChange={handleTypeChange} /></Form.Item>
                <Form.Item label={t('question.prompt')} name="prompt" rules={[{ required: true }]}><Input.TextArea rows={3} placeholder={t('question.promptPlaceholder')} /></Form.Item>
                <Form.Item label={t('question.points')} name="points" rules={[{ required: true }]}><InputNumber min={0} step={1} style={{ width: 160 }} /></Form.Item>

                {TYPE_NEEDS_OPTIONS.includes(type) && (
                    <Form.Item label="Options" required>
                        <Form.List name="options">
                            {(fields, { add, remove }) => {
                                const isSingle =
                                    type === QUESTION_TYPES.MCQ_SINGLE ||
                                    type === QUESTION_TYPES.TRUE_FALSE;

                                return (
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        {fields.map((field) => (
                                            <Space key={field.key} style={{ width: '100%' }}>
                                                {isSingle ? (
                                                    <Form.Item noStyle shouldUpdate>
                                                        {() => {
                                                            const correctIdx = (form.getFieldValue('options') || []).findIndex(
                                                                (o) => o?.isCorrect
                                                            );
                                                            return (
                                                                <Radio
                                                                    checked={correctIdx === field.name}
                                                                    onChange={() => {
                                                                        const next = (form.getFieldValue('options') || []).map(
                                                                            (o, i) => ({ ...o, isCorrect: i === field.name })
                                                                        );
                                                                        form.setFieldsValue({ options: next });
                                                                    }}
                                                                />
                                                            );
                                                        }}
                                                    </Form.Item>
                                                ) : (
                                                    <Form.Item
                                                        {...field}
                                                        key={`${field.key}-correct`}
                                                        name={[field.name, 'isCorrect']}
                                                        valuePropName="checked"
                                                        noStyle
                                                    >
                                                        <Switch checkedChildren={t('question.correct')} unCheckedChildren={t('question.wrong')} />
                                                    </Form.Item>
                                                )}
                                                <Form.Item
                                                    {...field}
                                                    key={`${field.key}-text`}
                                                    name={[field.name, 'text']}
                                                    rules={[{ required: true, message: t('question.optionRequired') }]}
                                                    noStyle
                                                >
                                                    <Input placeholder={t('question.optionPlaceholder', { n: field.name + 1 })} style={{ width: 400 }} disabled={type === QUESTION_TYPES.TRUE_FALSE} />
                                                </Form.Item>
                                                {type !== QUESTION_TYPES.TRUE_FALSE && fields.length > 2 && (
                                                    <Button
                                                        type="text"
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        onClick={() => remove(field.name)}
                                                    />
                                                )}
                                            </Space>
                                        ))}
                                        {type !== QUESTION_TYPES.TRUE_FALSE && (
                                            <Button type="dashed" onClick={() => add({ text: '', isCorrect: false })} icon={<PlusOutlined />}>{t('question.addOption')}</Button>
                                        )}
                                    </Space>
                                );
                            }}
                        </Form.List>
                    </Form.Item>
                )}

                {type === QUESTION_TYPES.SHORT_TEXT && (
                    <>
                        <Form.Item label={t('question.expectedAnswer')} name="expectedAnswer" rules={[{ required: true, message: t('question.expectedRequired') }]}><Input placeholder={t('question.exactAnswer')} /></Form.Item>
                        <Form.Item label={t('question.caseSensitive')} name="caseSensitive" valuePropName="checked"><Switch /></Form.Item>
                    </>
                )}

                {(type === QUESTION_TYPES.ESSAY || type === QUESTION_TYPES.CODE) && (
                    <p style={{ color: '#888' }}>{t('question.manualGrading')}</p>
                )}
            </Form>
        </Modal>
    );
};

export default QuestionEditorModal;
