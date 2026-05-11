import apiClient from "../lib/axiosConfig";

/**
 * 简历分析 - SSE流式输出
 * @param resumeText 简历文本内容
 * @param onChunk 接收每个数据块的回调函数
 * @returns Promise，在流结束时resolve
 */
export const analyzeResumeStream = async (
    resumeText: string,
    onChunk: (content: string) => void
): Promise<void> => {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/analyze-resume`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text: resumeText }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
        while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
                break;
            }

            // 解码数据块
            buffer += decoder.decode(value, { stream: true });
            
            // 按行分割SSE数据
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // 保留最后一个不完整的行

            for (const line of lines) {
                const trimmedLine = line.trim();
                
                // 跳过空行和注释
                if (!trimmedLine || trimmedLine.startsWith(':')) {
                    continue;
                }

                // 解析 data: 字段
                if (trimmedLine.startsWith('data: ')) {
                    const dataStr = trimmedLine.slice(6); // 移除 'data: ' 前缀
                    
                    // 检查是否是结束标记
                    if (dataStr === '[DONE]') {
                        return;
                    }

                    try {
                        // 解析JSON数据
                        const parsed = JSON.parse(dataStr);
                        if (parsed.content) {
                            onChunk(parsed.content);
                        }
                        if (parsed.error) {
                            throw new Error(parsed.error);
                        }
                    } catch (e) {
                        console.error('Failed to parse SSE data:', dataStr, e);
                    }
                }
            }
        }
    } finally {
        reader.releaseLock();
    }
};