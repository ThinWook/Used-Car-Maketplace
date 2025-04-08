import { useState } from "react";
import Image from "next/image";
import { Vehicle } from "./AdminVehicleList";

interface VehicleRowProps {
  vehicle: Vehicle;
  onAction: (vehicleId: string, action: string) => void;
  onViewDetails: (vehicle: Vehicle) => void;
}

const StatusBadge = ({ status }: { status: Vehicle["status"] }) => {
  const statusConfig: Record<
    Vehicle["status"],
    { color: string; label: string }
  > = {
    pending: {
      color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
      label: "Chờ duyệt",
    },
    approved: {
      color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
      label: "Đã duyệt",
    },
    rejected: {
      color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500",
      label: "Từ chối",
    },
    sold: {
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500",
      label: "Đã bán",
    },
    hidden: {
      color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      label: "Đã ẩn",
    },
  };

  const { color, label } = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
    >
      {label}
    </span>
  );
};

export default function VehicleRow({
  vehicle,
  onAction,
  onViewDetails,
}: VehicleRowProps) {
  const [actionOpen, setActionOpen] = useState(false);

  // Format giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
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

  return (
    <tr className="bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700/30">
      <td className="w-4 p-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="checkbox-table-1" className="sr-only">
            checkbox
          </label>
        </div>
      </td>
      <th
        scope="row"
        className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white"
      >
        <div className="relative w-10 h-10 overflow-hidden rounded">
          <Image
            width={40}
            height={40}
            src={vehicle.thumbnail || "/images/vehicles/placeholder.jpg"}
            alt={vehicle.title}
            className="object-cover"
          />
        </div>
        <div className="pl-3">
          <div className="text-base font-semibold line-clamp-1">{vehicle.title}</div>
          <div className="font-normal text-gray-500">
            {vehicle.make} {vehicle.model}
          </div>
        </div>
      </th>
      <td className="px-6 py-4 font-medium">
        {formatPrice(vehicle.price)}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="relative w-6 h-6 overflow-hidden rounded-full">
            <Image
              width={24}
              height={24}
              src={vehicle.seller.avatar || "/images/avatars/placeholder.jpg"}
              alt={vehicle.seller.fullName}
              className="object-cover"
            />
          </div>
          <span>{vehicle.seller.fullName}</span>
        </div>
      </td>
      <td className="px-6 py-4">{vehicle.year}</td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <div>{vehicle.body_type}</div>
          <div className="text-xs text-gray-500">
            {getVehicleTypeLabel(vehicle.type)}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={vehicle.status} />
      </td>
      <td className="px-6 py-4 relative">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewDetails(vehicle)}
            type="button"
            className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-500 dark:hover:bg-blue-800/50"
          >
            Xem chi tiết
          </button>
          
          <div className="relative">
            <button
              onClick={() => setActionOpen(!actionOpen)}
              type="button"
              className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Thao tác
            </button>
            
            {actionOpen && (
              <div className="absolute right-0 z-10 mt-2 w-44 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:border dark:border-gray-700">
                <div className="py-1">
                  {vehicle.status === "pending" && (
                    <button
                      onClick={() => {
                        onAction(vehicle.id, "approve");
                        setActionOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Duyệt tin đăng
                    </button>
                  )}
                  
                  {vehicle.status === "pending" && (
                    <button
                      onClick={() => {
                        onAction(vehicle.id, "reject");
                        setActionOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Từ chối
                    </button>
                  )}
                  
                  {vehicle.status !== "hidden" && (
                    <button
                      onClick={() => {
                        onAction(vehicle.id, "hide");
                        setActionOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Ẩn tin đăng
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      onAction(vehicle.id, "delete");
                      setActionOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-500 dark:hover:bg-gray-700"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
} 
 