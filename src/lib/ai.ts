

/**
 * 音频转录 - 调用后端API
 */
export async function transcribeAudio(audioBase64: string, mimeType: string) {
  try {
    const response = await fetch('/api/transcribe-audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioBase64, mimeType }),
    });

    if (!response.ok) {
      throw new Error('音频转录失败');
    }

    const data = await response.json();
    return data;
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
    const response = await fetch('/api/analyze-engagement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('参与度分析错误:', error);
    return [];
  }
}
