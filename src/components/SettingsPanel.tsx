    // src/components/SettingsPanel.tsx
    import { useState } from 'react';
    import { useAuth } from '../contexts/AuthContext';
    import { authApi } from '../api/auth';
    import { useToast } from '../hooks/useToast';
    import type { ChangePasswordRequest } from '../types/api';

    export default function SettingsPanel() {
    const { user, logout } = useAuth();
    const { addToast } = useToast();
    
    // 修改密码表单状态
    const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({
        oldPassword: '',
        newPassword: ''
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    
    // 删除账户确认状态
    // const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    // const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    // 处理密码修改
    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!passwordForm.oldPassword || !passwordForm.newPassword) {
        addToast('请填写所有字段', 'error');
        return;
        }
        
        if (passwordForm.newPassword.length < 6) {
        addToast('新密码至少需要6个字符', 'error');
        return;
        }

        setIsChangingPassword(true);
        try {
        await authApi.changePassword(passwordForm);
        addToast('密码修改成功', 'success');
        setPasswordForm({ oldPassword: '', newPassword: '' });
        } catch (error: any) {
        addToast(error.response?.data?.message || '密码修改失败', 'error');
        } finally {
        setIsChangingPassword(false);
        }
    };

    // 处理账户删除
    // const handleDeleteAccount = async () => {
    //     setIsDeletingAccount(true);
    //     try {
    //     await authApi.deleteAccount();
    //     addToast('账户已删除', 'success');
    //     logout();
    //     } catch (error: any) {
    //     addToast(error.response?.data?.message || '账户删除失败', 'error');
    //     } finally {
    //     setIsDeletingAccount(false);
    //     setShowDeleteConfirm(false);
    //     }
    // };

    return (
        <div className="space-y-8">
        {/* 用户信息卡片 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">个人信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                <input
                type="text"
                value={user?.username || ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
            </div>
            </div>
        </div>

        {/* 修改密码表单 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">修改密码</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
                <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-1">
                当前密码
                </label>
                <input
                type="password"
                id="oldPassword"
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入当前密码"
                />
            </div>
            <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                新密码
                </label>
                <input
                type="password"
                id="newPassword"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入新密码（至少6位）"
                />
            </div>
            <button
                type="submit"
                disabled={isChangingPassword}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isChangingPassword ? '修改中...' : '修改密码'}
            </button>
            </form>
        </div>

        {/* 危险操作区域
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
            <h2 className="text-lg font-semibold text-red-600 mb-4">危险操作</h2>
            <p className="text-gray-600 mb-4">
            删除账户是不可逆的操作，所有数据将被永久清除。
            </p>
            
            {!showDeleteConfirm ? (
            <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
                删除账户
            </button>
            ) : (
            <div className="space-y-4">
                <p className="text-red-600 font-medium">确定要删除账户吗？此操作不可撤销！</p>
                <div className="flex gap-3">
                <button
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isDeletingAccount ? '删除中...' : '确认删除'}
                </button>
                <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    取消
                </button>
                </div>
            </div>
            )}
        </div> */}
        </div>
    );
    }