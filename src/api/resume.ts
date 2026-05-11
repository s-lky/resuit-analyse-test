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
    const userStr = localStorage.getItem('user');
    let userId = '';
    
    if(userStr){
        try{
            const user = JSON.parse(userStr);
            userId = user.id || '';
        }catch(e){
            console.error('Failed to parse user:', e);
        }
    }
    
    console.log('=== SSE请求开始 ===');
    console.log('Token:', token ? '存在' : '不存在');
    console.log('UserId:', userId);
    
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/analyze-resume`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'userId': userId,
        },
        body: JSON.stringify({ text: resumeText }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let receivedChunks = 0;

    try {
        while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
                console.log('=== 数据读取完成 ===');
                console.log('总共接收的数据块数量:', receivedChunks);
                console.log('剩余buffer:', buffer);
                break;
            }

            // 解码数据块
            const decodedText = decoder.decode(value, { stream: true });
            console.log('接收到原始数据:', decodedText.substring(0, 200)); // 打印前200个字符
            buffer += decodedText;
            
            // 按行分割SSE数据
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // 保留最后一个不完整的行

            for (const line of lines) {
                const trimmedLine = line.trim();
                
                // 跳过空行和注释
                if (!trimmedLine || trimmedLine.startsWith(':')) {
                    continue;
                }

                console.log('处理SSE行:', trimmedLine);

                // 解析 data: 字段 (兼容有无空格的情况)
                if (trimmedLine.startsWith('data:')) {
                    const dataStr = trimmedLine.startsWith('data: ') 
                        ? trimmedLine.slice(6)  // 移除 'data: ' 前缀
                        : trimmedLine.slice(5); // 移除 'data:' 前缀
                    
                    // 检查是否是结束标记
                    if (dataStr === '[DONE]') {
                        console.log('收到结束标记');
                        return;
                    }

                    try {
                        // 解析JSON数据
                        const parsed = JSON.parse(dataStr);
                        console.log('解析后的数据:', parsed);
                        if (parsed.content) {
                            receivedChunks++;
                            console.log('调用onChunk, 内容长度:', parsed.content.length, '内容:', parsed.content);
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