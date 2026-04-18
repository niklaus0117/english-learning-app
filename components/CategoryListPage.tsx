import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';

interface CategoryListPageProps {
  categoryName: string;
  onBack: () => void;
  onItemClick: (item: any) => void;
}

const CategoryListPage: React.FC<CategoryListPageProps> = ({ categoryName, onBack, onItemClick }) => {
  const [activeTab, setActiveTab] = useState('全部');
  const [searchText, setSearchText] = useState('');
  const [items, setItems] = useState<any[]>([]);

  // Mock fetching data based on category
  useEffect(() => {
    setSearchText('');
    
    // Custom logic for different categories or a general mock
    const length = categoryName === '有声读物' ? 8 : 8;
    const mockData = Array.from({ length }).map((_, i) => ({
      id: `${categoryName}-${i}`,
      title: categoryName === '有声读物' && i === 0 ? '精听党 | 星际宝贝' : categoryName === '有声读物' && i === 1 ? '星际宝贝' : `${categoryName}精选频道 ${i + 1}`,
      count: Math.floor(Math.random() * 50) + 10,
      uploader: categoryName === '有声读物' && i === 0 ? '' : `用户${Math.floor(Math.random() * 10000)}上传`,
      playCount: Math.floor(Math.random() * 5000) + 1000,
      date: `2026-04-${String(Math.floor(Math.random() * 15) + 1).padStart(2, '0')}`,
      imageUrl: `https://picsum.photos/400/300?random=${categoryName.charCodeAt(0) + i}`,
      hasNotes: Math.random() > 0.5,
      isVip: Math.random() > 0.8,
    }));
    setItems(mockData);
  }, [categoryName]);

  // Audiobooks layout layout
  if (categoryName === '有声读物') {
      return (
        <div className="flex flex-col h-full bg-white">
          <header className="pt-4 px-4 pb-0 flex flex-col bg-white z-10">
             <div className="flex items-center justify-between h-12">
               <button onClick={onBack} className="flex items-center text-gray-800 absolute left-4 z-10">
                  <Icons.ChevronLeft size={28} />
                  <span className="text-[17px] ml-0.5 whitespace-nowrap">全部资源</span>
               </button>
               <h1 className="text-lg font-medium absolute left-1/2 -translate-x-1/2 w-full text-center truncate px-24">
                 {categoryName}
               </h1>
             </div>
          </header>

          <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-100 bg-white">
              {['全部', '迪士尼', '寓言故事', '分级阅读', '速读系列', '奇幻小说', '经典名著', '影视原著', '人文社科'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-4 text-[15px] whitespace-nowrap relative ${activeTab === tab ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[3px] bg-blue-600 rounded-full"></div>
                  )}
                </button>
              ))}
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-24 bg-white">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="flex gap-4 py-4 border-b border-gray-100 last:border-0 cursor-pointer active:bg-gray-50 transition-colors"
                onClick={() => onItemClick(item)}
              >
                {/* Image */}
                <div className="relative w-[88px] h-[88px] rounded-xl overflow-hidden flex-shrink-0 bg-gray-200">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  {item.isVip && (
                    <div className="absolute top-1 left-1 bg-red-500/90 text-white text-[9px] px-1 rounded-sm">
                      双语原著
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <h3 className="text-base font-medium text-gray-900 truncate mb-1.5">{item.title}</h3>
                  <p className="text-sm text-gray-500 mb-1.5">共{item.count}篇</p>
                  
                  <div className="flex items-center justify-between text-[13px] text-gray-400">
                    <span className="truncate pr-2">{item.uploader ? item.uploader : `${item.playCount}播放`}</span>
                    <span className="flex-shrink-0">{item.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
  }

  // General layout for everything else
  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header (Fixed) */}
      <header className="pt-4 pb-3 flex items-center justify-center relative bg-white z-20 border-b border-gray-100/60 flex-shrink-0 min-h-[44px]">
          <button onClick={onBack} className="absolute left-4 z-10 text-gray-800">
              <Icons.ChevronLeft size={28} />
          </button>
          <h1 className="text-lg font-medium text-center truncate px-12">
              {categoryName}
          </h1>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-white pt-2">
        {/* Search */}
        <div className="px-4 pb-3 bg-white">
          <div className="bg-gray-100 rounded-full px-4 py-1 flex items-center h-8">
            <Icons.Search className="text-gray-400 mr-2 flex-shrink-0" size={16} />
            <input 
              type="text" 
              placeholder="搜索"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="bg-transparent w-full outline-none text-xs text-gray-900 placeholder-gray-500"
            />
            {searchText && (
              <button onClick={() => setSearchText('')} className="p-1 -mr-1 cursor-pointer">
                <Icons.XCircle className="text-gray-400 fill-gray-400" size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Category Intro */}
        <div className="px-4 py-3 bg-white border-b border-gray-50">
           <p className="text-[14px] text-gray-500 leading-relaxed mb-3">
              欢迎来到{categoryName}专区。这里汇集了本类目下最受欢迎的各类精选内容与专辑频道，每日持续为您更新高质量视听素材。
           </p>
           
           <div className="flex items-center gap-5 text-[12px] text-gray-400">
               <div className="flex items-center gap-1.5 flex-1">
                   <Icons.Film size={14} className="text-gray-300" />
                   <span>1,208 频道</span>
               </div>
               <div className="flex items-center gap-1.5 flex-1 justify-center">
                   <Icons.FileText size={14} className="text-gray-300" />
                   <span>84,392 文章</span>
               </div>
               <div className="flex items-center gap-1.5 flex-1 justify-end">
                   <Icons.ArrowDownUp size={14} className="text-green-500/70" />
                   <span className="text-green-500">今日更新 12</span>
               </div>
           </div>
        </div>

        {/* List */}
        <div className="px-4 pb-24 pt-2">
          {items.map((item) => (
          <div 
            key={item.id} 
            className="flex gap-3 py-3 border-b border-gray-50 last:border-0 cursor-pointer active:bg-gray-50 transition-colors"
            onClick={() => onItemClick(item)}
          >
            {/* Image */}
            <div className="relative w-[110px] h-[82px] rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              {item.isVip && (
                <div className="absolute top-0 left-0 bg-orange-500 text-white text-[10px] font-bold px-1 rounded-br-lg">
                  VIP
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-bold text-gray-900 truncate">{item.title}</h3>
                {item.hasNotes && (
                  <span className="text-[10px] text-blue-500 bg-blue-50 px-1 py-0.5 rounded border border-blue-100 flex-shrink-0">
                    讲义
                  </span>
                )}
              </div>
              
              <p className="text-[13px] text-gray-500 mb-1">共{item.count}篇 · {item.playCount}次播放</p>
              
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="truncate pr-2">{item.uploader}</span>
                <span className="flex-shrink-0">{item.date}</span>
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryListPage;
