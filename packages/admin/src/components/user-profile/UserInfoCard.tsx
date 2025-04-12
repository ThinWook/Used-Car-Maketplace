"use client";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function UserInfoCard() {
  const { user } = useAuth();
  
  // Phân tách tên đầy đủ thành tên và họ
  const getFirstAndLastName = () => {
    if (!user || !user.full_name) return { firstName: '', lastName: '' };
    
    const nameParts = user.full_name.split(' ');
    // Nếu chỉ có một phần, đặt nó làm first name
    if (nameParts.length === 1) return { firstName: nameParts[0], lastName: '' };
    
    // Lấy phần tử cuối cùng làm last name, phần còn lại làm first name
    const lastName = nameParts.pop() || '';
    const firstName = nameParts.join(' ');
    
    return { firstName, lastName };
  };
  
  const { firstName, lastName } = getFirstAndLastName();
  
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                First Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {firstName || "N/A"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Last Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {lastName || "N/A"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.email || "N/A"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Role
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.role === 'admin' ? 'Quản trị viên' : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
