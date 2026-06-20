import axios from 'axios';
import { message } from 'antd'

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth-token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosClient.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('auth-token');
            
            window.location.href = '/login'

            message.error(error.response.data.message);
        } 
        return Promise.reject(error);
    }
);

export default axiosClient;