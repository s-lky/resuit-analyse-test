# API 使用指南

本文档说明如何在前端项目中使用已实现的 API 接口与 SpringBoot 后端进行联调。

## 📋 目录

- [环境配置](#环境配置)
- [认证相关 API](#认证相关-api)
- [面试分析 API](#面试分析-api)
- [简历优化 API](#简历优化-api)
- [历史数据 API](#历史数据-api)
- [使用示例](#使用示例)

---

## 🔧 环境配置

确保 `.env` 文件中配置了正确的后端地址：

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

**注意：** 
- SpringBoot 后端默认运行在 `http://localhost:8080`
- 前端 Vite 开发服务器运行在 `http://localhost:3000`
- 所有 API 请求会自动添加 `/api` 前缀

---

## 🔐 认证相关 API

### 1. 用户注册

```typescript
import { authApi } from '@/api/auth';

const result = await authApi.register({
    username: 'testuser',
    email: 'test@example.com',
    password: '123456'
});

// 返回数据
console.log(result.token);  // JWT Token
console.log(result.user);   // 用户信息
```

### 2. 用户登录

```typescript
import { authApi } from '@/api/auth';

const result = await authApi.login({
    username: 'testuser',
    password: '123456'
});

// 保存 Token 到 localStorage
localStorage.setItem('authToken', result.token);
```

### 3. 获取当前用户信息

```typescript
import { authApi } from '@/api/auth';

const user = await authApi.getCurrentUser();
console.log(user.username, user.email);
```

### 4. 修改密码

```typescript
import { authApi } from '@/api/auth';

await authApi.changePassword({
    oldPassword: '123456',
    newPassword: 'newpass123'
});
```

### 5. 删除账户

```typescript
import { authApi } from '@/api/auth';

await authApi.deleteAccount();
// 账户删除后需要重新登录
```

---

## 🎤 面试分析 API

### 1. 音频转录

```typescript
import { transcribeAudio } from '@/api/interview';

// 将音频文件转换为 Base64
const audioFile = document.getElementById('audioInput').files[0];
const reader = new FileReader();

reader.onload = async (e) => {
    const base64 = e.target.result as string;
    // 移除 data:audio/mp3;base64, 前缀
    const pureBase64 = base64.split(',')[1];
    
    const result = await transcribeAudio({
        audioBase64: pureBase64,
        mimeType: 'audio/mp3'
    });
    
    console.log(result.transcript); // 转录的对话文本
};

reader.readAsDataURL(audioFile);
```

### 2. 面试参与度分析

```typescript
import { analyzeEngagement } from '@/api/interview';

const transcript = [
    { speaker: 'A', text: '请简单介绍一下你自己。' },
    { speaker: 'B', text: '我是一名有3年经验的Java开发工程师...' }
];

const engagementData = await analyzeEngagement({
    transcript: JSON.stringify(transcript)
});

// 返回 10 个时间点的参与度数据
engagementData.forEach(item => {
    console.log(`${item.time}: ${item.engagement}`);
});
```

### 3. 生成面试辅导卡

```typescript
import { generateCoachingCard } from '@/api/interview';

const transcript = [
    { speaker: 'A', text: '请介绍你的项目经验' },
    { speaker: 'B', text: '我参与过...' }
];

const coaching = await generateCoachingCard({
    transcript: JSON.stringify(transcript)
});

console.log('优势:', coaching.strengths);
console.log('改进点:', coaching.opportunities);
```

---

## 📄 简历优化 API（SSE 流式）

```typescript
import { analyzeResumeStream } from '@/api/resume';

const resumeText = `张三
Java开发工程师
工作经历：
1. ABC公司 (2020-2023)
   - 负责后端开发
   - 使用Spring Boot框架`;

let fullContent = '';

await analyzeResumeStream(resumeText, (chunk) => {
    // 实时接收每个数据块
    fullContent += chunk;
    console.log('收到数据块:', chunk);
    
    // 可以实时更新 UI
    document.getElementById('analysis-result').innerHTML = fullContent;
});

console.log('分析完成');
```

**在 React 组件中使用：**

```tsx
import { useState } from 'react';
import { analyzeResumeStream } from '@/api/resume';

function ResumeAnalysis() {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        setLoading(true);
        setContent('');
        
        try {
            await analyzeResumeStream(resumeText, (chunk) => {
                setContent(prev => prev + chunk);
            });
        } catch (error) {
            console.error('分析失败:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button onClick={handleAnalyze} disabled={loading}>
                {loading ? '分析中...' : '开始分析'}
            </button>
            <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
    );
}
```

---

## 📊 历史数据 API

### 1. 获取完整的历史数据面板

```typescript
import { getHistoryDashboard } from '@/api/history';

const dashboard = await getHistoryDashboard();

console.log('总分:', dashboard.totalScore);
console.log('分数变化:', dashboard.scoreChange);
console.log('总时长:', dashboard.totalHours);
console.log('月度数据:', dashboard.monthlyData);
console.log('历史记录:', dashboard.historyRecords);
console.log('优势:', dashboard.advantages);
```

### 2. 获取月度分数数据

```typescript
import { getMonthlyScore } from '@/api/history';

const monthlyData = await getMonthlyScore();
monthlyData.forEach(item => {
    console.log(`${item.month}: 我的分数=${item.myScore}, 平均分=${item.svgScore}`);
});
```

### 3. 获取历史记录列表

```typescript
import { getHistoryRecords } from '@/api/history';

const records = await getHistoryRecords();
records.forEach(record => {
    console.log(`${record.date} - ${record.type} - ${record.fileName} - 分数:${record.score}`);
});
```

---

## 💡 使用示例

### 完整的登录流程

```typescript
import { authApi } from '@/api/auth';

async function handleLogin(username: string, password: string) {
    try {
        const result = await authApi.login({ username, password });
        
        // 保存 Token
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // 跳转到首页
        window.location.href = '/';
    } catch (error) {
        console.error('登录失败:', error);
        alert('用户名或密码错误');
    }
}
```

### 完整的面试分析流程

```typescript
import { transcribeAudio, analyzeEngagement, generateCoachingCard } from '@/api/interview';

async function analyzeInterview(audioFile: File) {
    try {
        // 1. 转录音频
        const base64 = await fileToBase64(audioFile);
        const transcription = await transcribeAudio({
            audioBase64: base64.split(',')[1],
            mimeType: audioFile.type
        });
        
        // 2. 分析参与度
        const engagement = await analyzeEngagement({
            transcript: JSON.stringify(transcription.transcript)
        });
        
        // 3. 生成辅导建议
        const coaching = await generateCoachingCard({
            transcript: JSON.stringify(transcription.transcript)
        });
        
        return {
            transcript: transcription.transcript,
            engagement,
            coaching
        };
    } catch (error) {
        console.error('分析失败:', error);
        throw error;
    }
}

// 辅助函数：文件转 Base64
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
```

---

## ⚠️ 注意事项

### 1. Token 自动管理

axios 配置已自动处理 Token：
- 请求时自动从 `localStorage` 读取 Token 并添加到请求头
- 响应拦截器自动处理 401 错误（未授权），跳转到登录页

### 2. 统一响应格式

所有后端接口返回统一格式：

```json
{
    "code": 200,
    "message": "操作成功",
    "data": { /* 具体数据 */ }
}
```

axios 响应拦截器会自动提取 `response.data`，所以你拿到的就是 `data` 字段的内容。

### 3. 错误处理

统一的错误处理已在 axios 配置中实现：
- 401: 自动跳转到登录页
- 403: 控制台输出"禁止访问"
- 404: 控制台输出"资源不存在"
- 500: 控制台输出"服务器内部错误"

你也可以在调用时添加额外的错误处理：

```typescript
try {
    const result = await authApi.login({ username, password });
    // 处理成功
} catch (error) {
    // 处理错误
    if (error.response?.status === 401) {
        alert('用户名或密码错误');
    }
}
```

### 4. SSE 流式响应

简历分析使用 SSE（Server-Sent Events）流式输出：
- 不能使用 axios，必须使用原生 `fetch` API
- 需要手动解析 SSE 格式的数据
- 记得在组件卸载时清理资源

---

## 🚀 快速测试

### 启动后端

```bash
cd deepresume-backend
mvn spring-boot:run
```

### 启动前端

```bash
npm run dev
```

### 测试登录

访问 `http://localhost:3000`，使用注册的账号登录即可开始测试。

---

## 📝 后续工作

1. **移除 server.ts**：确认前后端联调成功后，可以删除项目根目录的 `server.ts` 文件
2. **更新 vite.config.ts**：如果需要代理配置，可以在 vite.config.ts 中添加 proxy
3. **完善错误提示**：根据实际需求优化用户体验和错误提示

---

## 🔗 相关文档

- [后端接口文档](./deepresume-backend接口文档.pdf)
- [Axios 配置](../src/lib/axiosConfig.ts)
- [类型定义](../src/types/api.ts)
