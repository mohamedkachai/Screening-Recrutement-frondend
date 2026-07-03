import {
    AppstoreOutlined,
    BarChartOutlined,
    ClockCircleOutlined,
    FileSearchOutlined,
    FileTextOutlined,
    HomeOutlined,
    LogoutOutlined,
    MailOutlined,
    SearchOutlined,
    SolutionOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Avatar, Alert, Dropdown, Layout, Menu, Tag, theme } from 'antd';
import { useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ROLE_COLORS, ROLES } from '../constants/enums';
import { fileUrl } from '../utils/files';

const { Sider, Header, Content } = Layout;

const PATH_TO_KEY = [
    { match: /^\/$/, key: 'home' },
    { match: /^\/offers/, key: 'offers' },
    { match: /^\/tests$/, key: 'tests' },
    { match: /^\/tests\//, key: 'offers' },
    { match: /^\/invitations/, key: 'invitations' },
    { match: /^\/results/, key: 'results' },
    { match: /^\/attempts/, key: 'results' },
    { match: /^\/browse/, key: 'browse' },
    { match: /^\/my-applications/, key: 'my-apps' },
    { match: /^\/take/, key: 'my-apps' },
    { match: /^\/user\/add/, key: 'user-add' },
    { match: /^\/user\/list/, key: 'user-list' },
    { match: /^\/logs/, key: 'logs' },
    { match: /^\/profile/, key: 'profile' },
    { match: /^\/change-password/, key: 'profile' },
];

function deriveSelectedKey(pathname) {
    const found = PATH_TO_KEY.find((p) => p.match.test(pathname));
    return found ? found.key : 'home';
}

function MainLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout, role, isAdmin, isHR, isReviewer, isCandidate } = useContext(AuthContext);
    const location = useLocation();
    const { token } = theme.useToken();
    const { t, i18n } = useTranslation();

    const selectedKey = useMemo(() => deriveSelectedKey(location.pathname), [location.pathname]);

    const link = (label, to) => <Link to={to}>{label}</Link>;

    const langItems = {
        items: [
            { key: 'en', label: '🇬🇧 English', onClick: () => i18n.changeLanguage('en') },
            { key: 'fr', label: '🇫🇷 Français', onClick: () => i18n.changeLanguage('fr') },
        ],
    };

    const LangSwitcher = () => (
        <Dropdown menu={langItems} trigger={['click']} placement="bottomRight">
            <div
                style={{
                    cursor: 'pointer',
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: '1px solid rgba(0,0,0,0.12)',
                    fontSize: 13,
                    fontWeight: 600,
                    color: token.colorTextSecondary,
                    flexShrink: 0,
                    userSelect: 'none',
                }}
            >
                {i18n.language === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
            </div>
        </Dropdown>
    );

    const items = useMemo(() => {
        const list = [
            { key: 'home', icon: <HomeOutlined />, label: link(t('nav.home'), '/') },
        ];
        // Offers / Tests / Invitations are HR-managed. Admin focuses on users & oversight.
        if (isHR) {
            list.push({ key: 'offers', icon: <FileTextOutlined />, label: link(t('nav.offers'), '/offers') });
            list.push({ key: 'tests', icon: <FileSearchOutlined />, label: link(t('nav.tests'), '/tests') });
            list.push({ key: 'invitations', icon: <MailOutlined />, label: link(t('nav.invitations'), '/invitations') });
        }
        if (isAdmin || isHR || isReviewer) {
            list.push({ key: 'results', icon: <BarChartOutlined />, label: link(t('nav.results'), '/results') });
        }
        if (isCandidate) {
            list.push({ key: 'browse', icon: <SearchOutlined />, label: link(t('nav.browseOffers'), '/browse') });
            list.push({ key: 'my-apps', icon: <SolutionOutlined />, label: link(t('nav.myApplications'), '/my-applications') });
        }
        if (isAdmin) {
            list.push({
                key: 'users',
                icon: <TeamOutlined />,
                label: t('nav.users'),
                children: [
                    { key: 'user-add', label: link(t('nav.addUser'), '/user/add') },
                    { key: 'user-list', label: link(t('nav.allUsers'), '/user/list') },
                ],
            });
            list.push({ key: 'logs', icon: <ClockCircleOutlined />, label: link(t('nav.activityLogs'), '/logs/list') });
        }
        return list;
    }, [isAdmin, isHR, isReviewer, isCandidate, t, i18n.language]);

    const dropdownItems = {
        items: [
            { key: 'profile', icon: <UserOutlined />, label: <Link to="/profile">{t('nav.profile')}</Link> },
            { key: 'change-password', icon: <UserOutlined />, label: <Link to="/change-password">{t('nav.changePassword')}</Link> },
            { type: 'divider' },
            { key: 'language', label: `${i18n.language === 'fr' ? '🇫🇷' : '🇬🇧'} ${t('nav.language')}`, children: [
                { key: 'en', label: '🇬🇧 English', onClick: () => i18n.changeLanguage('en') },
                { key: 'fr', label: '🇫🇷 Français', onClick: () => i18n.changeLanguage('fr') },
            ] },
            { type: 'divider' },
            { key: 'logout', icon: <LogoutOutlined />, label: t('nav.logout'), onClick: logout },
        ],
    };

    if (isCandidate) {
        const candidateNavItems = [
            { key: 'home', icon: <HomeOutlined />, label: link(t('nav.home'), '/') },
            { key: 'browse', icon: <SearchOutlined />, label: link(t('nav.browseOffers'), '/browse') },
            { key: 'my-apps', icon: <SolutionOutlined />, label: link(t('nav.myApplications'), '/my-applications') },
        ];

        return (
            <Layout style={{ minHeight: '100vh', background: '#f5f6fa' }}>
                <Header
                    style={{
                        padding: '0 24px',
                        background: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 24,
                        boxShadow: '0 1px 4px rgba(0,21,41,.06)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            flexShrink: 0,
                        }}
                    >
                        <div
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                background: 'linear-gradient(135deg,#1677ff,#69c0ff)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <AppstoreOutlined style={{ color: '#fff', fontSize: 18 }} />
                        </div>
                        <div style={{ lineHeight: 1.1 }}>
                            <div style={{ fontWeight: 700, fontSize: 16 }}>Screening</div>
                            <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>
                                {t('nav.platform')}
                            </div>
                        </div>
                    </div>
                    <Menu
                        mode="horizontal"
                        selectedKeys={[selectedKey]}
                        items={candidateNavItems}
                        style={{ flex: 1, border: 'none', minWidth: 0 }}
                    />
                    <Dropdown menu={dropdownItems} trigger={['click']} placement="bottomRight">
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                cursor: 'pointer',
                                padding: '4px 8px',
                                borderRadius: 8,
                                flexShrink: 0,
                            }}
                        >
                            <div style={{ textAlign: 'right', lineHeight: 1.2 }}>
                                <div style={{ fontWeight: 600 }}>
                                    {user?.firstName} {user?.lastName}
                                </div>
                                {role && (
                                    <Tag
                                        color={ROLE_COLORS?.[role] || 'blue'}
                                        style={{ marginRight: 0 }}
                                    >
                                        {role}
                                    </Tag>
                                )}
                            </div>
                            <Avatar
                                src={fileUrl(user?.avatar)}
                                icon={!user?.avatar && <UserOutlined />}
                                size={40}
                            />
                        </div>
                    </Dropdown>
                </Header>
                <Content
                    style={{
                        margin: 16,
                        padding: 24,
                        background: '#fff',
                        borderRadius: 12,
                        minHeight: 360,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    }}
                >
                    {user && !user.profileCompleted && (
                        <Alert
                            type="warning"
                            showIcon
                            banner
                            message={t('profile.incompleteTitle')}
                            description={t('profile.incompleteDesc')}
                            action={<a href="/profile" style={{ fontWeight: 600 }}>{t('nav.profile')}</a>}
                            style={{ marginBottom: 16 }}
                        />
                    )}
                    <Outlet />
                </Content>
            </Layout>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                width={232}
                style={{ boxShadow: '2px 0 8px rgba(0,0,0,0.04)' }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: collapsed ? '20px 0' : '20px 20px',
                        color: '#fff',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                    }}
                >
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: 'linear-gradient(135deg,#1677ff,#69c0ff)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <AppstoreOutlined style={{ color: '#fff', fontSize: 18 }} />
                    </div>
                    {!collapsed && (
                        <div style={{ lineHeight: 1.1 }}>
                            <div style={{ fontWeight: 700, fontSize: 16 }}>Screening</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
                                {t('nav.platform')}
                            </div>
                        </div>
                    )}
                </div>
                <Menu
                    theme="dark"
                    selectedKeys={[selectedKey]}
                    defaultOpenKeys={['users']}
                    mode="inline"
                    items={items}
                />
            </Sider>
            <Layout>
                <Header
                    style={{
                        padding: '0 24px',
                        background: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 1px 4px rgba(0,21,41,.06)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                    }}
                >
                    <div style={{ fontWeight: 600, color: token.colorTextHeading }}>
                        {selectedKey === 'home'
                            ? t('header.welcome', { name: user?.firstName ? `, ${user.firstName}` : '' })
                            : ''}
                    </div>
                    <Dropdown menu={dropdownItems} trigger={['click']} placement="bottomRight">
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                cursor: 'pointer',
                                padding: '4px 8px',
                                borderRadius: 8,
                            }}
                        >
                            <div style={{ textAlign: 'right', lineHeight: 1.2 }}>
                                <div style={{ fontWeight: 600 }}>
                                    {user?.firstName} {user?.lastName}
                                </div>
                                {role && (
                                    <Tag color={ROLE_COLORS?.[role] || 'blue'} style={{ marginRight: 0 }}>
                                        {role}
                                    </Tag>
                                )}
                            </div>
                            <Avatar
                                src={fileUrl(user?.avatar)}
                                icon={!user?.avatar && <UserOutlined />}
                                size={40}
                            />
                        </div>
                    </Dropdown>
                </Header>
                <Content
                    style={{
                        margin: 16,
                        padding: 24,
                        background: '#fff',
                        borderRadius: 12,
                        minHeight: 360,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    }}
                >
                    {isCandidate && user && !user.profileCompleted && (
                        <Alert
                            type="warning"
                            showIcon
                            banner
                            message={t('profile.incompleteTitle')}
                            description={t('profile.incompleteDesc')}
                            action={<a href="/profile" style={{ fontWeight: 600 }}>{t('nav.profile')}</a>}
                            style={{ marginBottom: 16 }}
                        />
                    )}
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}

export { ROLES };
export default MainLayout;
