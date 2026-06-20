import { Divider, message, Space, Table, Tag, Button, Avatar } from 'antd'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns'
import EditUserDrawer from '../components/EditUserDrawer';
import UserDetailsDrawer from '../components/UserDetailsDrawer';
import { UserOutlined } from '@ant-design/icons';
import { listUsers } from '../api/users';
import { fileUrl } from '../utils/files';
import { ROLE_COLORS } from '../constants/enums';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const { t } = useTranslation();

  const columns = [
    {
      title: t('usersList.avatar'),
      dataIndex: 'avatar',
      key: 'avatar',
      render: (avatar) => (
        <Avatar
          src={fileUrl(avatar)}
          icon={!avatar && <UserOutlined />}
        />
      ),
    },
    {
      title: t('common.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => format(text, 'yyyy-MM-dd HH:mm'),
    },
    {
      title: t('common.firstName'),
      dataIndex: 'firstName',
      key: 'firstName',
    },
    {
      title: t('common.lastName'),
      dataIndex: 'lastName',
      key: 'lastName',
    },
    {
      title: t('common.email'),
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: t('usersList.accountType'),
      dataIndex: 'role',
      key: 'role',
      render: (text) => <Tag color={ROLE_COLORS[text]}>{text}</Tag>,
    },
    {
      title: t('common.actions'),
      render: (_, record) => (
        <Space>
          <UserDetailsDrawer userDetails={record} />
          <EditUserDrawer userDetails={record} refresh={refresh} setRefresh={setRefresh} />
        </Space>
      ),
    },
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await listUsers();
        setUsers(response.data.users);
      } catch (error) {
        message.error(error.message || 'Something went wrong');
      }
    }
    fetchData();
  }, [refresh]);

  return (
    <div>
      <h4>{t('usersList.title')}</h4>
      <Divider />
      <Table columns={columns} dataSource={users} scroll={{ x: 'max-content' }} />
    </div>
  );
};

export default UsersList;