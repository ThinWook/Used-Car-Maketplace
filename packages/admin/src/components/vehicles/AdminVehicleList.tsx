"use client";

import { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { SearchIcon, MagnifyingGlassIcon } from "@/icons";
import VehicleFilter from "./VehicleFilter";
import VehicleRow from "./VehicleRow";
import VehicleDetailDialog from "./VehicleDetailDialog";
import { Fragment } from "react";

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
  
  // State cho xe đang xem chi tiết
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Hàm lấy dữ liệu xe (mock data)
  useEffect(() => {
    // Giả lập API call
    const fetchVehicles = async () => {
      // Trong dự án thực tế, sẽ gọi API tại đây
      const mockVehicles: Vehicle[] = [
        {
          id: "1",
          title: "Mercedes C300 AMG 2023",
          price: 1650000000,
          seller: {
            id: "user1",
            fullName: "Nguyễn Văn A",
            avatar: "/images/avatars/user1.jpg",
          },
          year: 2023,
          body_type: "Sedan",
          type: "car",
          status: "approved",
          thumbnail: "/images/vehicles/mercedes-c300.jpg",
          licensePlate: "51F-123.45",
          make: "Mercedes-Benz",
          model: "C300 AMG",
          color: "Trắng",
          fuel_type: "Xăng",
          mileage: 1500,
          description: "Xe mới đi được 1500km, còn bảo hành chính hãng.",
          images: [
            "/images/vehicles/mercedes-c300-1.jpg",
            "/images/vehicles/mercedes-c300-2.jpg",
          ],
          created_at: "2023-12-15T08:00:00Z",
          updated_at: "2023-12-15T09:30:00Z",
        },
        {
          id: "2",
          title: "Honda SH 150i 2022",
          price: 120000000,
          seller: {
            id: "user2",
            fullName: "Trần Thị B",
            avatar: "/images/avatars/user2.jpg",
          },
          year: 2022,
          body_type: "Scooter",
          type: "motorcycle",
          status: "pending",
          thumbnail: "/images/vehicles/honda-sh.jpg",
          licensePlate: "59P2-12345",
          make: "Honda",
          model: "SH 150i",
          color: "Đen",
          mileage: 8500,
          description: "Xe chính chủ, đi giữ gìn, bảo dưỡng đầy đủ.",
          images: [
            "/images/vehicles/honda-sh-1.jpg",
            "/images/vehicles/honda-sh-2.jpg",
          ],
          created_at: "2023-12-10T10:00:00Z",
          updated_at: "2023-12-10T10:30:00Z",
        },
        {
          id: "3",
          title: "Giant ATX 2022",
          price: 8500000,
          seller: {
            id: "user3",
            fullName: "Lê Văn C",
            avatar: "/images/avatars/user3.jpg",
          },
          year: 2022,
          body_type: "Mountain Bike",
          type: "bicycle",
          status: "sold",
          thumbnail: "/images/vehicles/giant-atx.jpg",
          make: "Giant",
          model: "ATX",
          color: "Xanh dương",
          description: "Xe đạp địa hình nhập khẩu, mới 95%.",
          images: [
            "/images/vehicles/giant-atx-1.jpg",
            "/images/vehicles/giant-atx-2.jpg",
          ],
          created_at: "2023-11-20T14:00:00Z",
          updated_at: "2023-12-05T09:00:00Z",
        },
        {
          id: "4",
          title: "Toyota Camry 2.5Q 2020",
          price: 950000000,
          seller: {
            id: "user1",
            fullName: "Nguyễn Văn A",
            avatar: "/images/avatars/user1.jpg",
          },
          year: 2020,
          body_type: "Sedan",
          type: "car",
          status: "rejected",
          thumbnail: "/images/vehicles/toyota-camry.jpg",
          licensePlate: "51G-123.45",
          make: "Toyota",
          model: "Camry 2.5Q",
          color: "Đen",
          fuel_type: "Xăng",
          mileage: 25000,
          description: "Xe gia đình sử dụng, bảo dưỡng định kỳ tại hãng.",
          images: [
            "/images/vehicles/toyota-camry-1.jpg",
            "/images/vehicles/toyota-camry-2.jpg",
          ],
          created_at: "2023-12-01T08:00:00Z",
          updated_at: "2023-12-02T10:30:00Z",
        },
        {
          id: "5",
          title: "Yamaha Exciter 155 VVA 2022",
          price: 52000000,
          seller: {
            id: "user2",
            fullName: "Trần Thị B",
            avatar: "/images/avatars/user2.jpg",
          },
          year: 2022,
          body_type: "Sport Underbone",
          type: "motorcycle",
          status: "hidden",
          thumbnail: "/images/vehicles/yamaha-exciter.jpg",
          licensePlate: "59P3-54321",
          make: "Yamaha",
          model: "Exciter 155 VVA",
          color: "Xanh GP",
          mileage: 12000,
          description: "Xe chạy lướt, còn mới đẹp, máy zin chưa đụng.",
          images: [
            "/images/vehicles/yamaha-exciter-1.jpg",
            "/images/vehicles/yamaha-exciter-2.jpg",
          ],
          created_at: "2023-11-15T15:00:00Z",
          updated_at: "2023-11-16T09:30:00Z",
        },
      ];
      
      setVehicles(mockVehicles);
      setFilteredVehicles(mockVehicles);
    };
    
    fetchVehicles();
  }, []);

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

  // Hàm xử lý các hành động
  const handleAction = (vehicleId: string, action: string) => {
    // Trong dự án thực tế, sẽ gọi API tại đây
    switch (action) {
      case "approve":
        setVehicles((prev) =>
          prev.map((vehicle) =>
            vehicle.id === vehicleId
              ? { ...vehicle, status: "approved" }
              : vehicle
          )
        );
        break;
      case "reject":
        setVehicles((prev) =>
          prev.map((vehicle) =>
            vehicle.id === vehicleId
              ? { ...vehicle, status: "rejected" }
              : vehicle
          )
        );
        break;
      case "hide":
        setVehicles((prev) =>
          prev.map((vehicle) =>
            vehicle.id === vehicleId
              ? { ...vehicle, status: "hidden" }
              : vehicle
          )
        );
        break;
      case "delete":
        if (window.confirm("Bạn có chắc chắn muốn xóa tin đăng này?")) {
          setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== vehicleId));
        }
        break;
      default:
        break;
    }
  };

  // Hàm xử lý xem chi tiết
  const handleViewDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailOpen(true);
  };

  // Phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVehicles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);

  // Hàm chuyển trang
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
            {currentItems.length > 0 ? (
              currentItems.map((vehicle) => (
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
            Hiển thị <span className="font-medium">{indexOfFirstItem + 1}</span> đến{" "}
            <span className="font-medium">
              {Math.min(indexOfLastItem, filteredVehicles.length)}
            </span>{" "}
            trong <span className="font-medium">{filteredVehicles.length}</span> kết quả
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
 