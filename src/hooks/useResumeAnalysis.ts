import * as pdfjsLib from 'pdfjs-dist'
import { useState } from 'react';
//引入pdfjs-dist进行PDF解析工具
const pdfWorkerUrl = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).href;
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;


export default function useResumeAnalysis(){
    const [resumeText, setResumeText] = useState(''); //从PDF里抠出的纯文字
    const [resumeAnalysis, setResumeAnalysis] = useState(''); //给出的诊断报告
    const [isStreaming, setIsStreaming] = useState(false); //看是否在运行

    const handleResumeUpload = async(e:React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(!file) return;

        try{ //FileReader把pdf解构成0和1喂给getDocument
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
            };
        }catch(error){
            console.error('PDF Error:',error);
        }
    };

    const analyzeResume = async() => {
        if(!resumeText) return;

        setResumeAnalysis('');
        setIsStreaming(true);

        try{
            const response = await fetch('/api/analyze-resume',{
                method:'POST',
                headers:{ 'Content-Type':'application/json' },
                body: JSON.stringify({ text: resumeText }),
            });

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            if(reader){
                let shouldStop = false;
                while(!shouldStop){
                    const { done, value } = await reader.read();
                    if(done) break;

                    buffer += decoder.decode(value, { stream: true });
                    
                    // 处理完整的行
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for(const line of lines){
                        if(line.startsWith('data: ')){
                            const data = line.slice(6).trim();
                            if(data === '[DONE]'){
                                shouldStop = true;
                                break;
                            }
                            if(data){
                                try{
                                    const parsed = JSON.parse(data);
                                    if(parsed.content){
                                        setResumeAnalysis(prev => prev + parsed.content);
                                    }
                                }catch(e){
                                    console.warn('JSON parse error:', e, 'data:', data);
                                }
                            }
                        }
                    }
                }
            }
        }catch(error){
            console.error('Streaming Error:',error);
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