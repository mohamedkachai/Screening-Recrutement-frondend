import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Button, Drawer, Form, Input, DatePicker, Select, message, Avatar, Upload } from "antd";
import dayjs from "dayjs";
import { format } from "date-fns";
import { CameraOutlined, UserOutlined } from "@ant-design/icons";
import { uploadFile } from "../api/files";
import { updateUser } from "../api/users";
import { ROLE_OPTIONS } from "../constants/enums";
import { fileUrl } from "../utils/files";

const EditUserDrawer = (props) => {
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();
    const [avatar, setAvatar] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const { userDetails, refresh, setRefresh } = props;
    const { t } = useTranslation();

    const showDrawer = () => {
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        form.setFieldsValue({
            ...userDetails,
            ...(userDetails.dob && { dob: dayjs(userDetails.dob) })
        });

        setAvatar(userDetails.avatar);
    }, [])

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

            const response = await updateUser(userDetails._id, payload);

            message.success(response.data.message);
            setRefresh(!refresh);
            onClose();
        } catch (error) {
            message.error(error.response.data.message);
        }
    }
    return (
        <>
            <Button type='primary' size='small' onClick={showDrawer}>
                {t('editUserDrawer.triggerBtn')}
            </Button>
            <Drawer title={t('editUserDrawer.title')} closable={{ 'aria-label': 'Close Button' }} onClose={onClose} open={open}>
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
                <Form onFinish={onFinish} form={form} layout="vertical">
                    <Form.Item label={t('common.email')} name='email' rules={[{ required: true, message: t('auth.emailRequired') }]}><Input /></Form.Item>
                    <Form.Item label={t('common.firstName')} name='firstName' rules={[{ required: true, message: t('auth.firstNameRequired') }]}><Input /></Form.Item>
                    <Form.Item label={t('common.lastName')} name='lastName' rules={[{ required: true, message: t('auth.lastNameRequired') }]}><Input /></Form.Item>
                    <Form.Item label={t('editUserDrawer.dob')} name='dob'><DatePicker style={{ width: "100%" }} /></Form.Item>
                    <Form.Item label={t('editUserDrawer.accountType')} name='role' rules={[{ required: true, message: t('editUserDrawer.accountTypeRequired') }]}><Select options={ROLE_OPTIONS} /></Form.Item>
                    <Button type='primary' htmlType='submit'>{t('editUserDrawer.editBtn')}</Button>
                </Form>
            </Drawer>
        </>
    );
}

export default EditUserDrawer