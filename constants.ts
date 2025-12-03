
import { Course, Lesson, LessonSentence } from './types';

// --- CONFIGURATION ---
export const CONFIG = {
  USE_MOCK_DATA: true, // Set to false to use real API
  API_BASE_URL: 'https://api.example.com/v1', // Replace with real backend address
};

// --- MOCK DATA ---
export const MOCK_USER = {
  id: 'u123',
  phoneNumber: '138****8888',
  nickname: 'LearningStar',
  avatar: 'https://picsum.photos/100/100'
};

export const MOCK_LESSONS: Lesson[] = [
  {
    id: 'l1',
    title: '1.A Wonderful Weekend 一个美好的周末.mp3',
    isLearned: false
  },
  {
    id: 'l2',
    title: '2.A Day at School 在学校的一天.MP3',
    isLearned: false
  },
  {
    id: 'l3',
    title: '3.What Do You Usually Eat? 你通常吃什么.MP3',
    isLearned: false
  },
  {
    id: 'l4',
    title: '4.What\'s Your Hobby? 你的爱好是什么? .mp3',
    isLearned: false
  },
  {
    id: 'l5',
    title: '5.My Favorite Season 我最喜欢的季节.mp3',
    isLearned: false
  },
  {
    id: 'l6',
    title: '6.Travel Plans 旅行计划.mp3',
    isLearned: false
  }
];

export const MOCK_LESSON_TRANSCRIPT: LessonSentence[] = [
  { id: 's1', text: 'A wonderful weekend.', translation: '一个美好的周末。', startTime: 0, duration: 2 },
  { id: 's2', text: 'I had a good time last weekend.', translation: '我上周末过得很开心。', startTime: 2, duration: 3 },
  { id: 's3', text: 'On Saturday,', translation: '在周六，', startTime: 5, duration: 1.5 },
  { id: 's4', text: 'I got up late in the morning.', translation: '我早上起晚了。', startTime: 6.5, duration: 2.5 },
  { id: 's5', text: 'My mother prepared some milk, eggs,', translation: '我妈妈准备了一些牛奶，鸡蛋，', startTime: 9, duration: 3 },
  { id: 's6', text: 'and sandwiches for me.', translation: '还有给我的三明治。', startTime: 12, duration: 2 },
  { id: 's7', text: 'They were so yummy!', translation: '它们非常美味！', startTime: 14, duration: 2 },
  { id: 's8', text: 'After breakfast, I did my homework.', translation: '早饭后，我做了我的家庭作业。', startTime: 16, duration: 3 },
  { id: 's9', text: 'It was a little bit difficult.', translation: '它有一点难。', startTime: 19, duration: 2.5 },
  { id: 's10', text: 'But I finished it finally.', translation: '但是我最终完成了它。', startTime: 21.5, duration: 2.5 }
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
    price: 68.00
  },
  {
    id: '2',
    title: '每日英语播报',
    subtitle: '每日英语播报，收集超多经典演...',
    description: '每天十分钟，听遍全世界。',
    imageUrl: 'https://picsum.photos/400/500?random=2', 
    vocabularyCount: 6000,
    playCount: 221911,
    tags: ['共7篇', '高中', '四六级'],
    themeColor: 'bg-blue-600',
    author: 'DailyNews',
    price: 0
  },
  {
    id: '3',
    title: 'Grade Eight 八年级',
    subtitle: '精选 52 篇时文热点，学完搞定八...',
    description: '紧扣教材，拓展阅读。',
    imageUrl: 'https://picsum.photos/400/500?random=3',
    vocabularyCount: 2000,
    playCount: 632701,
    tags: ['共60篇', '初中'],
    isVip: true,
    themeColor: 'bg-orange-600',
    author: 'TeachMaster',
    price: 45.00
  },
  {
    id: '4',
    title: '走遍美国 (天宇)',
    subtitle: '以电视影集形式展现美国国家家庭...',
    description: '经典教材，地道美语。',
    imageUrl: 'https://picsum.photos/400/500?random=4',
    vocabularyCount: 2000,
    playCount: 15431,
    tags: ['共78篇', '小初高', '四六级'],
    isVip: true,
    themeColor: 'bg-red-600',
    author: 'USA Family',
    price: 99.00
  }
];

export const DAILY_READING_COURSES: Course[] = [
  {
    id: 'd1',
    title: 'Grade One, Two, Three',
    subtitle: '一、二、三阶',
    description: '我们所生活的社会中无处不有新...',
    imageUrl: 'https://picsum.photos/400/500?random=10',
    vocabularyCount: 1000,
    playCount: 20362027,
    tags: ['共106篇', '小学'],
    isVip: true,
    themeColor: 'bg-amber-100',
    author: 'KidsEng',
    price: 128.00
  },
  {
    id: 'd2',
    title: 'Grade Four 四阶',
    subtitle: '', 
    description: '我们所生活的社会中无处不有新...',
    imageUrl: 'https://picsum.photos/400/500?random=11',
    vocabularyCount: 1000,
    playCount: 2218436,
    tags: ['共119篇', '小学'],
    isVip: true,
    themeColor: 'bg-orange-200',
    author: 'KidsEng',
    price: 128.00
  },
  {
    id: 'd3',
    title: 'Grade Five',
    subtitle: '五阶',
    description: '我们所生活的社会中无处不有新...',
    imageUrl: 'https://picsum.photos/400/500?random=12',
    vocabularyCount: 1000,
    playCount: 6904203,
    tags: ['共100篇', '小学'],
    isVip: true,
    themeColor: 'bg-blue-200',
    author: 'KidsEng',
    price: 128.00
  },
  {
    id: 'd4',
    title: 'Grade Six',
    subtitle: '六阶',
    description: '我们所生活的社会中无处不有新...',
    imageUrl: 'https://picsum.photos/400/500?random=13',
    vocabularyCount: 1000,
    playCount: 1337787,
    tags: ['共95篇', '小学'],
    isVip: true,
    themeColor: 'bg-pink-200',
    author: 'KidsEng',
    price: 128.00
  }
];
