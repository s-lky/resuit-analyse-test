//算完数据之后的排版面板

import type { TranscriptItem } from "../../hooks/useInterviewAnalysis";

//接收数据信息
interface Props{
    transcript: TranscriptItem[];
}

//准备排版
export default function TranscriptBox({ transcript }: Props){
    if(transcript.length === 0){
        return(
            <div className="h-full flex flex-col items-center justify-center text-text-secondary border-2 border-dashed border-border rounded-xl">
                <p>暂无数据，请上传音频文件开始分析</p>
            </div>
        );
    }

    //把每一句话都拿出来照模版进行排版
    return(
        <>
            {transcript.map((item, i) => (
                //变位置
                <div key={i} className={`flex flex-col ${item.speaker === 'A' ? 'items-start' : 'items-end'}`}>
                    //变换不同人字体
                    <div className={`bubble ${item.speaker === 'A' ? 'bubble-a' : 'bubble-b'}`}>
                        //变名字
                        <span className="speaker">{item.speaker === 'A' ? '面试官(A)' : '候选人(B)'}</span>
                        {item.text}
                    </div>
                </div>
            ))}
        </>
    );
}