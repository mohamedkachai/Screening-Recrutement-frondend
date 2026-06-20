import { Button, Divider, Dropdown, message, Popconfirm, Table, Tag } from 'antd';
import { CalendarOutlined, DeleteOutlined, EditOutlined, EllipsisOutlined, EyeOutlined, FileSearchOutlined, FileTextOutlined, PlusOutlined, TeamOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { listOffers, deleteOffer } from '../../api/offers';
import { OFFER_STATUS_COLORS, OFFER_TYPE_OPTIONS } from '../../constants/enums';

const typeLabel = (value) => OFFER_TYPE_OPTIONS.find((o) => o.value === value)?.label || value;

const OffersList = () => {
    const navigate = useNavigate();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const res = await listOffers();
                setOffers(res.data.offers);
            } catch (error) {
                message.error(error?.response?.data?.message || t('common.loadError'));
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [refresh]);

    async function handleDelete(id) {
        try {
            await deleteOffer(id);
            message.success(t('offers.deleted'));
            setRefresh((r) => !r);
        } catch (error) {
            message.error(error?.response?.data?.message || t('common.deleteError'));
        }
    }

    const columns = [
        { title: t('offers.title'), dataIndex: 'title', key: 'title' },
        { title: t('common.type'), dataIndex: 'type', key: 'type', render: typeLabel },
        { title: t('common.location'), dataIndex: 'location', key: 'location' },
        {
            title: t('common.status'),
            dataIndex: 'status',
            key: 'status',
            render: (s) => <Tag color={OFFER_STATUS_COLORS[s]}>{s}</Tag>,
        },
        {
            title: t('common.deadline'),
            dataIndex: 'deadline',
            key: 'deadline',
            render: (d) => (d ? format(new Date(d), 'yyyy-MM-dd') : '-'),
        },
        {
            title: t('common.createdAt'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (d) => format(new Date(d), 'yyyy-MM-dd'),
        },
        {
            title: t('common.actions'),
            key: 'actions',
            width: 80,
            render: (_, record) => {
                const menuItems = [
                    { key: 'view', icon: <EyeOutlined />, label: t('common.view'), onClick: () => navigate(`/offers/${record._id}`) },
                    { key: 'tests', icon: <FileSearchOutlined />, label: t('nav.tests'), onClick: () => navigate(`/offers/${record._id}/tests`) },
                    { key: 'session', icon: <CalendarOutlined />, label: t('nav.session'), onClick: () => navigate(`/offers/${record._id}/session`) },
                    { key: 'attempts', icon: <FileTextOutlined />, label: t('nav.attempts'), onClick: () => navigate(`/offers/${record._id}/attempts`) },
                    { key: 'applications', icon: <TeamOutlined />, label: t('nav.applications'), onClick: () => navigate(`/offers/${record._id}/applications`) },
                    { type: 'divider' },
                    { key: 'edit', icon: <EditOutlined />, label: t('common.edit'), onClick: () => navigate(`/offers/${record._id}/edit`) },
                    {
                        key: 'delete',
                        icon: <DeleteOutlined />,
                        label: (
                            <Popconfirm
                                title={t('offers.deleteConfirm')}
                                onConfirm={() => handleDelete(record._id)}
                                okText={t('common.delete')}
                                okButtonProps={{ danger: true }}
                                onPopupClick={(e) => e.stopPropagation()}
                            >
                                <span style={{ color: '#ff4d4f' }}>{t('common.delete')}</span>
                            </Popconfirm>
                        ),
                        danger: true,
                    },
                ];

                return (
                    <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                        <Button size="small" icon={<EllipsisOutlined />} />
                    </Dropdown>
                );
            },
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>{t('offers.pageTitle')}</h4>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/offers/new')}>
                    {t('offers.newOffer')}
                </Button>
            </div>
            <Divider />
            <Table rowKey="_id" columns={columns} dataSource={offers} loading={loading} />
        </div>
    );
};

export default OffersList;
