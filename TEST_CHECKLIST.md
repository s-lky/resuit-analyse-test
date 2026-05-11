# 前后端联调快速测试清单

## 🚀 启动顺序

### 1. 启动后端（SpringBoot）
```bash
cd deepresume-backend
mvn spring-boot:run
```
等待看到类似 `Started Application in X seconds` 的消息

### 2. 启动前端（Vite）
```bash
npm run dev
```
等待看到 `Local: http://localhost:3000/`

---

## ✅ 测试步骤

### 第一步：测试用户注册

打开浏览器控制台（F12），在 Console 中执行：

```javascript
// 测试注册
fetch('http://localhost:8080/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'testuser',
    email: 'test@example.com',
    password: '123456'
  })
})
.then(res => res.json())
.then(data => console.log('注册结果:', data))
.catch(err => console.error('错误:', err));
```

**预期结果：**
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "createdAt": "2026-05-10 12:00:00"
    }
  }
}
```

---

### 第二步：测试用户登录

```javascript
// 测试登录
fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'testuser',
    password: '123456'
  })
})
.then(res => res.json())
.then(data => {
  console.log('登录结果:', data);
  // 保存 token
  localStorage.setItem('authToken', data.data.token);
  console.log('Token 已保存');
})
.catch(err => console.error('错误:', err));
```

**预期结果：** 与注册类似，返回 token 和用户信息

---

### 第三步：测试获取用户信息

```javascript
// 测试获取用户信息（需要先登录）
const token = localStorage.getItem('authToken');
fetch('http://localhost:8080/api/auth/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => console.log('用户信息:', data))
.catch(err => console.error('错误:', err));
```

**预期结果：**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "createdAt": "2026-05-10 12:00:00"
  }
}
```

---

### 第四步：通过 UI 测试

1. **访问前端页面：** http://localhost:3000

2. **注册新用户：**
   - 点击"注册"按钮
   - 填写用户名、邮箱、密码
   - 提交后应该自动登录并跳转到首页

3. **测试简历分析：**
   - 上传一个 PDF 简历
   - 点击"开始分析"
   - 观察是否有流式输出效果

4. **测试面试分析：**
   - 上传一个音频文件（MP3/WAV/M4A，<18MB）
   - 等待分析完成
   - 查看转录文本、参与度图表和辅导建议

5. **测试历史数据：**
   - 完成至少一次分析后
   - 查看历史数据面板是否正确显示

---

## 🔍 检查点

### ✅ 网络请求检查

打开浏览器开发者工具 → Network 标签：

1. **请求 URL 应该类似：**
   - `http://localhost:8080/api/auth/login`
   - `http://localhost:8080/api/transcribe-audio`
   - `http://localhost:8080/api/analyze-resume`

2. **请求头应该包含：**
   ```
   Authorization: Bearer eyJhbGci...
   Content-Type: application/json
   ```

3. **响应状态码：**
   - 成功：200 或 201
   - 未授权：401（会自动跳转登录页）
   - 其他错误：查看响应中的 message 字段

### ✅ Console 检查

打开浏览器开发者工具 → Console 标签：

1. **不应该有红色错误**（除了预期的警告）
2. **API 调用应该有日志输出**
3. **SSE 流式数据应该逐块显示**

### ✅ LocalStorage 检查

打开浏览器开发者工具 → Application → Local Storage：

应该看到：
- `authToken`: JWT Token 字符串
- `user`: 用户信息的 JSON 字符串

---

## 🐛 常见问题排查

### 问题 1：CORS 错误

**错误信息：**
```
Access to fetch at 'http://localhost:8080/api/...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**解决方法：**
在后端添加 CORS 配置（见 INTEGRATION_COMPLETE.md）

---

### 问题 2：404 Not Found

**可能原因：**
1. 后端未启动
2. API 路径错误
3. 环境变量配置错误

**检查步骤：**
```bash
# 1. 检查后端是否运行
curl http://localhost:8080/api/auth/login

# 2. 检查环境变量
cat .env | grep VITE_API_BASE_URL

# 3. 检查浏览器网络请求的完整 URL
```

---

### 问题 3：401 Unauthorized

**可能原因：**
1. Token 未设置
2. Token 已过期
3. Token 格式错误

**解决方法：**
```javascript
// 清除旧数据
localStorage.clear();

// 重新登录
// ...执行登录代码...
```

---

### 问题 4：SSE 流式响应不工作

**检查步骤：**
1. 确认后端设置了 `Content-Type: text/event-stream`
2. 查看 Network 标签，确认响应类型
3. 检查 Console 是否有解析错误

**测试 SSE：**
```javascript
const token = localStorage.getItem('authToken');
const eventSource = new EventSource(
  `http://localhost:8080/api/analyze-resume?text=测试简历`,
  { headers: { 'Authorization': `Bearer ${token}` } }
);

eventSource.onmessage = (event) => {
  console.log('收到数据:', event.data);
};

eventSource.onerror = (error) => {
  console.error('SSE 错误:', error);
  eventSource.close();
};
```

---

## 📊 性能检查

### 响应时间

| API | 预期响应时间 |
|-----|------------|
| 登录/注册 | < 500ms |
| 获取用户信息 | < 200ms |
| 音频转录 | 5-30s（取决于音频长度） |
| 参与度分析 | 2-10s |
| 辅导卡生成 | 2-10s |
| 简历分析（流式） | 实时逐块输出 |

### 文件大小限制

- 音频文件：< 18MB
- 简历文件：无明确限制（建议 < 10MB）

---

## ✨ 成功标志

当你看到以下现象时，说明前后端联调成功：

1. ✅ 可以正常注册和登录
2. ✅ Token 自动保存到 localStorage
3. ✅ 刷新页面后保持登录状态
4. ✅ 简历分析有流式输出效果
5. ✅ 面试分析能正确显示结果
6. ✅ 历史数据能正确加载
7. ✅ 没有 CORS 错误
8. ✅ 没有 404 错误

---

## 🎯 下一步

联调成功后：

1. **删除临时文件：**
   ```bash
   rm server.ts  # 删除简易后端
   ```

2. **优化代码：**
   - 移除 `src/lib/ai.ts`（如果不再使用）
   - 清理 console.log

3. **添加更多功能：**
   - 修改密码功能
   - 删除账户功能
   - 更多的错误处理

4. **部署准备：**
   - 配置生产环境变量
   - 构建前端：`npm run build`
   - 配置 Nginx 或其他 Web 服务器

---

祝测试顺利！🎉
