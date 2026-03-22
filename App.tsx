
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
import { apiService } from './services/api';
import { Course, TabName, Lesson } from './types';
import { MOCK_COURSES, MOCK_LESSONS } from './constants';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState<TabName>(TabName.HOME);
  const [topTab, setTopTab] = useState<'recommend' | 'purchased'>('recommend');
  
  // Navigation State
  const [currentView, setCurrentView] = useState<'main' | 'dailyReading' | 'courseDetail' | 'lessonPlayer' | 'cache'>('main');
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
            <header className="sticky top-0 z-40 bg-white pt-2 px-4 pb-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex space-x-6 relative">
                   {/* Tab Indicator Line */}
                   <div className={`absolute bottom-[-4px] h-[3px] w-6 bg-teal-500 rounded-full transition-all duration-300 ${topTab === 'recommend' ? 'left-1' : 'left-[4.5rem]'}`}></div>
                   
                   <button 
                      onClick={() => setTopTab('recommend')}
                      className={`text-xl font-bold transition-colors ${topTab === 'recommend' ? 'text-gray-900' : 'text-gray-400'}`}
                   >
                      推荐
                   </button>
                   <button 
                      onClick={() => requireAuth(() => setTopTab('purchased'))}
                      className={`text-xl font-bold transition-colors ${topTab === 'purchased' ? 'text-gray-900' : 'text-gray-400'}`}
                   >
                      已购
                   </button>
                </div>
                <button className="p-1">
                   <Icons.Menu className="text-gray-600" size={24} />
                </button>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-100 rounded-full px-3 py-2 flex items-center">
                      <Icons.Search className="text-gray-400 mr-2" size={18} />
                      <input 
                          type="text" 
                          placeholder="请输入搜索内容" 
                          className="bg-transparent w-full outline-none text-sm text-gray-700 placeholder-gray-400"
                      />
                  </div>
                  <div className="flex flex-col items-center justify-center text-gray-500">
                      <Icons.Message size={22} />
                      <span className="text-[10px] scale-75">消息</span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-gray-500">
                      <Icons.CustomerService size={22} />
                      <span className="text-[10px] scale-75">客服</span>
                  </div>
              </div>
            </header>

            <main className="px-4 pt-4">
              {/* Banner */}
              <div className="w-full bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl p-4 text-white relative overflow-hidden mb-6 h-40 shadow-md">
                  {/* Decorative Circles */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
                  <div className="absolute bottom-0 right-10 w-16 h-16 bg-yellow-300/30 rounded-full blur-lg"></div>

                  <div className="relative z-10 w-2/3">
                      <h2 className="text-lg font-bold mb-1 shadow-sm">APP中有海量书籍与精品课程</h2>
                      <h3 className="text-xl font-black mb-3">购买哪个学习哪个</h3>
                      <div className="inline-block bg-white text-orange-500 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                          星辰大海 未来可期
                      </div>
                  </div>
                  {/* 3D Character Illustration Placeholder */}
                  <div className="absolute -bottom-2 -right-2 w-32 h-32">
                      <img 
                        src="https://picsum.photos/200/200?random=100" 
                        alt="Mascot" 
                        className="w-full h-full object-contain drop-shadow-lg"
                        style={{clipPath: 'circle(50%)'}} 
                        referrerPolicy="no-referrer"
                      />
                  </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3 mb-8">
                  <div className="flex-1 bg-orange-50 rounded-xl p-3 flex items-center justify-between cursor-pointer active:scale-95 transition-transform" onClick={() => requireAuth(() => setTopTab('purchased'))}>
                      <span className="font-bold text-orange-800 text-sm">已购课程</span>
                      <Icons.ArrowRight className="text-orange-400" size={16} />
                  </div>
                  <div className="flex-1 bg-teal-50 rounded-xl p-3 flex items-center justify-between cursor-pointer active:scale-95 transition-transform">
                      <span className="font-bold text-teal-800 text-sm">兑换中心</span>
                      <Icons.ArrowRight className="text-teal-400" size={16} />
                  </div>
              </div>

              {/* Daily Reading Header */}
              <div 
                  className="flex items-center justify-between mb-4 cursor-pointer"
                  onClick={() => setCurrentView('dailyReading')}
              >
                  <h2 className="text-xl font-bold text-gray-900">每日英语听读</h2>
                  <div className="flex items-center text-gray-400 text-xs">
                      <span>查看更多</span>
                      <Icons.ArrowRight size={12} />
                  </div>
              </div>

              {/* Course Grid */}
              <div className="grid grid-cols-2 gap-4 pb-6">
                  {courses.map(course => (
                      <CourseCard 
                          key={course.id} 
                          course={course} 
                          onClick={handleCourseClick}
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
