import useResumeAnalysis from '../hooks/useResumeAnalysis';
import ResumeHistoryModal from './resume/ResumeHistoryModal';
import { useToast } from '../hooks/useToast';
import {
  exportResumeAnalysisToMarkdown,
  exportResumeAnalysisToPdf,
  exportResumeAnalysisToWord,
} from '../utils/resumeExport';
import { FileText, Loader2, Send, Upload, History, Download, FileType, File } from 'lucide-react';
import { useState, useRef } from 'react';

export default function ResumePanel(){
    const [showHistory, setShowHistory] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const analysisRef = useRef<HTMLDivElement>(null);
    const { success, error } = useToast();
    const{
        resumeText,
        resumeAnalysis,
        isStreaming,
        handleResumeUpload, 
        analyzeResume,
        loadFromHistory,
    } = useResumeAnalysis();

    const handleExport = async (format: 'pdf' | 'word' | 'md') => {
        if (!resumeAnalysis.trim() || isStreaming) return;
        try {
            if (format === 'md') {
                exportResumeAnalysisToMarkdown(resumeAnalysis);
            } else if (format === 'word') {
                await exportResumeAnalysisToWord(resumeAnalysis);
            } else {
                if (!analysisRef.current) {
                    throw new Error('未找到可导出的内容区域');
                }
                await exportResumeAnalysisToPdf(analysisRef.current);
            }
            success(`已导出为 ${format === 'word' ? 'Word' : format.toUpperCase()} 格式`);
            setShowExportMenu(false);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : '导出失败';
            error(message);
        }
    };

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
                        <label className="flex items-center gap-2 text-accent cursor-pointer hover:underline" >
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
                    {resumeAnalysis.trim().length > 0 && !isStreaming && (
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                className="flex items-center gap-2 text-accent cursor-pointer hover:underline"
                            >
                                <Download size={14} />
                                导出
                            </button>
                            {showExportMenu && (
                                <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[150px]">
                                    <button
                                        type="button"
                                        onClick={() => void handleExport('pdf')}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <FileText size={14} />
                                        导出为 PDF
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => void handleExport('word')}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <FileType size={14} />
                                        导出为 Word
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => void handleExport('md')}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <File size={14} />
                                        导出为 Markdown
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex-1 p-6 flex flex-col overflow-hidden">
                    {resumeAnalysis || isStreaming ? (
                        <div ref={analysisRef} className="streaming-output">
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