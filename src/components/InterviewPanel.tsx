// 面试音频分析面板
import React from 'react';
import useInterviewAnalysis from '../hooks/useInterviewAnalysis';
import TranscriptBox from './interview/TranscriptBox'; //记录音频里的话
import EngagementChart from './interview/EngagementChart'; //负责画图
import CoachingCard from './interview/CoachingCard'; //给建议
import { Loader2, Upload} from 'lucide-react';

export default function InterviewPanel(){
    const{
        isAnalyzing,  //是否正在思考
        transcript,  //面试音频文字记录
        engagementData, //用户表现的数据图表材料
        coaching, //面试建议
        handleAudioUpload, 
    } = useInterviewAnalysis();

    return(
        // 屏幕三等分，文字记录占两份，图表和建议占一份
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
            {/* 对话记录 */}
            <div className="lg:col-span-2 card h-full">
                <div className="card-header">
                    <span>对话记录分析</span>
                    {/* 记录什么时候显示“上传”按钮 */}
                    {transcript.length === 0 && ( //如果还没上传过就显示出来
                        <label className="flex items-center gap-2 text-accent cursor-pointer hover:underline">
                            <Upload size={14} />
                            上传面试音频
                            <input 
                                type="file" 
                                className="hidden" //隐藏丑丑的网页自带按钮
                                accept="audio/mp3, audio/mpeg, audio/m4a, audio/wav"
                                onChange={handleAudioUpload}
                                />
                        </label>
                    )}
                </div>
                <div className='flex-1 p-6 overflow-y-auto space-y-4'>
                    {isAnalyzing ? ( //确认在什么时候可以显示转圈圈
                        <div className='h-full flex flex-col items-center justify-center text-text-secondary gap-3'>
                            <Loader2 className="animate-spin" size={32} />
                            <p>正在通过AI进行语音转录与分析</p>
                        </div>
                    ):(
                        <TranscriptBox transcript={transcript} />
                    )}
                </div>
            </div>

            {/* 右侧：图标+辅导卡 */}
            {/* 把engagementData给engagementChart画成图 */}
            {/* 吧建议写在卡片上 */}
            <div className="flex flex-col gap-6 overflow-hidden">
                    <EngagementChart data={engagementData} />
                    <CoachingCard data={coaching} />
            </div>
        </div>
    );
}