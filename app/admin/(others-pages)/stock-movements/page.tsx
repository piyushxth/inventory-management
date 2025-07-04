"use client";
import React, { useEffect, useState } from "react";
import AdminTable, {
  AdminTableColumn,
} from "@/components/admin/common/AdminTable";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import { Dropdown } from "@/components/admin/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/admin/ui/dropdown/DropdownItem";
import axios from "axios";

interface StockMovement {
  _id: string;
  product: { _id: string; name: string } | string;
  quantity: number;
  type: string;
  note?: string;
  createdBy?: { _id: string; name: string } | string;
  createdAt: string;
}

interface StockMovementWithId extends StockMovement {
  id: string;
}

const columns: AdminTableColumn<any>[] = [
  {
    header: "Product",
    render: (row) =>
      typeof row.product === "object" ? row.product.name : row.product,
  },
  { header: "Quantity", accessor: "quantity" },
  { header: "Type", accessor: "type" },
  { header: "Note", accessor: "note" },
  {
    header: "User",
    render: (row) =>
      row.createdBy && typeof row.createdBy === "object"
        ? row.createdBy.name
        : row.createdBy || "-",
  },
  {
    header: "Date",
    render: (row) => new Date(row.createdAt).toLocaleString(),
  },
];

const fetchProducts = async () => {
  const res = await axios.get("/api/products");
  return res.data.data;
};

const fetchUsers = async () => {
  const res = await axios.get("/api/users");
  return res.data.data;
};

export default function StockMovementsPage() {
  const [stockMovements, setStockMovements] = useState<StockMovementWithId[]>(
    []
  );
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    product: "",
    type: "",
    user: "",
    startDate: "",
    endDate: "",
    search: "",
  });

  useEffect(() => {
    fetchProducts().then(setProducts);
    fetchUsers().then(setUsers);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filters.product) params.append("product", filters.product);
      if (filters.type) params.append("type", filters.type);
      if (filters.user) params.append("user", filters.user);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.search) params.append("search", filters.search);
      const res = await axios.get(`/api/stock-movements?${params.toString()}`);
      setStockMovements(
        (res.data.data || []).map((item: StockMovement) => ({
          ...item,
          id: item._id,
        }))
      );
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to fetch stock movements"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [filters]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleExport = async () => {
    const params = new URLSearchParams();
    if (filters.product) params.append("product", filters.product);
    if (filters.type) params.append("type", filters.type);
    if (filters.user) params.append("user", filters.user);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.search) params.append("search", filters.search);
    params.append("export", "csv");
    const res = await axios.get(`/api/stock-movements?${params.toString()}`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "stock-movements.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="p-6">
      <PageBreadcrumb pageTitle="Stock Movements" />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Stock Movements</h2>
        <a
          href="/admin/stock-movements/add"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Stock Movement
        </a>
      </div>
      <div className="mb-4 flex flex-wrap gap-2 items-end">
        <select
          name="product"
          value={filters.product}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        >
          <option value="">All Products</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          name="type"
          value={filters.type}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        >
          <option value="">All Types</option>
          <option value="purchase">Purchase</option>
          <option value="sale">Sale</option>
          <option value="return">Return</option>
          <option value="adjustment">Adjustment</option>
        </select>
        <select
          name="user"
          value={filters.user}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        >
          <option value="">All Users</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        />
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Search notes..."
          className="border p-2 rounded"
        />
        <button
          onClick={handleExport}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Export to CSV
        </button>
      </div>
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Loading stock movements...
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : (
        <AdminTable columns={columns} data={stockMovements} pageSize={20} />
      )}
    </div>
  );
}
