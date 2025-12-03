
import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import CourseCard from './CourseCard';
import { DAILY_READING_COURSES } from '../constants';
import { Course } from '../types';

interface DailyReadingPageProps {
  onBack: () => void;
  onCourseClick: (course: Course) => void;
}

const CATEGORIES = [
  '科学分级',
  '每日听读',
  '晨读美文',
  '优美范文',
  '外刊时文',
  '世界名著',
  '名人演讲'
];

const DailyReadingPage: React.FC<DailyReadingPageProps> = ({ onBack, onCourseClick }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCategory, setActiveCategory] = useState('科学分级');

  useEffect(() => {
    // Simulate fetching data for this page
    setCourses(DAILY_READING_COURSES);
  }, []);

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto relative flex flex-col">
      
      {/* --- Header --- */}
      <header className="bg-white px-4 py-3 flex items-center sticky top-0 z-50 shadow-sm">
        <button onClick={onBack} className="p-1 -ml-2 mr-2">
          <ChevronLeft size={28} className="text-gray-800" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 flex-1 text-center pr-8">每日英语听读</h1>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="px-4 pb-6">
            
            {/* --- Banner --- */}
            <div className="w-full bg-gradient-to-r from-orange-400 to-pink-400 rounded-xl p-4 text-white relative overflow-hidden mb-6 shadow-md flex items-center justify-between">
                <div className="z-10">
                    <div className="flex items-baseline space-x-1 mb-1">
                        <span className="text-lg font-bold">8大分类</span>
                        <span className="text-lg font-bold">49个主题</span>
                        <span className="text-lg font-bold">3000篇</span>
                    </div>
                    <div className="text-xs opacity-90 mb-0">精读+精讲+电子版教材</div>
                </div>
                
                <div className="z-10 flex flex-col items-center">
                    <div className="bg-white/20 text-[10px] px-2 py-0.5 rounded-full mb-1">VIP</div>
                    <button className="bg-white text-orange-500 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap">
                        立即开通
                    </button>
                </div>

                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-300/20 rounded-full blur-xl -ml-10 -mb-10"></div>
            </div>

            {/* --- Category Tabs --- */}
            <div className="flex overflow-x-auto no-scrollbar space-x-4 mb-6 items-center">
                {CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat;
                    return (
                        <button 
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                isActive 
                                ? 'bg-cyan-50 text-cyan-600 font-bold' 
                                : 'bg-transparent text-gray-500'
                            }`}
                        >
                            {cat}
                        </button>
                    );
                })}
            </div>

            {/* --- Course Grid --- */}
            <div className="grid grid-cols-2 gap-4">
                {courses.map(course => (
                    <CourseCard key={course.id} course={course} onClick={onCourseClick} />
                ))}
            </div>

        </div>
      </div>
    </div>
  );
};

export default DailyReadingPage;
