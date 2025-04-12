"use client";

import { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@/icons";
import VehicleFilter from "./VehicleFilter";
import VehicleRow from "./VehicleRow";
import VehicleDetailDialog from "./VehicleDetailDialog";
import { Fragment } from "react";
import { vehicleApi } from "@/lib/api";

// Mô hình dữ liệu cho xe
export interface Vehicle {
  id: string;
  title: string;
  price: number;
  seller: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  year: number;
  body_type: string;
  type: "car" | "motorcycle" | "bicycle";
  status: "pending" | "approved" | "rejected" | "sold" | "hidden";
  thumbnail: string;
  licensePlate?: string;
  make: string;
  model: string;
  color: string;
  fuel_type?: string;
  mileage?: number;
  description: string;
  images: string[];
  created_at: string;
  updated_at: string;
}

export default function AdminVehicleList() {
  // State cho danh sách xe
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  
  // State cho bộ lọc và tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    seller: "all",
  });
  
  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // State cho xe đang xem chi tiết
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // State cho trạng thái loading
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hàm lấy dữ liệu xe từ API
  const fetchVehicles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await vehicleApi.getVehicles({
        search: searchTerm,
        type: filters.type !== "all" ? filters.type : undefined,
        status: filters.status !== "all" ? filters.status : undefined,
        seller: filters.seller !== "all" ? filters.seller : undefined,
        page: currentPage,
        limit: itemsPerPage
      });
      
      // Biến đổi dữ liệu từ API để phù hợp với kiểu dữ liệu Vehicle
      const transformedVehicles = response.vehicles.map((v: any) => ({
        id: v._id,
        title: v.title,
        price: v.price,
        seller: {
          id: v.user?._id || "",
          fullName: v.user?.full_name || "Không xác định",
          avatar: v.user?.avatar_url
        },
        year: v.year,
        body_type: v.body_type || "",
        type: v.type,
        status: v.status,
        thumbnail: v.images?.[0] || "",
        licensePlate: v.license_plate || "",
        make: v.make,
        model: v.model,
        color: v.color || "",
        fuel_type: v.fuel_type,
        mileage: v.mileage,
        description: v.description,
        images: v.images || [],
        created_at: v.created_at,
        updated_at: v.updated_at
      }));
      
      setVehicles(transformedVehicles);
      setFilteredVehicles(transformedVehicles);
      setTotalItems(response.pagination.total);
      setTotalPages(response.pagination.pages);
    } catch (err) {
      console.error("Failed to fetch vehicles:", err);
      setError("Không thể tải danh sách xe. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Gọi API khi component mount hoặc khi các filter thay đổi
  useEffect(() => {
    fetchVehicles();
  }, [currentPage, searchTerm, filters]);

  // Xử lý lọc và tìm kiếm
  useEffect(() => {
    let results = [...vehicles];
    
    // Lọc theo tìm kiếm
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      results = results.filter(
        (vehicle) => 
          vehicle.title.toLowerCase().includes(search) ||
          (vehicle.licensePlate && vehicle.licensePlate.toLowerCase().includes(search))
      );
    }
    
    // Lọc theo loại xe
    if (filters.type !== "all") {
      results = results.filter((vehicle) => vehicle.type === filters.type);
    }
    
    // Lọc theo trạng thái
    if (filters.status !== "all") {
      results = results.filter((vehicle) => vehicle.status === filters.status);
    }
    
    // Lọc theo người bán
    if (filters.seller !== "all") {
      results = results.filter((vehicle) => vehicle.seller.id === filters.seller);
    }
    
    setFilteredVehicles(results);
    setCurrentPage(1); // Reset về trang đầu tiên khi lọc
  }, [searchTerm, filters, vehicles]);

  // Xử lý các action (approve, reject, hide, delete)
  const handleAction = async (vehicleId: string, action: string) => {
    try {
      let newStatus: 'pending' | 'approved' | 'rejected' | 'sold' | 'hidden';
      
      switch (action) {
        case 'approve':
          newStatus = 'approved';
          break;
        case 'reject':
          newStatus = 'rejected';
          break;
        case 'hide':
          newStatus = 'hidden';
          break;
        case 'delete':
          await vehicleApi.deleteVehicle(vehicleId);
          // Refresh danh sách sau khi xóa
          fetchVehicles();
          return;
        default:
          return;
      }
      
      // Cập nhật trạng thái xe
      await vehicleApi.updateVehicleStatus(vehicleId, newStatus);
      
      // Cập nhật lại danh sách xe
      fetchVehicles();
    } catch (error) {
      console.error(`Lỗi khi thực hiện ${action}:`, error);
      setError(`Không thể thực hiện thao tác. Vui lòng thử lại sau.`);
    }
  };

  // Xem chi tiết xe
  const handleViewDetails = async (vehicleId: string) => {
    try {
      setIsLoading(true);
      const vehicleDetails = await vehicleApi.getVehicleDetails(vehicleId);
      
      // Chuyển đổi dữ liệu
      const vehicle: Vehicle = {
        id: vehicleDetails._id,
        title: vehicleDetails.title,
        price: vehicleDetails.price,
        seller: {
          id: vehicleDetails.user?._id || "",
          fullName: vehicleDetails.user?.full_name || "Không xác định",
          avatar: vehicleDetails.user?.avatar_url
        },
        year: vehicleDetails.year,
        body_type: vehicleDetails.body_type || "",
        type: vehicleDetails.type,
        status: vehicleDetails.status,
        thumbnail: vehicleDetails.images?.[0] || "",
        licensePlate: vehicleDetails.license_plate || "",
        make: vehicleDetails.make,
        model: vehicleDetails.model,
        color: vehicleDetails.color || "",
        fuel_type: vehicleDetails.fuel_type,
        mileage: vehicleDetails.mileage,
        description: vehicleDetails.description,
        images: vehicleDetails.images || [],
        created_at: vehicleDetails.created_at,
        updated_at: vehicleDetails.updated_at
      };
      
      setSelectedVehicle(vehicle);
      setIsDetailOpen(true);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết xe:", error);
      setError("Không thể tải chi tiết xe. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  // Phân trang
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="w-full">
      {/* Phần tìm kiếm và lọc */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row justify-between">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlassIcon />
          </div>
          <input
            type="text"
            className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Tìm kiếm theo tiêu đề hoặc biển số..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <VehicleFilter 
          filters={filters} 
          setFilters={setFilters} 
          vehicles={vehicles}
        />
      </div>

      {/* Bảng danh sách xe */}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-700 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="p-4">
                <div className="flex items-center">
                  <input
                    id="checkbox-all"
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="checkbox-all" className="sr-only">
                    checkbox
                  </label>
                </div>
              </th>
              <th scope="col" className="px-6 py-3">
                Xe
              </th>
              <th scope="col" className="px-6 py-3">
                Giá
              </th>
              <th scope="col" className="px-6 py-3">
                Người bán
              </th>
              <th scope="col" className="px-6 py-3">
                Năm SX
              </th>
              <th scope="col" className="px-6 py-3">
                Loại xe
              </th>
              <th scope="col" className="px-6 py-3">
                Trạng thái
              </th>
              <th scope="col" className="px-6 py-3">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle) => (
                <VehicleRow
                  key={vehicle.id}
                  vehicle={vehicle}
                  onAction={handleAction}
                  onViewDetails={handleViewDetails}
                />
              ))
            ) : (
              <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <td colSpan={8} className="px-6 py-4 text-center">
                  Không tìm thấy tin đăng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      {filteredVehicles.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-700 dark:text-gray-400">
            Hiển thị <span className="font-medium">{currentPage * itemsPerPage - itemsPerPage + 1}</span> đến{" "}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, totalItems)}
            </span>{" "}
            trong <span className="font-medium">{totalItems}</span> kết quả
          </div>
          <nav className="inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-2 text-sm font-medium rounded-l-md ${
                currentPage === 1
                  ? "text-gray-400 bg-gray-100 dark:bg-gray-800"
                  : "text-gray-700 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              } border border-gray-300 dark:border-gray-700`}
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`px-3 py-2 text-sm font-medium ${
                  currentPage === number
                    ? "z-10 text-blue-600 bg-blue-50 border-blue-500 dark:bg-blue-900/30 dark:text-blue-500"
                    : "text-gray-700 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                } border border-gray-300 dark:border-gray-700`}
              >
                {number}
              </button>
            ))}
            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 text-sm font-medium rounded-r-md ${
                currentPage === totalPages
                  ? "text-gray-400 bg-gray-100 dark:bg-gray-800"
                  : "text-gray-700 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              } border border-gray-300 dark:border-gray-700`}
            >
              Sau
            </button>
          </nav>
        </div>
      )}

      {/* Dialog xem chi tiết */}
      {selectedVehicle && (
        <VehicleDetailDialog
          vehicle={selectedVehicle}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
        />
      )}
    </div>
  );
} 