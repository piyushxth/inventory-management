"use client";
import React, { useState } from "react";
import AdminTable, {
  AdminTableColumn,
} from "@/components/admin/common/AdminTable";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BasicTableTwo from "@/components/admin/tables/BasicTableTwo";
import { Dropdown } from "@/components/admin/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/admin/ui/dropdown/DropdownItem";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { TProductCreate } from "@/libs/zod_schema/products/productCreate";

interface Product {
  _id: string;
  name: string;
  category: string;
  cost_price: number;
  selling_price: number;
  availableQuantity: number;
  images: string[];
}

interface ProductWithId extends Product {
  id: string;
}

const fetchProducts = async () => {
  const res = await axios.get("/api/products");
  return res.data;
};

const columns: AdminTableColumn<any>[] = [
  { header: "Name", accessor: "name" },
  {
    header: "Category",
    render: (row) =>
      row.category && typeof row.category === "object"
        ? row.category.name
        : String(row.category),
  },
  { header: "Cost Price", accessor: "cost_price" },
  { header: "Selling Price", accessor: "selling_price" },
  { header: "Available Qty", accessor: "availableQuantity" },
];

export default function ProductsPage() {
  const [dropdownOpen, setDropdownOpen] = useState<string | number | null>(
    null
  );
  const [selectedProducts, setSelectedProducts] = useState<ProductWithId[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  // Map _id to id for table row key and selection
  const products: ProductWithId[] = (data?.data || []).map((item: Product) => ({
    ...item,
    id: item._id,
  }));

  const handleEdit = (productId: string) => {
    router.push(`/admin/products/edit/${productId}`);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      setIsDeleting(true);
      await axios.delete(`/api/products/${productId}`);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      alert("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      alert("Please select products to delete");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedProducts.length} product(s)?`
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      const productIds = selectedProducts.map((product) => product._id);
      await axios.delete("/api/products", {
        data: { ids: productIds },
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setSelectedProducts([]);
      alert(`${selectedProducts.length} product(s) deleted successfully`);
    } catch (error) {
      console.error("Error bulk deleting products:", error);
      alert("Failed to delete products");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRowSelect = (selected: ProductWithId[]) => {
    setSelectedProducts(selected);
  };

  return (
    <div className="p-6">
      <PageBreadcrumb pageTitle="Products" />
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          {selectedProducts.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              {isDeleting
                ? "Deleting..."
                : `Delete Selected (${selectedProducts.length})`}
            </button>
          )}
        </div>
        <Link
          href="/admin/products/add"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          Add Product
        </Link>
      </div>
      {isLoading ? (
        <div className="text-center py-10 text-gray-500">
          Loading products...
        </div>
      ) : isError ? (
        <div className="text-center py-10 text-red-500">
          Error loading products: {error?.message}
        </div>
      ) : (
        <AdminTable
          columns={columns}
          data={products}
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
