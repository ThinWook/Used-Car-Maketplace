import { useState, useEffect } from 'react';

/**
 * Hook để debounce một giá trị, thường được sử dụng để
 * tránh gọi API quá nhiều khi người dùng đang nhập vào ô tìm kiếm
 * 
 * @param value Giá trị cần debounce
 * @param delay Thời gian trễ tính bằng milliseconds
 * @returns Giá trị đã được debounce
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Đặt timeout để cập nhật giá trị debounced sau khoảng thời gian delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: hủy timeout nếu giá trị thay đổi hoặc component unmount
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
} 