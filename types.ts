
export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  imageUrl: string;
  vocabularyCount?: number;
  playCount: number;
  tags: string[];
  isVip?: boolean;
  themeColor?: string;
  author?: string; // New
  price?: number; // New
}

export interface Lesson {
  id: string;
  title: string;
  duration?: string;
  isLearned: boolean;
}

export interface LessonSentence {
  id: string;
  text: string;
  translation: string;
  startTime: number; // in seconds
  duration: number;
}

export interface User {
  id: string;
  phoneNumber: string;
  nickname: string;
  avatar: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export enum TabName {
  HOME = '首页',
  COLLECTION = '收藏',
  AI_CHAT = 'AI助教',
  VOCABULARY = '生词本',
  PROFILE = '我的'
}
