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