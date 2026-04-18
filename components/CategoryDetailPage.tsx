import React, { useState } from 'react';
import { Icons } from './Icons';

interface CategoryDetailPageProps {
  title: string;
  onBack: () => void;
  onItemClick?: (item: any) => void;
}

const MOCK_EPISODES = [
  {
    id: 'e1',
    title: '《幕府将军》泽井杏奈对话《洛基》汤姆·希德勒斯顿 Anna Sawai & To...',
    duration: '38:26',
    size: '127.62MB',
    date: '2024-08-20',
    imageUrl: 'https://picsum.photos/400/300?random=401',
    hasTranslation: true,
  },
  {
    id: 'e2',
    title: '《烈火战车》安东尼·麦凯对话《小学风云》泰勒·詹姆斯·威廉姆 Anthon...',
    duration: '47:13',
    size: '172.81MB',
    date: '2024-08-05',
    imageUrl: 'https://picsum.photos/400/300?random=402',
    hasTranslation: true,
  },
  {
    id: 'e3',
    title: '《玛丽和乔治》尼古拉斯·加利齐纳对话《一天》利奥·伍德尔 Nicholas G...',
    duration: '33:06',
    size: '120.83MB',
    date: '2024-07-22',
    imageUrl: 'https://picsum.photos/400/300?random=403',
    hasTranslation: true,
  },
  {
    id: 'e4',
    title: '《早间新闻》詹妮弗·安妮斯顿对话《...》...',
    duration: '45:12',
    size: '150.20MB',
    date: '2024-07-10',
    imageUrl: 'https://picsum.photos/400/300?random=404',
    hasTranslation: true,
  }
];

const CategoryDetailPage: React.FC<CategoryDetailPageProps> = ({ title, onBack, onItemClick }) => {
  const [activeTab, setActiveTab] = useState('双语精选');

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header (Fixed) */}
      <header className="pt-4 px-4 pb-2 flex items-center justify-between bg-[#8B4545] text-white flex-shrink-0 z-30">
        <button onClick={onBack} className="flex items-center text-white cursor-pointer">
          <Icons.ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-medium">{title}</h1>
        <button className="p-1 cursor-pointer">
          <Icons.List size={24} />
        </button>
      </header>

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto w-full">
        {/* Upper Background Section (Scrolls) */}
        <div className="bg-gradient-to-b from-[#8B4545] to-[#6B3E3E] text-white pb-5 rounded-b-2xl -mt-[1px]">
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
          选自 Youtube 的 Variety 频道，《Actors on Actors》（演员对谈）是一档由《Variety》（综艺）主办的明星一对一谈话节目。在每一期节目中，主办方邀请两位优秀的职业演员，以聊天和谈话的形式，对职业生涯与表演艺术进行共同探讨。
        </div>

        {/* Stats */}
        <div className="px-4 flex items-center justify-between text-xs text-white/80">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Icons.PlayCircle size={14} />
              <span>313万</span>
            </div>
            <div className="flex items-center gap-1">
              <Icons.Calendar size={14} />
              <span>2025-04-12</span>
            </div>
          </div>
          <div className="bg-white/20 px-2 py-1 rounded flex items-center gap-1">
            <Icons.Type size={12} />
            <span>词汇量6300</span>
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
          <button className="bg-gray-100 text-gray-500 text-sm font-medium px-4 py-1.5 rounded-full cursor-pointer">
            已收藏
          </button>
        </div>
      </div>

      {/* List */}
      <div className="px-4 pt-4 pb-24 bg-white">

        {MOCK_EPISODES.map((item) => (
          <div 
            key={item.id} 
            className="flex gap-3 py-4 border-b border-gray-50 last:border-0 cursor-pointer"
            onClick={() => onItemClick && onItemClick(item)}
          >
            {/* Image */}
            <div className="relative w-[120px] h-[75px] rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute top-1 right-1 bg-black/40 rounded-full p-0.5">
                <Icons.Play className="text-white fill-white" size={12} />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <h3 className="text-base text-gray-900 leading-tight line-clamp-2 mb-1">{item.title}</h3>
              
              <p className="text-xs text-gray-400 mb-1">
                {item.duration} | {item.size}
              </p>
              
              <div className="flex items-center text-xs text-gray-400 gap-1">
                <Icons.Calendar size={12} />
                <span>{item.date}</span>
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
          <img src="https://picsum.photos/100/100?random=401" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
             <Icons.Play className="text-white fill-white" size={16} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">《幕府将军》泽井杏奈对话《洛基》汤姆·希德...</h4>
          <p className="text-xs text-gray-500 truncate">ching "Loki," realized that we really shared the same th...</p>
        </div>
        <button className="p-2 text-gray-700 ml-2">
          <Icons.ListMusic size={24} />
        </button>
      </div>
    </div>
  );
};

export default CategoryDetailPage;
