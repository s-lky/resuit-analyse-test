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

export interface AuthResponse {
    token: string;
    user: User;
}
