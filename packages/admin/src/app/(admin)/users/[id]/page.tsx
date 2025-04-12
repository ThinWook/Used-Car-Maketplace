'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserIcon, ArrowLeft, CalendarIcon, PhoneIcon, MailIcon, HomeIcon, ShieldCheckIcon, 
         ShieldXIcon, LockIcon, UnlockIcon, CarIcon, ClipboardListIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { userApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import Link from 'next/link';
import { getImageUrl } from '@/lib/utils';

interface User {
  _id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  address?: {
    country?: string;
    city?: string;
  };
  role: 'user' | 'moderator' | 'admin';
  kyc_status: 'pending' | 'verified' | 'rejected';
  is_locked: boolean;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  vehicles_count?: number;
  saved_vehicles_count?: number;
}

interface Vehicle {
  _id: string;
  title: string;
  price: number;
  year: number;
  make: string;
  model: string;
  status: 'active' | 'sold' | 'pending' | 'rejected';
  thumbnail_url?: string;
  created_at: string;
}

export default function UserDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [error, setError] = useState('');

  // Lấy thông tin người dùng
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const response = await userApi.getUserDetails(id as string);
        setUser(response.user);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể lấy thông tin người dùng');
        toast.error('Không thể lấy thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserDetails();
    }
  }, [id]);

  // Lấy danh sách phương tiện của người dùng
  useEffect(() => {
    const fetchUserVehicles = async () => {
      try {
        setVehiclesLoading(true);
        const response = await userApi.getUserVehicles(id as string);
        setUserVehicles(response.vehicles || []);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách phương tiện:', err);
      } finally {
        setVehiclesLoading(false);
      }
    };

    if (id && !loading && user) {
      fetchUserVehicles();
    }
  }, [id, loading, user]);

  // Xử lý khoá/mở khoá tài khoản
  const handleToggleLock = async () => {
    if (!user) return;
    
    try {
      const response = await userApi.toggleUserLock(user._id, !user.is_locked);
      
      setUser(prev => prev ? { ...prev, is_locked: !prev.is_locked } : null);
      toast.success(`Đã ${!user.is_locked ? 'khóa' : 'mở khóa'} tài khoản người dùng`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể thay đổi trạng thái khóa');
    }
  };

  // Xử lý cập nhật trạng thái KYC
  const handleUpdateKyc = async (status: 'verified' | 'rejected') => {
    if (!user) return;
    
    try {
      const response = await userApi.updateKycStatus(user._id, status);
      
      setUser(prev => prev ? { ...prev, kyc_status: status } : null);
      toast.success(`Đã cập nhật trạng thái KYC thành ${status === 'verified' ? 'đã xác thực' : 'đã từ chối'}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể cập nhật trạng thái KYC');
    }
  };

  // Render skeleton khi đang tải
  if (loading) {
    return (
      <div className="container p-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-[200px]" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-[150px]" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <Skeleton className="h-32 w-32 rounded-full" />
                </div>
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-[150px]" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Render lỗi
  if (error || !user) {
    return (
      <div className="container p-6 max-w-5xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <ShieldXIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Không thể tải thông tin người dùng</h2>
              <p className="text-muted-foreground mb-4">{error || 'Người dùng không tồn tại hoặc bạn không có quyền truy cập'}</p>
              <Button asChild>
                <Link href="/users">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại danh sách người dùng
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/users">
            <ArrowLeft className="h-6 w-6" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Chi tiết người dùng</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Thông tin cơ bản */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage 
                    src={getImageUrl(user.avatar_url, 'avatar')} 
                    alt={user.full_name}
                    onError={(e) => {
                      // Ẩn ảnh lỗi và hiển thị fallback
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <AvatarFallback>
                    <UserIcon className="h-16 w-16 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">{user.full_name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={user.is_locked ? "secondary" : "outline"}>
                    {user.is_locked ? (
                      <LockIcon className="h-3 w-3 mr-1" />
                    ) : (
                      <UnlockIcon className="h-3 w-3 mr-1" />
                    )}
                    {user.is_locked ? 'Đã khóa' : 'Đang hoạt động'}
                  </Badge>
                  <Badge 
                    className={
                      user.kyc_status === 'verified' ? 'bg-green-100 text-green-800' :
                      user.kyc_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }
                  >
                    {user.kyc_status === 'verified' && <ShieldCheckIcon className="h-3 w-3 mr-1" />}
                    {user.kyc_status === 'rejected' && <ShieldXIcon className="h-3 w-3 mr-1" />}
                    {user.kyc_status === 'verified' ? 'Đã xác thực' : 
                     user.kyc_status === 'pending' ? 'Chờ xác thực' : 'Đã từ chối'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-start gap-2">
                  <MailIcon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>{user.email}</p>
                  </div>
                </div>

                {user.phone_number && (
                  <div className="flex items-start gap-2">
                    <PhoneIcon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Số điện thoại</p>
                      <p>{user.phone_number}</p>
                    </div>
                  </div>
                )}

                {user.address && (user.address.country || user.address.city) && (
                  <div className="flex items-start gap-2">
                    <HomeIcon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Địa chỉ</p>
                      <p>{[user.address.city, user.address.country].filter(Boolean).join(', ')}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <CalendarIcon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ngày tham gia</p>
                    <p>{new Date(user.created_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-2">
                {user.is_locked ? (
                  <Button onClick={handleToggleLock} variant="outline" className="w-full">
                    <UnlockIcon className="mr-2 h-4 w-4" />
                    Mở khóa tài khoản
                  </Button>
                ) : (
                  <Button onClick={handleToggleLock} variant="outline" className="w-full">
                    <LockIcon className="mr-2 h-4 w-4" />
                    Khóa tài khoản
                  </Button>
                )}

                {user.kyc_status === 'pending' && (
                  <>
                    <Button onClick={() => handleUpdateKyc('verified')} variant="default" className="w-full">
                      <ShieldCheckIcon className="mr-2 h-4 w-4" />
                      Xác thực KYC
                    </Button>
                    <Button onClick={() => handleUpdateKyc('rejected')} variant="outline" className="w-full">
                      <ShieldXIcon className="mr-2 h-4 w-4" />
                      Từ chối KYC
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs thông tin chi tiết */}
        <div className="md:col-span-2">
          <Tabs defaultValue="vehicles">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="vehicles">
                <CarIcon className="h-4 w-4 mr-2" />
                Phương tiện
              </TabsTrigger>
              <TabsTrigger value="activity">
                <ClipboardListIcon className="h-4 w-4 mr-2" />
                Hoạt động
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="vehicles" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Phương tiện của người dùng</CardTitle>
                </CardHeader>
                <CardContent>
                  {vehiclesLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                          <Skeleton className="h-14 w-14 rounded-md" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-[200px]" />
                            <Skeleton className="h-4 w-[150px]" />
                          </div>
                          <Skeleton className="h-8 w-[80px]" />
                        </div>
                      ))}
                    </div>
                  ) : userVehicles.length > 0 ? (
                    <div className="space-y-4">
                      {userVehicles.map(vehicle => (
                        <div key={vehicle._id} className="flex items-center gap-4 p-3 border rounded-lg">
                          <div className="h-14 w-14 bg-slate-100 rounded-md flex items-center justify-center">
                            {vehicle.thumbnail_url ? (
                              <img 
                                src={getImageUrl(vehicle.thumbnail_url, 'vehicle')} 
                                alt={vehicle.title} 
                                className="h-14 w-14 object-cover rounded-md"
                                onError={(e) => {
                                  // Ẩn ảnh lỗi và hiển thị icon mặc định
                                  e.currentTarget.style.display = 'none';
                                  // Hiển thị icon mặc định
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    const iconEl = document.createElement('div');
                                    iconEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6 text-slate-400"><path d="M7 11V7a5 5 0 0 1 10 0v4"/><path d="M12 11V3"/><path d="m19 8-1.2 1.2"/><path d="m14.9 6.5-.5-2.9"/><path d="m8.5 6.5 .5-2.9"/><path d="m5 8 1.2 1.2"/><path d="M3 17h18v4H3z"/></svg>';
                                    iconEl.className = 'flex items-center justify-center h-full w-full';
                                    parent.appendChild(iconEl);
                                  }
                                }}
                              />
                            ) : (
                              <CarIcon className="h-6 w-6 text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{vehicle.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {vehicle.make} {vehicle.model}, {vehicle.year} · 
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(vehicle.price)}
                            </p>
                          </div>
                          <Badge 
                            className={
                              vehicle.status === 'active' ? 'bg-green-100 text-green-800' :
                              vehicle.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              vehicle.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }
                          >
                            {vehicle.status === 'active' ? 'Đang bán' :
                             vehicle.status === 'pending' ? 'Chờ duyệt' :
                             vehicle.status === 'sold' ? 'Đã bán' : 'Từ chối'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CarIcon className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Người dùng này chưa đăng bán phương tiện nào</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Lịch sử hoạt động</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <ClipboardListIcon className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Tính năng đang được phát triển</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 