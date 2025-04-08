"use client";

import { Badge } from "@/components/ui/badge/Badge";

interface KycStatusBadgeProps {
  status: 'pending' | 'verified' | 'rejected';
}

export const KycStatusBadge = ({ status }: KycStatusBadgeProps) => {
  const statusConfig = {
    pending: {
      label: 'Đang chờ',
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    },
    verified: {
      label: 'Đã xác thực',
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    },
    rejected: {
      label: 'Từ chối',
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    },
  };

  const config = statusConfig[status];

  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
}; 