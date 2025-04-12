import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@/icons";
import { Vehicle } from "./AdminVehicleList";

interface FiltersState {
  type: string;
  status: string;
  seller: string;
}

interface VehicleFilterProps {
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  vehicles: Vehicle[];
}

export default function VehicleFilter({
  filters,
  setFilters,
  vehicles,
}: VehicleFilterProps) {
  // Các tùy chọn cho bộ lọc loại xe
  const typeOptions = [
    { value: "all", label: "Tất cả loại xe" },
    { value: "car", label: "Ô tô" },
    { value: "motorcycle", label: "Xe máy" },
    { value: "bicycle", label: "Xe đạp" },
  ];

  // Các tùy chọn cho bộ lọc trạng thái
  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "pending", label: "Chờ duyệt" },
    { value: "approved", label: "Đã duyệt" },
    { value: "rejected", label: "Từ chối" },
    { value: "sold", label: "Đã bán" },
    { value: "hidden", label: "Đã ẩn" },
  ];

  // Tạo danh sách người bán từ dữ liệu xe
  const uniqueSellers = [...new Set(vehicles.map((vehicle) => vehicle.seller.id))];
  const sellerOptions = [
    { value: "all", label: "Tất cả người bán" },
    ...uniqueSellers.map((sellerId) => {
      const seller = vehicles.find((v) => v.seller.id === sellerId)?.seller;
      return {
        value: seller?.id || "",
        label: seller?.fullName || "",
      };
    }),
  ];

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (
    filterName: keyof FiltersState,
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {/* Lọc theo loại xe */}
      <FilterSelect
        value={filters.type}
        onChange={(value) => handleFilterChange("type", value)}
        options={typeOptions}
      />

      {/* Lọc theo trạng thái */}
      <FilterSelect
        value={filters.status}
        onChange={(value) => handleFilterChange("status", value)}
        options={statusOptions}
      />

      {/* Lọc theo người bán */}
      <FilterSelect
        value={filters.seller}
        onChange={(value) => handleFilterChange("seller", value)}
        options={sellerOptions}
      />
    </div>
  );
}

// Component cho select dropdown
interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

function FilterSelect({ value, onChange, options }: FilterSelectProps) {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative w-full sm:w-48">
        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-left border border-gray-300 dark:border-gray-700 focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm">
          <span className="block truncate">
            {selectedOption ? selectedOption.label : options[0].label}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDownIcon className="h-5 w-5" />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active
                      ? "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-300"
                      : "text-gray-900 dark:text-gray-300"
                  }`
                }
                value={option.value}
              >
                {({ selected, active }) => (
                  <>
                    <span
                      className={`block truncate ${
                        selected ? "font-medium" : "font-normal"
                      }`}
                    >
                      {option.label}
                    </span>
                    {selected ? (
                      <span
                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                          active
                            ? "text-blue-600 dark:text-blue-300"
                            : "text-blue-600 dark:text-blue-500"
                        }`}
                      >
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
} 