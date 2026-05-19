import { useState, useEffect } from "react";
import Sidebar from './components/Sidebar';
import InterviewPanel from './components/InterviewPanel';
import ResumePanel from './components/ResumePanel';
import SettingsPanel from './components/SettingsPanel';
import ToastContainer from './components/Toast/ToastContainer';
import { useToast, ToastProvider } from './hooks/useToast';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import HistroyReportPanel from './components/HistoryReportPanel';
import ProtectedRoute from './components/ProtectedRoute';


function AppContent() {
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const { toasts, removeToast } = useToast();
  const { user, isAuthenticated, isLoading, logout, checkAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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
              navigate('/interview'); //登录后跳转到默认页面
            }}
          />
        ) : (
          <RegisterForm
            onSwitchToLogin={() => setAuthView('login')}
            onRegisterSuccess={async () => {
              await checkAuth();
              navigate('/interview'); //注册后跳转到默认页面
            }}
          />
        )}
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  //根据当前路径确定激活的标签页
  const getActiveTabFromPath = () =>{
    const path = location.pathname;
    if(path.includes('/resume')) return 'resume';
    if(path.includes('/history')) return 'history';
    if(path.includes('/settings')) return 'settings';
    return 'interview'; //默认
  };

  const activeTab = getActiveTabFromPath();

  const handleTabChange = (tab: 'interview' | 'resume' | 'history' | 'settings') =>{
    switch(tab){
      case 'interview':
        navigate('/interview');
        break;
      case 'resume':
        navigate('/resume');
        break;
      case 'history':
        navigate('/history');
        break;
      case 'settings':
        navigate('/settings');
        break;
    }
  };

  return(
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} onLogout={logout} user={user} />

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

        <Routes>
          <Route path="/login" element={
            !isAuthenticated ?
              (authView === 'login' ?
                <LoginForm onSwitchToRegister={() => setAuthView('register')} onLoginSuccess={async () =>{
                  await checkAuth();
                  navigate('/interview');
                }} /> :
                <RegisterForm onSwitchToLogin={() => setAuthView('login')} onRegisterSuccess={async () =>{
                  await checkAuth();
                  navigate('/interview');
                }}/>
              ):
              <Navigate to="/interview" replace/>
          }/>

          <Route path="/interview" element={
            <ProtectedRoute>
              <InterviewPanel />
            </ProtectedRoute>
          }/>
          <Route path="/resume" element={
            <ProtectedRoute>
              <ResumePanel />
            </ProtectedRoute>
          }/>
          <Route path="/history" element={
            <ProtectedRoute>
              <HistroyReportPanel />
            </ProtectedRoute>
          }/>
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPanel />
            </ProtectedRoute>
          }/>
          <Route path="/" element={<Navigate to="/interview" replace />} />
          <Route path="*" element={<Navigate to="/interview" replace />} />
        </Routes>
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