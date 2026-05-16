# Resuit Analyse - 面试分析与简历优化平台

一个基于 React + TypeScript + Vite 的前端项目，配合 SpringBoot 后端实现面试实时智能分析和简历智能优化建议。

## 快速开始

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

## 技术栈

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

## 项目结构

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
## 👥 贡献

欢迎提交 Issue 和 Pull Request！
