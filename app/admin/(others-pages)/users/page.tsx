"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import AdminTable, {
  AdminTableColumn,
} from "@/components/admin/common/AdminTable";
import { Dropdown } from "@/components/admin/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/admin/ui/dropdown/DropdownItem";

const UsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState<string | number | null>(
    null
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/api/users");
        if (res.data.success) {
          setUsers(
            res.data.data.map((u: any) => ({
              ...u,
              id: u._id,
            }))
          );
        } else {
          setError(res.data.message || "Failed to fetch users");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`/api/users/${id}`);
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const columns: AdminTableColumn<any>[] = [
    {
      header: "Avatar",
      render: (row) =>
        row.profilePicture ? (
          <img
            src={row.profilePicture}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            {row.name?.[0]}
          </div>
        ),
      className: "text-center",
    },
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Role", render: (row) => row.roles?.name || row.roles },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Users</h2>
        <button
          onClick={() => router.push("/admin/users/add")}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add User
        </button>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <AdminTable
        columns={columns}
        data={users}
        loading={loading}
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
                onClick={() => router.push(`/admin/users/view/${row.id}`)}
              >
                View
              </DropdownItem>
              <DropdownItem
                onClick={() => router.push(`/admin/users/edit/${row.id}`)}
              >
                Edit
              </DropdownItem>
              <DropdownItem onClick={() => handleDelete(row.id)}>
                Delete
              </DropdownItem>
            </Dropdown>
          </div>
        )}
        pageSize={10}
      />
    </div>
  );
};

export default UsersPage;
