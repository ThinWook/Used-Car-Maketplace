"use client";

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { MoreHorizontal, Search, Filter, User as UserIcon, Lock, Unlock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { userApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { getImageUrl } from "@/lib/utils";

interface User {
  _id: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: 'admin' | 'user' | 'moderator';
  is_locked: boolean;
  kyc_status: 'verified' | 'pending' | 'rejected';
  avatar_url?: string;
  created_at: string;
}

interface FilterParams {
  search: string;
  role: string;
  is_locked: string;
  kyc_status: string;
  page: number;
  limit: number;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

const AdminUserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasMore: false
  });
  
  const [filters, setFilters] = useState<FilterParams>({
    search: '',
    role: 'all',
    is_locked: 'all',
    kyc_status: 'all',
    page: 1,
    limit: 10
  });
  
  // Tạo giá trị search được debounce
  const debouncedSearch = useDebounce(filters.search, 500);
  
  const router = useRouter();
  
  // Lấy danh sách người dùng từ API
  const fetchUsers = useCallback(async (params: FilterParams, isNewSearch = false) => {
    try {
      setLoading(true);
      
      // Tạo đối tượng chứa các tham số API thực tế
      const apiParams: any = {
        search: params.search,
        page: params.page,
        limit: params.limit,
        exclude_admin: params.role !== 'admin' // Ẩn admin nếu không filter theo admin
      };
      
      // Xử lý tham số role
      if (params.role !== 'all') {
        apiParams.role = params.role;
      }
      
      // Xử lý tham số is_locked (chuyển đổi từ string sang boolean)
      if (params.is_locked !== 'all') {
        apiParams.is_locked = params.is_locked === 'locked';
      }
      
      // Xử lý tham số kyc_status
      if (params.kyc_status !== 'all') {
        apiParams.kyc_status = params.kyc_status;
      }
      
      const result = await userApi.getUsers(apiParams);
      
      // Nếu là tìm kiếm mới, thay thế danh sách hiện tại
      // Ngược lại, thêm vào cuối danh sách
      if (isNewSearch) {
        setUsers(result.users);
      } else {
        setUsers(prev => [...prev, ...result.users]);
      }
      
      // Cập nhật thông tin phân trang
      setPagination(result.pagination);
      
    } catch (err) {
      setError('Không thể tải danh sách người dùng. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Xử lý khi filters thay đổi
  useEffect(() => {
    setFilters(prev => ({ ...prev, page: 1 }));
    fetchUsers({ ...filters, page: 1 }, true);
  }, [debouncedSearch, filters.role, filters.is_locked, filters.kyc_status, fetchUsers]);
  
  // Xử lý khi nhập từ khoá tìm kiếm
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };
  
  // Xử lý khi thay đổi lọc
  const handleFilterChange = (type: keyof FilterParams, value: string) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };
  
  // Tải thêm người dùng
  const loadMore = () => {
    if (!loading && pagination.hasMore) {
      const newPage = filters.page + 1;
      setFilters(prev => ({ ...prev, page: newPage }));
      fetchUsers({ ...filters, page: newPage });
    }
  };
  
  // Xử lý duyệt/từ chối KYC
  const handleKycAction = async (userId: string, approve: boolean) => {
    try {
      const newStatus = approve ? 'verified' : 'rejected';
      await userApi.updateKycStatus(userId, newStatus);
      
      // Cập nhật state sau khi API thành công
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId 
            ? { ...user, kyc_status: newStatus } 
            : user
        )
      );
      
      toast.success(`Đã ${approve ? 'duyệt' : 'từ chối'} KYC cho người dùng`);
    } catch (error) {
      console.error('Error updating KYC status:', error);
      toast.error('Không thể cập nhật trạng thái KYC');
    }
  };
  
  // Xử lý khoá/mở khoá người dùng
  const handleLockAction = async (userId: string, lock: boolean) => {
    try {
      await userApi.toggleUserLock(userId, lock);
      
      // Cập nhật state sau khi API thành công
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId 
            ? { ...user, is_locked: lock } 
            : user
        )
      );
      
      toast.success(`Đã ${lock ? 'khóa' : 'mở khóa'} tài khoản người dùng`);
    } catch (error) {
      console.error('Error toggling user lock status:', error);
      toast.error('Không thể thay đổi trạng thái khóa của tài khoản');
    }
  };
  
  // Xem chi tiết người dùng
  const handleViewUser = (userId: string) => {
    // Chuyển hướng đến trang chi tiết người dùng
    router.push(`/users/${userId}`);
  };
  
  // Hiển thị skeleton khi đang tải
  const renderSkeleton = () => (
    Array(5).fill(null).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        <TableCell><Skeleton className="h-4 w-4 rounded-full" /></TableCell>
        <TableCell>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-[140px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
        </TableCell>
        <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
        <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
        <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
        <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
      </TableRow>
    ))
  );

  // Hiển thị trạng thái KYC
  const renderKycStatus = (status: User['kyc_status']) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Đã xác thực</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Đã từ chối</Badge>;
      default:
        return null;
    }
  };

  // Hiển thị trạng thái tài khoản
  const renderUserStatus = (is_locked: boolean) => {
    return is_locked 
      ? <Badge className="bg-gray-100 text-gray-800">Đã khóa</Badge>
      : <Badge className="bg-green-100 text-green-800">Đang hoạt động</Badge>;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Quản lý người dùng</h2>
        <Button>
          <UserIcon className="mr-2 h-4 w-4" />
          Thêm người dùng
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            className="pl-10"
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filters.role} onValueChange={(value) => handleFilterChange('role', value)}>
            <SelectTrigger className="w-[160px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value="user">Người dùng</SelectItem>
              <SelectItem value="moderator">Kiểm duyệt viên</SelectItem>
              <SelectItem value="admin">Quản trị viên</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filters.is_locked} onValueChange={(value) => handleFilterChange('is_locked', value)}>
            <SelectTrigger className="w-[160px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="locked">Đã khóa</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filters.kyc_status} onValueChange={(value) => handleFilterChange('kyc_status', value)}>
            <SelectTrigger className="w-[160px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Trạng thái KYC" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả KYC</SelectItem>
              <SelectItem value="verified">Đã xác thực</SelectItem>
              <SelectItem value="pending">Chờ duyệt</SelectItem>
              <SelectItem value="rejected">Đã từ chối</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-md mb-4 text-red-800">{error}</div>
      )}
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">#</TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>KYC</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead aria-label="Actions" className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && users.length === 0 ? renderSkeleton() : (
              users.map((user, index) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{(pagination.page - 1) * pagination.limit + index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                        {user.avatar_url ? (
                          <img 
                            src={getImageUrl(user.avatar_url, 'avatar')} 
                            alt={user.full_name} 
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              // Khi ảnh lỗi, ẩn ảnh và hiển thị icon mặc định
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement?.classList.add('show-fallback');
                            }}
                          />
                        ) : (
                          <UserIcon className="h-5 w-5 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-muted-foreground">{user.phone_number}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {user.role === 'admin' ? 'Quản trị viên' : 
                       user.role === 'moderator' ? 'Kiểm duyệt viên' : 'Người dùng'}
                    </Badge>
                  </TableCell>
                  <TableCell>{renderUserStatus(user.is_locked)}</TableCell>
                  <TableCell>{renderKycStatus(user.kyc_status)}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Mở menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewUser(user._id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Xem chi tiết</span>
                        </DropdownMenuItem>
                        
                        {user.kyc_status === 'pending' && (
                          <>
                            <DropdownMenuItem onClick={() => handleKycAction(user._id, true)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              <span>Duyệt KYC</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleKycAction(user._id, false)}>
                              <XCircle className="mr-2 h-4 w-4" />
                              <span>Từ chối KYC</span>
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        {!user.is_locked ? (
                          <DropdownMenuItem onClick={() => handleLockAction(user._id, true)}>
                            <Lock className="mr-2 h-4 w-4" />
                            <span>Khóa tài khoản</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleLockAction(user._id, false)}>
                            <Unlock className="mr-2 h-4 w-4" />
                            <span>Mở khóa tài khoản</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
            
            {users.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Không tìm thấy người dùng nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {pagination.hasMore && (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? 'Đang tải...' : 'Tải thêm'}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default AdminUserList; 