
import React, { useState } from 'react';
import { ChevronLeft, Share, Flame, ArrowDownCircle, MessageCircle, PlayCircle, ListMusic, ChevronRight } from 'lucide-react';
import { Course, Lesson } from '../types';
import { MOCK_LESSONS } from '../constants';

interface CourseDetailPageProps {
  course: Course;
  onBack: () => void;
  onLessonClick?: (lesson: Lesson) => void;
  onDownloadLesson: (lesson: Lesson) => void;
  onBuy?: () => void;
  downloadedLessons: Lesson[];
}

const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ course, onBack, onLessonClick, onDownloadLesson, onBuy, downloadedLessons }) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'details'>('directory');

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto relative flex flex-col pb-24">
      
      {/* --- Top Section (Dark Background) --- */}
      <div className="bg-[#786C5E] text-white p-4 pb-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-6">
            <button onClick={onBack} className="p-1 -ml-2">
                <ChevronLeft size={28} />
            </button>
            <button className="p-1 -mr-2">
                <Share size={24} />
            </button>
        </div>

        {/* Course Info */}
        <div className="flex gap-4">
            {/* Cover Image */}
            <div className="w-24 h-32 flex-shrink-0 rounded-lg overflow-hidden shadow-lg border border-white/20">
                <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
            </div>
            
            {/* Text Info */}
            <div className="flex-1 flex flex-col justify-between py-1">
                <h1 className="text-xl font-bold leading-tight line-clamp-2 mb-1">{course.title}</h1>
                
                {/* Stats Tags */}
                <div className="flex flex-wrap gap-2 text-[10px] items-center text-white/90 mb-1">
                    <span className="bg-white/20 px-2 py-0.5 rounded-md flex items-center">
                        <Flame size={10} className="mr-1 text-orange-300 fill-orange-300" />
                        {course.playCount}播放
                    </span>
                    <span className="bg-white/20 px-2 py-0.5 rounded-md">
                        {course.tags[0]} {/* e.g. 共137篇 */}
                    </span>
                    {course.vocabularyCount && (
                        <span className="bg-white/20 px-2 py-0.5 rounded-md">
                            词汇量:{course.vocabularyCount}
                        </span>
                    )}
                </div>

                <div className="text-sm font-medium opacity-90">{course.author || 'Unknown Author'}</div>
                
                <p className="text-xs text-white/80 line-clamp-2 leading-snug mt-1">
                    {course.description || course.subtitle}
                </p>
            </div>
        </div>
      </div>

      {/* --- Middle Bar (Sort, Publisher, Add Bookshelf) --- */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
        <div className="flex items-center space-x-1 text-gray-700 text-sm font-medium">
            <ListMusic size={16} />
            <span>推荐排序</span>
        </div>
        
        <div className="flex items-center text-gray-500 text-sm">
            <span>发布者:Nice</span>
            <ChevronRight size={14} />
        </div>
      </div>

      {/* --- Tabs --- */}
      <div className="flex items-center justify-around border-b border-gray-100 sticky top-0 bg-white z-10 pt-2">
        <button 
            onClick={() => setActiveTab('directory')}
            className={`flex-1 pb-3 text-center text-base font-bold relative ${activeTab === 'directory' ? 'text-gray-900' : 'text-gray-400 font-normal'}`}
        >
            目录
            {activeTab === 'directory' && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-teal-500 rounded-full"></div>
            )}
        </button>
        <button 
             onClick={() => setActiveTab('details')}
             className={`flex-1 pb-3 text-center text-base font-bold relative ${activeTab === 'details' ? 'text-gray-900' : 'text-gray-400 font-normal'}`}
        >
            详情
            {activeTab === 'details' && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-teal-500 rounded-full"></div>
            )}
        </button>
      </div>

      {/* --- Content List --- */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'directory' && (
            <div>
                <div className="text-teal-500 text-sm font-bold mb-4">全部</div>
                <div className="space-y-6">
                    {MOCK_LESSONS.map((lesson) => (
                        <div 
                            key={lesson.id} 
                            className="flex items-start justify-between cursor-pointer active:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                            onClick={() => onLessonClick && onLessonClick(lesson)}
                        >
                            <div className="flex-1 pr-4">
                                <h3 className="text-sm font-medium text-gray-800 leading-normal mb-1">
                                    {lesson.title}
                                </h3>
                                <div className="inline-block bg-gray-100 text-gray-400 text-[10px] px-2 py-0.5 rounded-sm">
                                    未学
                                </div>
                            </div>
                            <button 
                                className="mt-1"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDownloadLesson && onDownloadLesson(lesson);
                                }}
                            >
                                <ArrowDownCircle 
                                    size={20} 
                                    className={downloadedLessons.find(l => l.id === lesson.id) ? "text-teal-500" : "text-gray-300"} 
                                />
                            </button>
                        </div>
                    ))}
                    {/* Duplicate list to show scrolling */}
                    {MOCK_LESSONS.map((lesson) => (
                        <div 
                             key={`${lesson.id}-dup`} 
                             className="flex items-start justify-between cursor-pointer active:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                             onClick={() => onLessonClick && onLessonClick(lesson)}
                        >
                            <div className="flex-1 pr-4">
                                <h3 className="text-sm font-medium text-gray-800 leading-normal mb-1">
                                    {lesson.title}
                                </h3>
                                <div className="inline-block bg-gray-100 text-gray-400 text-[10px] px-2 py-0.5 rounded-sm">
                                    未学
                                </div>
                            </div>
                            <button 
                                className="mt-1"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDownloadLesson && onDownloadLesson(lesson);
                                }}
                            >
                                <ArrowDownCircle 
                                    size={20} 
                                    className={downloadedLessons.find(l => l.id === lesson.id) ? "text-teal-500" : "text-gray-300"} 
                                />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}
        {activeTab === 'details' && (
            <div className="text-gray-500 text-center py-10 text-sm">
                暂无详情介绍
            </div>
        )}
      </div>

      {/* --- Bottom Action Bar --- */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 px-4 py-3 flex items-center space-x-4 z-50 h-[80px]">
          {/* Customer Service */}
          <div className="flex flex-col items-center justify-center text-gray-500 min-w-[3rem]">
              <MessageCircle size={24} />
              <span className="text-[10px] mt-0.5">客服</span>
          </div>

          {/* Buy Button */}
          <button 
            onClick={onBuy}
            className="flex-1 bg-orange-500 text-white font-bold text-lg h-12 rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
          >
              ¥{course.price ? course.price.toFixed(2) : '0.00'}
          </button>

          {/* Mini Player Floating (Visual Only) */}
          <div className="absolute right-6 -top-10 w-12 h-12 bg-white rounded-full shadow-xl p-0.5 flex items-center justify-center border border-gray-100">
               <div className="w-full h-full rounded-full overflow-hidden relative">
                   <img src={course.imageUrl} alt="mini" className="w-full h-full object-cover opacity-80" />
                   <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                       <PlayCircle size={20} className="text-white fill-white/50" />
                   </div>
               </div>
          </div>
      </div>

    </div>
  );
};

export default CourseDetailPage;
