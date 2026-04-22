import { useState } from "react";
import { analyzeEngagement, transcribeAudio } from "../lib/ai";
import apiClient from "../lib/axiosConfig";

//制作汇报表格的模版
export interface TranscriptItem{ //空白表格1：速记单只填说的人(AB)和说了什么
    speaker: 'A'|'B';
    text: string;
}
export interface CoachingData{
    strengths:string[];
    opportunities: string[];
}

interface UseInterviewAnalysisOptions{
    onToast ?: (message: string, type: 'success' | 'error' | 'info') => void;
}

//四大记忆区
export default function useInterviewAnalysis(option?: UseInterviewAnalysisOptions){
    //默认没在分析
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    //默认空白的记录数组
    const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
    //默认空白的数据数组
    const [engagementData, setEngagementData] = useState<any[]>([]);
    //默认是null的建议卡
    const [coaching, setCoaching] = useState<CoachingData | null>(null);

    // 传进录音文件触发该动作
    const handleAudioUpload = async(e:React.ChangeEvent<HTMLInputElement>) => {
        //没有文件就直接return
        const file = e.target.files?.[0];
        if(!file) return;

        //限制最大上传文件大小
        const MAX_FILE_SIZE = 10 * 1024 * 1024;
        if(file.size > MAX_FILE_SIZE){
            alert('文件过大！为了保证 AI 分析速度，请上传 10MB 以内的音频文件。\n建议使用 MP3 或 M4A 格式替代 WAV 格式。');
            e.target.value='';
            return;
        }

        setIsAnalyzing(true);
        try{

            // 把拿到的声音文件，翻译成一串能通过网络传输的代码
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64 = (reader.result as string).split(',')[1];

                option?.onToast?.('上传成功，开始分析','info');

                //把代码扔给第一个AI模型transcribeAudio
                const res = await transcribeAudio(base64, file.type);
                setTranscript(res);

                //把文字拼接连续然后扔给第二个模型analyzeEngagement计算数据然后存在setEngagementData
                const transcriptText = res.map((item:any) => `${item.speaker}:${item.text}`).join('\n');
                const engagement = await analyzeEngagement(transcriptText);
                setEngagementData(engagement);

                //生成辅导卡，用axios发送数据
                const coachingRes = await apiClient.post('/api/coaching-card',{
                    transcript:transcriptText,
                });
                setCoaching(coachingRes);

                option?.onToast?.('分析完成','success');
            };
        }catch(error){
            console.error(error);
            option?.onToast?.('分析失败，请检查控制台网络请求','error');
        }finally{
            setIsAnalyzing(false);
        }
    };

    //打包发货给前端
    return{
        isAnalyzing,
        transcript,
        engagementData,
        coaching,
        handleAudioUpload,
    };
}