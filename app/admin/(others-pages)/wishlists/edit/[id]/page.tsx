"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";

const EditWishlistPage = () => {
  const { id } = useParams();
  const [form, setForm] = useState({
    user: "",
    products: [] as string[],
    updatedAt: "",
  });
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await axios.get(`/api/wishlists/${id}`);
        if (res.data.success) {
          const wishlist = res.data.data;
          setForm({
            user: wishlist.user?.name || wishlist.user,
            products: wishlist.products?.map((p: any) => p._id || p) || [],
            updatedAt: wishlist.updatedAt
              ? new Date(wishlist.updatedAt).toLocaleString()
              : "",
          });
        } else {
          setError(res.data.message || "Wishlist not found");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch wishlist");
      } finally {
        setLoading(false);
      }
    };
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/products");
        if (res.data.success) {
          setAllProducts(res.data.data);
        }
      } catch {}
    };
    fetchWishlist();
    fetchProducts();
  }, [id]);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setForm({ ...form, products: selected });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await axios.put(`/api/wishlists/${id}`, {
        products: form.products,
      });
      if (res.data.success) {
        setSuccess("Wishlist updated successfully!");
        setTimeout(() => router.push("/admin/wishlists"), 1000);
      } else {
        setError(res.data.message || "Failed to update wishlist");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update wishlist");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Wishlist</h2>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded shadow"
      >
        <div>
          <label className="block font-semibold mb-1">User</label>
          <input
            value={form.user}
            readOnly
            className="w-full border p-2 rounded bg-gray-100"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Products</label>
          <select
            name="products"
            multiple
            value={form.products}
            onChange={handleProductChange}
            className="w-full border p-2 rounded h-32"
          >
            {allProducts.map((product) => (
              <option key={product._id} value={product._id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Updated At</label>
          <input
            value={form.updatedAt}
            readOnly
            className="w-full border p-2 rounded bg-gray-100"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Wishlist"}
        </button>
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
      </form>
    </div>
  );
};

export default EditWishlistPage;
