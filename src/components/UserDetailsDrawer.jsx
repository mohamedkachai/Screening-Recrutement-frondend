import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Avatar, Descriptions, Drawer, Space, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { fileUrl } from '../utils/files';
import { ROLE_COLORS } from '../constants/enums';

const UserDetailsDrawer = ({ userDetails, triggerText, width = 420 }) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  if (!userDetails) {
    return null;
  }

  const createdAt = userDetails.createdAt
    ? format(new Date(userDetails.createdAt), 'yyyy-MM-dd HH:mm')
    : '-';
  const dob = userDetails.dob ? format(new Date(userDetails.dob), 'yyyy-MM-dd') : '-';

  return (
    <>
      <Button type="link" size="small" onClick={() => setOpen(true)}>
        {triggerText || t('usersList.details')}
      </Button>
      <Drawer
        title={t('usersList.details')}
        width={width}
        closable={{ 'aria-label': 'Close Button' }}
        onClose={() => setOpen(false)}
        open={open}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <Avatar
            size={80}
            src={fileUrl(userDetails.avatar)}
            icon={!userDetails.avatar && <UserOutlined />}
          />
          <div>
            <h3 style={{ margin: 0 }}>
              {`${userDetails.firstName || ''} ${userDetails.lastName || ''}`.trim() || userDetails.email}
            </h3>
            {userDetails.role && (
              <Tag color={ROLE_COLORS[userDetails.role] || 'default'}>{userDetails.role}</Tag>
            )}
          </div>
        </div>

        <Descriptions column={1} size="small">
          <Descriptions.Item label={t('common.email')}>
            {userDetails.email || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('common.firstName')}>
            {userDetails.firstName || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('common.lastName')}>
            {userDetails.lastName || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('editUserDrawer.dob')}>
            {dob}
          </Descriptions.Item>
          <Descriptions.Item label={t('usersList.accountType')}>
            {userDetails.role || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('common.createdAt')}>
            {createdAt}
          </Descriptions.Item>
        </Descriptions>
      </Drawer>
    </>
  );
};

export default UserDetailsDrawer;
