# 注册失败问题排查指南

## 🔍 问题现象

注册时弹窗提示"注册失败"，然后直接跳转到登录页面。

## 🛠️ 已修复的问题

### 1. Axios 响应拦截器优化

**问题：** 响应拦截器没有正确处理后端统一返回格式

**修复：** 
- 自动提取 `response.data.data` 字段
- 添加 400 错误处理（不跳转，让业务代码处理）
- 增强错误日志输出

### 2. Vite 代理配置调整

**问题：** vite.config.ts 中的代理配置可能与完整 URL 冲突

**修复：** 
- 注释掉代理配置（因为使用了完整的后端 URL）
- 如果需要代理，可以修改 `.env` 使用相对路径

### 3. 增强错误日志

**修复：** 
- 在 RegisterForm 中添加详细的 console.log
- 输出请求数据和响应数据
- 输出完整的错误信息

---

## 📋 排查步骤

### 第一步：打开浏览器开发者工具

按 F12 打开开发者工具，切换到以下标签：

1. **Console（控制台）** - 查看日志和错误
2. **Network（网络）** - 查看 HTTP 请求
3. **Application（应用）** - 查看 LocalStorage

### 第二步：尝试注册并观察

#### Console 标签应该显示：

**成功情况：**
```
发送注册请求: {username: "test", email: "test@example.com", password: "123456"}
注册响应: {token: "eyJhbGci...", user: {...}}
```

**失败情况（会显示详细错误）：**
```
发送注册请求: {username: "test", email: "test@example.com", password: "123456"}
API Error: Error: Request failed with status code 400
注册错误详情: Error: Request failed with status code 400
错误响应: {data: {code: 400, message: "用户名已存在"}, status: 400, ...}
请求参数错误: 用户名已存在
```

#### Network 标签应该显示：

**检查请求：**
1. 找到 `register` 或 `/auth/register` 请求
2. 点击该请求，查看：
   - **Headers（请求头）**
     - Request URL: 应该是 `http://localhost:8080/api/auth/register`
     - Request Method: POST
     - Content-Type: application/json
   - **Payload（请求体）**
     - 应该包含：`{username: "...", email: "...", password: "..."}`
   - **Response（响应）**
     - 状态码：200 或 201（成功），400/401/500（失败）
     - 响应数据：`{code: 200, message: "注册成功", data: {...}}`

### 第三步：根据错误类型排查

---

## 🐛 常见错误及解决方案

### 错误 1：CORS 跨域错误

**Console 显示：**
```
Access to XMLHttpRequest at 'http://localhost:8080/api/auth/register' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**原因：** 后端未配置 CORS

**解决：** 在 SpringBoot 后端添加 CORS 配置

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

或者在 Controller 上添加注解：
```java
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    // ...
}
```

---

### 错误 2：404 Not Found

**Network 显示：**
- Status Code: 404
- Response: `{code: 404, message: "请求的资源不存在"}`

**可能原因：**
1. 后端未启动
2. API 路径错误
3. 环境变量配置错误

**排查步骤：**

1. **检查后端是否运行：**
   ```bash
   curl http://localhost:8080/api/auth/register
   ```

2. **检查环境变量：**
   ```bash
   # 查看 .env 文件
   cat .env | grep VITE_API_BASE_URL
   # 应该显示：VITE_API_BASE_URL=http://localhost:8080/api
   ```

3. **检查 Network 标签中的 Request URL：**
   - 应该是：`http://localhost:8080/api/auth/register`
   - 如果是：`http://localhost:3000/api/auth/register` → 说明 baseURL 配置错误

**解决：**
- 确保后端正在运行
- 确认 `.env` 文件配置正确
- 重启前端开发服务器（修改 .env 后需要重启）

---

### 错误 3：400 Bad Request

**Network 显示：**
- Status Code: 400
- Response: `{code: 400, message: "用户名已存在"}` 或其他错误信息

**可能原因：**
1. 用户名已存在
2. 邮箱已被注册
3. 密码长度不足
4. 邮箱格式不正确
5. 缺少必填字段

**排查步骤：**

1. **查看 Console 中的错误信息：**
   ```
   请求参数错误: 用户名已存在
   ```

2. **查看 Network 标签的 Response：**
   ```json
   {
     "code": 400,
     "message": "用户名已存在",
     "data": null
   }
   ```

**解决：**
- 使用不同的用户名和邮箱
- 确保密码长度 >= 6
- 确保邮箱格式正确

---

### 错误 4：500 Internal Server Error

**Network 显示：**
- Status Code: 500
- Response: `{code: 500, message: "服务器内部错误"}`

**可能原因：**
1. 后端代码错误
2. 数据库连接失败
3. 后端服务异常

**排查步骤：**

1. **查看后端控制台日志**
2. **检查数据库连接**
3. **检查后端是否有异常堆栈信息**

**解决：**
- 查看后端日志定位具体错误
- 确保数据库正常运行
- 检查后端配置

---

### 错误 5：网络错误

**Console 显示：**
```
网络错误，请检查网络连接
```

**可能原因：**
1. 后端服务未启动
2. 防火墙阻止连接
3. 端口被占用

**排查步骤：**

1. **测试后端是否可访问：**
   ```bash
   curl http://localhost:8080/api/auth/register
   ```

2. **检查端口是否被占用：**
   ```bash
   # Windows
   netstat -ano | findstr :8080
   
   # 查看进程
   tasklist | findstr <PID>
   ```

**解决：**
- 启动后端服务
- 检查防火墙设置
- 更换端口或停止占用端口的进程

---

## 🔧 快速诊断脚本

在浏览器 Console 中执行以下代码进行快速诊断：

```javascript
// 1. 检查环境变量配置
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);

// 2. 测试后端连通性
fetch('http://localhost:8080/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'test_' + Date.now(),
    email: 'test_' + Date.now() + '@example.com',
    password: '123456'
  })
})
.then(res => {
  console.log('状态码:', res.status);
  return res.json();
})
.then(data => {
  console.log('响应数据:', data);
})
.catch(err => {
  console.error('请求失败:', err);
});
```

---

## ✅ 验证修复

修复后，正常的注册流程应该是：

1. **填写注册表单**
   - 用户名：testuser
   - 邮箱：test@example.com
   - 密码：123456
   - 确认密码：123456

2. **点击注册按钮**

3. **Console 显示：**
   ```
   发送注册请求: {username: "testuser", email: "test@example.com", password: "123456"}
   注册响应: {token: "eyJhbGci...", user: {...}}
   ```

4. **Network 显示：**
   - Request URL: `http://localhost:8080/api/auth/register`
   - Status Code: 200 或 201
   - Response: `{code: 200, message: "注册成功", data: {...}}`

5. **页面行为：**
   - 显示 Toast 提示："注册成功！"
   - 自动登录并跳转到首页
   - **不会**跳转到登录页面

6. **LocalStorage 应该有：**
   - `authToken`: JWT Token 字符串
   - `user`: 用户信息的 JSON 字符串

---

## 📞 如果问题仍然存在

请提供以下信息：

1. **Console 标签的完整输出**（截图或复制文本）
2. **Network 标签中 register 请求的详细信息：**
   - Request URL
   - Status Code
   - Request Payload
   - Response Body
3. **后端控制台的日志输出**
4. **浏览器版本和操作系统**

这样可以更准确地定位问题！
