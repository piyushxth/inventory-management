import React from "react";
import axios from "axios";

const fetchWishlistById = async (id: string) => {
  const res = await axios.get(`/api/wishlists/${id}`);
  return res.data.data;
};

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const id = (await params).id;
  const wishlist = await fetchWishlistById(id);
  return (
    <div className="max-w-xl mx-auto p-6">
      <a
        href="/admin/wishlists"
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        &larr; Back to Wishlists
      </a>
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Wishlist Details</h2>
        <div className="space-y-2">
          <div>
            <strong>User:</strong> {wishlist.user?.name || wishlist.user}
          </div>
          <div>
            <strong>Products:</strong>
            <ul className="list-disc ml-6 mt-1">
              {wishlist.products && wishlist.products.length > 0 ? (
                wishlist.products.map((product: any) => (
                  <li
                    key={product._id || product}
                    className="flex items-center gap-2"
                  >
                    {product.images && product.images.length > 0 && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                    )}
                    <span>{product.name || product}</span>
                  </li>
                ))
              ) : (
                <li>No products</li>
              )}
            </ul>
          </div>
          <div>
            <strong>Updated At:</strong>{" "}
            {wishlist.updatedAt
              ? new Date(wishlist.updatedAt).toLocaleString()
              : "-"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
