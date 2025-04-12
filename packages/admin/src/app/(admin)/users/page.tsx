"use client";

import AdminUserList from "@/components/users/AdminUserList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/PageContainer";

export default function UsersPage() {
  return (
    <PageContainer>
      <Card>
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle>Quản lý người dùng</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <AdminUserList />
        </CardContent>
      </Card>
    </PageContainer>
  );
} 