import { useContext, useState, useEffect } from 'react';
import {
    Avatar,
    Button,
    Card,
    Descriptions,
    Divider,
    Form,
    Input,
    InputNumber,
    Select,
    Switch,
    DatePicker,
    Tag,
    Upload,
    message,
    Space,
    Row,
    Col,
} from 'antd';
import {
    EditOutlined,
    LockOutlined,
    SaveOutlined,
    CloseOutlined,
    UserOutlined,
    CameraOutlined,
    FilePdfOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { format } from 'date-fns';
import { AuthContext } from '../contexts/AuthContext';
import { uploadFile } from '../api/files';
import { updateMyProfile } from '../api/users';
import { fileUrl } from '../utils/files';
import { ROLE_COLORS, WORK_MODE_OPTIONS } from '../constants/enums';

const Profile = () => {
    const { user, refreshUser } = useContext(AuthContext);
    const [form] = Form.useForm();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [cvFile, setCvFile] = useState(null);
    const [diplomaFiles, setDiplomaFiles] = useState([]);
    const [diplomas, setDiplomas] = useState([]);
    const { t } = useTranslation();

    useEffect(() => {
        if (user && editing) {
            form.setFieldsValue({
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                country: user.country,
                address: user.address,
                yearsOfExperience: user.yearsOfExperience,
                skills: user.skills,
                linkedinUrl: user.linkedinUrl,
                portfolioUrl: user.portfolioUrl,
                workMode: user.workMode,
                willingToRelocate: user.willingToRelocate,
                dob: user.dob ? dayjs(user.dob) : undefined,
                expectedSalaryAmount: user.expectedSalary?.amount,
                expectedSalaryCurrency: user.expectedSalary?.currency || 'USD',
            });
            setDiplomas(user.diplomas || []);
        }
    }, [user, editing, form]);

    if (!user) {
        return null;
    }

    const startEdit = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
        setCvFile(null);
        setDiplomaFiles([]);
        setEditing(true);
    };

    const cancelEdit = () => {
        setEditing(false);
        form.resetFields();
    };

    const beforeAvatarUpload = (file) => {
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
        return false;
    };

    const beforeCvUpload = (file) => {
        setCvFile(file);
        return false;
    };

    const beforeDiplomaUpload = (file) => {
        setDiplomaFiles((prev) => [...prev, file]);
        return false;
    };

    async function uploadIfNeeded(file) {
        if (!file) {
            return null;
        }
        const res = await uploadFile(file);
        return res.data.file.filename;
    }

    async function onFinish(values) {
        try {
            setSaving(true);

            const avatarFilename = avatarFile ? await uploadIfNeeded(avatarFile) : user.avatar;
            const cvFilename = cvFile ? await uploadIfNeeded(cvFile) : user.cv;

            let nextDiplomas = diplomas;
            if (diplomaFiles.length > 0) {
                const uploaded = await Promise.all(diplomaFiles.map((f) => uploadIfNeeded(f)));
                nextDiplomas = [...nextDiplomas, ...uploaded.filter(Boolean)];
            }

            const { expectedSalaryAmount, expectedSalaryCurrency, ...rest } = values;

            const payload = {
                ...rest,
                dob: values.dob ? format(values.dob.toDate(), 'yyyy-MM-dd') : undefined,
                avatar: avatarFilename,
                cv: cvFilename,
                diplomas: nextDiplomas,
                expectedSalary: expectedSalaryAmount
                    ? { amount: expectedSalaryAmount, currency: expectedSalaryCurrency || 'USD' }
                    : undefined,
            };

            await updateMyProfile(payload);
            await refreshUser();
            message.success('Profile updated successfully');
            setEditing(false);
        } catch (error) {
            message.error(error?.response?.data?.message || 'Something went wrong');
        } finally {
            setSaving(false);
        }
    }

    const removeDiploma = (filename) => {
        setDiplomas((prev) => prev.filter((d) => d !== filename));
    };

    if (editing) {
        return (
            <div>
                <h4>{t('profile.editTitle')}</h4>
                <Divider />
                <Card style={{ maxWidth: 800 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                        <Avatar
                            size={80}
                            src={avatarPreview || fileUrl(user.avatar)}
                            icon={!avatarPreview && !user.avatar && <UserOutlined />}
                        />
                        <Upload beforeUpload={beforeAvatarUpload} showUploadList={false} accept="image/*">
                            <Button icon={<CameraOutlined />}>
                                {avatarPreview ? t('profile.changePicture') : t('profile.updatePicture')}
                            </Button>
                        </Upload>
                    </div>
                    <Form form={form} layout="vertical" onFinish={onFinish}>
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item label={t('profile.firstName')} name="firstName" rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label={t('profile.lastName')} name="lastName" rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label={t('profile.phone')} name="phone">
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label={t('profile.dob')} name="dob">
                                    <DatePicker style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label={t('profile.country')} name="country">
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label={t('profile.address')} name="address">
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label={t('profile.yearsOfExperience')} name="yearsOfExperience">
                                    <InputNumber min={0} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label={t('profile.skills')} name="skills">
                                    <Select mode="tags" placeholder={t('profile.skillsPlaceholder')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label={t('profile.linkedin')} name="linkedinUrl">
                                    <Input placeholder="https://linkedin.com/in/..." />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label={t('profile.portfolio')} name="portfolioUrl">
                                    <Input placeholder="https://..." />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label={t('profile.expectedSalary')}>
                                    <Space.Compact style={{ width: '100%' }}>
                                        <Form.Item name="expectedSalaryAmount" noStyle>
                                            <InputNumber min={0} style={{ width: '70%' }} placeholder="Amount" />
                                        </Form.Item>
                                        <Form.Item name="expectedSalaryCurrency" noStyle initialValue="USD">
                                            <Input style={{ width: '30%' }} placeholder="USD" />
                                        </Form.Item>
                                    </Space.Compact>
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label={t('profile.workMode')} name="workMode">
                                    <Select options={WORK_MODE_OPTIONS} allowClear />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label={t('profile.willingToRelocate')} name="willingToRelocate" valuePropName="checked">
                                    <Switch />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Divider orientation="left">{t('profile.documents')}</Divider>

                        <Form.Item label={t('profile.cv')}>
                            <Space direction="vertical">
                                {user.cv && !cvFile && (
                                    <a href={fileUrl(user.cv)} target="_blank" rel="noreferrer">
                                        <FilePdfOutlined /> {t('profile.currentCv')}
                                    </a>
                                )}
                                <Upload beforeUpload={beforeCvUpload} showUploadList={false} accept=".pdf">
                                    <Button icon={<UploadOutlined />}>{cvFile ? cvFile.name : t('profile.uploadCv')}</Button>
                                </Upload>
                            </Space>
                        </Form.Item>

                        <Form.Item label={t('profile.diplomas')}>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                {diplomas.map((d) => (
                                    <Space key={d}>
                                        <a href={fileUrl(d)} target="_blank" rel="noreferrer">
                                            <FilePdfOutlined /> {d}
                                        </a>
                                        <Button size="small" type="link" danger onClick={() => removeDiploma(d)}>
                                            {t('common.remove')}
                                        </Button>
                                    </Space>
                                ))}
                                <Upload beforeUpload={beforeDiplomaUpload} showUploadList multiple accept=".pdf,image/*">
                                    <Button icon={<UploadOutlined />}>{t('profile.addDiploma')}</Button>
                                </Upload>
                            </Space>
                        </Form.Item>

                        <Space>
                            <Button type="primary" htmlType="submit" loading={saving} icon={<SaveOutlined />}>
                                {t('common.save')}
                            </Button>
                            <Button onClick={cancelEdit} icon={<CloseOutlined />} disabled={saving}>
                                {t('common.cancel')}
                            </Button>
                        </Space>
                    </Form>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>{t('profile.title')}</h4>
                <Space>
                    <Button icon={<EditOutlined />} onClick={startEdit}>{t('profile.editBtn')}</Button>
                    <Link to="/change-password">
                        <Button icon={<LockOutlined />}>{t('profile.changePasswordBtn')}</Button>
                    </Link>
                </Space>
            </div>
            <Divider />
            <Card style={{ maxWidth: 800 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                    <Avatar
                        src={fileUrl(user.avatar)}
                        icon={!user.avatar && <UserOutlined />}
                        size={80}
                    />
                    <div>
                        <h3 style={{ margin: 0 }}>{user.firstName} {user.lastName}</h3>
                        <Tag color={ROLE_COLORS[user.role]}>{user.role}</Tag>
                        {!user.profileCompleted && <Tag color="orange">{t('profile.incomplete')}</Tag>}
                    </div>
                </div>
                <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label={t('common.email')}>{user.email}</Descriptions.Item>
                    <Descriptions.Item label={t('profile.phone')}>{user.phone || '-'}</Descriptions.Item>
                    <Descriptions.Item label={t('profile.dob')}>
                        {user.dob ? new Date(user.dob).toLocaleDateString() : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('profile.country')}>{user.country || '-'}</Descriptions.Item>
                    <Descriptions.Item label={t('profile.address')}>{user.address || '-'}</Descriptions.Item>
                    <Descriptions.Item label={t('profile.yearsOfExperience')}>
                        {user.yearsOfExperience ?? '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('profile.skills')}>
                        {user.skills?.length ? user.skills.map((s) => <Tag key={s}>{s}</Tag>) : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('profile.linkedin')}>
                        {user.linkedinUrl ? (
                            <a href={user.linkedinUrl} target="_blank" rel="noreferrer">{user.linkedinUrl}</a>
                        ) : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('profile.portfolio')}>
                        {user.portfolioUrl ? (
                            <a href={user.portfolioUrl} target="_blank" rel="noreferrer">{user.portfolioUrl}</a>
                        ) : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('profile.expectedSalary')}>
                        {user.expectedSalary?.amount
                            ? `${user.expectedSalary.amount} ${user.expectedSalary.currency || 'USD'}`
                            : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('profile.workMode')}>{user.workMode || '-'}</Descriptions.Item>
                    <Descriptions.Item label={t('profile.willingToRelocate')}>
                        {user.willingToRelocate ? t('common.yes') : t('common.no')}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('profile.cv')}>
                        {user.cv ? (
                            <a href={fileUrl(user.cv)} target="_blank" rel="noreferrer">
                                <FilePdfOutlined /> {t('profile.viewCv')}
                            </a>
                        ) : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('profile.diplomas')}>
                        {user.diplomas?.length ? (
                            <Space direction="vertical">
                                {user.diplomas.map((d) => (
                                    <a key={d} href={fileUrl(d)} target="_blank" rel="noreferrer">
                                        <FilePdfOutlined /> {d}
                                    </a>
                                ))}
                            </Space>
                        ) : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('profile.memberSince')}>
                        {new Date(user.createdAt).toLocaleDateString()}
                    </Descriptions.Item>
                </Descriptions>
            </Card>
        </div>
    );
};

export default Profile;
