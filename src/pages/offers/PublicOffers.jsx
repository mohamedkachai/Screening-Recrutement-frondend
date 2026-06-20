import { Card, Col, Divider, Empty, Input, Row, Select, Space, Tag, message, Spin } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { EnvironmentOutlined, ClockCircleOutlined, DollarOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { listPublicOffers } from '../../api/offers';
import { OFFER_TYPE_OPTIONS } from '../../constants/enums';

const typeLabel = (value) => OFFER_TYPE_OPTIONS.find((o) => o.value === value)?.label || value;

const PublicOffers = () => {
    const navigate = useNavigate();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState();
    const { t } = useTranslation();

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await listPublicOffers();
                setOffers(res.data.offers);
            } catch (error) {
                message.error(error?.response?.data?.message || t('common.loadError'));
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const filtered = useMemo(() => {
        return offers.filter((o) => {
            if (typeFilter && o.type !== typeFilter) {
                return false;
            }
            if (search) {
                const q = search.toLowerCase();
                return (
                    o.title.toLowerCase().includes(q) ||
                    o.description.toLowerCase().includes(q) ||
                    (o.location || '').toLowerCase().includes(q) ||
                    (o.requiredSkills || []).some((s) => s.toLowerCase().includes(q))
                );
            }
            return true;
        });
    }, [offers, search, typeFilter]);

    return (
        <div>
            <h4>{t('publicOffers.title')}</h4>
            <Divider />
            <Space style={{ marginBottom: 16 }} wrap>
                <Input.Search
                    placeholder={t('publicOffers.searchPlaceholder')}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: 320 }}
                    allowClear
                />
                <Select
                    placeholder={t('publicOffers.filterByType')}
                    options={OFFER_TYPE_OPTIONS}
                    onChange={setTypeFilter}
                    allowClear
                    style={{ width: 200 }}
                />
            </Space>
            {loading ? (
                <Spin />
            ) : filtered.length === 0 ? (
                <Empty description={t('publicOffers.noResults')} />
            ) : (
                <Row gutter={[16, 16]}>
                    {filtered.map((offer) => (
                        <Col xs={24} md={12} lg={8} key={offer._id}>
                            <Card
                                hoverable
                                title={offer.title}
                                onClick={() => navigate(`/offers/${offer._id}`)}
                                extra={<Tag color="cyan">{typeLabel(offer.type)}</Tag>}
                            >
                                <p style={{ minHeight: 60 }}>{offer.description.slice(0, 120)}...</p>
                                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                    {offer.location && (
                                        <span><EnvironmentOutlined /> {offer.location} {offer.workMode && `• ${offer.workMode}`}</span>
                                    )}
                                    {offer.salaryMin != null && offer.salaryMax != null && (
                                        <span><DollarOutlined /> {offer.salaryMin}-{offer.salaryMax} {offer.currency}</span>
                                    )}
                                    {offer.deadline && (
                                        <span><ClockCircleOutlined /> {t('publicOffers.until')} {format(new Date(offer.deadline), 'yyyy-MM-dd')}</span>
                                    )}
                                </Space>
                                <div style={{ marginTop: 12 }}>
                                    {(offer.requiredSkills || []).slice(0, 4).map((s) => (
                                        <Tag key={s}>{s}</Tag>
                                    ))}
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default PublicOffers;
