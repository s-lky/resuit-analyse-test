import { useState, useEffect } from "react";
import { transcribeAudio, analyzeEngagement, generateCoachingCard } from "../api/interview";
import { saveInterviewAnalysis } from "../api/history";
import type { TranscriptItem, CoachingData, TranscribeAudioResponse } from "../types/api";
import { exportToPDF, exportToWord, exportToMarkdown } from "../utils/export";

export type { TranscriptItem, CoachingData } from "../types/api";

interface UseInterviewAnalysisOptions{
    onToast ?: (message: string, type: 'success' | 'error' | 'info') => void;
}

const STORAGE_KEY_TRANSCRIPT = 'interview_transcript';
const STORAGE_KEY_ENGAGEMENT = 'interview_engagement';
const STORAGE_KEY_COACHING = 'interview_coaching';

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

function exportTranscript(transcript: TranscriptItem[], format: 'pdf' | 'word' | 'md'): void {
    if (transcript.length === 0) {
        throw new Error('没有可导出的转录内容');
    }
    
    switch (format) {
        case 'pdf':
            exportToPDF(transcript);
            break;
        case 'word':
            exportToWord(transcript);
            break;
        case 'md':
            exportToMarkdown(transcript);
            break;
    }
}

async function saveAnalysisToHistory(
    transcript: TranscriptItem[],
    engagementData: any[],
    coaching: CoachingData | null,
    fileName: string
): Promise<void> {
    try {
        const transcriptStr = JSON.stringify(transcript);
        const engagementStr = JSON.stringify(engagementData);
        const strengthsStr = JSON.stringify(coaching?.strengths || []);
        const opportunitiesStr = JSON.stringify(coaching?.opportunities || []);
        
        const score = coaching && coaching.strengths.length > 0 ? 80 : 70;
        
        await saveInterviewAnalysis({
            fileName,
            audioDuration: '',
            transcript: transcriptStr,
            engagementData: engagementStr,
            strengths: strengthsStr,
            opportunities: opportunitiesStr,
            score,
        });
    } catch (error) {
        console.error('保存历史记录失败:', error);
    }
}

function saveToSessionStorage(
    transcript: TranscriptItem[],
    engagementData: any[],
    coaching: CoachingData | null
): void {
    try {
        if (transcript.length > 0) {
            sessionStorage.setItem(STORAGE_KEY_TRANSCRIPT, JSON.stringify(transcript));
        }
        if (engagementData.length > 0) {
            sessionStorage.setItem(STORAGE_KEY_ENGAGEMENT, JSON.stringify(engagementData));
        }
        if (coaching) {
            sessionStorage.setItem(STORAGE_KEY_COACHING, JSON.stringify(coaching));
        }
    } catch (error) {
        console.error('保存到 sessionStorage 失败:', error);
    }
}

function loadFromSessionStorage() {
    try {
        const transcriptStr = sessionStorage.getItem(STORAGE_KEY_TRANSCRIPT);
        const engagementStr = sessionStorage.getItem(STORAGE_KEY_ENGAGEMENT);
        const coachingStr = sessionStorage.getItem(STORAGE_KEY_COACHING);
        
        return {
            transcript: transcriptStr ? JSON.parse(transcriptStr) : [],
            engagementData: engagementStr ? JSON.parse(engagementStr) : [],
            coaching: coachingStr ? JSON.parse(coachingStr) : null,
        };
    } catch (error) {
        console.error('从 sessionStorage 加载失败:', error);
        return {
            transcript: [],
            engagementData: [],
            coaching: null,
        };
    }
}

function clearSessionStorage(): void {
    try {
        sessionStorage.removeItem(STORAGE_KEY_TRANSCRIPT);
        sessionStorage.removeItem(STORAGE_KEY_ENGAGEMENT);
        sessionStorage.removeItem(STORAGE_KEY_COACHING);
    } catch (error) {
        console.error('清除 sessionStorage 失败:', error);
    }
}

//四大记忆区
export default function useInterviewAnalysis(option?: UseInterviewAnalysisOptions){
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    const stored = loadFromSessionStorage();
    
    const [transcript, setTranscript] = useState<TranscriptItem[]>(stored.transcript);
    const [engagementData, setEngagementData] = useState<any[]>(stored.engagementData);
    const [coaching, setCoaching] = useState<CoachingData | null>(stored.coaching);

    useEffect(() => {
        saveToSessionStorage(transcript, engagementData, coaching);
    }, [transcript, engagementData, coaching]);

    const loadFromHistory = (detail: {
        transcript: TranscriptItem[];
        engagementData: any[];
        coaching: CoachingData | null;
    }) => {
        setTranscript(detail.transcript);
        setEngagementData(detail.engagementData);
        setCoaching(detail.coaching);
    };

    // 传进录音文件触发该动作
    const handleAudioUpload = async(e:React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(!file) return;

        const MAX_FILE_SIZE = 10 * 1024 * 1024;
        if(file.size > MAX_FILE_SIZE){
            alert('文件过大！为了保证 AI 分析速度，请上传 10MB 以内的音频文件。\n建议使用 MP3 或 M4A 格式替代 WAV 格式。');
            e.target.value='';
            return;
        }

        clearSessionStorage();
        setIsAnalyzing(true);
        setCoaching(null);
        setEngagementData([]);
        setTranscript([]);
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
                
                await saveAnalysisToHistory(
                    transcriptList,
                    engagementData,
                    coachingNorm,
                    file.name
                );
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
            clearSessionStorage();
            setTranscript([]);
            setEngagementData([]);
            setCoaching(null);
        }finally{
            setIsAnalyzing(false);
            e.target.value = '';
        }
    };

    return{
        isAnalyzing,
        transcript,
        engagementData,
        coaching,
        handleAudioUpload,
        exportTranscript,
        loadFromHistory,
    };
}