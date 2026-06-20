import {Divider, Form, Input, Button, DatePicker, Select, message, Upload, Avatar} from 'antd';
import {UserOutlined, CameraOutlined} from '@ant-design/icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { uploadFile } from '../api/files';
import { createUser } from '../api/users';
import { ROLE_OPTIONS } from '../constants/enums';

const AddUser = () => {
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const { t } = useTranslation();

  const beforeUpload = (file) => {
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    return false;
  };

  async function onFinish(values) {
    try {
      let avatarFilename = null;
      if (avatarFile) {
        const uploadRes = await uploadFile(avatarFile);
        avatarFilename = uploadRes.data.file.filename;
      }
      const response = await createUser(values, avatarFilename);
      message.success(response.data.message);
    } catch (error) {
      message.error(error?.response?.data?.message || t('common.errorOccurred'));
    }
  }

  return (
    <div>
      <h4>{t('addUser.title')}</h4>
      <Divider />
      <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24}}>
        <Avatar size={80} src={avatarPreview || undefined} icon={!avatarPreview && <UserOutlined />} />
        <Upload beforeUpload={beforeUpload} showUploadList={false} accept="image/*">
          <Button icon={<CameraOutlined />}>
            {avatarPreview ? t('profile.changePicture') : t('profile.addPicture')}
          </Button>
        </Upload>
      </div>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item label={t('common.email')} name='email' rules={[{required: true, message: t('auth.emailRequired')}]}>
          <Input />
        </Form.Item>
        <Form.Item label={t('common.firstName')} name='firstName' rules={[{required: true, message: t('auth.firstNameRequired')}]}>
          <Input />
        </Form.Item>
        <Form.Item label={t('common.lastName')} name='lastName' rules={[{required: true, message: t('auth.lastNameRequired')}]}>
          <Input />
        </Form.Item>
        <Form.Item label={t('common.password')} name='password' rules={[
          {required: true, message: t('auth.passwordRequired')},
          {min: 8, message: t('auth.passwordMin')},
        ]}>
          <Input.Password />
        </Form.Item>
        <Form.Item label={t('auth.confirmPassword')} name='confirmPassword' rules={[
          {required: true, message: t('auth.confirmPasswordRequired')},
          {min: 8, message: t('auth.passwordMin')},
        ]}>
          <Input.Password />
        </Form.Item>
        <Form.Item label={t('profile.dob')} name='dob'>
          <DatePicker style={{width: '100%'}} />
        </Form.Item>
        <Form.Item label={t('addUser.accountType')} name='role' rules={[{required: true, message: t('addUser.accountTypeRequired')}]}>
          <Select options={ROLE_OPTIONS} />
        </Form.Item>
        <Button type='primary' htmlType='submit'>{t('common.create')}</Button>
      </Form>
    </div>
  );
};

export default AddUser;
