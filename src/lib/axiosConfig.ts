import axios, { type AxiosResponse } from 'axios';

// 创建axios实例
const apiClient = axios.create({

    //从环境变量获取基础URL
    baseURL: import.meta.env.VITE_API_BASE_URL || 'api',
    timeout: 30000,
    headers:{
        'Content-Type': 'application/json',
    },
});

//请求拦截器
apiClient.interceptors.request.use(
    (config) => {

        //在这里添加token
        const token = localStorage.getItem('authToken');
        if(token){
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

//响应拦截器
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response.data;
    },

    (error) => {
        console.error('API Error:', error);

        //统一处理错误
        if(error.response){
            switch(error.response.status){
                case 401:
                    //未授权，跳转到登录页
                    window.location.href = '/login';
                    break;
                case 403:
                    console.error('禁止访问');
                    break;
                case 404:
                    console.error('请求的资源不存在');
                    break;
                case 500:
                    console.error('服务器内部错误');
                    break;
                default:
                    console.error(`请求失败: ${error.response.status}`);
            }
        }else if(error.request){
            console.error('网络错误，请检查网络连接');
        }else{
            console.error('请求配置错误：',error.message);
        }

        return Promise.reject(error);
    }
);

export default apiClient as unknown as {
    get: <T = any>(url: string, config?: any) => Promise<T>;
    post: <T = any>(url: string, data?: any, config?: any) => Promise<T>;
    put: <T = any>(url: string, data?: any, config?: any) => Promise<T>;
    delete: <T = any>(url: string, config?: any) => Promise<T>;
    patch: <T = any>(url: string, data?: any, config?: any) => Promise<T>;
};