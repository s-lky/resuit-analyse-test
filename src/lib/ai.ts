import apiClient from "./axiosConfig";

/**
 * 音频转录 - 调用后端API
 */
export async function transcribeAudio(audioBase64: string, mimeType: string) {
  try {
    const response = await apiClient.post('/api/transcribe-audio', {
      audioBase64, 
      mimeType,
    });
    return response;
  } catch (error) {
    console.error('音频转录错误:', error);
    throw error;
  }
}

/**
 * 参与度分析 - 调用后端API
 */
export async function analyzeEngagement(transcript: string) {
  try {
    const response = await apiClient.post('/api/analyze-engagement', {
      transcript,
    });
    return response;
  } catch (error) {
    console.error('参与度分析错误:', error);
    return [];
  }
}
