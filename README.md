# Resuit Analyse - 面试分析与简历优化平台

一个基于 React + TypeScript + Vite 的前端项目，配合 SpringBoot 后端实现面试实时智能分析和简历智能优化建议。

## 🚀 快速开始

### 前置要求

- Node.js >= 18
- Java >= 17 (用于运行后端)
- Maven >= 3.6 (用于构建后端)

### 安装依赖

```bash
npm install
```

### 配置环境变量

确保 `.env` 文件存在并配置正确：

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### 启动后端（SpringBoot）

```bash
cd deepresume-backend
mvn spring-boot:run
```

后端将运行在 `http://localhost:8080`

### 启动前端（Vite）

```bash
npm run dev
```

前端将运行在 `http://localhost:3000`

## 📚 功能特性

- ✅ **用户认证系统** - 注册、登录、JWT Token 管理
- ✅ **简历智能分析** - PDF 简历解析，AI 流式输出优化建议
- ✅ **面试实时分析** - 音频转录、参与度分析、辅导建议生成
- ✅ **历史数据面板** - 查看历史分析报告和月度趋势
- ✅ **响应式设计** - 适配各种屏幕尺寸

## 📖 文档

- [API 使用指南](./API_USAGE.md) - 详细的 API 使用说明和示例代码
- [前后端联调说明](./INTEGRATION_COMPLETE.md) - 联调完成情况和注意事项
- [快速测试清单](./TEST_CHECKLIST.md) - 逐步测试指南
- [后端接口文档](./deepresume-backend接口文档.pdf) - 完整的后端 API 定义

## 🛠️ 技术栈

### 前端

- **框架**: React 19 + TypeScript
- **构建工具**: Vite 6
- **HTTP 客户端**: Axios
- **状态管理**: React Context + Hooks
- **UI 组件**: 自定义组件
- **PDF 解析**: pdfjs-dist

### 后端

- **框架**: Spring Boot
- **数据库**: MySQL
- **ORM**: MyBatis
- **认证**: JWT
- **AI 集成**: 通义千问、DeepSeek

## 📁 项目结构

```
resuit-analyse-test/
├── src/
│   ├── api/              # API 接口封装
│   │   ├── auth.ts       # 认证相关接口
│   │   ├── history.ts    # 历史数据接口
│   │   ├── interview.ts  # 面试分析接口
│   │   └── resume.ts     # 简历分析接口
│   ├── components/       # React 组件
│   ├── contexts/         # Context 提供者
│   ├── hooks/            # 自定义 Hooks
│   ├── lib/              # 工具库
│   ├── types/            # TypeScript 类型定义
│   └── App.tsx           # 主应用组件
├── public/               # 静态资源
├── .env                  # 环境变量
├── package.json          # 依赖配置
├── tsconfig.json         # TypeScript 配置
└── vite.config.ts        # Vite 配置
```

## 🔧 开发指南

### 添加新的 API 接口

1. 在 `src/types/api.ts` 中定义类型
2. 在 `src/api/` 目录下创建或更新 API 文件
3. 在组件或 hooks 中使用新 API

示例：

```typescript
// src/api/example.ts
import apiClient from "../lib/axiosConfig";
import type { ExampleRequest, ExampleResponse } from "../types/api";

export const exampleApi = {
    getData: (data: ExampleRequest) =>
        apiClient.post<ExampleResponse>('/example', data),
};
```

### 处理 SSE 流式响应

```typescript
import { analyzeResumeStream } from '@/api/resume';

await analyzeResumeStream(resumeText, (chunk) => {
    console.log('收到数据块:', chunk);
    // 更新 UI
});
```

## 🐛 常见问题

### CORS 错误

如果看到跨域错误，请检查 SpringBoot 后端的 CORS 配置。参考 [INTEGRATION_COMPLETE.md](./INTEGRATION_COMPLETE.md)

### 401 Unauthorized

Token 可能已过期，请重新登录。

### 404 Not Found

检查 `.env` 中的 `VITE_API_BASE_URL` 是否正确，确认后端正在运行。

## 📝 许可证

MIT

## 👥 贡献

欢迎提交 Issue 和 Pull Request！
