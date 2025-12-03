
import React from 'react';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  onClick?: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  return (
    <div 
      className="flex flex-col bg-transparent mb-6 cursor-pointer active:opacity-80 transition-opacity"
      onClick={() => onClick && onClick(course)}
    >
      {/* Image Container */}
      <div className="relative rounded-xl overflow-hidden shadow-sm aspect-[3/4] mb-2 bg-gray-200">
        <img 
          src={course.imageUrl} 
          alt={course.title} 
          className="w-full h-full object-cover"
        />
        
        {/* Top Overlay Gradient for readability */}
        <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-black/20 to-transparent"></div>

        {/* Play Count & VIP Badge Row */}
        <div className="absolute top-2 left-2 flex items-center space-x-1">
            {course.isVip && (
                <div className="text-[#FFD700] text-[10px] font-bold flex items-center drop-shadow-md">
                    <span className="mr-0.5">VIP专享</span>
                </div>
            )}
            <div className="text-white text-[10px] flex items-center drop-shadow-md opacity-90">
                 {course.isVip && <span className="mx-1">|</span>}
                 {course.playCount > 10000 ? `${Math.floor(course.playCount/10000)}万` : course.playCount}播放
            </div>
        </div>

        {/* Vocab Count (Bottom Right) */}
        {course.vocabularyCount && (
            <div className="absolute bottom-2 right-2 bg-black/30 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full border border-white/10">
              词汇量:{course.vocabularyCount}
            </div>
        )}
      </div>

      {/* Content */}
      <div className="px-1">
        <h3 className="font-bold text-gray-900 text-base leading-tight mb-0.5 truncate">
          {course.title}
        </h3>
        
        {/* Subtitle (If distinct from description, or if description is missing) */}
        {course.subtitle && (
             <h4 className={`font-bold text-gray-800 text-sm leading-tight mb-1 truncate ${course.description ? '' : 'text-gray-500 font-normal text-xs'}`}>
                {course.subtitle}
             </h4>
        )}
        
        {/* Description (Used in Daily Reading Page) */}
        {course.description && (
            <p className="text-gray-400 text-xs mb-2 line-clamp-1">
                {course.description}
            </p>
        )}
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-1">
            {course.tags.map((tag, index) => (
                <span 
                    key={index} 
                    className={`text-[10px] px-2 py-0.5 rounded-md ${
                        index === 0 
                        ? 'bg-[#FFF8E1] text-[#B8860B]'  // Light Yellow / Gold text
                        : 'bg-[#F5F5DC] text-[#8B4513]'  // Beige / Brown text
                    }`}
                >
                    {tag}
                </span>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
