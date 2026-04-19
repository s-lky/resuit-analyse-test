// 侧边栏组件-菜单按钮，切换不同业务
import { BarChart3, Settings, Mic, FileText } from "lucide-react"; //图标库

//接收App的安排
interface SidebarProps{
    activeTab: 'interview' | 'resume'; //现在正在的部分
    setActiveTab: (tab: 'interview' | 'resume') => void; //换台
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps){
    return(
        // 侧边栏的外壳和logo，<aside> 规定了这个面板的宽度（w-64）
        <aside className="w-64 bg-sidebar-bg text-white flex flex-col p-6">
            <div className="flex items-center gap-2 text-xl font-extrabold mb-10">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                    <BarChart3 size={20} />
                </div>
                DeepRecuit
            </div>
            {/* 导航菜单，一共有四个按钮 */}
            {/* active让按钮高亮，onClick切换频道 */}
            <nav className="flex-1">
                <div
                    className={`nav-item ${activeTab === 'interview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('interview')}
                >
                    <Mic size={18} />
                    面试智能分析
                </div>
                <div
                    className={`nav-item ${activeTab === 'resume' ? 'active' : ''}`}
                    onClick={() => setActiveTab('resume')}
                >
                    <FileText size={18} />
                    简历优化助手
                </div>

                {/* 还没做完-先空着，opacity人按钮半透明，cursor-not-allowed禁止通行 */}
                <div className="nav-item opacity-50 curcor-not-allowed">
                    <BarChart3 size={18} />
                    历史数据报告
                </div>
                <div className="nav-item opacity-50 cursor-not-allowed">
                    <Settings size={18} />
                    系统设置
                </div>
            </nav>

            <div className="mt-auto pt-6 border-t border-white/10 text-xs text-white/40">
                Powered by Deepseek-v3&Qwen
            </div>
        </aside>
    );
}