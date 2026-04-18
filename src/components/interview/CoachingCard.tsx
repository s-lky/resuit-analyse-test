import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { CoachingData } from "../../hooks/useInterviewAnalysis";


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
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-success mb-3">
                                <CheckCircle2 size={12} />
                                表现优异的三件事
                            </div>
                            <ul className="space-y-2">
                                {data.strengths.map((s, i) =>(
                                    <li key={i} className="text-xs flex gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-sucsess mt-1 shrink-0" />
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
                                {data.opportunites.map((o, i) =>(
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