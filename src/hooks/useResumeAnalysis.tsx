import * as pdfjsLib from 'pdfjs-dist'
import { useState, useEffect } from 'react';
import { useToast } from './useToast';
import { analyzeResumeStream } from '../api/resume';
import { saveResumeAnalysis } from '../api/history';

const pdfWorkerUrl = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).href;
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const STORAGE_KEY_RESUME_TEXT = 'resume_text';
const STORAGE_KEY_RESUME_ANALYSIS = 'resume_analysis';

export default function useResumeAnalysis(){
    const { info, success, error } = useToast();
    
    const storedText = sessionStorage.getItem(STORAGE_KEY_RESUME_TEXT) || '';
    const storedAnalysis = sessionStorage.getItem(STORAGE_KEY_RESUME_ANALYSIS) || '';
    
    const [resumeText, setResumeText] = useState(storedText);
    const [resumeAnalysis, setResumeAnalysis] = useState(storedAnalysis);
    const [isStreaming, setIsStreaming] = useState(false);

    useEffect(() => {
        if (resumeText) {
            sessionStorage.setItem(STORAGE_KEY_RESUME_TEXT, resumeText);
        }
        if (resumeAnalysis) {
            sessionStorage.setItem(STORAGE_KEY_RESUME_ANALYSIS, resumeAnalysis);
        }
    }, [resumeText, resumeAnalysis]);

    const loadFromHistory = (data: { resumeText: string; analysisResult: string }) => {
        setResumeText(data.resumeText);
        setResumeAnalysis(data.analysisResult);
    };

    const handleResumeUpload = async(e:React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(!file) return;

        try{ 
            info('简历上传成功，开始解析...');
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = async () => {
                const typedarray = new Uint8Array(reader.result as ArrayBuffer);
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                let fullText = '';
                for(let i = 1;i <= pdf.numPages;i++){
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item:any) => item.str).join(' ');
                    fullText += pageText + '\n'; 
                }
                setResumeText(fullText);
                setResumeAnalysis('');
                sessionStorage.removeItem(STORAGE_KEY_RESUME_ANALYSIS);
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

        let fullAnalysisResult = '';

        try{
            await analyzeResumeStream(resumeText, (chunk) => {
                setResumeAnalysis(prev => prev + chunk);
                fullAnalysisResult += chunk;
            });
            success('分析完成');
            
            try {
                await saveResumeAnalysis({
                    fileName: '简历分析_' + new Date().toLocaleDateString(),
                    content: resumeText,
                    analysisResult: fullAnalysisResult,
                    score: 75,
                });
                info('已保存到历史记录');
            } catch (saveError) {
                console.error('保存历史记录失败:', saveError);
            }
        }catch(error: any){
            console.error('Streaming Error:', error);
            setResumeAnalysis('请求失败，请稍后重试');
            error('简历分析失败')
        }finally{
            setIsStreaming(false);
        }
    };

    return{
        resumeText,
        resumeAnalysis,
        isStreaming,
        handleResumeUpload,
        analyzeResume,
        loadFromHistory,
    };
}