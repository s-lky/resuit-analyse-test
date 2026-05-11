export interface TranscriptItem{
    speaker: 'A' | 'B';
    text: string;
}

export interface EngagementData{
    time: string;
    engagement: number;
}

export interface CoachingData{
    strengths: string[];
    opportunities: string[];
}

export interface ResumeAnalysisResponse{
    content?: string;
    error?: string;
}

export interface ApiError{
    message: string;
    status?: number;
}

export interface User {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface MonthlyScoreData{
    month: string;
    myScore: number;
    svgScore: number;
}

export interface HistoryRecord{
    id: number;
    date: string;
    type: string;
    fileName: string;
    score: number;
}

export interface UserAdvantages{
    advantages: string[];
}

export interface HistoryDashboard{
    totalScore: number;
    scoreChange: number;
    totalHours: number;
    monthlyData: MonthlyScoreData[];
    historyRecords: HistoryRecord[];
    advantages: string[];
}

// 面试分析相关类型
export interface TranscribeAudioRequest {
    audioBase64: string;
    mimeType: string;
}

export interface TranscribeAudioResponse {
    transcript: TranscriptItem[];
}

export interface AnalyzeEngagementRequest {
    transcript: string; // JSON字符串格式的对话数组
}

export interface AnalyzeEngagementResponse {
    time: string;
    engagement: number;
}

export interface CoachingCardRequest {
    transcript: string; // JSON字符串格式的对话数组
}

export interface CoachingCardResponse {
    strengths: string[];
    opportunities: string[];
}

// 简历分析SSE响应
export interface ResumeAnalysisSSEChunk {
    content?: string;
    error?: string;
}