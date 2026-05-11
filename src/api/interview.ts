import apiClient from "../lib/axiosConfig";
import type {
    TranscribeAudioRequest,
    TranscribeAudioResponse,
    AnalyzeEngagementRequest,
    AnalyzeEngagementResponse,
    CoachingCardRequest,
    CoachingCardResponse,
} from "../types/api";

/**
 * 音频转录 - 将面试音频转为对话文本
 */
export const transcribeAudio = (data: TranscribeAudioRequest) =>
    apiClient.post<TranscribeAudioResponse>('/transcribe-audio', data);

/**
 * 面试参与度分析 - 分析对话中的参与度变化趋势
 */
export const analyzeEngagement = (data: AnalyzeEngagementRequest) =>
    apiClient.post<AnalyzeEngagementResponse[]>('/analyze-engagement', data);

/**
 * 面试辅导卡生成 - 根据面试对话生成辅导建议
 */
export const generateCoachingCard = (data: CoachingCardRequest) =>
    apiClient.post<CoachingCardResponse>('/coaching-card', data);
