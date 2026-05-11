import apiClient from "../lib/axiosConfig";
import type { HistoryDashboard, HistoryRecord, MonthlyScoreData } from "../types/api";

export const getHistoryDashboard = async () : Promise<HistoryDashboard> => {
    return apiClient.get<HistoryDashboard>('/history/dashboard');
};

export const getMonthlyScore = async () : Promise<MonthlyScoreData[]> =>{
    return apiClient.get<MonthlyScoreData[]>('/history/monthly-scores');
};

export const getHistoryRecords = async () : Promise<HistoryRecord[]> =>{
    return apiClient.get<HistoryRecord[]>('/history/records');
};