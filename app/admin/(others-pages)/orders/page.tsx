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

interface Order {
  _id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    province?: string;
    city?: string;
    address?: string;
    landmark?: string;
  };
  items: any[];
  totalAmount: number;
  discount?: number;
  additionalPrice?: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  orderNote?: string;
  createdDate: string;
  modifiedDate: string;
}

interface OrderWithId extends Order {
  id: string;
}

const fetchOrders = async () => {
  const res = await axios.get("/api/orders");
  return res.data;
};

const columns: AdminTableColumn<any>[] = [
  {
    header: "Customer Name",
    render: (row) => row.customer?.name || "-",
    className: "min-w-[150px] max-w-[200px]",
  },
  {
    header: "Email",
    render: (row) => row.customer?.email || "-",
    className: "min-w-[150px] max-w-[200px]",
  },
  {
    header: "Order Status",
    render: (row) => row.orderStatus,
    className: "min-w-[120px] max-w-[150px]",
  },
  {
    header: "Total Amount",
    render: (row) => `$${row.totalAmount.toFixed(2)}`,
    className: "min-w-[100px] max-w-[120px]",
  },
  {
    header: "Created",
    render: (row) => new Date(row.createdDate).toLocaleDateString(),
    className: "min-w-[100px] max-w-[120px]",
  },
];

export default function OrdersPage() {
  const [dropdownOpen, setDropdownOpen] = useState<string | number | null>(
    null
  );
  const [selectedOrders, setSelectedOrders] = useState<OrderWithId[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  // Map _id to id for table row key and selection
  const orders: OrderWithId[] = (data?.data || []).map((item: Order) => ({
    ...item,
    id: item._id,
  }));

  const handleEdit = (orderId: string) => {
    router.push(`/admin/orders/edit/${orderId}`);
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) {
      return;
    }

    try {
      setIsDeleting(true);
      await axios.delete(`/api/orders/${orderId}`);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      alert("Order deleted successfully");
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Failed to delete order");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) {
      alert("Please select orders to delete");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedOrders.length} order(s)?`
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      const orderIds = selectedOrders.map((order) => order._id);
      await axios.delete("/api/orders", {
        data: { ids: orderIds },
      });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setSelectedOrders([]);
      alert(`${selectedOrders.length} order(s) deleted successfully`);
    } catch (error) {
      console.error("Error bulk deleting orders:", error);
      alert("Failed to delete orders");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRowSelect = (selected: OrderWithId[]) => {
    setSelectedOrders(selected);
  };

  return (
    <div className="p-6">
      <PageBreadcrumb pageTitle="Orders" />
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          {selectedOrders.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              {isDeleting
                ? "Deleting..."
                : `Delete Selected (${selectedOrders.length})`}
            </button>
          )}
        </div>
        <Link
          href="/admin/orders/add"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          Add Order
        </Link>
      </div>
      {isLoading ? (
        <div className="text-center py-10 text-gray-500">Loading orders...</div>
      ) : isError ? (
        <div className="text-center py-10 text-red-500">
          Error loading orders: {error?.message}
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <AdminTable
            columns={columns}
            data={orders}
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
                    onClick={() => router.push(`/admin/orders/view/${row.id}`)}
                  >
                    View
                  </DropdownItem>
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
        </div>
      )}
    </div>
  );
}
