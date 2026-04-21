import * as pdfjsLib from 'pdfjs-dist'
import { useState } from 'react';
import { useToast } from './useToast';
//引入pdfjs-dist进行PDF解析工具
const pdfWorkerUrl = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).href;
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;


export default function useResumeAnalysis(){
    const { info, success, error } = useToast();
    const [resumeText, setResumeText] = useState(''); //从PDF里抠出的纯文字
    const [resumeAnalysis, setResumeAnalysis] = useState(''); //给出的诊断报告
    const [isStreaming, setIsStreaming] = useState(false); //看是否在运行

    const handleResumeUpload = async(e:React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(!file) return;

        try{ 
            //FileReader把pdf解构成0和1喂给getDocument
            info('简历上传成功，开始解析...');
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = async () => {
                const typedarray = new Uint8Array(reader.result as ArrayBuffer);
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                let fullText = '';
                //循环遍历简历，用join(' ')拼成一整段，每一页都塞进fullText，最后存入setResumeText
                for(let i = 1;i <= pdf.numPages;i++){
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item:any) => item.str).join(' ');
                    fullText += pageText + '\n'; 
                }
                setResumeText(fullText);
                success('简历解析完成');
            };
        }catch(error){
            console.error('PDF Error:',error);
            error('简历解析失败');
        }
    };

    const analyzeResume = async() => {
        if(!resumeText) return;

        setResumeAnalysis('');
        setIsStreaming(true);
        info('AI分析中')

        try{
            const response = await fetch('/api/analyze-resume',{
                method:'POST',
                headers:{ 'Content-Type':'application/json' },
                body: JSON.stringify({ text: resumeText }),
            });

            if(!response.ok){
                throw new Error(`请求失败: ${response.status}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            if(reader){
                let isDone = false;
                while(!isDone){
                    const { done, value } = await reader.read();
                    if(done) break;

                    // 解码并添加到缓冲区
                    buffer += decoder.decode(value, { stream: true });
                    
                    // 按行分割处理
                    const lines = buffer.split('\n');
                    // 保留最后一个不完整的行
                    buffer = lines.pop() || '';

                    for(const line of lines){
                        if(line.startsWith('data: ')){
                            const data = line.slice(6).trim();
                            
                            if(data === '[DONE]'){
                                isDone = true;
                                break;
                            }
                            
                            if(data){
                                try{
                                    const parsed = JSON.parse(data);
                                    if(parsed.content){
                                        setResumeAnalysis(prev => prev + parsed.content);
                                    }else if(parsed.error){
                                        console.error('分析错误:', parsed.error);
                                        setResumeAnalysis('分析失败：' + parsed.error);
                                        isDone = true;
                                        break;
                                    }
                                }catch(e){
                                    console.warn('JSON 解析错误:', e);
                                }
                            }
                        }
                    }
                }
            }
            success('分析完成');
        }catch(error: any){
            console.error('Streaming Error:', error);
            setResumeAnalysis('请求失败，请稍后重试');
            error('简历分析失败')
        }finally{
            setIsStreaming(false);
        }
    };

    //打包发给ResumePanel
    return{
        resumeText,
        resumeAnalysis,
        isStreaming,
        handleResumeUpload,
        analyzeResume,
    };
}