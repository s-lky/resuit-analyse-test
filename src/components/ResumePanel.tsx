// 简历分析面板
import useResumeAnalysis from '../hooks/useResumeAnalysis';
import { FileText, Loader2, Send, Upload } from 'lucide-react';

export default function ResumePanel(){
    const{
        resumeText, //PDF里抠出来的文字
        resumeAnalysis, //简历修改建议
        isStreaming, //一个一个字往外输出
        handleResumeUpload, 
        analyzeResume, //开始写报告
    } = useResumeAnalysis();

    return( //把屏幕平分，各一半
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
            {/* 简历上传 */}
            <div className="card h-full">
                <div className="card-header">
                    <span>简历内容解析</span>
                    <label className="flex items-center gap-2 text-accent cursor=pointer hover:underline" >
                        <Upload size={14} />
                        上传PDF简历 
                        <input type="file" className="hidden" accept=".pdf" onChange={handleResumeUpload} />
                        //限制只能上传pdf
                    </label>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                    {/* 看用户是否有没有上传简历 */}
                    {resumeText ? ( //whitespace-pre-wrap是原来的PDF里怎么换行的，这里就怎么换行
                    <div className="whitespace-pre-wrap text-sm text-text-secondary font-mono bg-slate-50 p-4 rounded-lg border border-border">
                        {resumeText} 
                    </div> //有上传就显示一个带边框的灰框bg-slate-50
                    ):(
                        <div className="h-full flex flex-col items-center justify-center text-text-secondary border-2 border-dashed border-border rounded-xl">
                            <FileText size={48} className="mb-4 opacity-20" />
                            <p>上传PDF简历以提取内容</p>
                        </div> //还没上传简历就显示一个画着虚线框的空盘子border-dashed
                    )}
                </div>
                    {/* 上传文件后才显示的按钮 */}
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

            {/* AI分析结果 */}
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
                            <p>点击“开始分析”获取优化建议</p>
                        </div>
                        // 只要开始工作了（isStreaming），或者报告写完了（resuemAnalysis 有内容了），屏幕上就会显示文字。
                        // {isStreaming && <span className="animate-pulse">_</span>}是：如果AI正在打字，就在文字的最后面加上一个下划线 _，用 animate-pulse 让它像光标一样闪烁
                    )}
                </div>
            </div>
        </div>
    );
}