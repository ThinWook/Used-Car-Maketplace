"use client";

import { Badge } from "@/components/ui/badge/Badge";

interface AccountStatusBadgeProps {
  status: 'active' | 'locked';
}

export const AccountStatusBadge = ({ status }: AccountStatusBadgeProps) => {
  const statusConfig = {
    active: {
      label: 'Hoạt động',
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    },
    locked: {
      label: 'Đã khoá',
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