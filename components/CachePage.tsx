import React from 'react';
import { ChevronLeft, PlayCircle, Trash2 } from 'lucide-react';
import { Lesson } from '../types';

interface CachePageProps {
  downloadedLessons: Lesson[];
  onBack: () => void;
  onLessonClick: (lesson: Lesson) => void;
}

const CachePage: React.FC<CachePageProps> = ({ downloadedLessons, onBack, onLessonClick }) => {
  return (
    <div className="h-full w-full bg-gray-50 relative flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="p-1 -ml-2 text-gray-700">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">我的缓存</h1>
        <div className="w-8"></div> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {downloadedLessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p className="text-sm">暂无缓存内容</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
            {downloadedLessons.map(lesson => (
              <div 
                key={lesson.id} 
                className="flex items-center justify-between p-4 active:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onLessonClick(lesson)}
              >
                <div className="flex-1 pr-4">
                  <h3 className="text-sm font-medium text-gray-800 mb-1 line-clamp-1">{lesson.title}</h3>
                  <p className="text-xs text-gray-400">已缓存</p>
                </div>
                <button className="text-teal-500 p-2">
                  <PlayCircle size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CachePage;
