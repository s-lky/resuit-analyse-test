import { useState, useEffect } from 'react';
import { X, Clock, Trash2 } from 'lucide-react';
import { getResumeHistoryList, getResumeDetail, deleteResumeRecord } from '../../api/history';
import type { HistoryListItem, ResumeAnalysisDetail } from '../../types/api';
import { useToast } from '../../hooks/useToast';

interface ResumeHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoadHistory: (data: {
        resumeText: string;
        analysisResult: string;
    }) => void;
}

export default function ResumeHistoryModal({ isOpen, onClose, onLoadHistory }: ResumeHistoryModalProps) {
    const { success, error } = useToast();
    const [historyList, setHistoryList] = useState<HistoryListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState<ResumeAnalysisDetail | null>(null);
    const [showDetail, setShowDetail] = useState(false);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const list = await getResumeHistoryList();
            setHistoryList(list);
        } catch (err) {
            error('获取历史记录失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen]);

    const handleViewDetail = async (record: HistoryListItem) => {
        try {
            const detail = await getResumeDetail(record.id);
            setSelectedDetail(detail);
            setShowDetail(true);
        } catch (err) {
            error('获取详情失败');
        }
    };

    const handleLoad = () => {
        if (!selectedDetail) return;
        
        onLoadHistory({
            resumeText: selectedDetail.content || '',
            analysisResult: selectedDetail.analysisResult,
        });
        success('已加载历史记录');
        onClose();
    };

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('确定要删除这条记录吗？')) return;
        
        try {
            await deleteResumeRecord(id);
            success('删除成功');
            fetchHistory();
            if (selectedDetail?.id === id) {
                setShowDetail(false);
                setSelectedDetail(null);
            }
        } catch (err) {
            error('删除失败');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[80vh] flex flex-col">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">简历分析历史记录</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : !showDetail ? (
                        <div className="space-y-3">
                            {historyList.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Clock size={48} className="mx-auto mb-4 opacity-30" />
                                    <p>暂无历史记录</p>
                                </div>
                            ) : (
                                historyList.map((record) => (
                                    <div
                                        key={record.id}
                                        onClick={() => handleViewDetail(record)}
                                        className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900">{record.fileName}</h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {new Date(record.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg font-bold text-blue-600">
                                                    {record.score}分
                                                </span>
                                                <button
                                                    onClick={(e) => handleDelete(record.id, e)}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div>
                            <button
                                onClick={() => setShowDetail(false)}
                                className="text-blue-600 hover:underline mb-4"
                            >
                                ← 返回列表
                            </button>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">{selectedDetail.fileName}</h3>
                                    <span className="text-xl font-bold text-blue-600">
                                        {selectedDetail.score}分
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {new Date(selectedDetail.createdAt).toLocaleString()}
                                </p>
                                <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                                    <pre className="text-sm whitespace-pre-wrap">{selectedDetail.analysisResult}</pre>
                                </div>
                                <button
                                    onClick={handleLoad}
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    加载此记录
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}