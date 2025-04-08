import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Admin Dashboard | Used Car Marketplace",
  description: "Admin dashboard for the Used Car Marketplace",
};

export default function AdminDashboard() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 md:p-10">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="flex items-center justify-center w-20 h-20 bg-brand-50 dark:bg-brand-500/10 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
      </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Chào mừng đến với Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Đây là dashboard quản trị dành cho hệ thống Marketplace xe cũ. Vui lòng sử dụng menu bên trái để truy cập các tính năng quản trị hệ thống.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-left">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Quản lý người dùng</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Xem và quản lý tài khoản người dùng, phân quyền và thông tin cá nhân.</p>
            <a href="/profile" className="text-brand-500 dark:text-brand-400 font-medium hover:text-brand-600 dark:hover:text-brand-300">
              Truy cập →
            </a>
      </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-left">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Xác thực &amp; Bảo mật</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Quản lý đăng nhập, đăng ký và các thiết lập bảo mật cho hệ thống.</p>
            <a href="/signin" className="text-brand-500 dark:text-brand-400 font-medium hover:text-brand-600 dark:hover:text-brand-300">
              Truy cập →
            </a>
      </div>
      </div>
      </div>
    </div>
  );
}
