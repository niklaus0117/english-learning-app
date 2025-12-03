import React, { useState } from 'react';
import { apiService } from '../services/api';

interface LoginOverlayProps {
  onLoginSuccess: () => void;
}

const LoginOverlay: React.FC<LoginOverlayProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleOneClickLogin = async () => {
    setIsLoading(true);
    try {
      // Simulate "Local Phone Number" retrieval
      await apiService.login('138****8888');
      onLoginSuccess();
    } catch (error) {
      console.error("Login failed", error);
      alert("登录失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 flex flex-col items-center">
        
        {/* Logo Placeholder */}
        <div className="w-24 h-24 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
           <span className="text-white text-3xl font-bold">ABC</span>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-12">欢迎来到英语学习App</h2>

        {/* Current Phone Number Display */}
        <p className="text-gray-500 mb-2 text-sm">中国移动提供认证服务</p>
        <h3 className="text-3xl font-semibold text-gray-900 mb-8">138 **** 8888</h3>

        {/* One Click Login Button */}
        <button
          onClick={handleOneClickLogin}
          disabled={isLoading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-full shadow-lg transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center"
        >
          {isLoading ? (
            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
          ) : null}
          {isLoading ? '登录中...' : '本机号码一键登录'}
        </button>

        {/* Other Login Methods */}
        <button className="mt-6 text-gray-400 text-sm">
          其他方式登录
        </button>

        {/* Privacy Policy */}
        <div className="absolute bottom-10 text-[10px] text-gray-400 text-center px-10">
          登录即代表您同意 <span className="text-orange-500">《用户协议》</span> 和 <span className="text-orange-500">《隐私政策》</span>
          <br />
          并授权使用本机号码进行认证
        </div>
      </div>
    </div>
  );
};

export default LoginOverlay;