import { AppstoreOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

/**
 * Branded split-screen shell for the auth pages (login, signup, reset, etc.).
 * Left: gradient brand panel (hidden on small screens). Right: centered form card.
 */
const AuthLayout = ({ title, subtitle, children }) => {
    const { t } = useTranslation();

    const bullets = [
        t('auth.perk1'),
        t('auth.perk2'),
        t('auth.perk3'),
    ];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: '#f5f6fa' }}>
            {/* Brand panel */}
            <div
                className="auth-brand-panel"
                style={{
                    flex: '1 1 46%',
                    background:
                        'linear-gradient(150deg, #0e9a9a 0%, #13c2c2 42%, #1677ff 100%)',
                    color: '#fff',
                    padding: '56px 56px',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <div
                    aria-hidden
                    style={{
                        position: 'absolute',
                        width: 420,
                        height: 420,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.08)',
                        top: -120,
                        right: -120,
                    }}
                />
                <div
                    aria-hidden
                    style={{
                        position: 'absolute',
                        width: 260,
                        height: 260,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.06)',
                        bottom: -80,
                        left: -60,
                    }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
                    <div
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            background: 'rgba(255,255,255,0.18)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(4px)',
                        }}
                    >
                        <AppstoreOutlined style={{ fontSize: 24 }} />
                    </div>
                    <div style={{ lineHeight: 1.1 }}>
                        <div style={{ fontWeight: 800, fontSize: 22 }}>Screening</div>
                        <div style={{ fontSize: 12, opacity: 0.85 }}>{t('nav.platform')}</div>
                    </div>
                </div>

                <div style={{ position: 'relative', maxWidth: 460 }}>
                    <h1 style={{ fontSize: 34, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                        {t('auth.heroTitle')}
                    </h1>
                    <p style={{ fontSize: 16, opacity: 0.9, marginTop: 16, lineHeight: 1.6 }}>
                        {t('auth.heroSubtitle')}
                    </p>
                    <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {bullets.map((b) => (
                            <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <CheckCircleFilled style={{ fontSize: 18 }} />
                                <span style={{ fontSize: 15 }}>{b}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ position: 'relative', fontSize: 12, opacity: 0.75 }}>
                    © {new Date().getFullYear()} Screening · {t('nav.platform')}
                </div>
            </div>

            {/* Form panel */}
            <div
                style={{
                    flex: '1 1 54%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '32px 20px',
                }}
            >
                <div style={{ width: '100%', maxWidth: 400 }}>
                    <div style={{ marginBottom: 24 }}>
                        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>{title}</h2>
                        {subtitle && (
                            <p style={{ margin: '6px 0 0', color: 'rgba(0,0,0,0.45)' }}>{subtitle}</p>
                        )}
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
