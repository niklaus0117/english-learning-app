import React, { useState } from 'react';
import { Icons } from './Icons';

interface MorningReadingPageProps {
  onBack: () => void;
}

const MOCK_MORNING_LIST = [
  {
    id: 'm1',
    title: '点击我，直接跳转关注【每日英语听力|晨读打卡】微信公众号',
    duration: '00:01',
    size: '21.83KB',
    date: '2021-10-09',
    playCount: 40898,
    imageUrl: 'https://picsum.photos/400/300?random=301',
    hasTranslation: false,
  },
  {
    id: 'm2',
    title: '1124期 | 说得少与说得多',
    duration: '00:13',
    size: '2.50MB',
    date: '2026-04-15',
    playCount: 1002,
    imageUrl: 'https://picsum.photos/400/300?random=302',
    hasTranslation: true,
  },
  {
    id: 'm3',
    title: '1123期 | 我们不是输了比赛',
    duration: '00:13',
    size: '3.78MB',
    date: '2026-04-14',
    playCount: 2323,
    imageUrl: 'https://picsum.photos/400/300?random=303',
    hasTranslation: true,
  },
  {
    id: 'm4',
    title: '1122期 | 当创作成为本能',
    duration: '00:13',
    size: '2.81MB',
    date: '2026-04-13',
    playCount: 3282,
    imageUrl: 'https://picsum.photos/400/300?random=304',
    hasTranslation: true,
  },
  {
    id: 'm5',
    title: '1121期 | 真理所求',
    duration: '00:15',
    size: '3.12MB',
    date: '2026-04-12',
    playCount: 4105,
    imageUrl: 'https://picsum.photos/400/300?random=305',
    hasTranslation: true,
  }
];

const MorningReadingPage: React.FC<MorningReadingPageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('全部');

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header (Fixed) */}
      <header className="pt-4 px-4 pb-2 flex items-center justify-between bg-gray-500 text-white flex-shrink-0 z-30">
        <button onClick={onBack} className="flex items-center text-white cursor-pointer">
          <Icons.ChevronLeft size={24} />
          <span className="text-base ml-1">返回</span>
        </button>
        <h1 className="text-lg font-medium">每日英语听力 | 晨读专栏</h1>
        <button className="flex items-center text-white p-1 cursor-pointer">
          <Icons.List size={24} />
        </button>
      </header>

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto w-full">
        {/* Upper Background Section (Scrolls) */}
        <div className="bg-gradient-to-b from-gray-500 to-gray-400 text-white pb-5 rounded-b-2xl -mt-[1px]">
          {/* Search Bar */}
          <div className="px-4 pt-1 mb-4">
          <div className="bg-white/20 rounded-lg px-3 py-1.5 flex items-center">
            <Icons.Search className="text-white/70 mr-2" size={16} />
            <input 
              type="text" 
              placeholder="搜索" 
              className="bg-transparent w-full outline-none text-xs text-white placeholder-white/70"
            />
          </div>
        </div>

        {/* Description */}
        <div className="px-4 mb-4 text-sm leading-relaxed text-white/90">
          每日英语听力独家出品，晨读专栏全新上线，带你读美句学英语。关注微信公众号【每日英语听力 | 晨读打卡】，获取每期晨读的完整版知识讲义哦！<br/>
          *工作日每日早晨 8:30 更新，周末及法定节假日休息。会员可直接观看完整版解析笔记月度合集。
        </div>

        {/* Stats */}
        <div className="px-4 flex items-center justify-between text-xs text-white/80">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Icons.PlayCircle size={14} />
              <span>5406万</span>
            </div>
            <div className="flex items-center gap-1">
              <Icons.Calendar size={14} />
              <span>2025-04-16</span>
            </div>
          </div>
          <div className="bg-white/20 px-2 py-1 rounded flex items-center gap-1">
            <Icons.Type size={12} />
            <span>词汇量5200</span>
          </div>
        </div>
        </div>

        {/* Foreground Layer Wrapper */}
        <div className="bg-white rounded-t-2xl -mt-4 relative z-10 min-h-full flex flex-col">
          {/* Sticky Action Bar & Tabs */}
          <div className="sticky top-0 z-20 bg-white rounded-t-2xl pt-1">
            {/* Action Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-6 text-sm text-gray-700">
              <button className="flex items-center gap-1 font-medium cursor-pointer">
                <Icons.ArrowDownUp size={16} />
                推荐排序
              </button>
              <button className="flex items-center gap-1 font-medium cursor-pointer">
                <Icons.Share size={16} />
                分享
              </button>
            </div>
            <button className="bg-blue-500 text-white text-sm font-medium px-4 py-1.5 rounded-full flex items-center gap-1 cursor-pointer">
              <Icons.Plus size={16} />
              收藏
            </button>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto hide-scrollbar px-4 border-b border-gray-100 bg-white">
            {['全部', '讲义完整版合集 2026.03', '讲义完整版合集 2026.02'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-4 text-[15px] whitespace-nowrap relative cursor-pointer ${activeTab === tab ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="px-4 pt-2 pb-24 bg-white">
          {MOCK_MORNING_LIST.map((item) => (
          <div key={item.id} className="flex gap-3 py-4 border-b border-gray-50 last:border-0">
            {/* Image */}
            <div className="relative w-[120px] h-[75px] rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              {item.id !== 'm1' && (
                <div className="absolute top-1 right-1 bg-black/40 rounded-full p-0.5">
                  <Icons.Play className="text-white fill-white" size={12} />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <h3 className="text-base text-gray-900 leading-tight line-clamp-2 mb-1">{item.title}</h3>
              
              <p className="text-xs text-gray-400 mb-1">
                {item.duration} | {item.size}
              </p>
              
              <div className="flex items-center text-xs text-gray-400 gap-4">
                <div className="flex items-center gap-1">
                  <Icons.Calendar size={12} />
                  <span>{item.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icons.PlayCircle size={12} />
                  <span>{item.playCount}</span>
                </div>
              </div>
            </div>

            {/* Download Action */}
            <div className="flex flex-col items-center justify-center pl-2">
              <button className="p-1 text-gray-400">
                <Icons.Download size={20} />
              </button>
              {item.hasTranslation && (
                <span className="text-[10px] text-gray-400 mt-1">(译文)</span>
              )}
            </div>
          </div>
        ))}
        </div>
      </div>
      </div>
      
      {/* Mini Player for this page */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-200 flex items-center p-3 pb-safe z-50">
        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 relative mr-3">
          <img src="https://picsum.photos/100/100?random=306" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
             <Icons.Play className="text-white fill-white" size={16} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">每日英语听力 | 晨读专栏 - 1111期 | 眼泪不是...</h4>
          <p className="text-xs text-gray-500 truncate">There is a sacredness in tears. They are not the mark...</p>
        </div>
        <button className="p-2 text-gray-700 ml-2">
          <Icons.ListMusic size={24} />
        </button>
      </div>
    </div>
  );
};

export default MorningReadingPage;
