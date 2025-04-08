import { Menu, Transition } from '@headlessui/react';
import { BellIcon } from '@/icons';
import { Fragment } from 'react';

const notifications = [
  {
    id: 1,
    title: 'Thông báo mới',
    message: 'Bạn có một tin nhắn mới',
    time: '2 phút trước',
    read: false,
  },
  {
    id: 2,
    title: 'Cập nhật hệ thống',
    message: 'Hệ thống đã được cập nhật phiên bản mới',
    time: '1 giờ trước',
    read: true,
  },
];

export const NotificationDropdown = () => {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
        <BellIcon />
        {notifications.some((n) => !n.read) && (
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Thông báo
            </h3>
            <div className="mt-2 space-y-2">
              {notifications.map((notification) => (
                <Menu.Item key={notification.id}>
                  {({ active }) => (
                    <div
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } p-3 rounded-lg ${
                        !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </Menu.Item>
              ))}
            </div>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}; 