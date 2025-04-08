"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button/Button";
import { KycStatusBadge } from "./KycStatusBadge";
import { AccountStatusBadge } from "./AccountStatusBadge";
import { EyeIcon, CheckIcon, XMarkIcon, LockClosedIcon, LockOpenIcon } from "@/icons";

interface User {
  id: string;
  avatar: string;
  fullName: string;
  email: string;
  phone: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  accountStatus: 'active' | 'locked';
}

interface UserRowProps {
  user: User;
  onView: (id: string) => void;
  onApproveKyc: (id: string) => void;
  onRejectKyc: (id: string) => void;
  onLock: (id: string) => void;
  onUnlock: (id: string) => void;
}

export const UserRow = ({
  user,
  onView,
  onApproveKyc,
  onRejectKyc,
  onLock,
  onUnlock,
}: UserRowProps) => {
  return (
    <tr className="border-b border-gray-200 dark:border-gray-700">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="relative w-10 h-10 rounded-full overflow-hidden">
            <Image
              src={user.avatar}
              alt={user.fullName}
              fill
              className="object-cover"
            />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {user.fullName}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 dark:text-white">{user.phone}</div>
      </td>
      <td className="px-6 py-4">
        <KycStatusBadge status={user.kycStatus} />
      </td>
      <td className="px-6 py-4">
        <AccountStatusBadge status={user.accountStatus} />
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(user.id)}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <EyeIcon className="w-5 h-5" />
          </Button>
          
          {user.kycStatus === 'pending' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onApproveKyc(user.id)}
                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
              >
                <CheckIcon className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRejectKyc(user.id)}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
              >
                <XMarkIcon className="w-5 h-5" />
              </Button>
            </>
          )}
          
          {user.accountStatus === 'active' ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLock(user.id)}
              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
            >
              <LockClosedIcon className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUnlock(user.id)}
              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
            >
              <LockOpenIcon className="w-5 h-5" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}; 