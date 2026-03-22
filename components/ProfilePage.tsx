
import React, { useState } from 'react';
import { Icons } from './Icons';
import { Lesson } from '../types';
import { ArrowDownCircle } from 'lucide-react';

interface ProfilePageProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
  downloadedLessons?: Lesson[];
  onNavigateToCache?: () => void;
  requireAuth: (action: () => void) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ 
  isLoggedIn, 
  onLoginClick, 
  downloadedLessons = [], 
  onNavigateToCache,
  requireAuth
}) => {
  // Mock user data
  const user = {
    nickname: '学习达人',
    phoneNumber: '138****8888',
    avatar: 'https://picsum.photos/100/100?random=1',
  };

  const menuItems = [
    { icon: Icons.Book, label: '我的订单', action: () => requireAuth(() => console.log('订单')) },
    { icon: Icons.Settings, label: '设置', action: () => requireAuth(() => console.log('设置')) },
    { icon: Icons.CustomerService, label: '帮助与反馈', action: () => console.log('帮助') },
    { icon: Icons.Info, label: '关于我们', action: () => console.log('关于') },
  ];

  return (
    <div className="p-4 bg-gray-50 min-h-full pb-20">
      {/* User Info / Login Prompt */}
      {isLoggedIn ? (
        <div className="bg-white rounded-2xl p-6 flex items-center shadow-sm mb-6">
          <img src={user.avatar} alt="Avatar" className="w-16 h-16 rounded-full mr-4 border-2 border-teal-100" referrerPolicy="no-referrer" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user.nickname}</h2>
            <p className="text-sm text-gray-500">{user.phoneNumber}</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-sm mb-6 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
            <Icons.User size={40} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">您还未登录</h2>
          <p className="text-sm text-gray-400 mb-6">登录后可查看学习数据和已购课程</p>
          <button 
            onClick={onLoginClick}
            className="bg-teal-500 text-white px-10 py-3 rounded-full font-bold shadow-md active:scale-95 transition-transform"
          >
            立即登录
          </button>
        </div>
      )}

      {/* Cache List Link */}
      <button 
        onClick={onNavigateToCache}
        className="w-full bg-white rounded-2xl shadow-sm overflow-hidden mb-6 p-4 flex items-center justify-between active:bg-gray-50 transition-colors"
      >
        <div className="flex items-center text-gray-800 font-bold">
            <ArrowDownCircle className="mr-2 text-teal-500" size={20} />
            我的缓存
        </div>
        <div className="flex items-center">
            <span className="text-xs text-gray-400 mr-2">{downloadedLessons.length} 节内容</span>
            <Icons.ArrowRight size={16} className="text-gray-400" />
        </div>
      </button>

      {/* Menu Items */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.action}
            className="w-full flex items-center justify-between p-4 border-b border-gray-100 last:border-0 active:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <div className="p-2 bg-teal-50 rounded-lg mr-3 text-teal-600">
                <item.icon size={20} />
              </div>
              <span className="font-medium text-gray-700">{item.label}</span>
            </div>
            <Icons.ArrowRight size={16} className="text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;
