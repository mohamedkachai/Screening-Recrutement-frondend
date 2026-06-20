import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Divider, message, Table } from 'antd';
import { listLogs } from '../api/logs';

const LogsList = () => {
    const [logs, setLogs] = useState([]);
    const { t } = useTranslation();

    const columns = [
        {
            title: t('common.createdAt'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => format(text, 'yyyy-MM-dd HH:mm'),
        },
        {
            title: t('logs.action'),
            dataIndex: 'action',
            key: 'action',
        },
    ];

    useEffect(() => {
        async function fetchLogs() {
            try {
                const response = await listLogs();
                setLogs(response.data.logs);
            } catch (error) {
                message.error(error.response.data.message);
            }
        }
        fetchLogs();
    }, []);

    return (
        <div>
            <h4>{t('logs.title')}</h4>
            <Divider />
            <Table columns={columns} dataSource={logs} scroll={{ x: 'max-content' }} />
        </div>
    );
};

export default LogsList;
