import { Button, Divider, Popconfirm, Space, Table, Tag, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { listInvitations, revokeInvitation } from '../../api/invitations';
import BatchInviteButton from '../../components/BatchInviteButton';
import InviteCandidateButton from '../../components/InviteCandidateButton';

const InvitationsList = () => {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const res = await listInvitations();
                setInvitations(res.data.invitations);
            } catch (error) {
                message.error(error?.response?.data?.message || t('common.loadError'));
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [refresh]);

    const triggerRefresh = () => setRefresh((r) => !r);

    async function handleRevoke(id) {
        try {
            await revokeInvitation(id);
            message.success(t('invitation.revoked'));
            triggerRefresh();
        } catch (error) {
            message.error(error?.response?.data?.message || t('invitation.revokeFailed'));
        }
    }

    const statusOf = (record) => {
        if (record.acceptedAt) return <Tag color="green">{t('invitation.accepted')}</Tag>;
        if (new Date(record.expiresAt) < new Date()) return <Tag color="red">{t('invitation.expired')}</Tag>;
        return <Tag color="gold">{t('invitation.pending')}</Tag>;
    };

    const columns = [
        { title: t('common.email'), dataIndex: 'email', key: 'email' },
        {
            title: t('offers.pageTitle'),
            key: 'offer',
            render: (_, r) => r.offerId?.title || <span style={{ color: '#aaa' }}>({t('invitation.platformWide')})</span>,
        },
        {
            title: t('invitation.invitedBy'),
            key: 'invitedBy',
            render: (_, r) => r.invitedBy ? `${r.invitedBy.firstName} ${r.invitedBy.lastName}` : '-',
        },
        {
            title: t('invitation.sent'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (d) => format(new Date(d), 'yyyy-MM-dd HH:mm'),
        },
        {
            title: t('invitation.expires'),
            dataIndex: 'expiresAt',
            key: 'expiresAt',
            render: (d) => format(new Date(d), 'yyyy-MM-dd HH:mm'),
        },
        { title: t('applications.status'), key: 'status', render: (_, r) => statusOf(r) },
        {
            title: t('common.actions'),
            key: 'actions',
            render: (_, record) =>
                !record.acceptedAt && (
                    <Popconfirm
                        title={t('invitation.revokeConfirm')}
                        onConfirm={() => handleRevoke(record._id)}
                        okText={t('invitation.revokeBtn')}
                        okButtonProps={{ danger: true }}
                    >
                        <Button size="small" danger icon={<DeleteOutlined />}>
                            {t('invitation.revokeBtn')}
                        </Button>
                    </Popconfirm>
                ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>{t('invitation.title')}</h4>
                <Space>
                    <BatchInviteButton onSent={triggerRefresh} />
                    <InviteCandidateButton onSent={triggerRefresh} buttonProps={{ type: 'primary' }} />
                </Space>
            </div>
            <Divider />
            <Table rowKey="_id" columns={columns} dataSource={invitations} loading={loading} scroll={{ x: 'max-content' }} />
        </div>
    );
};

export default InvitationsList;
