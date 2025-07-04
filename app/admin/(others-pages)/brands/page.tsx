"use client";
import React, { useState } from "react";
import AdminTable, {
  AdminTableColumn,
} from "@/components/admin/common/AdminTable";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dropdown } from "@/components/admin/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/admin/ui/dropdown/DropdownItem";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";

interface Brand {
  _id: string;
  name: string;
  logo?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface BrandWithId extends Brand {
  id: string;
}

const fetchBrands = async () => {
  const res = await axios.get("/api/brands");
  return res.data;
};

const columns: AdminTableColumn<any>[] = [
  { header: "Name", accessor: "name" },
  {
    header: "Logo",
    render: (row) =>
      row.logo ? (
        <div className="w-12 h-12 relative">
          <Image
            src={row.logo}
            alt={row.name}
            width={48}
            height={48}
            className="rounded object-cover"
          />
        </div>
      ) : (
        <span className="text-gray-400">No logo</span>
      ),
  },
  {
    header: "Description",
    render: (row) =>
      row.description ? (
        <span className="truncate max-w-xs">{row.description}</span>
      ) : (
        <span className="text-gray-400">No description</span>
      ),
  },
  {
    header: "Created",
    render: (row) => new Date(row.createdAt).toLocaleDateString(),
  },
];

export default function BrandsPage() {
  const [dropdownOpen, setDropdownOpen] = useState<string | number | null>(
    null
  );
  const [selectedBrands, setSelectedBrands] = useState<BrandWithId[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["brands"],
    queryFn: fetchBrands,
  });

  // Map _id to id for table row key and selection
  const brands: BrandWithId[] = (data?.data || []).map((item: Brand) => ({
    ...item,
    id: item._id,
  }));

  const handleEdit = (brandId: string) => {
    router.push(`/admin/brands/edit/${brandId}`);
  };

  const handleDelete = async (brandId: string) => {
    if (!confirm("Are you sure you want to delete this brand?")) {
      return;
    }

    try {
      setIsDeleting(true);
      await axios.delete(`/api/brands/${brandId}`);
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      alert("Brand deleted successfully");
    } catch (error) {
      console.error("Error deleting brand:", error);
      alert("Failed to delete brand");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBrands.length === 0) {
      alert("Please select brands to delete");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedBrands.length} brand(s)?`
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      const brandIds = selectedBrands.map((brand) => brand._id);
      await axios.delete("/api/brands", {
        data: { ids: brandIds },
      });
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setSelectedBrands([]);
      alert(`${selectedBrands.length} brand(s) deleted successfully`);
    } catch (error) {
      console.error("Error bulk deleting brands:", error);
      alert("Failed to delete brands");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRowSelect = (selected: BrandWithId[]) => {
    setSelectedBrands(selected);
  };

  return (
    <div className="p-6">
      <PageBreadcrumb pageTitle="Brands" />
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          {selectedBrands.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              {isDeleting
                ? "Deleting..."
                : `Delete Selected (${selectedBrands.length})`}
            </button>
          )}
        </div>
        <Link
          href="/admin/brands/add"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          Add Brand
        </Link>
      </div>
      {isLoading ? (
        <div className="text-center py-10 text-gray-500">Loading brands...</div>
      ) : isError ? (
        <div className="text-center py-10 text-red-500">
          Error loading brands: {error?.message}
        </div>
      ) : (
        <AdminTable
          columns={columns}
          data={brands}
          pageSize={10}
          onRowSelect={handleRowSelect}
          actions={(row) => (
            <div className="flex items-center justify-center relative">
              <button
                className="dropdown-toggle text-gray-500 dark:text-gray-400"
                onClick={() =>
                  setDropdownOpen(dropdownOpen === row.id ? null : row.id)
                }
                aria-label="Actions"
                type="button"
              >
                <svg
                  className="fill-current"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5.99902 10.245C6.96552 10.245 7.74902 11.0285 7.74902 11.995V12.005C7.74902 12.9715 6.96552 13.755 5.99902 13.755C5.03253 13.755 4.24902 12.9715 4.24902 12.005V11.995C4.24902 11.0285 5.03253 10.245 5.99902 10.245ZM17.999 10.245C18.9655 10.245 19.749 11.0285 19.749 11.995V12.005C19.749 12.9715 18.9655 13.755 17.999 13.755C17.0325 13.755 16.249 12.9715 16.249 12.005V11.995C16.249 11.0285 17.0325 10.245 17.999 10.245ZM13.749 11.995C13.749 11.0285 12.9655 10.245 11.999 10.245C11.0325 10.245 10.249 11.0285 10.249 11.995V12.005C10.249 12.9715 11.0325 13.755 11.999 13.755C12.9655 13.755 13.749 12.9715 13.749 12.005V11.995Z"
                    fill=""
                  />
                </svg>
              </button>
              <Dropdown
                isOpen={dropdownOpen === row.id}
                onClose={() => setDropdownOpen(null)}
              >
                <DropdownItem onClick={() => handleEdit(String(row.id))}>
                  Edit
                </DropdownItem>
                <DropdownItem onClick={() => handleDelete(String(row.id))}>
                  Delete
                </DropdownItem>
              </Dropdown>
            </div>
          )}
        />
      )}
    </div>
  );
}
