import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';
import multer from 'multer';
import OpenAI from 'openai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

const upload = multer({ dest: 'uploads/' });

app.use(express.json({ limit:'50mb' }));
app.use(express.urlencoded({ extended: true, limit:'100mb' }));

const deepseek = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY || 'dummy',
    baseURL: 'https://api.deepseek.com',
});

const qwenClient = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY || 'dummy',
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

app.post('/api/transcribe-audio', async(req, res) =>{
    const { audioBase64, mimeType } = req.body;

    if(audioBase64 && audioBase64.length > 18000000){
        return res.status(400).json({ error: '音频文件过大，请压缩后（如转换为 MP3）再上传' });
    }

    try{
        console.log('开始音频转录，使用原生 fetch 调用 qwen-audio-turbo 模型');

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

        const contentArray = result.output?.choices[0]?.message?.content || [];
        const textObj = contentArray.find((item: any) => item.text);
        const text = textObj ? textObj.text : '';

        console.log('转录结果：',text);

        const cleanText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        const jsonMatch = cleanText.match(/\[[\s\s]*\]/);

        if(jsonMatch){
            res.json(JSON.parse(jsonMatch[0]));
        }else{
            res.status(500).json({ error: '无法解析转录结果', raw: text });
        }
    }catch(error: any){
        console.error('Transcription Error:',error);
        res.status(500).json({
            error: '音频转录失败',
            details: error?.message || '未知错误'
        });
    }
});


app.post('/api/analyze-engagement',async(req,res) =>{
    const { transcript } = req.body;

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
            temperature:0.3,
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

app.post('/api/analyze-resume', async(req,res) =>{
    const { text } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try{
        const stream = await deepseek.chat.completions.create({
            model: 'deepseek-chat',
            messages:[
                { role: 'system', content:'你是一个专业的简历优化专家。请分析以下简历内容，并给出具体的优化建议。请使用流式输出。' },
                { role: 'user', content:text }
            ],
            stream:true,
        });

        for await(const chunk of stream){
            const content = chunk.choices[0]?.delta?.content || '';
            if(content){
                res.write(`data:${JSON.stringify({ content })}\n\n`);
            }
        }
        res.write('data: [DONE]\n\n');
        res.end();
    }catch(error){
        console.error('DeepSeek Error:', error);
        res.write(`dataL${JSON.stringify({ error: 'Analysis failed' })}\n\n`);
        res.end();
    }
});

app.post('/api/coaching-card', async(req,res) =>{
    const { transcript } = req.body;

    try{
        const response = await deepseek.chat.completions.create({
            model: 'deepseek-chat',
            messages:[
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

if(process.env.NODE_ENV !== 'production'){
    const vite = await createViteServer({
        server: { middlewareMode:true },
        appType: 'spa',
    });
    app.use(vite.middlewares);
}else{
    app.use(express.static('dist'));
    app.get('*',(req, res) =>{
        res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
}

app.listen(port,'0.0.0.0',() =>{
    console.log(`
        Server started
        Local:   http://localhost:${port}        
        Network: http://127.0.0.1:${port}
        `);
})