import { Badge, Button, Form, Input, InputNumber, Modal, Popconfirm, Table, Tooltip, message } from 'antd';
import { DeleteOutlined, EditOutlined, FileSearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { createTest, deleteTest, listAllTests } from '../../api/tests';

const { Search } = Input;

const TestLibrary = () => {
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form] = Form.useForm();
    const { t } = useTranslation();

    const load = async () => {
        try {
            setLoading(true);
            const res = await listAllTests();
            setTests(res.data.tests);
        } catch (error) {
            message.error(error?.response?.data?.message || t('common.failedToLoad') + ' tests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    async function handleCreate(values) {
        try {
            setCreating(true);
            const res = await createTest(values);
            message.success(t('tests.testCreated'));
            setCreateOpen(false);
            form.resetFields();
            navigate(`/tests/${res.data.test._id}`);
        } catch (error) {
            message.error(error?.response?.data?.message || t('common.error'));
        } finally {
            setCreating(false);
        }
    }

    async function handleDelete(id) {
        try {
            await deleteTest(id);
            message.success(t('tests.testDeleted'));
            load();
        } catch (error) {
            message.error(error?.response?.data?.message || t('common.error'));
        }
    }

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return tests;
        return tests.filter((t) => t.title.toLowerCase().includes(q));
    }, [tests, search]);

    const columns = [
        {
            title: 'Test title',
            dataIndex: 'title',
            key: 'title',
            render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
        },
        {
            title: 'Duration',
            dataIndex: 'durationMinutes',
            key: 'duration',
            width: 110,
            render: (m) => `${m} min`,
        },
        {
            title: 'Questions',
            dataIndex: 'questionCount',
            key: 'questionCount',
            width: 110,
            render: (n) => <Badge count={n} showZero color="#1677ff" />,
        },
        {
            title: 'Total pts',
            dataIndex: 'totalPoints',
            key: 'totalPoints',
            width: 100,
        },
        {
            title: 'Passing',
            dataIndex: 'passingScore',
            key: 'passingScore',
            width: 100,
            render: (s) => s || '—',
        },
        {
            title: 'Assigned to',
            dataIndex: 'assignedToCount',
            key: 'assignedToCount',
            width: 120,
            render: (n) => (
                <Badge
                    count={n}
                    showZero
                    color={n > 0 ? '#52c41a' : '#d9d9d9'}
                    overflowCount={99}
                />
            ),
        },
        { title: t('common.actions'), key: 'actions', width: 90, render: (_, record) => (<span style={{ display: 'flex', gap: 6 }}><Tooltip title={t('tests.editTest')}><Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/tests/${record._id}`)} /></Tooltip><Popconfirm title={t('tests.deleteConfirm')} description={t('tests.deleteDescription')} onConfirm={() => handleDelete(record._id)} okText={t('common.delete')} okButtonProps={{ danger: true }}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm></span>) },
    ];

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FileSearchOutlined style={{ fontSize: 20 }} />
                    <h4 style={{ margin: 0 }}>{t('tests.libraryTitle')}</h4>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Search placeholder={t('tests.searchPlaceholder')} allowClear style={{ width: 260 }} value={search} onChange={(e) => setSearch(e.target.value)} />
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>{t('tests.newTest')}</Button>
                </div>
            </div>
            <Table
                rowKey="_id"
                columns={columns}
                dataSource={filtered}
                loading={loading}
                pagination={{ pageSize: 15 }}
            />

            <Modal title={t('tests.createModal')} open={createOpen} onCancel={() => { setCreateOpen(false); form.resetFields(); }} onOk={() => form.submit()} okText={t('tests.createAndEdit')} confirmLoading={creating} destroyOnClose>
                <Form form={form} layout="vertical" onFinish={handleCreate} style={{ marginTop: 12 }}>
                    <Form.Item label={t('common.title')} name="title" rules={[{ required: true, message: t('tests.titleRequired') }]}><Input placeholder={t('tests.titlePlaceholder')} /></Form.Item>
                    <Form.Item label={t('common.description')} name="description"><Input.TextArea rows={2} placeholder={t('common.optional')} /></Form.Item>
                    <Form.Item label={t('tests.durationMinutes')} name="durationMinutes" rules={[{ required: true, message: t('tests.durationRequired') }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
                    <Form.Item label={t('tests.passingScore')} name="passingScore"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TestLibrary;

