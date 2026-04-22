import { useState } from "react";
import Sidebar from './components/Sidebar';
import InterviewPanel from './components/InterviewPanel';
import ResumePanel from './components/ResumePanel';
import HistoryReportPanel from './components/HistoryReportPanel';
import ToastContainer from './components/Toast/ToastContainer';
import { useToast, ToastProvider } from './hooks/useToast';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'interview' | 'resume' | 'history'>('interview');
  const { toasts, removeToast } = useToast();

  return(
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 flex flex-col p-8 gap-8 overflow-hidden">
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-text-primary">
            {activeTab === 'interview' ? '面试实时智能分析面板':activeTab === 'resume' ? '简历智能优化建议' : '历史数据报告'}
          </h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-accent-light text-accent rounded-full text-xs font-medium">
            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
              AI引擎已就绪
          </div>
        </header>

        {activeTab === 'interview' ? <InterviewPanel /> : activeTab === 'resume' ? <ResumePanel/> : <HistoryReportPanel />}
      </main>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}