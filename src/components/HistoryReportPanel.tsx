import { useEffect, useState } from "react"
import type { HistoryDashboard } from "../types/api"
import { getHistoryDashboard } from "../api/history";
import { TrendingUp, Award, Clock, Eye } from 'lucide-react';
import { LineChart, Line, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Legend, Tooltip } from "recharts";
import { useToast } from "../hooks/useToast";

export default function HistroyReportPanel(){
  const { success, error } = useToast();
  const[data, setData] = useState<HistoryDashboard | null>(null);
  const[loading, setLoading] = useState(true);
  const[errorState, setErrorState] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() =>{
    const fetchData = async () =>{
      try{
        setLoading(true);
        const result = await getHistoryDashboard();
        setData(result);
        setErrorState(null);
      }catch(err){
        setErrorState('获取数据失败，请稍后重试');
        console.error('Failed to fetch history data: ',err);
      }finally{
        setLoading(false);
      }
    };

    fetchData();
  }, []);
 
  const handleViewDetail = async (record: any) => {
    try {
      setSelectedRecord(record);
      setShowDetail(true);
      // 这里可以根据 record.analysisId 调用详情接口
      success('已打开详情页面');
    } catch (err) {
      error('获取详情失败');
    }
  };

  if(loading){
    return(
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-text-secondary">加载中...</p>
        </div>
      </div>
    );
  }

  if(errorState){
    return(
      <div className="flex-1 flex- items-center justify-center">
        <div className="text-center text-red-500">
          <p>{errorState}</p>
        </div>
      </div>
    );
  }

  if(!data) return null;

  const { totalScore, scoreChange, totalHours, monthlyData, historyRecords, advantages } = data;

  return(
    <div className="flex-1 overflow-y-auto space-y-6">
      {/* 顶部kpi数据卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 面试综合得分 */}
        <div className="card p-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary mb-1">综合面试得分</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-accent">{totalScore}</span>
                <span className="text-sm text-text-secondary mb-1">分</span>
              </div>
              <div className={`flex items-center gap-1 mt-2 text-sm ${scoreChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                <TrendingUp size={16} />
                <span>{scoreChange >= 0 ? '+' : ''}{scoreChange}% 较上周{scoreChange >= 0 ? '进步':'下降'}</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
            <Award size={24}/>
            </div>
          </div>
        </div>
      
      {/* 累计分析时长 */}
        <div className="card p-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary mb-1">累计分析时长</p>
              <div className="flex-items-end gap-2">
                <span className="text-4xl font-bold text-blue-500">{totalHours}</span>
                <span className="text-sm text-text-secondary mb-1">小时</span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-blue-500 text-sm">
                <Clock size={16} />
                <span>持续成长中</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
              <Clock size={24}/>
            </div>
          </div>
        </div>

        {/* 核心高频优势 */}
        <div className="card p-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-text-secondary mb-3">核心高频优势</p>
              <div className="flex flex-wrap gap-2">
                {advantages.map((tag, index) =>(
                  <span
                    key={index}
                    className="px-3 py-1 bg-linear-to-r from-green-50 to-emerald-50 text-green-600 text-sm rounded-full border border-green-200 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-green-500 text-sm">
                <TrendingUp size={16} />
                <span>能力标签持续积累中</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-500 ml-1">
              <Award size={24}/>
            </div>
          </div>
        </div>
      </div>

        {/* 中间：能力成长曲线图 */}
          <div className="card">
              <div className="card-header">
                  <span>能力成长趋势</span>
                  <span className="text-xs text-text-secondary">近 6 个月数据分析</span>
              </div>
              <div className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis
                              dataKey="month"
                              stroke="#64748b"
                              fontSize={12}
                          />
                          <YAxis
                              stroke="#64748b"
                              fontSize={12}
                              domain={[50, 100]}
                          />
                          <Tooltip
                              contentStyle={{
                                  backgroundColor: '#fff',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '8px',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              }}
                          />
                          <Legend />
                          <Line
                              type="monotone"
                              dataKey="myScore"
                              name="我的表现"
                              stroke="#3b82f6"
                              strokeWidth={3}
                              dot={{ r: 5, fill: '#3b82f6' }}
                              activeDot={{ r: 7, fill: '#3b82f6' }}
                          />
                          <Line
                              type="monotone"
                              dataKey="avgScore"
                              name="全网平均水平"
                              stroke="#94a3b8"
                              strokeWidth={2}
                              strokeDasharray="5 5"
                              dot={{ r: 4, fill: '#94a3b8' }}
                              activeDot={{ r: 6, fill: '#94a3b8' }}
                          />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </div>
          
          {/* 底部：历史记录表格 */}
            <div className="card">
                <div className="card-header">
                    <span>分析历史记录</span>
                    <span className="text-xs text-text-secondary">共 {historyRecords.length} 条记录</span>
                </div>
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">日期</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">分析类型</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">文件名称</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">AI评分</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyRecords.map((record) => (
                                    <tr
                                        key={record.id}
                                        className="border-b border-border hover:bg-slate-50 transition-colors"
                                    >
                                        <td className="py-3 px-4 text-sm text-text-primary">{record.date}</td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                                                    record.type === '面试'
                                                        ? 'bg-blue-50 text-blue-600'
                                                        : 'bg-purple-50 text-purple-600'
                                                }`}
                                            >
                                                {record.type}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-text-primary">{record.fileName}</td>
                                        <td className="py-3 px-4">
                                            <span className="text-sm font-semibold text-accent">{record.score}分</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <button 
                                                onClick={() => handleViewDetail(record)}
                                                className="flex items-center gap-1 px-3 py-1 text-sm text-accent hover:text-accent/80 transition-colors"
                                            >
                                                <Eye size={14} />
                                                查看报告
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        {/* 详情弹窗 */}
        {showDetail && selectedRecord && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                {selectedRecord.type}分析报告 - {selectedRecord.fileName}
                            </h2>
                            <button 
                                onClick={() => setShowDetail(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-4">
                            <p><strong>日期：</strong>{selectedRecord.date}</p>
                            <p><strong>评分：</strong>{selectedRecord.score}分</p>
                            <p><strong>类型：</strong>{selectedRecord.type}</p>
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">
                                    详情功能开发中，将显示完整的分析内容和数据...
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div> 
  );
}