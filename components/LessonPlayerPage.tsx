
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
  const [duration, setDuration] = useState(38); // Default mock duration
  const [showOverlayControls, setShowOverlayControls] = useState(true);
  
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showPlayModeMenu, setShowPlayModeMenu] = useState(false);
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Tabs at the top
  const TABS = ['原文', '精讲', '教材', '词汇', '收藏', '笔记'];
  const [activeTab, setActiveTab] = useState('原文');

  const isVideo = lesson.mediaType === 'video';

  // --- External Click Handlers ---
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        // Close if not clicking inside the menu containers
        if (!target.closest('.speed-menu-container')) {
            setShowSpeedMenu(false);
        }
        if (!target.closest('.playmode-menu-container')) {
            setShowPlayModeMenu(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Auto hide overlay controls logic ---
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isPlaying && showOverlayControls) {
      timeout = setTimeout(() => setShowOverlayControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, showOverlayControls]);

  // Handle Play/Pause
  const togglePlay = () => {
    const mediaElement = isVideo ? videoRef.current : audioRef.current;
    if (mediaElement) {
      if (isPlaying) {
        mediaElement.pause();
      } else {
        mediaElement.play().catch(e => console.error("Playback failed", e));
      }
    } else if (!isVideo) {
        // Fallback mock simulation if no real media URL
        setIsPlaying(!isPlaying);
    }
  };

  const handleSeekRelative = (e: React.MouseEvent, delta: number) => {
      e.stopPropagation();
      const newTime = Math.max(0, Math.min(duration, currentTime + delta));
      setCurrentTime(newTime);
      const mediaElement = isVideo ? videoRef.current : audioRef.current;
      if (mediaElement) {
          mediaElement.currentTime = newTime;
      }
      setShowOverlayControls(true); // Keep controls open when interacting
  };

  // Sync state with media element
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLMediaElement>) => {
    const time = e.currentTarget.currentTime;
    setCurrentTime(time);
    
    // Sync transcript
    const currentSentence = MOCK_LESSON_TRANSCRIPT.find(
        s => time >= s.startTime && time < (s.startTime + s.duration)
    );
    if (currentSentence && currentSentence.id !== activeSentenceId) {
        setActiveSentenceId(currentSentence.id);
    }
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLMediaElement>) => {
    setDuration(e.currentTarget.duration);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Scroll active sentence into view
  useEffect(() => {
    if (activeSentenceId) {
        const el = document.getElementById(`sentence-${activeSentenceId}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
  }, [activeSentenceId]);

  // Simulation of audio playback (fallback if no mediaUrl)
  useEffect(() => {
    if (lesson.mediaUrl) return; // Skip simulation if we have real media

    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setCurrentTime(prev => {
           if (prev >= duration) {
               setIsPlaying(false);
               return 0;
           }
           const newTime = prev + 0.1;
           
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
  }, [isPlaying, activeSentenceId, duration, lesson.mediaUrl]);

  // Handle speed change
  useEffect(() => {
    const mediaElement = isVideo ? videoRef.current : audioRef.current;
    if (mediaElement) {
      mediaElement.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, isVideo]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSentenceClick = (id: string, startTime: number) => {
      setActiveSentenceId(id);
      setCurrentTime(startTime);
      const mediaElement = isVideo ? videoRef.current : audioRef.current;
      if (mediaElement) {
          mediaElement.currentTime = startTime;
          mediaElement.play().catch(e => console.error(e));
      } else {
          setIsPlaying(true);
      }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      const newTime = percentage * duration;
      
      setCurrentTime(newTime);
      const mediaElement = isVideo ? videoRef.current : audioRef.current;
      if (mediaElement) {
          mediaElement.currentTime = newTime;
      }
  };

  return (
    <div className="flex flex-col h-screen bg-white relative overflow-hidden">
      
      {/* --- Media Player Area (Top) --- */}
      {isVideo && lesson.mediaUrl ? (
          <div 
            className="w-full bg-black relative z-10 flex-shrink-0 group overflow-hidden" 
            style={{ aspectRatio: '16/9' }}
            onMouseMove={() => setShowOverlayControls(true)}
            onTouchStart={() => setShowOverlayControls(true)}
          >
              <video 
                  ref={videoRef}
                  src={lesson.mediaUrl}
                  poster={lesson.coverUrl}
                  className="absolute inset-0 w-full h-full object-contain cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); setShowOverlayControls(true); togglePlay(); }}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleEnded}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onError={(e) => console.error("Video error:", e.currentTarget.error)}
                  playsInline
              />

              {/* OVERLAY WRAPPER */}
              <div 
                className={`absolute inset-0 z-20 pointer-events-none transition-opacity duration-300 ${(!isPlaying || showOverlayControls) ? 'opacity-100' : 'opacity-0'}`}
              >
                  {/* Top Overlaid Header */}
                  <div className="absolute top-0 left-0 right-0 p-3 pb-6 bg-gradient-to-b from-black/60 to-transparent flex items-center justify-between pointer-events-auto">
                    <button onClick={onBack} className="p-1 text-white active:scale-95 -ml-1">
                      <ChevronLeft size={24} />
                    </button>
                    {/* Icons inside header */}
                    <div className="flex items-center gap-3 text-white">
                        <button className="active:scale-95">
                          <Icons.Languages size={20} />
                        </button>
                        <button className="active:scale-95">
                          <Icons.Moon size={20} />
                        </button>
                        <button className="active:scale-95">
                          <Icons.PlusSquare size={20} />
                        </button>
                        <button className="active:scale-95">
                          <Icons.Youtube size={20} />
                        </button>
                        <button className="active:scale-95">
                          <Icons.MoreVertical size={20} />
                        </button>
                    </div>
                  </div>

                  {/* Bottom Overlay Controls (Play, Skip, Progress) */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 pt-10 bg-gradient-to-t from-black/80 to-transparent pointer-events-auto flex items-center gap-3">
                      {/* Left Controls */}
                      <div className="flex items-center gap-4 translate-y-[-1px]">
                          <button 
                            onClick={(e) => handleSeekRelative(e, -10)} 
                            className="text-white active:scale-95 transition-transform"
                          >
                             <Icons.SkipBack size={20} className="fill-white" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setShowOverlayControls(true); togglePlay(); }}
                            className="text-white active:scale-95 transition-transform"
                          >
                              {isPlaying ? (
                                  <Icons.Pause size={20} className="fill-white" />
                              ) : (
                                  <Icons.Play size={20} className="fill-white" />
                              )}
                          </button>
                          <button 
                            onClick={(e) => handleSeekRelative(e, 10)} 
                            className="text-white active:scale-95 transition-transform"
                          >
                             <Icons.SkipForward size={20} className="fill-white" />
                          </button>
                      </div>

                      {/* Progress Bar Area */}
                      <div className="flex-1 flex items-center gap-2.5">
                          <span className="text-white/90 text-[11px] font-mono font-medium">
                            {formatTime(currentTime)}
                          </span>
                          <div 
                            className="flex-1 h-[2px] bg-white/30 rounded-full relative cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); setShowOverlayControls(true); handleSeek(e); }}
                          >
                              <div 
                                className="absolute top-0 left-0 h-full bg-white rounded-full" 
                                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                              ></div>
                              <div 
                                className="absolute top-1/2 -mt-[3px] h-[6px] w-[6px] bg-white rounded-full shadow-[0_0_5px_rgba(0,0,0,0.5)] transform -translate-x-1/2"
                                style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                              ></div>
                          </div>
                          <span className="text-white/90 text-[11px] font-mono font-medium">
                            {formatTime(duration)}
                          </span>
                      </div>

                      {/* Right Fullscreen Icon */}
                      <button className="text-white active:scale-95">
                          <Icons.Maximize size={16} />
                      </button>
                  </div>
              </div>
          </div>
      ) : (
          <div className="w-full relative z-10 flex-shrink-0 bg-white">
              {/* Normal Header for Audio/No-video */}
              <div className="px-3 py-3 flex items-center justify-between border-b border-gray-100">
                <button onClick={onBack} className="p-1 text-gray-800 active:scale-95 -ml-1">
                  <ChevronLeft size={24} />
                </button>
                <h1 className="text-gray-900 text-sm font-medium truncate flex-1 px-4 text-center">
                   Saturn | A Travellers Guide To The Planet
                </h1>
                <button className="p-1 text-gray-800 active:scale-95">
                  <Icons.MoreHorizontal size={20} />
                </button>
              </div>
              
              {lesson.mediaUrl && (
                  <audio 
                      ref={audioRef}
                      src={lesson.mediaUrl}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={handleEnded}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onError={(e) => console.error("Audio error:", e.currentTarget.error)}
                  />
              )}
          </div>
      )}

      {/* --- Tabs --- */}
      <div className="flex items-center px-4 py-2.5 border-b border-gray-100 flex-shrink-0 justify-between">
          <div className="flex space-x-5">
              <div className="relative flex flex-col items-center">
                  <button className="text-[#0066FF] font-bold text-[15px] py-0.5">原文</button>
                  <div className="absolute bottom-[-11px] w-6 h-[2px] bg-[#0066FF] rounded-full"></div>
              </div>
              <div className="relative flex flex-col items-center">
                  <button className="text-gray-400 font-medium text-[15px] py-0.5">笔记</button>
              </div>
          </div>
          <div className="flex items-center text-[13px] text-gray-400">
              <span className="truncate max-w-[120px]">行星旅行指南</span>
              <Icons.ChevronRight size={14} className="ml-1" />
          </div>
      </div>

      {/* --- Content Area --- */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-white pb-64 no-scrollbar">
        {/* Title */}
        <h2 className="text-[17px] font-bold text-[#2A2A2A] leading-[1.3] mb-2 font-serif">
            Saturn | A Travellers Guide To The Planet
        </h2>

        {/* AI Banner */}
        <div className="bg-[#FFF9EE] rounded flex items-center px-3 py-2 mb-4">
            <Icons.Bot size={16} className="text-[#F2994A] mr-2" />
            <span className="text-[#F2994A] text-[12px] font-medium tracking-wide">当前字幕由 AI 自动生成，仅供参考</span>
        </div>

        {/* Sentences */}
        <div className="space-y-5">
            {MOCK_LESSON_TRANSCRIPT.map((sentence) => {
                const isActive = activeSentenceId === sentence.id;
                return (
                    <div 
                        key={sentence.id}
                        id={`sentence-${sentence.id}`}
                        onClick={() => handleSentenceClick(sentence.id, sentence.startTime)}
                        className={`transition-colors duration-300 rounded cursor-pointer ${isActive ? 'bg-[#F2F7FF] -mx-2 px-2 py-1' : 'bg-transparent'}`}
                    >
                        {/* English */}
                        <div className={`text-[16px] leading-[1.5] mb-1 font-serif ${isActive ? 'text-[#5C6BFA]' : 'text-[#333]'}`}>
                            {sentence.text}
                        </div>
                        
                        {/* Chinese (Restored to real translation) */}
                        <div className={`text-[13px] font-serif tracking-wide ${isActive ? 'text-[#5C6BFA]/80' : 'text-[#888]'}`}>
                            {sentence.translation.split(',')[0]}，{sentence.translation.split(',')[1]}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      {/* --- Fixed Bottom Controls --- */}
      <div className="absolute bottom-0 left-0 right-0 bg-white z-30 flex flex-col pb-safe shadow-[0_-2px_15px_rgba(0,0,0,0.02)] transition-all duration-300">
          
          {/* Row 1: Tools */}
          {!isBottomCollapsed && (
              <div className="flex justify-between items-center pt-3 pb-2 px-6 relative">
                  {/* Speed */}
                  <div className="relative speed-menu-container">
                      <button 
                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                        className="flex flex-col items-center gap-1 text-gray-500 active:scale-95 transition-transform"
                      >
                          <span className="font-bold text-[14px] text-[#333] tracking-tight mb-[1px]">{playbackSpeed.toFixed(1)}x</span>
                          <span className="text-[10px] text-gray-500">倍速</span>
                      </button>

                      {/* Speed Popup Menu */}
                      {showSpeedMenu && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-xl shadow-[0_5px_25px_rgba(0,0,0,0.15)] py-2 w-[80px] overflow-hidden z-50">
                              <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-gray-100/50"></div>
                              <div className="relative z-10 bg-white">
                                  {[0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0].map((speed) => (
                                      <button 
                                          key={speed}
                                          onClick={() => { setPlaybackSpeed(speed); setShowSpeedMenu(false); }}
                                          className="w-full flex items-center justify-between px-3 py-2 text-[14px] active:bg-gray-50 transition-colors"
                                      >
                                          <span className={playbackSpeed === speed ? "text-[#0066FF]" : "text-[#333]"}>
                                              {speed.toFixed(1)}x
                                          </span>
                                          {playbackSpeed === speed && <Icons.Check size={14} className="text-[#0066FF]" />}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>

                  {/* Order */}
                  <div className="relative playmode-menu-container">
                      <button 
                          onClick={() => setShowPlayModeMenu(!showPlayModeMenu)}
                          className="flex flex-col items-center gap-1 text-gray-500 active:scale-95 transition-transform"
                      >
                          <Icons.Repeat size={20} className="text-[#333]" strokeWidth={1.5} />
                          <span className="text-[10px] text-gray-500 mt-0.5">
                              {playMode === 'order' ? '顺序播放' : playMode === 'repeat' ? '单篇循环' : '单句循环'}
                          </span>
                      </button>

                      {/* Play Mode Popup Menu */}
                      {showPlayModeMenu && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-xl shadow-[0_5px_25px_rgba(0,0,0,0.15)] py-2 w-[110px] overflow-hidden z-50">
                              <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-gray-100/50"></div>
                              <div className="relative z-10 bg-white">
                                  {[
                                      { id: 'order', label: '顺序播放' },
                                      { id: 'channel-repeat', label: '频道循环' },
                                      { id: 'repeat', label: '单篇循环' },
                                      { id: 'shuffle', label: '随机播放' },
                                      { id: 'single', label: '单句循环' }
                                  ].map((mode) => (
                                      <button 
                                          key={mode.id}
                                          onClick={() => { setPlayMode(mode.id as any); setShowPlayModeMenu(false); }}
                                          className="w-full flex items-center justify-between px-3 py-2 text-[14px] active:bg-gray-50 transition-colors"
                                      >
                                          <span className={playMode === mode.id ? "text-[#0066FF]" : "text-[#333]"}>
                                              {mode.label}
                                          </span>
                                          {playMode === mode.id && <Icons.Check size={14} className="text-[#0066FF]" />}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>

                  {/* Read Mode */}
                  <button className="flex flex-col items-center gap-1 text-gray-500 active:scale-95 transition-transform">
                      <Icons.FileText size={20} className="text-[#333]" strokeWidth={1.5} />
                      <span className="text-[10px] text-gray-500 mt-0.5">阅读模式</span>
                  </button>

                  {/* Shadowing */}
                  <button className="flex flex-col items-center gap-1 text-gray-500 active:scale-95 transition-transform">
                      <Icons.Mic size={20} className="text-[#333]" strokeWidth={1.5} />
                      <span className="text-[10px] text-gray-500 mt-0.5">跟读原文</span>
                  </button>

                  {/* Vocabulary */}
                  <button className="flex flex-col items-center gap-1 text-gray-500 active:scale-95 transition-transform">
                      <Icons.BookOpen size={20} className="text-[#333]" strokeWidth={1.5} />
                      <span className="text-[10px] text-gray-500 mt-0.5">单词训练</span>
                  </button>
              </div>
          )}

          {/* Row 2: Progress Area */}
          {!isBottomCollapsed && (
              <div className="flex flex-col px-6 mt-1 mb-1">
                  <div 
                    className="w-full h-[2px] bg-gray-100 rounded-full relative cursor-pointer"
                    onClick={handleSeek}
                  >
                      <div 
                        className="absolute top-0 left-0 h-full bg-[#5C6BFA] rounded-full" 
                        style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                      ></div>
                      <div 
                        className="absolute top-1/2 -mt-[3px] h-[6px] w-[6px] bg-[#5C6BFA] rounded-full shadow-sm transform -translate-x-1/2"
                        style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                      ></div>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-[10px] text-gray-400 font-mono tracking-wider">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                  </div>
              </div>
          )}

          {/* Row 3: Playback Controls */}
          <div className={`flex items-center justify-between px-8 ${isBottomCollapsed ? 'pb-7 pt-4' : 'pb-5 pt-2'}`}>
              <button 
                onClick={() => setIsBottomCollapsed(!isBottomCollapsed)}
                className="text-gray-400 active:scale-95 transition-transform p-1"
              >
                  <Icons.List size={22} strokeWidth={1.5} />
              </button>

              <button className="active:scale-90 transition-transform -ml-2">
                  <Icons.SkipBack size={24} className="fill-[#333] text-[#333]" />
              </button>
              
              <button 
                onClick={togglePlay}
                className="active:scale-95 transition-transform"
              >
                  {isPlaying ? (
                      <Icons.Pause size={28} className="fill-[#333] text-[#333]" />
                  ) : (
                      <Icons.Play size={28} className="fill-[#333] text-[#333]" />
                  )}
              </button>

              <button className="active:scale-90 transition-transform -mr-2">
                  <Icons.SkipForward size={24} className="fill-[#333] text-[#333]" />
              </button>

              <button className="text-gray-400 active:scale-95 transition-transform p-1">
                  <Icons.Shuffle size={20} className="text-[#333]" strokeWidth={1.5} />
              </button>
          </div>
      </div>
    </div>
  );
};

export default LessonPlayerPage;
