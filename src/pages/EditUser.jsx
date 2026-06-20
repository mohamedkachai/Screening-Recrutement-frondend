import { Divider, Form, Input, Button, DatePicker, Select, message, Avatar, Upload } from 'antd'
import { format } from 'date-fns';
import dayjs from 'dayjs'
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { CameraOutlined, UserOutlined } from '@ant-design/icons';
import { uploadFile } from '../api/files';
import { getUserById, updateUser } from '../api/users';
import { ROLE_OPTIONS } from '../constants/enums';
import { fileUrl } from '../utils/files';

const EditUser = () => {
  const [form] = Form.useForm();
  const [avatar, setAvatar] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const { t } = useTranslation();

  const { id } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    async function getById() {
      try {
        const response = await getUserById(id);

        form.setFieldsValue({
          ...response.data.user,
          ...(response.data.user.dob && { dob: dayjs(response.data.user.dob) })
        });

        setAvatar(response.data.user.avatar);
      } catch (error) {
        message.error(error.response.data.message);
      }
    }

    if (id) {
      // Call API And setFieldsValue;
      getById();
    }
  }, [id])

  const beforeUpload = (file) => {
    setAvatarFile(file);

    setAvatarPreview(URL.createObjectURL(file));
    return false;
  }

  async function onFinish(values) {
    try {
      let avatarFilename = avatar;

      if (avatarFile) {

        const uploadRes = await uploadFile(avatarFile);

        avatarFilename = uploadRes.data.file.filename;
      }
      
      const payload = {
        ...values,
        dob: values.dob ? format(values.dob, "yyyy-MM-dd") : undefined,
        avatar: avatarFilename
      }

      const response = await updateUser(id, payload);

      message.success(response.data.message);
      navigate('/user/list');
    } catch (error) {
      message.error(error.response.data.message);
    }
  }

  return (
    <div>
      <h4>{t('editUserDrawer.title')}</h4>
      <Divider />
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <Avatar
          size={80}
          src={avatarPreview || fileUrl(avatar)}
          icon={!avatarPreview && !avatar && <UserOutlined />}
        />
        <Upload beforeUpload={beforeUpload} showUploadList={false} accept={"image/*"}>
          <Button icon={<CameraOutlined />}>
            {avatarPreview ? t('profile.changePicture') : t('profile.addPicture')}
          </Button>
        </Upload>
      </div>
      <Form onFinish={onFinish} form={form}>
        <Form.Item label={t('common.email')} name='email' rules={[{ required: true, message: t('auth.emailRequired') }]}><Input /></Form.Item>
        <Form.Item label={t('common.firstName')} name='firstName' rules={[{ required: true, message: t('auth.firstNameRequired') }]}><Input /></Form.Item>
        <Form.Item label={t('common.lastName')} name='lastName' rules={[{ required: true, message: t('auth.lastNameRequired') }]}><Input /></Form.Item>
        <Form.Item label={t('editUserDrawer.dob')} name='dob'><DatePicker style={{ width: "100%" }} /></Form.Item>
        <Form.Item label={t('editUserDrawer.accountType')} name='role' rules={[{ required: true, message: t('editUserDrawer.accountTypeRequired') }]}><Select options={ROLE_OPTIONS} /></Form.Item>
        <Button type='primary' htmlType='submit'>{t('editUserDrawer.editBtn')}</Button>
      </Form>
    </div>
  )
}
// email, firstName, lastName, password, confirmPassword, dob, role
export default EditUser