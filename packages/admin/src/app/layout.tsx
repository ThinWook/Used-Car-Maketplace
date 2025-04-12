"use client";

import { Outfit } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AdminProvider } from '@/contexts/AdminContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  // Kiểm tra phiên hết hạn khi tải trang
  useEffect(() => {
    const checkAuthSession = () => {
      try {
        const userData = localStorage.getItem('userData');
        if (!userData) {
          router.push('/signin');
          return;
        }

        const userObj = JSON.parse(userData);
        if (!userObj.exp) return; // Nếu không có exp, bỏ qua
        
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime > userObj.exp) {
          console.log('Phiên đăng nhập đã hết hạn');
          // Xóa dữ liệu đăng nhập
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userData');
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'userData=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          
          // Chuyển hướng về trang đăng nhập
          router.push('/signin');
        }
      } catch (error) {
        console.error('Lỗi kiểm tra phiên:', error);
        router.push('/signin');
      }
    };

    // Kiểm tra ngay khi tải trang
    checkAuthSession();

    // Thiết lập kiểm tra định kỳ
    const interval = setInterval(checkAuthSession, 60 * 1000); // Kiểm tra mỗi phút
    
    return () => clearInterval(interval);
  }, [router]);

  return (
    <html suppressHydrationWarning lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <AuthProvider>
          <AdminProvider>
            <ThemeProvider>
              <SidebarProvider>
                {children}
                <Toaster position="top-right" />
              </SidebarProvider>
            </ThemeProvider>
          </AdminProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
