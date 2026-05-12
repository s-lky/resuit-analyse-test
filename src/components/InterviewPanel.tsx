import useInterviewAnalysis from '../hooks/useInterviewAnalysis';
import TranscriptBox from './interview/TranscriptBox';
import EngagementChart from './interview/EngagementChart';
import CoachingCard from './interview/CoachingCard';
import InterviewHistoryModal from './interview/HistoryModal';
import { Loader2, Upload, Download, FileText, FileType, File, History } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { useState } from 'react';

export default function InterviewPanel(){
    const { success, error, info } = useToast();
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const{
        isAnalyzing,
        transcript,
        engagementData,
        coaching,
        handleAudioUpload,
        exportTranscript,
        loadFromHistory,
    } = useInterviewAnalysis({
        onToast: (message, type) => {
            if(type === 'success') success(message);
            else if(type === 'error') error(message);
            else info(message);
        }
    });

    const handleExport = (format: 'pdf' | 'word' | 'md') => {
        try {
            exportTranscript(transcript, format);
            success(`已导出为${format.toUpperCase()}格式`);
            setShowExportMenu(false);
        } catch (err: any) {
            error(err.message || '导出失败');
        }
    };

    return(
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
            <div className="lg:col-span-2 card h-full">
                <div className="card-header">
                    <span>对话记录分析</span>
                    <div className="flex items-center gap-3">
                        {/* 历史记录按钮 */}
                        <button
                            onClick={() => setShowHistory(true)}
                            className="flex items-center gap-2 text-gray-600 hover:text-accent cursor-pointer transition-colors"
                        >
                            <History size={14} />
                            历史记录
                        </button>
                        
                        {/* 导出菜单 */}
                        {(transcript?.length ?? 0) > 0 && !isAnalyzing && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowExportMenu(!showExportMenu)}
                                    className="flex items-center gap-2 text-accent cursor-pointer hover:underline"
                                >
                                    <Download size={14} />
                                    导出
                                </button>
                                
                                {showExportMenu && (
                                    <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[150px]">
                                        <button
                                            onClick={() => handleExport('pdf')}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <FileText size={14} />
                                            导出为 PDF
                                        </button>
                                        <button
                                            onClick={() => handleExport('word')}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <FileType size={14} />
                                            导出为 Word
                                        </button>
                                        <button
                                            onClick={() => handleExport('md')}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <File size={14} />
                                            导出为 Markdown
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* 上传按钮 */}
                        {(transcript?.length ?? 0) === 0 && (
                            <label className="flex items-center gap-2 text-accent cursor-pointer hover:underline">
                                <Upload size={14} />
                                上传面试音频
                                <input 
                                    type="file" 
                                    className="hidden"
                                    accept="audio/mp3, audio/mpeg, audio/m4a, audio/wav"
                                    onChange={handleAudioUpload}
                                    />
                            </label>
                        )}
                    </div>
                </div>
                <div className='flex-1 p-6 overflow-y-auto space-y-4'>
                    {isAnalyzing ? (
                        <div className='h-full flex flex-col items-center justify-center text-text-secondary gap-3'>
                            <Loader2 className="animate-spin" size={32} />
                            <p>正在通过AI进行语音转录与分析</p>
                        </div>
                    ):(
                        <TranscriptBox transcript={transcript} />
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-6 overflow-hidden">
                    <EngagementChart data={engagementData} />
                    <CoachingCard data={coaching} />
            </div>

            {/* 历史记录弹窗 */}
            <InterviewHistoryModal
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
                onLoadHistory={loadFromHistory}
            />
        </div>
    );
}