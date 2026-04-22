// src/components/HistoryReportPanel.tsx
import { TrendingUp, Clock, Award, Eye } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// 模拟历史数据（后续可接后端API）
const mockMonthlyData = [
  { month: '1月', myScore: 65, avgScore: 60 },
  { month: '2月', myScore: 68, avgScore: 61 },
  { month: '3月', myScore: 72, avgScore: 62 },
  { month: '4月', myScore: 75, avgScore: 63 },
  { month: '5月', myScore: 78, avgScore: 64 },
  { month: '6月', myScore: 85, avgScore: 65 },
];

const mockHistoryRecords = [
  { id: 1, date: '2026-04-20', type: '面试', fileName: '前端工程师面试.mp3', score: 88 },
  { id: 2, date: '2026-04-18', type: '简历', fileName: '张三-简历.pdf', score: 82 },
  { id: 3, date: '2026-04-15', type: '面试', fileName: '产品经理面试.mp3', score: 79 },
  { id: 4, date: '2026-04-10', type: '面试', fileName: '后端开发面试.mp3', score: 85 },
  { id: 5, date: '2026-04-05', type: '简历', fileName: '李四-简历.pdf', score: 76 },
];

const advantages = ['逻辑清晰', '沟通自信', '技术扎实'];

export default function HistoryReportPanel() {
  return (
    <div className="flex-1 overflow-y-auto space-y-6">
      {/* 顶部：KPI 数据卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 综合面试得分 */}
        <div className="card p-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary mb-1">综合面试得分</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-accent">85</span>
                <span className="text-sm text-text-secondary mb-1">分</span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-green-500 text-sm">
                <TrendingUp size={16} />
                <span>+5% 较上周进步</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
              <Award size={24} />
            </div>
          </div>
        </div>

        {/* 累计分析时长 */}
        <div className="card p-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary mb-1">累计分析时长</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-blue-500">12.5</span>
                <span className="text-sm text-text-secondary mb-1">小时</span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-blue-500 text-sm">
                <Clock size={16} />
                <span>持续成长中</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
              <Clock size={24} />
            </div>
          </div>
        </div>

        {/* 核心高频优势 */}
        <div className="card p-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-text-secondary mb-3">核心高频优势</p>
              <div className="flex flex-wrap gap-2">
                {advantages.map((tag, index) => (
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
                <span>能力标签持续积累</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-500 ml-2">
              <Award size={24} />
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
            <LineChart data={mockMonthlyData}>
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
          <span className="text-xs text-text-secondary">共 {mockHistoryRecords.length} 条记录</span>
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
                {mockHistoryRecords.map((record) => (
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
                      <button className="flex items-center gap-1 px-3 py-1 text-sm text-accent hover:text-accent/80 transition-colors">
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
    </div>
  );
}