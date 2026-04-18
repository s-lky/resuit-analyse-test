import { AreaChart,CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Area } from "recharts";

// 要一份只包含了时间和情绪分数的表格
interface Props{
    data : any[];
}

export default function EngagementChart({ data }: Props){
    return(
        // 只占一半高度并且只在有数据的时候画图
        <div className="card h-1/2">
            <div className="card-header">
                <span>参与度情绪波动</span>
            </div>
            <div className="flex-1 p-4">
                {data.length > 0 ? (
                    // ResponsiveContainer自动拉伸到刚好填满的程度
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs> 
                                {/* colorEngage 渐变颜料 */}
                                <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            {/* 五笔成画 */}
                            {/* CartesianGrid背景网格。画上虚线（3 3）。为了页面干净，规定不画竖线（vertical={false}），只画横向的参考线。 */}
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            {/* 隐藏坐标轴，且高度只在0-100 */}
                            <XAxis dataKey="time" hide />
                            <YAxis hide domain={[0,100]} />

                            {/* 互动放大 */}
                            <Tooltip />

                            {/* 照engagement来画 */}
                            <Area 
                            // 平滑曲线
                                type="monotone"  
                                dataKey="engagement"
                                stroke="#2563eb"
                                fillOpacity={1}
                                fill="url(#colorEngage)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-xs text-text-secondary">
                        等待音频分析生成图表
                    </div>
                )}
            </div>
        </div>
    );
}