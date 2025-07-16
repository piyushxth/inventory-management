"use client";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import React, { useEffect, useState } from "react";
import AdminTable, {
  AdminTableColumn,
} from "@/components/admin/common/AdminTable";
import axios from "axios";

interface Role {
  _id: string;
  id: string;
  name: string;
  userCount: number;
  users: Array<{
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  }>;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/roles");
        if (res.data.success) {
          console.log(
            res.data.data.map((role: any) => ({ ...role, id: role._id }))
          );
          setRoles(
            res.data.data.map((role: any) => ({ ...role, id: role._id }))
          );
        } else {
          setError(res.data.message || "Failed to fetch roles");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch roles");
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const columns: AdminTableColumn<Role>[] = [
    { header: "Role Name", accessor: "name" },
    { header: "User Count", accessor: "userCount" },
    {
      header: "Actions",
      render: (row) => (
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          onClick={() => setSelectedRole(row)}
        >
          View Users
        </button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <PageBreadcrumb pageTitle="Roles & Permissions" />
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <AdminTable
        columns={columns}
        data={roles}
        loading={loading}
        pageSize={10}
      />
      {selectedRole && (
        <div className="mt-8 p-4 border rounded bg-gray-50">
          <h3 className="text-xl font-semibold mb-2">
            Users with role: {selectedRole.name}
          </h3>
          {selectedRole.users.length === 0 ? (
            <div className="text-gray-500">No users with this role.</div>
          ) : (
            <ul className="divide-y">
              {selectedRole.users.map((user) => (
                <li key={user._id} className="py-2 flex items-center gap-3">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                      {user.name?.[0]}
                    </div>
                  )}
                  <span className="font-medium">{user.name}</span>
                  <span className="text-gray-500 text-sm">{user.email}</span>
                </li>
              ))}
            </ul>
          )}
          <button
            className="mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
            onClick={() => setSelectedRole(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
