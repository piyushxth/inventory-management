"use client";
import React, { useState } from "react";
import AdminTable, {
  AdminTableColumn,
} from "@/components/admin/common/AdminTable";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import { Dropdown } from "@/components/admin/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/admin/ui/dropdown/DropdownItem";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Cart {
  _id: string;
  user: { _id: string; name: string; email: string } | string;
  items: any[];
  updatedAt: string;
}

interface CartWithId extends Cart {
  id: string;
}

const fetchCarts = async () => {
  const res = await axios.get("/api/carts");
  return res.data;
};

const columns: AdminTableColumn<any>[] = [
  {
    header: "User",
    render: (row) =>
      typeof row.user === "object"
        ? `${row.user.name} (${row.user.email})`
        : row.user,
  },
  {
    header: "Item Count",
    render: (row) => row.items?.length || 0,
  },
  {
    header: "Updated At",
    render: (row) => new Date(row.updatedAt).toLocaleString(),
  },
];

export default function CartsPage() {
  const [dropdownOpen, setDropdownOpen] = useState<string | number | null>(
    null
  );
  const [selectedCarts, setSelectedCarts] = useState<CartWithId[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [carts, setCarts] = useState<CartWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchCarts();
        setCarts(
          (res.data || []).map((item: Cart) => ({ ...item, id: item._id }))
        );
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch carts");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (cartId: string) => {
    if (!confirm("Are you sure you want to delete this cart?")) {
      return;
    }
    try {
      setIsDeleting(true);
      await axios.delete(`/api/carts/${cartId}`);
      setCarts(carts.filter((c) => c.id !== cartId));
    } catch (error) {
      alert("Failed to delete cart");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCarts.length === 0) {
      alert("Please select carts to delete");
      return;
    }
    if (
      !confirm(
        `Are you sure you want to delete ${selectedCarts.length} cart(s)?`
      )
    ) {
      return;
    }
    try {
      setIsDeleting(true);
      // Optionally implement a bulk delete API
      for (const c of selectedCarts) {
        await axios.delete(`/api/carts/${c.id}`);
      }
      setCarts(
        carts.filter((c) => !selectedCarts.some((sc) => sc.id === c.id))
      );
      setSelectedCarts([]);
    } catch (error) {
      alert("Failed to delete carts");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRowSelect = (selected: CartWithId[]) => {
    setSelectedCarts(selected);
  };

  return (
    <div className="p-6">
      <PageBreadcrumb pageTitle="Carts" />
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          {selectedCarts.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              {isDeleting
                ? "Deleting..."
                : `Delete Selected (${selectedCarts.length})`}
            </button>
          )}
        </div>
      </div>
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading carts...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : (
        <AdminTable
          columns={columns}
          data={carts}
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
                <DropdownItem
                  onClick={() => router.push(`/admin/carts/view/${row.id}`)}
                >
                  View
                </DropdownItem>
                <DropdownItem onClick={() => handleDelete(row.id)}>
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
