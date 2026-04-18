// import React,{ useState, useRef, useEffect } from "react";
// import { transcribeAudio, anslyzeEngagement } from '.lib/ai';
import * as pdfjsLib from 'pdfjs-dist';
import { useState } from 'react';

//添加本地导入
const pdfWorkerUrl = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).href;

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
//把workerSrc设置为本地路径
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

// interface TranscriptItem{
//   speaker: 'A' | 'B';
//   text:string;
// }

// interface CoachingData{
//   strengths: string[];
//   opportunities:string[];
// }

// export default function App(){
//   const [activeTab, setActiveTab] = useState<'interview' | 'resume'>('interview');

// }

