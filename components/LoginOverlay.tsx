import React, { useState } from 'react';
import { apiService } from '../services/api';
import { Icons } from './Icons';
import { motion, AnimatePresence } from 'motion/react';

interface LoginOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const LoginOverlay: React.FC<LoginOverlayProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleOneClickLogin = async () => {
    setIsLoading(true);
    try {
      // Simulate "Local Phone Number" retrieval
      await apiService.login('138****8888');
      onLoginSuccess();
      onClose();
    } catch (error) {
      console.error("Login failed", error);
      alert("登录失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[101] bg-white rounded-t-[32px] shadow-2xl max-w-md mx-auto overflow-hidden"
            style={{ height: '60vh' }}
          >
            {/* Handle Bar */}
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 mb-8" />

            <div className="px-8 flex flex-col items-center">
              {/* Simple Logo */}
              <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3">
                 <Icons.Sparkles className="text-white" size={32} />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">欢迎回来</h2>
              <p className="text-gray-500 mb-10 text-center text-sm">登录后即可同步学习进度</p>

              {/* Phone Number Display */}
              <div className="w-full text-center mb-8">
                <p className="text-xs text-gray-400 mb-1">中国移动提供认证服务</p>
                <h3 className="text-3xl font-bold text-gray-900 tracking-wider">138 **** 8888</h3>
              </div>

              {/* One Click Login Button */}
              <button
                onClick={handleOneClickLogin}
                disabled={isLoading}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center text-lg"
              >
                {isLoading ? (
                  <Icons.Loader className="animate-spin mr-2" size={20} />
                ) : null}
                {isLoading ? '登录中...' : '本机号码一键登录'}
              </button>

              {/* Other Login Methods */}
              <div className="mt-6 flex items-center space-x-4">
                <button className="text-gray-400 text-sm hover:text-gray-600 transition-colors">
                  其他手机号登录
                </button>
                <span className="text-gray-200">|</span>
                <button className="text-gray-400 text-sm hover:text-gray-600 transition-colors">
                  验证码登录
                </button>
              </div>

              {/* Privacy Policy */}
              <div className="mt-auto pt-10 pb-8 text-[11px] text-gray-400 text-center leading-relaxed">
                登录即代表您同意 <span className="text-teal-600 font-medium">《用户协议》</span> 和 <span className="text-teal-600 font-medium">《隐私政策》</span>
                <br />
                并授权使用本机号码进行认证
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoginOverlay;
