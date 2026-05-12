import apiClient from "../lib/axiosConfig";
import type { 
    HistoryDashboard, 
    HistoryRecord, 
    MonthlyScoreData,
    SaveInterviewAnalysisRequest,
    SaveResumeAnalysisRequest,
    InterviewAnalysisRecord,
    ResumeAnalysisRecord,
    HistoryListItem,
    InterviewAnalysisDetail,
    ResumeAnalysisDetail
} from "../types/api";

export const getHistoryDashboard = async () : Promise<HistoryDashboard> => {
    return apiClient.get<HistoryDashboard>('/history/dashboard');
};

export const getMonthlyScore = async () : Promise<MonthlyScoreData[]> =>{
    return apiClient.get<MonthlyScoreData[]>('/history/monthly-scores');
};

export const getHistoryRecords = async () : Promise<HistoryRecord[]> =>{
    return apiClient.get<HistoryRecord[]>('/history/records');
};

export const saveInterviewAnalysis = async (data: SaveInterviewAnalysisRequest): Promise<number> => {
    return apiClient.post<number>('/history/interview', data);
};

export const saveResumeAnalysis = async (data: SaveResumeAnalysisRequest): Promise<number> => {
    return apiClient.post<number>('/history/resume', data);
};

// 获取面试分析历史列表
export const getInterviewHistoryList = async (): Promise<HistoryListItem[]> => {
    return apiClient.get<HistoryListItem[]>('/history/interview/list');
};

// 获取面试分析详情
export const getInterviewDetail = async (id: number): Promise<InterviewAnalysisDetail> => {
    return apiClient.get<InterviewAnalysisDetail>(`/history/interview/${id}`);
};

// 删除面试分析记录
export const deleteInterviewRecord = async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/history/interview/${id}`);
};

// 获取简历分析历史列表
export const getResumeHistoryList = async (): Promise<HistoryListItem[]> => {
    return apiClient.get<HistoryListItem[]>('/history/resume/list');
};

// 获取简历分析详情
export const getResumeDetail = async (id: number): Promise<ResumeAnalysisDetail> => {
    return apiClient.get<ResumeAnalysisDetail>(`/history/resume/${id}`);
};

// 删除简历分析记录
export const deleteResumeRecord = async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/history/resume/${id}`);
};