import AdminVehicleList from "@/components/vehicles/AdminVehicleList";

export default function VehiclesPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Quản lý tin đăng xe
        </h1>
      </div>
      
      <AdminVehicleList />
    </div>
  );
} 