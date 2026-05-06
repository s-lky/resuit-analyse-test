import apiClient from "../lib/axiosConfig";
// 修改第2行，加上 User 类型
import type { AuthResponse, LoginRequest, RegisterRequest, User } from "../types/api";

export const authApi = {
    register: (data: RegisterRequest) =>
        apiClient.post<AuthResponse>('/auth/register', data),

    login: (data: LoginRequest) =>
        apiClient.post<AuthResponse>('/auth/login', data),

    getCurrentUser:() =>
        apiClient.get<User>('/auth/me'),
};