"use client";

import { useState, useEffect } from "react";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { Button } from "@/components/ui/button/Button";
import { UserRow } from "./UserRow";
import { MagnifyingGlassIcon } from "@/icons";

interface User {
  id: string;
  avatar: string;
  fullName: string;
  email: string;
  phone: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  accountStatus: 'active' | 'locked';
}

interface FilterParams {
  search?: string;
  role?: string;
  kycStatus?: string;
  page?: number;
  limit?: number;
}

const roleOptions = [
  { value: '', label: 'Tất cả vai trò' },
  { value: 'user', label: 'Người dùng' },
  { value: 'seller', label: 'Người bán' },
  { value: 'admin', label: 'Quản trị viên' },
];

const kycStatusOptions = [
  { value: '', label: 'Tất cả KYC' },
  { value: 'pending', label: 'Đang chờ' },
  { value: 'verified', label: 'Đã xác thực' },
  { value: 'rejected', label: 'Từ chối' },
];

export const AdminUserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterParams>({
    page: 1,
    limit: 10,
  });
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(`/api/admin/users?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }
      
      const data = await response.json();
      
      if (filters.page === 1) {
        setUsers(data.users || []);
      } else {
        setUsers(prev => [...prev, ...(data.users || [])]);
      }
      
      setHasMore(data.hasMore || false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Không thể tải danh sách người dùng. Vui lòng thử lại sau.');
      setUsers([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const handleSearch = (value: string) => {
    setFilters(prev => ({
      ...prev,
      search: value,
      page: 1,
    }));
  };

  const handleFilterChange = (key: keyof FilterParams, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handleLoadMore = () => {
    setFilters(prev => ({
      ...prev,
      page: (prev.page || 1) + 1,
    }));
  };

  const handleApproveKyc = async (userId: string) => {
    try {
      await fetch(`/api/admin/users/${userId}/kyc`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'verified' }),
      });
      fetchUsers();
    } catch (error) {
      console.error('Error approving KYC:', error);
    }
  };

  const handleRejectKyc = async (userId: string) => {
    try {
      await fetch(`/api/admin/users/${userId}/kyc`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'rejected' }),
      });
      fetchUsers();
    } catch (error) {
      console.error('Error rejecting KYC:', error);
    }
  };

  const handleLock = async (userId: string) => {
    try {
      await fetch(`/api/admin/users/${userId}/lock`, {
        method: 'PATCH',
      });
      fetchUsers();
    } catch (error) {
      console.error('Error locking user:', error);
    }
  };

  const handleUnlock = async (userId: string) => {
    try {
      await fetch(`/api/admin/users/${userId}/unlock`, {
        method: 'PATCH',
      });
      fetchUsers();
    } catch (error) {
      console.error('Error unlocking user:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Input
                type="text"
                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                value={filters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <Select
              options={roleOptions}
              value={filters.role || ''}
              onChange={(value) => handleFilterChange('role', value)}
              className="w-40"
            />
            <Select
              options={kycStatusOptions}
              value={filters.kycStatus || ''}
              onChange={(value) => handleFilterChange('kycStatus', value)}
              className="w-40"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Người dùng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Số điện thoại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Trạng thái KYC
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Trạng thái tài khoản
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-4 py-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  Không tìm thấy người dùng nào
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onView={() => {/* TODO: Implement view user details */}}
                  onApproveKyc={handleApproveKyc}
                  onRejectKyc={handleRejectKyc}
                  onLock={handleLock}
                  onUnlock={handleUnlock}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {hasMore && !loading && (
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            className="w-full md:w-auto"
          >
            Tải thêm
          </Button>
        </div>
      )}
    </div>
  );
}; 