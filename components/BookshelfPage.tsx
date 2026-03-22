import React from 'react';
import { PlayCircle } from 'lucide-react';
import { Lesson } from '../types';

interface BookshelfPageProps {
  collectedLessons: Lesson[];
  onLessonClick: (lesson: Lesson) => void;
}

const BookshelfPage: React.FC<BookshelfPageProps> = ({ collectedLessons, onLessonClick }) => {
  return (
    <div className="p-4 bg-white min-h-full">
      <h2 className="text-xl font-bold text-gray-900 mb-4">我的收藏</h2>
      {collectedLessons.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p>收藏夹空空如也，快去收藏喜欢的课程章节吧！</p>
        </div>
      ) : (
        <div className="space-y-3">
          {collectedLessons.map(lesson => (
            <div 
              key={lesson.id} 
              className="flex items-center justify-between cursor-pointer active:bg-gray-50 p-3 rounded-xl border border-gray-100 shadow-sm transition-colors"
              onClick={() => onLessonClick(lesson)}
            >
              <div className="flex-1 pr-4">
                <h3 className="text-sm font-bold text-gray-900 leading-tight mb-1">
                  {lesson.title}
                </h3>
                <p className="text-xs text-gray-500">
                   时长: {lesson.duration || '未知'}
                </p>
              </div>
              <button className="text-orange-500">
                <PlayCircle size={24} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookshelfPage;
