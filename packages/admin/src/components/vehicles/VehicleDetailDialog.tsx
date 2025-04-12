import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import Image from "next/image";
import { Vehicle } from "./AdminVehicleList";

interface VehicleDetailDialogProps {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
}

export default function VehicleDetailDialog({
  vehicle,
  isOpen,
  onClose,
}: VehicleDetailDialogProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Format giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Format ngày tháng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Hiển thị loại xe
  const getVehicleTypeLabel = (type: Vehicle["type"]) => {
    const typeLabels: Record<Vehicle["type"], string> = {
      car: "Ô tô",
      motorcycle: "Xe máy",
      bicycle: "Xe đạp",
    };
    return typeLabels[type];
  };

  // Hiển thị trạng thái
  const getStatusLabel = (status: Vehicle["status"]) => {
    const statusLabels: Record<Vehicle["status"], string> = {
      pending: "Chờ duyệt",
      approved: "Đã duyệt",
      rejected: "Từ chối",
      sold: "Đã bán",
      hidden: "Đã ẩn",
    };
    return statusLabels[status];
  };

  // Danh sách hình ảnh (thumbnail + các ảnh khác)
  const allImages = [vehicle.thumbnail, ...vehicle.images];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 dark:bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    Chi tiết tin đăng
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Đóng</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phần hình ảnh */}
                  <div>
                    <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-2">
                      <Image
                        src={allImages[activeImageIndex] || "/images/vehicles/placeholder.jpg"}
                        alt={vehicle.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    {/* Thumbnail ảnh */}
                    {allImages.length > 1 && (
                      <div className="flex space-x-2 overflow-x-auto pb-2">
                        {allImages.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setActiveImageIndex(index)}
                            className={`relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 ${
                              activeImageIndex === index
                                ? "ring-2 ring-blue-500"
                                : "opacity-70"
                            }`}
                          >
                            <Image
                              src={image || "/images/vehicles/placeholder.jpg"}
                              alt={`Hình ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Phần thông tin */}
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {vehicle.title}
                      </h2>
                      <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-500">
                        {formatPrice(vehicle.price)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="relative w-8 h-8 overflow-hidden rounded-full">
                        <Image
                          width={32}
                          height={32}
                          src={vehicle.seller.avatar || "/images/avatars/placeholder.jpg"}
                          alt={vehicle.seller.fullName}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {vehicle.seller.fullName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Tạo lúc: {formatDate(vehicle.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Loại xe
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {getVehicleTypeLabel(vehicle.type)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Kiểu dáng
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {vehicle.body_type}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Hãng xe
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {vehicle.make}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Mẫu xe
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {vehicle.model}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Năm sản xuất
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {vehicle.year}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Màu sắc
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {vehicle.color}
                        </p>
                      </div>
                      {vehicle.licensePlate && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Biển số
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {vehicle.licensePlate}
                          </p>
                        </div>
                      )}
                      {vehicle.fuel_type && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Nhiên liệu
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {vehicle.fuel_type}
                          </p>
                        </div>
                      )}
                      {vehicle.mileage !== undefined && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Số km đã đi
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {vehicle.mileage.toLocaleString()} km
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Trạng thái
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {getStatusLabel(vehicle.status)}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Mô tả
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {vehicle.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:bg-blue-900/30 dark:text-blue-500 dark:hover:bg-blue-800/40"
                    onClick={onClose}
                  >
                    Đóng
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 