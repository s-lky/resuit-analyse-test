import { useState } from "react";
import { transcribeAudio, analyzeEngagement, generateCoachingCard } from "../api/interview";
import type { TranscriptItem, CoachingData, TranscribeAudioResponse } from "../types/api";

export type { TranscriptItem, CoachingData } from "../types/api";

interface UseInterviewAnalysisOptions{
    onToast ?: (message: string, type: 'success' | 'error' | 'info') => void;
}

/** 兼容 Spring Result.data 为数组，或 { transcript: [] }（与简易 server 直出数组） */
function normalizeTranscriptPayload(res: unknown): TranscriptItem[] {
    if (Array.isArray(res)) return res as TranscriptItem[];
    if (res && typeof res === "object" && "transcript" in res) {
        const t = (res as TranscribeAudioResponse).transcript;
        return Array.isArray(t) ? t : [];
    }
    return [];
}

function readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const raw = reader.result as string;
            const base64 = raw.includes(",") ? raw.split(",")[1] : raw;
            resolve(base64 ?? "");
        };
        reader.onerror = () => reject(reader.error ?? new Error("读取文件失败"));
        reader.readAsDataURL(file);
    });
}

function normalizeEngagementPayload(data: unknown): any[] {
    return Array.isArray(data) ? data : [];
}

function normalizeCoachingPayload(data: unknown): CoachingData | null {
    if (!data || typeof data !== "object") return null;
    const s = (data as CoachingData).strengths;
    const o = (data as CoachingData).opportunities;
    if (!Array.isArray(s) || !Array.isArray(o)) return null;
    return { strengths: s, opportunities: o };
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
        setCoaching(null);
        try{
            const base64 = await readFileAsBase64(file);
            option?.onToast?.('上传成功，开始分析','info');

            const res = await transcribeAudio({
                audioBase64: base64,
                mimeType: file.type
            });
            const transcriptList = normalizeTranscriptPayload(res);
            setTranscript(transcriptList);

            if (transcriptList.length === 0) {
                option?.onToast?.('转录结果为空，请检查接口返回是否为 transcript 数组或 { transcript }', 'error');
                return;
            }

            const payload = JSON.stringify(transcriptList);

            try {
                const engagement = await analyzeEngagement({ transcript: payload });
                setEngagementData(normalizeEngagementPayload(engagement));
            } catch (engErr: unknown) {
                console.error(engErr);
                setEngagementData([]);
                option?.onToast?.('参与度分析失败，已保留转录文本', 'error');
            }

            try {
                const coachingRes = await generateCoachingCard({ transcript: payload });
                const coachingNorm = normalizeCoachingPayload(coachingRes);
                setCoaching(coachingNorm);
                if (coachingNorm) {
                    option?.onToast?.('分析完成', 'success');
                } else {
                    option?.onToast?.('辅导卡数据格式异常，已展示转录与参与度', 'info');
                }
            } catch (coachingErr: unknown) {
                console.error(coachingErr);
                const msg =
                    coachingErr && typeof coachingErr === "object" && "message" in coachingErr
                        ? String((coachingErr as { message?: string }).message)
                        : "辅导卡生成失败";
                option?.onToast?.(msg, 'error');
                option?.onToast?.('已保留语音转录与参与度分析结果', 'info');
            }
        }catch(error){
            console.error(error);
            const msg =
                error && typeof error === "object" && "message" in error
                    ? String((error as { message?: string }).message)
                    : "";
            option?.onToast?.(msg ? `分析失败：${msg}` : '分析失败，请检查控制台网络请求','error');
            setTranscript([]);
            setEngagementData([]);
            setCoaching(null);
        }finally{
            setIsAnalyzing(false);
            e.target.value = '';
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