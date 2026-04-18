
import React, { useState, useEffect } from 'react';
import { Icons } from './components/Icons';
import CourseCard from './components/CourseCard';
import LoginOverlay from './components/LoginOverlay';
import DailyReadingPage from './components/DailyReadingPage';
import CourseDetailPage from './components/CourseDetailPage';
import AIChatPage from './components/AIChatPage';
import LessonPlayerPage from './components/LessonPlayerPage';
import ProfilePage from './components/ProfilePage';
import BookshelfPage from './components/BookshelfPage';
import CachePage from './components/CachePage';
import CategoryListPage from './components/CategoryListPage';
import CategoryDetailPage from './components/CategoryDetailPage';
import MorningReadingPage from './components/MorningReadingPage';
import { apiService } from './services/api';
import { Course, TabName, Lesson } from './types';
import { MOCK_COURSES, MOCK_LESSONS } from './constants';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState<TabName>(TabName.HOME);
  const [topTab, setTopTab] = useState<string>('推荐');
  
  // Navigation State
  const [currentView, setCurrentView] = useState<'main' | 'dailyReading' | 'courseDetail' | 'lessonPlayer' | 'cache' | 'categoryList' | 'categoryDetail' | 'morningReading'>('main');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  // Store the previous view to handle "Back" correctly
  const [courseDetailSourceView, setCourseDetailSourceView] = useState<'main' | 'dailyReading'>('main');
  const [lessonPlayerSourceView, setLessonPlayerSourceView] = useState<'courseDetail' | 'cache' | 'bookshelf'>('courseDetail');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  // Initialize bookshelf with some mock collected lessons
  const [collectedLessons, setCollectedLessons] = useState<Lesson[]>(MOCK_LESSONS.slice(0, 3));
  const [downloadedLessons, setDownloadedLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await apiService.getCourses();
      setCourses(data);
    } catch (e) {
      console.error("Failed to load courses", e);
    }
  };

  const requireAuth = (action: () => void) => {
    if (isLoggedIn) {
      action();
    } else {
      setShowLoginModal(true);
    }
  };

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    // Determine source view for proper back navigation
    if (currentView === 'main' || currentView === 'dailyReading') {
        setCourseDetailSourceView(currentView);
    }
    setCurrentView('courseDetail');
  };

  const collectLesson = (lesson: Lesson) => {
    requireAuth(() => {
      if (!collectedLessons.find(l => l.id === lesson.id)) {
          setCollectedLessons([...collectedLessons, lesson]);
          alert('已收藏课程章节');
      } else {
          alert('已在收藏中');
      }
    });
  };

  const downloadLesson = (lesson: Lesson) => {
    requireAuth(() => {
      if (!downloadedLessons.find(l => l.id === lesson.id)) {
          setDownloadedLessons([...downloadedLessons, lesson]);
          alert('已加入缓存列表');
      } else {
          alert('已在缓存列表中');
      }
    });
  };

  const handleLessonClick = (lesson: Lesson) => {
    requireAuth(() => {
      setSelectedLesson(lesson);
      // Store the previous view before going to lesson player
      if (currentView === 'courseDetail' || currentView === 'cache' || currentView === 'main') {
          // Note: bookshelf is within 'main' view
          setLessonPlayerSourceView(currentView === 'main' ? 'bookshelf' : currentView);
      }
      setCurrentView('lessonPlayer');
    });
  };

  const renderCurrentView = () => {
    // --- Render Daily Reading Page ---
    if (currentView === 'dailyReading') {
        return (
          <DailyReadingPage 
            onBack={() => setCurrentView('main')} 
            onCourseClick={handleCourseClick}
          />
        );
    }

    // --- Render Course Detail Page ---
    if (currentView === 'courseDetail' && selectedCourse) {
        return (
            <CourseDetailPage 
              course={selectedCourse} 
              onBack={() => setCurrentView(courseDetailSourceView)} 
              onLessonClick={handleLessonClick}
              onDownloadLesson={downloadLesson}
              onBuy={() => requireAuth(() => alert('跳转支付页面...'))}
              downloadedLessons={downloadedLessons}
            />
        );
    }

    // --- Render Cache Page ---
    if (currentView === 'cache') {
        return (
            <CachePage
                downloadedLessons={downloadedLessons}
                onBack={() => setCurrentView('main')}
                onLessonClick={handleLessonClick}
            />
        );
    }

    // --- Render Category List Page ---
    if (currentView === 'categoryList') {
        return (
          <CategoryListPage 
            categoryName={selectedCategory} 
            onBack={() => setCurrentView('main')} 
            onItemClick={(item) => {
              setSelectedChannel(item);
              setCurrentView('categoryDetail');
            }}
          />
        );
    }

    // --- Render Category Detail Page ---
    if (currentView === 'categoryDetail' && selectedChannel) {
        return (
          <CategoryDetailPage
            title={selectedChannel.title}
            onBack={() => setCurrentView('categoryList')}
            onItemClick={(item) => {
              // Create a mock lesson out of the item to play
              setSelectedLesson({
                id: item.id,
                courseId: 'mock',
                title: item.title,
                duration: item.duration || '49:58',
                progress: 0,
                mediaType: 'video',
                mediaUrl: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4',
                coverUrl: item.imageUrl
              });
              setLessonPlayerSourceView('categoryDetail');
              setCurrentView('lessonPlayer');
            }}
          />
        );
    }

    // --- Render Morning Reading Page ---
    if (currentView === 'morningReading') {
        return <MorningReadingPage onBack={() => setCurrentView('main')} />;
    }

    // --- Render Lesson Player Page ---
    if (currentView === 'lessonPlayer' && selectedLesson) {
        return (
            <LessonPlayerPage
                lesson={selectedLesson}
                onBack={() => setCurrentView(lessonPlayerSourceView === 'bookshelf' ? 'main' : lessonPlayerSourceView)}
            />
        );
    }

    // --- Render Main App (Home with Tabs) ---
    return (
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-[60px]">
        {/* HOME TAB CONTENT */}
        {activeTab === TabName.HOME && (
          <>
            {/* --- Sticky Header --- */}
            <header className="sticky top-0 z-40 bg-gradient-to-b from-orange-50 to-white pt-4 px-4 pb-2">
              {/* Search Bar & Notification */}
              <div className="flex items-center gap-3">
                  <div className="flex-1 bg-white rounded-full px-4 py-1.5 flex items-center shadow-sm border border-gray-100">
                      <Icons.Search className="text-gray-400 mr-2" size={16} />
                      <input 
                          type="text" 
                          placeholder="CNN 10 学生英语" 
                          className="bg-transparent w-full outline-none text-xs text-gray-700 placeholder-gray-400"
                      />
                  </div>
                  <div className="relative cursor-pointer mt-1">
                      <Icons.Bell className="text-gray-700" size={24} />
                      <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[8px] font-bold px-1 rounded-full border border-white">20</span>
                  </div>
              </div>
            </header>

            <main className="px-4 pt-2 bg-white">
              {/* Banner */}
              <div 
                className="w-full rounded-2xl overflow-hidden relative mb-6 shadow-sm h-40 cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => setCurrentView('morningReading')}
              >
                  <img 
                    src="https://picsum.photos/800/400?random=banner3" 
                    alt="Banner" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {/* Banner content overlay to match design */}
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-900/60 to-transparent flex flex-col justify-center p-6">
                      <div className="bg-white/90 text-gray-800 text-xs font-bold px-2 py-1 rounded w-fit mb-2">每日英语听力独家出品</div>
                      <h2 className="text-white text-2xl font-black drop-shadow-md">晨读专栏</h2>
                      <h3 className="text-white text-lg font-medium drop-shadow-md mt-1">带你读美句学英语</h3>
                  </div>
                  {/* Dots */}
                  <div className="absolute bottom-3 right-4 flex gap-1.5">
                     <div className="w-4 h-1.5 bg-white rounded-full"></div>
                     <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
                     <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
                     <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
                  </div>
              </div>

              {/* Grid Menu */}
              <div className="grid grid-cols-4 gap-y-5 gap-x-2 mb-8">
                  {[
                    { name: '少儿启蒙', icon: Icons.Baby, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { name: '教材', icon: Icons.Book, color: 'text-red-500', bg: 'bg-red-50' },
                    { name: '考试', icon: Icons.FileText, color: 'text-orange-500', bg: 'bg-orange-50' },
                    { name: '公开课', icon: Icons.GraduationCap, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { name: '人文历史', icon: Icons.Calendar, color: 'text-purple-500', bg: 'bg-purple-50' },
                    { name: '影视', icon: Icons.Film, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { name: '演讲', icon: Icons.Mic, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                    { name: '有声读物', icon: Icons.Headphones, color: 'text-cyan-500', bg: 'bg-cyan-50' },
                  ].map((item, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => {
                          setSelectedCategory(item.name);
                          setCurrentView('categoryList');
                        }} 
                        className="flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
                      >
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bg} ${item.color} shadow-sm`}>
                              <item.icon size={24} strokeWidth={1.5} />
                          </div>
                          <span className="text-xs text-gray-700">{item.name}</span>
                      </div>
                  ))}
              </div>

              {/* Hot Recommendations Header */}
              <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-1">
                      <span className="text-orange-500 text-xl">🔥</span> 热门推荐
                  </h2>
                  <div 
                      className="flex items-center text-gray-400 text-xs cursor-pointer"
                      onClick={() => setCurrentView('dailyReading')}
                  >
                      <span>查看更多</span>
                      <Icons.ChevronRight size={14} />
                  </div>
              </div>

              {/* Course List */}
              <div className="flex flex-col pb-6">
                  {courses.map(course => (
                      <CourseCard 
                          key={course.id} 
                          course={course} 
                          onClick={handleCourseClick}
                          layout="list"
                      />
                  ))}
              </div>
            </main>
          </>
        )}

        {/* AI CHAT TAB CONTENT */}
        {activeTab === TabName.AI_CHAT && (
            <div className="h-full">
                <AIChatPage />
            </div>
        )}

        {/* PROFILE TAB CONTENT */}
        {activeTab === TabName.PROFILE && (
            <div className="h-full">
                <ProfilePage 
                    isLoggedIn={isLoggedIn}
                    onLoginClick={() => setShowLoginModal(true)}
                    downloadedLessons={downloadedLessons}
                    onNavigateToCache={() => requireAuth(() => setCurrentView('cache'))}
                    requireAuth={requireAuth}
                />
            </div>
        )}

        {/* BOOKSHELF TAB CONTENT */}
        {activeTab === TabName.BOOKSHELF && (
            <div className="h-full">
                <BookshelfPage 
                    collectedLessons={collectedLessons}
                    onLessonClick={handleLessonClick}
                />
            </div>
        )}

        {/* VOCABULARY TAB CONTENT */}
        {activeTab === TabName.VOCABULARY && (
             <div className="flex flex-col items-center justify-center h-full pt-20 text-gray-400">
                <div className="bg-gray-100 p-6 rounded-full mb-4">
                  <Icons.BookOpen size={48} />
                </div>
                <h2 className="text-lg font-bold text-gray-500">{activeTab}</h2>
                <p className="text-sm mt-2">功能正在开发中...</p>
            </div>
        )}

        {/* --- Bottom Navigation --- */}
        {/* Mini Player */}
        {selectedLesson && currentView !== 'lessonPlayer' && (
           <div 
             className="absolute bottom-[68px] left-3 right-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] p-2 flex items-center gap-3 z-40 border border-gray-100 cursor-pointer"
             onClick={() => setCurrentView('lessonPlayer')}
           >
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                 <img src={selectedLesson.coverUrl || 'https://picsum.photos/100/100'} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Icons.Play className="text-white fill-white" size={16} />
                 </div>
              </div>
              <div className="flex-1 min-w-0">
                 <h4 className="text-sm font-bold text-gray-900 truncate">{selectedLesson.title}</h4>
                 <p className="text-xs text-gray-500 truncate">点击继续播放</p>
              </div>
              <div className="flex items-center gap-3 pr-2">
                 <button className="p-1.5 text-gray-800 hover:bg-gray-100 rounded-full" onClick={(e) => { e.stopPropagation(); setCurrentView('lessonPlayer'); }}>
                    <Icons.Play size={24} className="fill-current" />
                 </button>
                 <button className="p-1.5 text-gray-800 hover:bg-gray-100 rounded-full" onClick={(e) => { e.stopPropagation(); }}>
                    <Icons.SkipForward size={24} className="fill-current" />
                 </button>
              </div>
           </div>
        )}

        <nav className="absolute bottom-0 w-full bg-white border-t border-gray-100 flex justify-around items-center pb-safe pt-2 h-[60px] z-50">
          <NavButton 
              icon={<Icons.Home size={24} />} 
              label={TabName.HOME} 
              isActive={activeTab === TabName.HOME} 
              onClick={() => setActiveTab(TabName.HOME)}
          />
          <NavButton 
              icon={<Icons.Book size={24} />} 
              label={TabName.BOOKSHELF} 
              isActive={activeTab === TabName.BOOKSHELF} 
              onClick={() => requireAuth(() => setActiveTab(TabName.BOOKSHELF))}
          />
          {/* NEW AI TAB */}
          <div className="relative -top-5">
            <button 
              onClick={() => requireAuth(() => setActiveTab(TabName.AI_CHAT))}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform active:scale-95 ${
                  activeTab === TabName.AI_CHAT 
                  ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white ring-4 ring-white' 
                  : 'bg-white text-gray-400 border border-gray-200'
              }`}
            >
              <Icons.Sparkles size={24} className={activeTab === TabName.AI_CHAT ? "animate-pulse" : ""} />
            </button>
            <span className={`absolute -bottom-5 w-full text-center text-[10px] font-medium ${activeTab === TabName.AI_CHAT ? 'text-indigo-600' : 'text-gray-400'}`}>
                AI助教
            </span>
          </div>

          <NavButton 
              icon={<Icons.BookOpen size={24} />} 
              label={TabName.VOCABULARY} 
              isActive={activeTab === TabName.VOCABULARY} 
              onClick={() => requireAuth(() => setActiveTab(TabName.VOCABULARY))}
          />
          <NavButton 
              icon={<Icons.User size={24} />} 
              label={TabName.PROFILE} 
              isActive={activeTab === TabName.PROFILE} 
              onClick={() => setActiveTab(TabName.PROFILE)}
          />
        </nav>
      </div>
    );
  };

  return (
    <div className="h-[100dvh] bg-white max-w-md mx-auto relative shadow-2xl overflow-hidden flex flex-col">
      {renderCurrentView()}

      {/* Login Modal */}
      <LoginOverlay 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onLoginSuccess={() => setIsLoggedIn(true)} 
      />
    </div>
  );
}

// Subcomponent for Navigation Buttons
const NavButton = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-orange-500' : 'text-gray-400'}`}
    >
        {isActive && label === TabName.HOME ? (
            <div className="bg-orange-500 text-white p-1 rounded-lg">
               {React.cloneElement(icon as React.ReactElement<any>, { size: 18, color: 'white' })}
            </div>
        ) : (
            icon
        )}
        <span className="text-[10px] font-medium">{label}</span>
    </button>
);

export default App;
