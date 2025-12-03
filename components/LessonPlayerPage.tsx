
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Icons } from './Icons';
import { MOCK_LESSON_TRANSCRIPT } from '../constants';
import { Lesson } from '../types';

interface LessonPlayerPageProps {
  lesson: Lesson;
  onBack: () => void;
}

const LessonPlayerPage: React.FC<LessonPlayerPageProps> = ({ lesson, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSentenceId, setActiveSentenceId] = useState<string>('s1');
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showChinese, setShowChinese] = useState(true);
  const [playMode, setPlayMode] = useState<'order' | 'repeat' | 'single'>('order');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(38); // Mock duration 38s
  
  // Tabs at the top
  const TABS = ['原文', '精讲', '教材', '词汇', '收藏', '笔记'];
  const [activeTab, setActiveTab] = useState('原文');

  // Simulation of audio playback
  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setCurrentTime(prev => {
           if (prev >= duration) {
               setIsPlaying(false);
               return 0;
           }
           const newTime = prev + 0.1;
           
           // Simple sync logic: Find sentence that matches current time
           // In a real app, this would be driven by audio events
           const currentSentence = MOCK_LESSON_TRANSCRIPT.find(
               s => newTime >= s.startTime && newTime < (s.startTime + s.duration)
           );
           if (currentSentence && currentSentence.id !== activeSentenceId) {
               setActiveSentenceId(currentSentence.id);
           }
           
           return newTime;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeSentenceId, duration]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSentenceClick = (id: string, startTime: number) => {
      setActiveSentenceId(id);
      setCurrentTime(startTime);
      setIsPlaying(true);
  };

  return (
    <div className="flex flex-col h-screen bg-white max-w-md mx-auto relative overflow-hidden">
      
      {/* --- Header --- */}
      <header className="bg-white px-3 py-3 flex items-center justify-between sticky top-0 z-20 border-b border-gray-50">
        <button onClick={onBack} className="p-1 -ml-1">
          <ChevronLeft size={28} className="text-gray-800" />
        </button>
        
        {/* Navigation Tabs */}
        <div className="flex-1 flex justify-center space-x-4 overflow-x-auto no-scrollbar px-2">
            {TABS.map(tab => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap text-base transition-colors ${
                        activeTab === tab 
                        ? 'text-orange-500 font-bold scale-105' 
                        : 'text-gray-500 font-medium'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>

        <div className="flex items-center space-x-3">
             <Icons.Star size={22} className="text-gray-400" />
             <Icons.Share size={22} className="text-gray-400" />
        </div>
      </header>

      {/* --- Content Area --- */}
      <div className="flex-1 overflow-y-auto p-4 pb-48 no-scrollbar bg-gray-50/30">
        <h1 className="text-lg font-bold text-gray-900 mb-1 leading-snug">
            {lesson.title}
        </h1>
        <h2 className="text-sm text-gray-500 mb-6">
            {lesson.title.split(' ')[0]}... (Subtitle)
        </h2>

        <div className="space-y-6">
            {MOCK_LESSON_TRANSCRIPT.map((sentence) => {
                const isActive = activeSentenceId === sentence.id;
                return (
                    <div 
                        key={sentence.id}
                        id={`sentence-${sentence.id}`}
                        onClick={() => handleSentenceClick(sentence.id, sentence.startTime)}
                        className={`transition-colors duration-300 rounded-lg p-2 -mx-2 ${isActive ? 'bg-blue-50' : 'bg-transparent'}`}
                    >
                        {/* English */}
                        <div className={`text-[17px] leading-relaxed mb-1 ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-800'}`}>
                            {sentence.text}
                            <span className="inline-block ml-2 text-[10px] text-blue-500 border border-blue-200 bg-white px-1 rounded align-middle cursor-pointer">
                                [解析]
                            </span>
                        </div>
                        
                        {/* Chinese */}
                        {showChinese && (
                            <div className="text-sm text-gray-500 leading-relaxed">
                                {sentence.translation}
                            </div>
                        )}
                    </div>
                );
            })}
             {/* Spacer for bottom controls */}
             <div className="h-20"></div>
        </div>
      </div>

      {/* --- Fixed Bottom Controls --- */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-5px_15px_rgba(0,0,0,0.02)] px-4 pt-3 pb-safe z-30">
          
          {/* Row 1: Tools */}
          <div className="flex justify-between items-center mb-4 px-1">
              {/* Speed */}
              <button 
                onClick={() => setPlaybackSpeed(prev => prev === 1 ? 1.5 : 1)}
                className="flex flex-col items-center gap-1 text-gray-600"
              >
                  <span className="font-bold text-xs">{playbackSpeed.toFixed(1)}x</span>
                  <span className="text-[10px] scale-90">倍速</span>
              </button>

              {/* Order */}
              <button 
                  onClick={() => setPlayMode(prev => prev === 'order' ? 'repeat' : 'order')}
                  className="flex flex-col items-center gap-1 text-gray-600"
              >
                  <Icons.ListOrdered size={20} />
                  <span className="text-[10px] scale-90">顺序</span>
              </button>

              {/* Point Read */}
              <button className="flex flex-col items-center gap-1 text-gray-600">
                  <Icons.Pointer size={20} />
                  <span className="text-[10px] scale-90">点读</span>
              </button>

              {/* Repeat */}
              <button className="flex flex-col items-center gap-1 text-gray-600">
                  <Icons.Repeat size={20} />
                  <span className="text-[10px] scale-90">复读</span>
              </button>

              {/* Bilingual Toggle */}
              <button 
                  onClick={() => setShowChinese(!showChinese)}
                  className={`flex flex-col items-center gap-1 ${showChinese ? 'text-orange-500' : 'text-gray-400'}`}
              >
                  <Icons.Type size={20} />
                  <span className="text-[10px] scale-90">双语</span>
              </button>

              {/* Shadowing */}
              <button className="flex flex-col items-center gap-1 text-gray-600">
                  <Icons.Mic size={20} />
                  <span className="text-[10px] scale-90">跟读</span>
              </button>
          </div>

          {/* Row 2: Progress Bar */}
          <div className="flex items-center gap-3 mb-4 text-xs text-gray-400 font-mono">
              <span className="w-10 text-right">{formatTime(currentTime)}</span>
              <div className="flex-1 h-1 bg-gray-200 rounded-full relative cursor-pointer group">
                  <div 
                    className="absolute top-0 left-0 h-full bg-orange-500 rounded-full" 
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  ></div>
                  <div 
                    className="absolute top-1/2 -mt-1.5 h-3 w-3 bg-white border-2 border-orange-500 rounded-full shadow-md transform -translate-x-1/2"
                    style={{ left: `${(currentTime / duration) * 100}%` }}
                  ></div>
              </div>
              <span className="w-10">{formatTime(duration)}</span>
          </div>

          {/* Row 3: Playback Controls */}
          <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1 text-orange-500 text-xs truncate max-w-[120px]">
                 <span className="truncate">章节 · {lesson.title.split(' ')[0]}</span>
              </div>

              <div className="flex items-center gap-6">
                  <button className="text-gray-800 active:scale-90 transition-transform">
                      <Icons.SkipBack size={28} className="fill-current" />
                  </button>
                  
                  <button 
                    onClick={togglePlay}
                    className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform"
                  >
                      {isPlaying ? (
                          <Icons.Pause size={28} className="fill-current" />
                      ) : (
                          <Icons.Play size={28} className="fill-current ml-1" />
                      )}
                  </button>

                  <button className="text-gray-800 active:scale-90 transition-transform">
                      <Icons.SkipForward size={28} className="fill-current" />
                  </button>
              </div>

              <button className="text-gray-400">
                  <Icons.Settings size={22} />
              </button>
          </div>
      </div>
    </div>
  );
};

export default LessonPlayerPage;
