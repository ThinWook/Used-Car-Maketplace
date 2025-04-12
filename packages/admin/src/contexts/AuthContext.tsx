'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  full_name: string;
  email: string;
  role: 'admin';
  avatar_url?: string;
  exp?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  refreshToken: () => Promise<string | null>;
  checkSession: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenRefreshInterval, setTokenRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [sessionCheckInterval, setSessionCheckInterval] = useState<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const checkSession = (): boolean => {
    try {
      const userData = localStorage.getItem('userData');
      if (!userData) return false;
      
      const userObj = JSON.parse(userData);
      if (!userObj.exp) return true;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return currentTime < userObj.exp;
    } catch (error) {
      console.error('Lỗi kiểm tra phiên:', error);
      return false;
    }
  };
  
  const checkAndLogoutIfExpired = () => {
    if (!checkSession()) {
      console.log('Phiên làm việc đã hết hạn. Đang đăng xuất...');
      logout();
      return false;
    }
    return true;
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          router.push('/signin');
          return;
        }

        if (!checkSession()) {
          console.log('Phiên đăng nhập đã hết hạn khi tải trang');
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          localStorage.removeItem('refreshToken');
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'userData=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          setIsLoading(false);
          router.push('/signin');
          return;
        }

        const userDataStr = localStorage.getItem('userData');
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          
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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_URL}/users/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }
      
      if (!data || !data.token) {
        throw new Error('Phản hồi không hợp lệ từ máy chủ');
      }
      
      const tokenExpiry = Math.floor(Date.now() / 1000) + 8 * 60 * 60;
      const userData = { ...data, exp: tokenExpiry };
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_refresh_token', data.refreshToken);
      localStorage.setItem('admin_user', JSON.stringify({
        _id: data._id,
        full_name: data.full_name,
        email: data.email,
        role: data.role
      }));
      
      document.cookie = `token=${data.token}; path=/; max-age=${60*60*8}`;
      document.cookie = `userData=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=${60*60*8}`;
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return userData;
    } catch (error: any) {
      console.error('Login error:', error);
      
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user');
    
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'userData=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    if (tokenRefreshInterval) {
      clearInterval(tokenRefreshInterval);
    }
    
    if (sessionCheckInterval) {
      clearInterval(sessionCheckInterval);
    }
    
    setUser(null);
    setIsAuthenticated(false);
    router.push('/signin');
  };

  const refreshToken = async (): Promise<string | null> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('Không tìm thấy refresh token');
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_URL}/users/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Không thể làm mới token');
      }

      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        const tokenExpiry = Math.floor(Date.now() / 1000) + 8 * 60 * 60;
        const updatedUserData = { ...userData, exp: tokenExpiry };
        
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
        document.cookie = `userData=${encodeURIComponent(JSON.stringify(updatedUserData))}; path=/; max-age=${60*60*8}`;
        setUser(updatedUserData);
      }

      localStorage.setItem('token', data.token);
      document.cookie = `token=${data.token}; path=/; max-age=${60*60*8}`;
      
      return data.token;
    } catch (error) {
      console.error('Lỗi làm mới token:', error);
      logout();
      return null;
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        refreshToken();
      }, 7 * 60 * 60 * 1000);
      
      const sessionInterval = setInterval(() => {
        checkAndLogoutIfExpired();
      }, 60 * 1000);
      
      setTokenRefreshInterval(interval);
      setSessionCheckInterval(sessionInterval);
      
      return () => {
        clearInterval(interval);
        clearInterval(sessionInterval);
        setTokenRefreshInterval(null);
        setSessionCheckInterval(null);
      };
    }
  }, [isAuthenticated, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshToken,
        checkSession
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