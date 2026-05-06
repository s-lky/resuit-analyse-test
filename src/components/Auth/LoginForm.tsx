import React, { useState } from "react";
import { useToast } from "../../hooks/useToast";
import { authApi } from "../../api/auth";
import { Eye, EyeOff, Lock, User } from 'lucide-react';

interface LoginFormProps {
    onSwitchToRegister: () => void;
    onLoginSuccess: () => void;
    }

export default function LoginForm({ onSwitchToRegister, onLoginSuccess }: LoginFormProps) {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { success, error } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.username || !formData.password) {
            error('请填写用户名和密码');
            return;
        }

        setIsLoading(true);
        try {
            const response = await authApi.login(formData);
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            success('登录成功！');
            onLoginSuccess();
        } catch (err: any) {
            error(err.response?.data?.message || '登录失败，请检查用户名和密码');
        } finally {
            setIsLoading(false);
        }
    };

    return(
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <User size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">欢迎回来</h1>
                    <p className="text-gray-600 mt-2">请登录您的账户以继续使用</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" >
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                            用户名
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User size={18} className="text-gray-400" />
                            </div>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="请输入用户名"
                                />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            密码
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock size={18} className="text-gray-400" />
                            </div>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="pl-10 pr-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="请输入密码"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                            {showPassword ? (
                            <EyeOff size={18} className="text-gray-400 hover:text-gray-600" />
                            ) : (
                            <Eye size={18} className="text-gray-400 hover:text-gray-600" />
                            )}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? '登录中...' : '登录'}
                </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        还没有账户？{' '}
                        <button
                        onClick={onSwitchToRegister}
                        className="font-medium text-blue-600 hover:text-blue-500"
                        >
                        立即注册
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}