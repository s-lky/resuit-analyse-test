import useResumeAnalysis from '../hooks/useResumeAnalysis';
import ResumeHistoryModal from './resume/ResumeHistoryModal';
import { FileText, Loader2, Send, Upload, History } from 'lucide-react';
import { useState } from 'react';

export default function ResumePanel(){
    const [showHistory, setShowHistory] = useState(false);
    const{
        resumeText,
        resumeAnalysis,
        isStreaming,
        handleResumeUpload, 
        analyzeResume,
        loadFromHistory,
    } = useResumeAnalysis();

    return(
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
            <div className="card h-full">
                <div className="card-header">
                    <span>简历内容解析</span>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowHistory(true)}
                            className="flex items-center gap-2 text-gray-600 hover:text-accent cursor-pointer transition-colors"
                        >
                            <History size={14} />
                            历史记录
                        </button>
                        <label className="flex items-center gap-2 text-accent cursor=pointer hover:underline" >
                            <Upload size={14} />
                            上传PDF简历 
                            <input type="file" className="hidden" accept=".pdf" onChange={handleResumeUpload} />
                        </label>
                    </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                    {resumeText ? (
                    <div className="whitespace-pre-wrap text-sm text-text-secondary font-mono bg-slate-50 p-4 rounded-lg border border-border">
                        {resumeText} 
                    </div>
                    ):(
                        <div className="h-full flex flex-col items-center justify-center text-text-secondary border-2 border-dashed border-border rounded-xl">
                            <FileText size={48} className="mb-4 opacity-20" />
                            <p>上传PDF简历以提取内容</p>
                        </div>
                    )}
                </div>
                    
                {resumeText && (
                    <div className="p-4 border-t border-border bg-slate-50">
                        <button
                            onClick={analyzeResume}
                            disabled={isStreaming}
                            className="w-full bg-accent text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-accent/90  transition-colors disabled:opacity-50"
                        >
                            {isStreaming ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                            开始AI智能分析
                        </button>
                    </div>
                )}
            </div>

            <div className="card h-full">
                <div className="card-header">
                    <span>AI优化建议</span>
                </div>
                <div className="flex-1 p-6 flex flex-col overflow-hidden">
                    {resumeAnalysis || isStreaming ? (
                        <div className="streaming-output">
                            {resumeAnalysis}
                            {isStreaming && <span className="animate-pulse">_</span>}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-text-secondary">
                            <FileText size={48} className="mb-4 opacity-20" />
                            <p>点击"开始分析"获取优化建议</p>
                        </div>
                    )}
                </div>
            </div>

            <ResumeHistoryModal
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
                onLoadHistory={loadFromHistory}
            />
        </div>
    );
}