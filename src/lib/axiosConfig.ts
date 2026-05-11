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
        // 排除不需要认证的接口（注册、登录）
        const publicApis = ['/auth/register', '/auth/login'];
        const isPublicApi = publicApis.some(api => config.url?.includes(api));
        
        if (!isPublicApi) {
            const token = localStorage.getItem('authToken');
            if(token){
                config.headers.Authorization = `Bearer ${token}`;
            }
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
        const payload = response.data;
        // 后端统一 Result: { code: 200, message: "...", data: {...} }，HTTP 常为 200
        if (payload && typeof payload.code === 'number') {
            if (payload.code !== 200) {
                // 失败时 data 多为 null；不能用 data !== undefined 判断，否则会把 null 当成「有 data」返回
                return Promise.reject({
                    response: {
                        status: payload.code,
                        data: {
                            message: payload.message ?? '请求失败',
                            code: payload.code,
                        },
                    },
                    message: payload.message ?? '请求失败',
                });
            }
            return payload.data;
        }
        return payload;
    },

    (error) => {
        console.error('API Error:', error);

        //统一处理错误
        if(error.response){
            const errorMessage = error.response.data?.message || '请求失败';
            
            switch(error.response.status){
                case 400:
                    // 请求参数错误，不跳转，让业务代码处理错误提示
                    console.error('请求参数错误:', errorMessage);
                    break;
                case 401:
                    //未授权，跳转到登录页
                    console.error('未授权:', errorMessage);
                    window.location.href = '/login';
                    break;
                case 403:
                    console.error('禁止访问:', errorMessage);
                    break;
                case 404:
                    console.error('请求的资源不存在:', errorMessage);
                    break;
                case 500:
                    console.error('服务器内部错误:', errorMessage);
                    break;
                default:
                    console.error(`请求失败: ${error.response.status}`, errorMessage);
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