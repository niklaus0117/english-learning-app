
import { Course, Lesson, LessonSentence } from './types';

// --- CONFIGURATION ---
export const CONFIG = {
  USE_MOCK_DATA: true,
  API_BASE_URL: 'https://api.example.com/v1',
};

// --- MOCK DATA ---
export const MOCK_USER = {
  id: 'u123',
  phoneNumber: '138****8888',
  nickname: 'LearningStar',
  avatar: 'https://picsum.photos/100/100'
};

// Reusable sample media URLs
const SAMPLE_AUDIO_1 = 'https://www.w3schools.com/html/horse.mp3';
const SAMPLE_AUDIO_2 = 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3';
const SAMPLE_VIDEO_1 = 'https://www.w3schools.com/html/mov_bbb.mp4';
const SAMPLE_VIDEO_2 = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4';

// Specific Lesson Lists
const LESSONS_SCIENCE: Lesson[] = [
  { id: 'sci1', title: '1. The Solar System 太阳系', duration: '02:15', isLearned: false, mediaType: 'video', mediaUrl: SAMPLE_VIDEO_1, coverUrl: 'https://picsum.photos/400/225?random=101' },
  { id: 'sci2', title: '2. Water Cycle 水循环', duration: '03:40', isLearned: false, mediaType: 'video', mediaUrl: SAMPLE_VIDEO_2, coverUrl: 'https://picsum.photos/400/225?random=102' },
  { id: 'sci3', title: '3. Plant Growth 植物生长', duration: '04:10', isLearned: false, mediaType: 'audio', mediaUrl: SAMPLE_AUDIO_1 },
];

const LESSONS_DAILY: Lesson[] = [
  { id: 'day1', title: '1. A Wonderful Weekend 一个美好的周末', duration: '05:30', isLearned: false, mediaType: 'audio', mediaUrl: SAMPLE_AUDIO_1 },
  { id: 'day2', title: '2. Morning Routine 晨间日常', duration: '04:20', isLearned: true, mediaType: 'video', mediaUrl: SAMPLE_VIDEO_1, coverUrl: 'https://picsum.photos/400/225?random=103' },
  { id: 'day3', title: '3. At the Supermarket 在超市', duration: '06:15', isLearned: false, mediaType: 'audio', mediaUrl: SAMPLE_AUDIO_2 },
];

const LESSONS_SPEECH: Lesson[] = [
  { id: 'sp1', title: '1. I Have a Dream (Excerpt)', duration: '10:05', isLearned: false, mediaType: 'video', mediaUrl: SAMPLE_VIDEO_2, coverUrl: 'https://picsum.photos/400/225?random=104' },
  { id: 'sp2', title: '2. Stay Hungry, Stay Foolish', duration: '14:20', isLearned: false, mediaType: 'video', mediaUrl: SAMPLE_VIDEO_1, coverUrl: 'https://picsum.photos/400/225?random=105' },
];

const LESSONS_CLASSIC: Lesson[] = [
  { id: 'cl1', title: '1. The Little Prince - Ch 1', duration: '08:30', isLearned: false, mediaType: 'audio', mediaUrl: SAMPLE_AUDIO_1 },
  { id: 'cl2', title: '2. Alice in Wonderland - Ch 1', duration: '12:45', isLearned: false, mediaType: 'audio', mediaUrl: SAMPLE_AUDIO_2 },
];

// Fallback lessons for older components
export const MOCK_LESSONS: Lesson[] = LESSONS_DAILY;

export const MOCK_LESSON_TRANSCRIPT: LessonSentence[] = [
  { id: 's1', text: 'To follow in the footsteps of our robot pioneers and explore the planets of our solar system.', translation: '翻译功能已禁用,点击开启VIP权限', startTime: 0, duration: 25 },
  { id: 's2', text: 'Imagine boarding a flight to Saturn.', translation: '翻译功能已禁用,点击开启VIP权限', startTime: 25, duration: 5 },
  { id: 's3', text: 'What would you need to know before traveling?', translation: '翻译功能已禁用,点击开启VIP权限', startTime: 30, duration: 5 },
  { id: 's4', text: 'The best ringside vantage points.', translation: '翻译功能已禁用,点击开启VIP权限', startTime: 35, duration: 6 },
  { id: 's5', text: 'The must-see moons.', translation: '翻译功能已禁用,点击开启VIP权限', startTime: 41, duration: 5 },
  { id: 's6', text: 'Think of this as your personal guide to the ringed wonder.', translation: '翻译功能已禁用,点击开启VIP权限', startTime: 46, duration: 5 },
  { id: 's7', text: 'No planet beats Saturn for jaw-dropping beauty.', translation: '翻译功能已禁用,点击开启VIP权限', startTime: 51, duration: 6 },
  { id: 's8', text: 'Saturn is the most photogenic planet in all the solar system.', translation: '翻译功能已禁用,点击开启VIP权限', startTime: 57, duration: 6 },
  { id: 's9', text: 'Some of the pictures are to die for.', translation: '翻译功能已禁用,点击开启VIP权限', startTime: 63, duration: 4 },
  { id: 's10', text: 'But the postcards only tell part of the story.', translation: '翻译功能已禁用,点击开启VIP权限', startTime: 67, duration: 5 }
];

export const MOCK_COURSES: Course[] = [
  {
    id: '1',
    title: '150篇搞定小初核心2500词',
    subtitle: '每日英语听读，150篇精选范文...',
    description: '每日英语听读，150篇精选范文搞定小初2500词。',
    imageUrl: 'https://picsum.photos/400/500?random=1',
    vocabularyCount: 2500,
    playCount: 7888143,
    tags: ['共137篇', '小学', '初中'],
    isVip: true,
    themeColor: 'bg-green-600',
    author: 'Mater',
    price: 68.00,
    lessons: LESSONS_DAILY
  },
  {
    id: '2',
    title: '每日英语播报 (视频版)',
    subtitle: '每日英语播报，收集超多经典演...',
    description: '每天十分钟，听遍全世界。',
    imageUrl: 'https://picsum.photos/400/500?random=2', 
    vocabularyCount: 6000,
    playCount: 221911,
    tags: ['共7篇', '高中', '视频'],
    themeColor: 'bg-blue-600',
    author: 'DailyNews',
    price: 0,
    lessons: LESSONS_SPEECH
  }
];

export const DAILY_READING_COURSES: Course[] = [
  {
    id: 'd1',
    title: 'Grade One, Two, Three',
    subtitle: '一、二、三阶',
    description: '科学分级阅读，适合低年级。',
    imageUrl: 'https://picsum.photos/400/500?random=10',
    vocabularyCount: 1000,
    playCount: 20362027,
    tags: ['共106篇', '小学'],
    isVip: true,
    themeColor: 'bg-amber-100',
    author: 'KidsEng',
    price: 128.00,
    category: '科学分级',
    lessons: LESSONS_SCIENCE
  },
  {
    id: 'd2',
    title: 'Grade Four 四阶',
    subtitle: '', 
    description: '科学分级阅读，进阶挑战。',
    imageUrl: 'https://picsum.photos/400/500?random=11',
    vocabularyCount: 1000,
    playCount: 2218436,
    tags: ['共119篇', '小学'],
    isVip: true,
    themeColor: 'bg-orange-200',
    author: 'KidsEng',
    price: 128.00,
    category: '科学分级',
    lessons: LESSONS_SCIENCE
  },
  {
    id: 'd3',
    title: '晨间新闻精听',
    subtitle: '每日听读',
    description: '每天早上5分钟，养成听力好习惯。',
    imageUrl: 'https://picsum.photos/400/500?random=12',
    vocabularyCount: 1500,
    playCount: 6904203,
    tags: ['共100篇', '日常'],
    isVip: false,
    themeColor: 'bg-blue-200',
    author: 'DailyEng',
    price: 0,
    category: '每日听读',
    lessons: LESSONS_DAILY
  },
  {
    id: 'd4',
    title: '乔布斯斯坦福演讲',
    subtitle: '名人演讲',
    description: '经典名人演讲视频解析。',
    imageUrl: 'https://picsum.photos/400/500?random=13',
    vocabularyCount: 3000,
    playCount: 1337787,
    tags: ['共2篇', '视频', '演讲'],
    isVip: true,
    themeColor: 'bg-pink-200',
    author: 'SpeechPro',
    price: 19.90,
    category: '名人演讲',
    lessons: LESSONS_SPEECH
  },
  {
    id: 'd5',
    title: '小王子 (The Little Prince)',
    subtitle: '世界名著',
    description: '经典英文原著朗读。',
    imageUrl: 'https://picsum.photos/400/500?random=14',
    vocabularyCount: 4000,
    playCount: 554321,
    tags: ['共27篇', '名著', '音频'],
    isVip: true,
    themeColor: 'bg-purple-200',
    author: 'ClassicRead',
    price: 29.90,
    category: '世界名著',
    lessons: LESSONS_CLASSIC
  }
];
