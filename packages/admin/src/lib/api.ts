import axios, { AxiosError } from 'axios';

// URL cơ sở của API backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Tạo axios instance với cấu hình mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Timeout 30 giây
});

// Interceptors để xử lý authentication token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`Gọi API: ${config.method?.toUpperCase()} ${config.url}`, config.params || config.data);
    return config;
  },
  (error) => {
    console.error('Lỗi request:', error.message);
    return Promise.reject(error);
  }
);

// Interceptors để xử lý token hết hạn
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    if (!error.response) {
      console.error('Lỗi kết nối tới server:', error.message);
      return Promise.reject(new Error('Không thể kết nối tới server. Vui lòng kiểm tra lại kết nối mạng.'));
    }
    
    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }
    
    // Nếu lỗi là 401 và chưa thử refresh token
    if (error.response?.status === 401 && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true;
      
      try {
        // Refresh token
        const refreshToken = localStorage.getItem('admin_refresh_token');
        if (!refreshToken) {
          // Nếu không có refresh token, chuyển tới trang login thay vì đăng xuất trực tiếp
          window.location.href = '/login';
          return Promise.reject(new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.'));
        }
        
        const response = await axios.post(`${API_BASE_URL}/users/refresh-token`, {
          refreshToken
        });
        
        const { token } = response.data;
        localStorage.setItem('admin_token', token);
        
        // Cập nhật token trong header và thử lại request
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axios(originalRequest);
      } catch (err) {
        // Nếu refresh token thất bại, chuyển tới trang login
        window.location.href = '/login';
        return Promise.reject(new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.'));
      }
    }
    
    // Xử lý các lỗi HTTP khác
    const errorData = error.response?.data;
    const errorMessage = typeof errorData === 'object' && errorData !== null 
                         ? ((errorData as any).message || 'Đã xảy ra lỗi không xác định') 
                         : 'Đã xảy ra lỗi không xác định';
    console.error(`Lỗi API (${error.response?.status}):`, errorMessage);
    return Promise.reject(error);
  }
);

// Hàm đăng xuất
const logout = () => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_refresh_token');
  localStorage.removeItem('admin_user');
  
  // Chuyển hướng đến trang đăng nhập
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

// API endpoints cho quản lý người dùng
export const userApi = {
  // Đăng nhập admin
  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/users/admin-login', { email, password });
      const data = response.data;
      
      // Lưu token ngay sau khi đăng nhập thành công
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_refresh_token', data.refreshToken);
      localStorage.setItem('admin_user', JSON.stringify({
        _id: data._id,
        full_name: data.full_name,
        email: data.email,
        role: data.role
      }));
      
      return data;
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      throw error;
    }
  },
  
  // Lấy chi tiết người dùng theo ID
  getUserDetails: async (userId: string) => {
    try {
      const response = await apiClient.get(`/users/admin/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin chi tiết người dùng:', error);
      throw error;
    }
  },
  
  // Lấy danh sách phương tiện của người dùng
  getUserVehicles: async (userId: string) => {
    try {
      const response = await apiClient.get(`/vehicles/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phương tiện của người dùng:', error);
      throw error;
    }
  },
  
  // Lấy danh sách người dùng
  getUsers: async (params: {
    search?: string;
    role?: string;
    is_locked?: boolean;
    kyc_status?: string;
    page?: number;
    limit?: number;
    exclude_admin?: boolean;
  }) => {
    try {
      // Tạo đối tượng tham số tương thích với backend
      const apiParams: Record<string, any> = {
        search: params.search || '',
        page: params.page || 1,
        limit: params.limit || 10,
        exclude_admin: params.exclude_admin !== undefined ? params.exclude_admin : true
      };
      
      // Xử lý tham số role
      if (params.role && params.role !== 'all') {
        apiParams.role = params.role;
      }
      
      // Xử lý tham số is_locked
      if (params.is_locked !== undefined) {
        apiParams.is_locked = params.is_locked;
      }
      
      // Xử lý tham số kyc_status
      if (params.kyc_status && params.kyc_status !== 'all') {
        apiParams.kyc_status = params.kyc_status;
      }
      
      const response = await apiClient.get('/users', { params: apiParams });
      return response.data;
    } catch (error) {
      console.error('Lỗi lấy danh sách người dùng:', error);
      throw error;
    }
  },
  
  // Khóa/mở khóa tài khoản người dùng
  toggleUserLock: async (userId: string, isLocked: boolean) => {
    try {
      const response = await apiClient.post('/users/toggle-lock', {
        userId,
        isLocked
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái khóa người dùng:', error);
      throw error;
    }
  },
  
  // Cập nhật trạng thái KYC
  updateKycStatus: async (userId: string, kyc_status: 'pending' | 'verified' | 'rejected') => {
    try {
      const response = await apiClient.post('/users/update-kyc-status', {
        userId,
        kycStatus: kyc_status  // Đổi từ kyc_status thành kycStatus để phù hợp với API backend
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái KYC:', error);
      throw error;
    }
  }
};

// API endpoints cho quản lý phương tiện
export const vehicleApi = {
  // Lấy danh sách phương tiện cho admin
  getVehicles: async (params: {
    search?: string;
    type?: string;
    status?: string;
    seller?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      // Tạo đối tượng tham số tương thích với backend
      const apiParams: Record<string, any> = {
        page: params.page || 1,
        limit: params.limit || 10
      };
      
      // Xử lý tham số tìm kiếm
      if (params.search) {
        apiParams.search = params.search;
      }
      
      // Xử lý tham số loại xe
      if (params.type && params.type !== 'all') {
        apiParams.type = params.type;
      }
      
      // Xử lý tham số trạng thái
      if (params.status && params.status !== 'all') {
        apiParams.status = params.status;
      }
      
      // Xử lý tham số người bán
      if (params.seller && params.seller !== 'all') {
        apiParams.seller = params.seller;
      }
      
      const response = await apiClient.get('/vehicles/admin', { params: apiParams });
      return response.data;
    } catch (error) {
      console.error('Lỗi lấy danh sách phương tiện:', error);
      throw error;
    }
  },
  
  // Cập nhật trạng thái phương tiện
  updateVehicleStatus: async (vehicleId: string, status: 'pending' | 'approved' | 'rejected' | 'sold' | 'hidden') => {
    try {
      const response = await apiClient.put(`/vehicles/admin/${vehicleId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái phương tiện:', error);
      throw error;
    }
  },
  
  // Lấy chi tiết phương tiện
  getVehicleDetails: async (vehicleId: string) => {
    try {
      const response = await apiClient.get(`/vehicles/${vehicleId}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết phương tiện:', error);
      throw error;
    }
  },
  
  // Xóa phương tiện
  deleteVehicle: async (vehicleId: string) => {
    try {
      const response = await apiClient.delete(`/vehicles/${vehicleId}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi xóa phương tiện:', error);
      throw error;
    }
  }
};
export default apiClient; 