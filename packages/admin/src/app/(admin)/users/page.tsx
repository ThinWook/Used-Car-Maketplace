import { AdminUserList } from "@/components/users/AdminUserList";

export default function UsersPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Quản lý người dùng
        </h1>
      </div>
      
      <AdminUserList />
    </div>
  );
} 