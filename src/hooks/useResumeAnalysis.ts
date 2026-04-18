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

        try{ //发送纯文本给模型
            const response = await fetch('/api/analyze-resume',{
                method:'POST',
                headers:{ 'Content-Type':'application/json' },
                body: JSON.stringify({ text: resumeText }),
            });

            //链接
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if(reader){
                while(true){ //流式接收模型返回的数据，一个字发出就一个字接收，进入死循环，除非模型发完了就不会结束
                    const { done, value } = await reader.read();
                    if(done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');

                    //把字帖屏幕上，收到的电报格式大概是这样的：data: {"content": "你"}。要把 data: 切掉，拿出里面的 "你" 字。
                    for(const line of lines){
                        if(line.startsWith('data: ')){
                            const data = line.slice(6);
                            if(data === '[DONE]') break;
                            try{
                                const parsed = JSON.parse(data);
                                if(parsed.content){  //把之前已经显示在屏幕上的字（prev），加上刚刚收到的新字，重新显示出来
                                    setResumeAnalysis(prev => prev + parsed.content);
                                }
                            }catch(e) {}
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