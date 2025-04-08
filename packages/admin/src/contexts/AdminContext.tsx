'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AdminUser {
  _id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string;
}

interface AdminContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasAccess: (requiredRole?: string) => boolean;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Kiểm tra xác thực khi component mount
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setIsLoading(false);
          router.push('/signin');
          return;
        }

        // Lấy thông tin người dùng từ localStorage
        const userDataStr = localStorage.getItem('userData');
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          
          // Kiểm tra role phải là admin
          if (userData.role !== 'admin') {
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            setIsLoading(false);
            router.push('/signin');
            return;
          }
          
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
          router.push('/signin');
        }
      } catch (error) {
        console.error('Lỗi kiểm tra xác thực:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        router.push('/signin');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Hàm kiểm tra quyền truy cập
  const hasAccess = (requiredRole: string = 'admin') => {
    if (!user) return false;
    return user.role === requiredRole;
  };

  // Đăng xuất
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'userData=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setUser(null);
    setIsAuthenticated(false);
    router.push('/signin');
  };

  return (
    <AdminContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        hasAccess,
        logout
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  
  if (context === undefined) {
    throw new Error('useAdmin phải được sử dụng trong phạm vi AdminProvider');
  }
  
  return context;
}; 