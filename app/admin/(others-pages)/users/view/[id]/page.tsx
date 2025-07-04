import React from "react";
import axios from "axios";

const fetchUserById = async (id: string) => {
  const res = await axios.get(`/api/users/${id}`);
  return res.data.data;
};

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const id = (await params).id;
  const user = await fetchUserById(id);
  return (
    <div className="max-w-xl mx-auto p-6">
      <a
        href="/admin/users"
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        &larr; Back to Users
      </a>
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-2xl font-bold mb-4">User Details</h2>
        <div className="space-y-2">
          <div>
            <strong>Name:</strong> {user.name}
          </div>
          <div>
            <strong>Email:</strong> {user.email}
          </div>
          <div>
            <strong>Profile Picture:</strong>{" "}
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-16 h-16 rounded-full"
              />
            ) : (
              "-"
            )}
          </div>
          <div>
            <strong>Role:</strong> {user.roles?.name || user.roles}
          </div>
          <div>
            <strong>Address:</strong> {user.address || "-"}
          </div>
          <div>
            <strong>Created:</strong>{" "}
            {user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}
          </div>
          <div>
            <strong>Updated:</strong>{" "}
            {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "-"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
