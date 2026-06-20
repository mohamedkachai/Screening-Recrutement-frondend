import {
    Badge,
    Button,
    Card,
    Divider,
    Empty,
    Popconfirm,
    Space,
    Table,
    Tag,
    message,
    Modal,
    Input,
} from 'antd';
import {
    ArrowLeftOutlined,
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    LinkOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { assignTest, listAllTests, listTests, unassignTest } from '../../api/tests';

const { Search } = Input;

const TestsList = () => {
    const { offerId } = useParams();
    const navigate = useNavigate();
    const [offer, setOffer] = useState(null);
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assignOpen, setAssignOpen] = useState(false);
    const [library, setLibrary] = useState([]);
    const [libraryLoading, setLibraryLoading] = useState(false);
    const [assigningId, setAssigningId] = useState(null);
    const [libSearch, setLibSearch] = useState('');
    const { t } = useTranslation();

    const load = async () => {
        try {
            setLoading(true);
            const res = await listTests(offerId);
            setOffer(res.data.offer);
            setTests(res.data.tests);
        } catch (error) {
            message.error(error?.response?.data?.message || t('common.failedToLoad'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [offerId]);

    async function openAssignModal() {
        setAssignOpen(true);
        try {
            setLibraryLoading(true);
            const res = await listAllTests();
            // Exclude already-assigned tests
            const assignedIds = new Set(tests.map((t) => t._id));
            setLibrary(res.data.tests.filter((t) => !assignedIds.has(t._id)));
        } catch (error) {
            message.error(error?.response?.data?.message || t('common.failedToLoad') + ' test library');
        } finally {
            setLibraryLoading(false);
        }
    }

    async function handleAssign(testId) {
        try {
            setAssigningId(testId);
            await assignTest(testId, offerId);
            message.success(t('tests.testAdded'));
            setAssignOpen(false);
            setLibSearch('');
            load();
        } catch (error) {
            message.error(error?.response?.data?.message || t('common.error'));
        } finally {
            setAssigningId(null);
        }
    }

    async function handleUnassign(testId) {
        try {
            await unassignTest(testId, offerId);
            message.success(t('tests.testRemoved'));
            load();
        } catch (error) {
            message.error(error?.response?.data?.message || t('common.error'));
        }
    }

    const filteredLibrary = useMemo(() => {
        const q = libSearch.trim().toLowerCase();
        if (!q) return library;
        return library.filter((t) => t.title.toLowerCase().includes(q));
    }, [library, libSearch]);

    const columns = [
        {
            title: '#',
            key: 'index',
            width: 50,
            render: (_, __, index) => index + 1,
        },
        { title: 'Title', dataIndex: 'title', key: 'title' },
        {
            title: 'Duration',
            dataIndex: 'durationMinutes',
            key: 'duration',
            render: (m) => `${m} min`,
        },
        {
            title: 'Questions',
            dataIndex: 'questionCount',
            key: 'questionCount',
            render: (n) => <Badge count={n} showZero color="#1677ff" />,
        },
        {
            title: 'Total pts',
            dataIndex: 'totalPoints',
            key: 'totalPoints',
        },
        {
            title: 'Passing',
            dataIndex: 'passingScore',
            key: 'passingScore',
            render: (s) => s || '—',
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 110,
            render: (_, record) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/tests/${record._id}`)}
                    />
                    <Popconfirm
                        title="Remove from this offer?"
                        description={t('tests.removeDescription')}
                        onConfirm={() => handleUnassign(record._id)}
                        okText={t('common.remove')}
                        okButtonProps={{ danger: true }}
                    >
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
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
                <h4>{t('nav.tests')} {offer && `— ${offer.title}`}</h4>
                <Space>
                    <Button icon={<EyeOutlined />} onClick={() => navigate(`/offers/${offerId}`)}>
                        {t('common.view')} {t('offers.pageTitle').toLowerCase()}
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={openAssignModal}>
                        {t('tests.addFromLibrary')}
                    </Button>
                </Space>
            </div>
            <Divider />
            <Card>
                {tests.length === 0 && !loading ? (
                    <Empty description={t('tests.noTestsAssigned')} image={Empty.PRESENTED_IMAGE_SIMPLE}>
                        <Button type="primary" icon={<LinkOutlined />} onClick={openAssignModal}>
                            {t('tests.addFromLibrary')}
                        </Button>
                    </Empty>
                ) : (
                    <Table
                        rowKey="_id"
                        columns={columns}
                        dataSource={tests}
                        loading={loading}
                        pagination={false}
                    />
                )}
            </Card>

            <Modal title={t('tests.addFromLibrary')} open={assignOpen} onCancel={() => { setAssignOpen(false); setLibSearch(''); }} footer={null} width={700} destroyOnClose>
                <Search placeholder={t('tests.searchPlaceholder')} allowClear value={libSearch} onChange={(e) => setLibSearch(e.target.value)} style={{ marginBottom: 12 }} />
                {filteredLibrary.length === 0 && !libraryLoading ? (
                    <Empty description={t('tests.allAssigned')} />
                ) : (
                    <Table
                        rowKey="_id"
                        loading={libraryLoading}
                        dataSource={filteredLibrary}
                        pagination={{ pageSize: 8 }}
                        size="small"
                        columns={[
                            { title: t('common.title'), dataIndex: 'title', key: 'title' },
                            { title: t('common.questions'), dataIndex: 'questionCount', width: 100, render: (n) => <Badge count={n} showZero color="#1677ff" /> },
                            { title: t('common.duration'), dataIndex: 'durationMinutes', width: 100, render: (m) => `${m} min` },
                            {
                                title: '',
                                key: 'action',
                                width: 90,
                                render: (_, r) => (
                                    <Button
                                        size="small"
                                        type="primary"
                                        icon={<LinkOutlined />}
                                        loading={assigningId === r._id}
                                        onClick={() => handleAssign(r._id)}
                                    >
                                        {t('tests.assignBtn')}
                                    </Button>
                                ),
                            },
                        ]}
                    />
                )}
            </Modal>
        </div>
    );
};

export default TestsList;
