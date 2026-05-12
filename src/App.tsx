import { useState, useEffect } from "react";
import Sidebar from './components/Sidebar';
import InterviewPanel from './components/InterviewPanel';
import ResumePanel from './components/ResumePanel';
import HistoryReportPanel from './components/HistoryReportPanel';
import SettingsPanel from './components/SettingsPanel';
import ToastContainer from './components/Toast/ToastContainer';
import { useToast, ToastProvider } from './hooks/useToast';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'interview' | 'resume' | 'history' | 'settings'>('interview');
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const { toasts, removeToast } = useToast();
  const { user, isAuthenticated, isLoading, logout, checkAuth } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-text-secondary">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        {authView === 'login' ? (
          <LoginForm
            onSwitchToRegister={() => setAuthView('register')}
            onLoginSuccess={async () => {
              await checkAuth();
            }}
          />
        ) : (
          <RegisterForm
            onSwitchToLogin={() => setAuthView('login')}
            onRegisterSuccess={async () => {
              await checkAuth();
            }}
          />
        )}
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  return(
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} user={user} />

      <main className="flex-1 flex flex-col p-8 gap-8 overflow-hidden">
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-text-primary">
            {activeTab === 'interview' ? '面试实时智能分析面板':
            activeTab === 'resume' ? '简历智能优化建议' :
            activeTab === 'history' ? '历史数据报告' : '系统设置'}
          </h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-accent-light text-accent rounded-full text-xs font-medium">
            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
              AI引擎已就绪
          </div>
        </header>

        {activeTab === 'interview' ? <InterviewPanel /> :
        activeTab === 'resume' ? <ResumePanel/> :
        activeTab === 'history' ? <HistoryReportPanel /> :
        <SettingsPanel />}
      </main>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}