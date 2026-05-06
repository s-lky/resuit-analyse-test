import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';
import multer from 'multer';
import OpenAI from 'openai';
import { createServer as createViteServer } from 'vite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

// ES 模块（import）默认没有 __dirname（当前文件所在目录），手动兼容，方便后续读取前端静态文件、上传目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//创建Express实例
const app = express();
const port = 3000;

// 配置文件上传目录为 uploads/
const upload = multer({ dest: 'uploads/' });

app.use(express.json({ limit:'50mb' }));
app.use(express.urlencoded({ extended: true, limit:'100mb' }));

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 模拟用户数据库（实际项目中应使用真实数据库）
const users: Array<{
    id: string;
    username: string;
    email: string;
    password: string;
    createdAt: Date;
}> = [];

// 生成JWT令牌
const generateToken = (userId: string) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// 验证JWT中间件
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
    return res.status(401).json({ message: '访问令牌缺失' });
        }

    try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    (req as any).userId = decoded.userId;
        next();
    } catch (error) {
    return res.status(403).json({ message: '无效的访问令牌' });
        }
    };

// 用户注册接口
app.post('/api/auth/register', async (req, res) => {
    try {
    const { username, email, password } = req.body;

    // 验证输入
    if (!username || !email || !password) {
        return res.status(400).json({ message: '请填写所有必填字段' });
    }

    // 检查用户名是否已存在
    if (users.some(u => u.username === username)) {
        return res.status(400).json({ message: '用户名已存在' });
    }

    // 检查邮箱是否已存在
    if (users.some(u => u.email === email)) {
        return res.status(400).json({ message: '邮箱已被注册' });
    }

    // 密码加密
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 创建新用户
    const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password: hashedPassword,
        createdAt: new Date()
    };

    users.push(newUser);

    // 生成JWT令牌
    const token = generateToken(newUser.id);

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
        token,
        user: userWithoutPassword
        });
    } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: '注册失败，请稍后重试' });
        }
});

// 用户登录接口
app.post('/api/auth/login', async (req, res) => {
    try {
    const { username, password } = req.body;

    // 验证输入
    if (!username || !password) {
        return res.status(400).json({ message: '请填写用户名和密码' });
    }

    // 查找用户
    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 生成JWT令牌
    const token = generateToken(user.id);

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;
    res.json({
        token,
        user: userWithoutPassword
        });
    } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '登录失败，请稍后重试' });
    }
});

// 获取当前用户信息接口
app.get('/api/auth/me', authenticateToken, (req, res) => {
    try {
    const userId = (req as any).userId;
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        return res.status(404).json({ message: '用户不存在' });
    }

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
    } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: '获取用户信息失败' });
    }
});

const deepseek = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY || 'dummy',
    baseURL: 'https://api.deepseek.com',
});

const qwenClient = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY || 'dummy',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

// 接口1：音频转录-TranscriptBox组件
app.post('/api/transcribe-audio', async(req, res) =>{
      // 1. 获取前端传来的 Base64 音频和格式
    const { audioBase64, mimeType } = req.body;

      // 2. 限制音频大小（避免过大导致接口失败）
    if(audioBase64 && audioBase64.length > 18000000){
        return res.status(400).json({ error: '音频文件过大，请压缩后（如转换为 MP3）再上传' });
    }

    try{
        console.log('开始音频转录，使用原生 fetch 调用 qwen-audio-turbo 模型');
        // 3. 直接调用阿里云原生音频接口（不使用OpenAI封装）
        const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',{
            method: 'POST',
            headers:{
                'Authorization':`Bearer ${process.env.DASHSCOPE_API_KEY}`,
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                model:'qwen-audio-turbo',
                input:{
                    messages:[
                        {
                            role:'user',
                            content: [
                                { "audio":`data:${mimeType};base64,${audioBase64}` },
                                { "text": '请将这段面试音频转录为对话记录。区分面试官(A)和候选人(B)。以JSON数组格式返回，格式示例：[{"speaker": "A", "text": "..."}, {"speaker": "B", "text": "..."}]。只返回JSON，不要有其他内容。' }
                            ]
                        }
                    ]
                },
                parameters: {}
            })
        });

        const result = await response.json();

        if(result.code){
            console.error('DashScope API 错误：',result);
            throw new Error(`API错误:${result.message}`);
        }

        
        // 4. 解析AI返回结果，提取纯文本
        const contentArray = result.output?.choices[0]?.message?.content || [];
        const textObj = contentArray.find((item: any) => item.text);
        const text = textObj ? textObj.text : '';

        console.log('转录结果：',text);

        // 5. 清洗结果：去掉``json标记，提取JSON数组
        const cleanText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        
        // 尝试直接解析，如果失败再使用正则提取
        let parsedData;
        try {
            // 先尝试直接解析整个文本
            parsedData = JSON.parse(cleanText);
        } catch (e) {
            // 如果失败，使用正则提取JSON数组
            const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                parsedData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('无法解析转录结果');
            }
        }
        
        // 6. 返回解析后的JSON给前端
        res.json(parsedData);
    }catch(error: any){
        console.error('Transcription Error:',error);
        res.status(500).json({
            error: '音频转录失败',
            details: error?.message || '未知错误'
        });
    }
});

// 接口2:面试参与度分析-EngagementChart组件
app.post('/api/analyze-engagement',async(req,res) =>{
    const { transcript } = req.body; //对话文本

    try{
        console.log('开始参与度分析，使用 qwen3.6-plus 模型');

        const response = await qwenClient.chat.completions.create({
            model: 'qwen3.6-plus',
            messages:[
                {
                    role:'system',
                    content:'你是专业的面试分析师，擅长从对话中分析候选人的情绪和参与度变化。'
                },
                {
                    role: 'user',
                    content:`分析以下面试对话，生成参与度波动数据。要求：
1. 返回JSON数组，包含10个时间点的数据
2. 每个数据点格式：{"time": "时间戳", "engagement": 0-100的数值}
3. 根据对话内容的积极性、回答长度、互动频率来判断参与度
4. 只返回JSON数组

对话记录：
${transcript}`
                }
            ],
            temperature:0.3,  //数组越低，结果越稳定
        });

        const content = response.choices[0]?.message?.content || '';
        console.log('参与度分析结果',content);

        const cleanText = content.replace(/```json\s*/g,'').replace(/```\s*/g,'');
        const jsonMatch = cleanText.match(/\[[\s\S]*\]/);

        if(jsonMatch){
            res.json(JSON.parse(jsonMatch[0]));
        }else{
            res.json([]);
        }
    }catch(error: any){
        console.error('Engagement Analysis Error:', error);
        console.error('Error details:', error?.response?.data || error?.message);
        res.json([]);
    }
});

// 接口3：流式简历优化
app.post('/api/analyze-resume', async(req,res) =>{
    const { text } = req.body;
    // 设置 SSE 流式响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // 禁用代理缓冲

    try{
        console.log('开始简历分析，使用流式输出');
        
        const stream = await deepseek.chat.completions.create({
            model: 'deepseek-chat',
            messages:[
                { role: 'system', content:'你是一个专业的简历优化专家。请分析以下简历内容，并给出具体的优化建议。' },
                { role: 'user', content:text }
            ],
            stream: true, // 开启流式输出
        });
        
        // 逐段读取流，实时发给前端
        for await(const chunk of stream){
            const content = chunk.choices[0]?.delta?.content || '';
            if(content){
                // SSE 格式：data: {json}\n\n
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }
        
        // 发送结束标记
        res.write('data: [DONE]\n\n');
        res.end();
    }catch(error: any){
        console.error('DeepSeek Error:', error);
        // 错误时也要用 SSE 格式发送
        res.write(`data: ${JSON.stringify({ error: error.message || 'Analysis failed' })}\n\n`);
        res.end();
    }
});

// 接口4：辅导卡-CoachingCard
app.post('/api/coaching-card', async(req,res) =>{
    const { transcript } = req.body;

    try{
        const response = await deepseek.chat.completions.create({
            model: 'deepseek-chat',
            messages:[ // 强制要求返回固定JSON结构：优点3条、机会3条
                { role: 'system', 
                    content:'你是一个面试教练。根据提供的面试对话记录，生成一份"辅导卡"。列出被面试人员做得好的3件事和错过的3个机会。请以JSON格式返回，格式如下：{"strengths": ["...", "...", "..."], "opportunities": ["...", "...", "..."]}' 
                },
                { role: 'user', content:transcript }
            ],
            response_format: { type: 'json_object' }
        });
        res.json(JSON.parse(response.choices[0].message.content || '{}'));
    }catch(error){
        console.error('DeepSeek Error:', error);
        res.status(500).json({ error: 'Failed to generate coaching card' });
    }
});
// Vite 全栈整合
// 开发环境：使用 Vite 中间件，热更新前端
if(process.env.NODE_ENV !== 'production'){
    const vite = await createViteServer({
        server: { middlewareMode:true },
        appType: 'spa',
    });
    app.use(vite.middlewares);
    // 生产环境：托管前端打包后的 dist 文件夹
}else{
    app.use(express.static('dist'));
    app.get('*',(req, res) =>{
        res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
}

// 启动服务,0.0.0.0 允许局域网 / 外部访问
app.listen(port,'0.0.0.0',() =>{
    console.log(`
        Server started
        Local:   http://localhost:${port}
        Network: http://127.0.0.1:${port}
        `);
})