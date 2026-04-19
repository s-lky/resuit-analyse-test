// 主文件
import { useState } from "react";
import Sidebar from './components/Sidebar';
import InterviewPanel from './components/InterviewPanel';
import ResumePanel from './components/ResumePanel';

//主程序，导出app
export default function App(){
  //给页面按个开关，activeTab是当前频道，setActiveTab是换台，interview是默认频道，<'interview' | 'resume'>是只能在这两个之间切换
  const [activeTab, setActiveTab] = useState<'interview' | 'resume'>('interview');

  //以下是网页上真正能看到的东西
  return(
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      {/* 左侧边栏 */}
      {/* 用setActiveTab把频道切换成简历 */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 主内容 */}
      <main className="flex-1 flex flex-col p-8 gap-8 overflow-hidden">
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-text-primary">
            {activeTab === 'interview' ? '面试实时智能分析面板':'简历智能优化建议'}
          </h1>
          {/* 装逼小东西 */}
          {/* 小圆点（w-1.5 h-1.5）,animate-pulse让这个小圆点像呼吸灯一样闪烁*/}
          <div className="flex items-center gap-2 px-3 py-1 bg-accent-light text-accent rounded-full text-xs font-medium">
            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
              AI引擎已就绪
          </div>
        </header>

        {/* 中间的频道播放器如果 频道是 'interview'，屏幕上就放映 InterviewPanel，否则就是ResumePanel */}
        {activeTab === 'interview' ? <InterviewPanel /> : <ResumePanel/>}
      </main>
    </div>
  );
}