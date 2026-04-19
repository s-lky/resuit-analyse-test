import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { CoachingData } from "../../hooks/useInterviewAnalysis";

// 受到数据包data，要么是满的要么是空的
interface Props{
    data: CoachingData | null;
}

export default function CoachingCard({ data }: Props){
    return(
        <div className="card h-1/2">
            <div className="card-header">
                <span>AI智能辅导卡</span>
            </div>
            <div className="flex-1 p-5 overflow-y-auto space-y-6">
                {data ? (
                    <>
                        <div> 
                            {/* text-success（绿色代码），并且加上了一个绿色的打钩图标 CheckCircle */}
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-success mb-3">
                                <CheckCircle2 size={12} />
                                表现优异的三件事
                            </div>
                            {/* 把“优点数组（strengths）”里的句子一条一条列出来。shrink-0：保证每句话前面都有的w-1.5 h-1.5（很小很小）的绿色圆点在建议文字特别长（折成了两行）的时候，让浏览器不会把这个圆点压扁 */}
                            <ul className="space-y-2">
                                {data.strengths.map((s, i) =>(
                                    <li key={i} className="text-xs flex gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-success mt-1 shrink-0" />
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-danger mb-3">
                                <AlertCircle size={12} />
                                错过的三个机会
                            </div>

                            <ul className="space-y-2">
                                {data.opportunities.map((o, i) =>(
                                    <li key={i} className="text-xs flex gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-danger mt-1 shrink-0" />
                                        {o}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center text-xs text-text-secondary">
                        分析完成后将显示建议
                    </div>
                )}
            </div>
        </div>
    );
}