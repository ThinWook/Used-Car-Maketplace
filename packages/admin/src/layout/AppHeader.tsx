"use client";

import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";
import { ChevronLeftIcon, MenuIcon } from "@/icons";
import { useSidebar } from "@/context/SidebarContext";

const AppHeader = () => {
  const { isExpanded, toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <span className="sr-only">Open sidebar</span>
            {isExpanded ? <ChevronLeftIcon /> : <MenuIcon />}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggleButton />
          <NotificationDropdown />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
