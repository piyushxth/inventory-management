"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";

const EditUserPage = () => {
  const { id } = useParams();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    profilePicture: "",
    roles: "",
    address: "",
  });
  const [roles, setRoles] = useState<any[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axios.get("/api/roles");
        if (res.data.success) {
          setRoles(res.data.data);
        }
      } catch {
        setRoles([]);
      } finally {
        setRolesLoading(false);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/api/users/${id}`);
        if (res.data.success) {
          setForm({
            name: res.data.data.name || "",
            email: res.data.data.email || "",
            password: "",
            profilePicture: res.data.data.profilePicture || "",
            roles: res.data.data.roles?._id || res.data.data.roles || "",
            address: res.data.data.address || "",
          });
        } else {
          setError(res.data.message || "User not found");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await axios.put(`/api/users/${id}`, form);
      if (res.data.success) {
        setSuccess("User updated successfully!");
        setTimeout(() => router.push("/admin/users"), 1000);
      } else {
        setError(res.data.message || "Failed to update user");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Edit User</h2>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded shadow"
      >
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          type="email"
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password (leave blank to keep current)"
          type="password"
          className="w-full border p-2 rounded"
        />
        <input
          name="profilePicture"
          value={form.profilePicture}
          onChange={handleChange}
          placeholder="Profile Picture URL"
          className="w-full border p-2 rounded"
        />
        {rolesLoading ? (
          <div className="text-gray-500">Loading roles...</div>
        ) : (
          <select
            name="roles"
            value={form.roles}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Role</option>
            {roles.map((role) => (
              <option key={role._id} value={role._id}>
                {role.name}
              </option>
            ))}
          </select>
        )}
        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Address"
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update User"}
        </button>
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
      </form>
    </div>
  );
};

export default EditUserPage;
