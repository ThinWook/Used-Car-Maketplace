import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Chuyển đổi URL hình ảnh tương đối thành URL đầy đủ
 * @param imageUrl URL hình ảnh cần xử lý
 * @param type Loại hình ảnh (avatar hoặc vehicle)
 * @returns URL hình ảnh đã xử lý
 */
export function getImageUrl(imageUrl?: string, type: 'avatar' | 'vehicle' = 'avatar'): string {
  if (!imageUrl) {
    // Sử dụng UI Avatars cho avatar mặc định nếu không có ảnh
    return type === 'avatar'
      ? 'https://ui-avatars.com/api/?background=random&name=User&size=200'
      : '/images/default-vehicle.png';
  }
  
  // Nếu đã là URL đầy đủ thì giữ nguyên
  if (imageUrl.startsWith('http')) return imageUrl;
  
  // Nếu là đường dẫn tương đối, thêm base URL
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  return `${apiBaseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
} 