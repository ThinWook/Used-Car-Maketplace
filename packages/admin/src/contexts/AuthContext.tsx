'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  full_name: string;
  email: string;
  role: 'admin';
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập chưa khi tải trang
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
          // Nếu không có thông tin người dùng, đăng xuất
          localStorage.removeItem('token');
          router.push('/signin');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        router.push('/signin');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const login = async (email: string, password: string): Promise<any> => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Đăng nhập thất bại');
      }

      const data = await response.json();
      
      if (!data || !data.token) {
        throw new Error('Phản hồi không hợp lệ từ máy chủ');
      }
      
      // Kiểm tra role phải là admin
      if (data.role !== 'admin') {
        throw new Error('Bạn không có quyền truy cập trang quản trị');
      }
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('userData', JSON.stringify(data));
      
      // Lưu cookie để middleware xử lý
      document.cookie = `token=${data.token}; path=/; max-age=${60*60*24*30}`;
      document.cookie = `userData=${encodeURIComponent(JSON.stringify(data))}; path=/; max-age=${60*60*24*30}`;
      
      setUser(data);
      setIsAuthenticated(true);
      
      return data;
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Xử lý trường hợp đặc biệt cho môi trường phát triển
      if (process.env.NODE_ENV === 'development' && 
          email === 'admin@example.com' && 
          password === 'admin') {
        
        const adminUser = {
          _id: 'admin-id',
          full_name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin' as const,
          avatar_url: '/assets/images/avatar.png'
        };
        
        const mockToken = 'dev-admin-token';
        
        localStorage.setItem('token', mockToken);
        localStorage.setItem('userData', JSON.stringify(adminUser));
        
        // Lưu cookie để middleware xử lý
        document.cookie = `token=${mockToken}; path=/; max-age=${60*60*24*30}`;
        document.cookie = `userData=${encodeURIComponent(JSON.stringify(adminUser))}; path=/; max-age=${60*60*24*30}`;
        
        setUser(adminUser);
        setIsAuthenticated(true);
        
        return { ...adminUser, token: mockToken };
      }
      
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    
    // Xóa cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'userData=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    setUser(null);
    setIsAuthenticated(false);
    router.push('/signin');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth phải được sử dụng trong phạm vi AuthProvider');
  }
  
  return context;
}; 