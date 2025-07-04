"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import Label from "@/components/admin/form/Label";
import Input from "@/components/admin/form/input/InputField";
import TextArea from "@/components/admin/form/input/TextArea";
import Select from "@/components/admin/form/Select";
import ComponentCard from "@/components/admin/common/ComponentCard";

// Review validation schema
const reviewSchema = z.object({
  product: z.string().min(1, "Product is required"),
  user: z.string().min(1, "User is required"),
  rating: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  comment: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface Review {
  _id: string;
  product: {
    _id: string;
    name: string;
  };
  user: {
    _id: string;
    name: string;
    email: string;
  };
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  _id: string;
  name: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

const ReviewEditForm = ({ review }: { review: Review }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      product: review.product._id,
      user: review.user._id,
      rating: review.rating,
      comment: review.comment || "",
    },
  });

  // Fetch products and users on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        setDataError(null);

        console.log("Fetching products and users for edit...");

        const [productsRes, usersRes] = await Promise.all([
          axios.get("/api/products"),
          axios.get("/api/users"),
        ]);

        console.log("Products response:", productsRes.data);
        console.log("Users response:", usersRes.data);

        if (productsRes.data.success) {
          setProducts(productsRes.data.data);
          console.log("Products loaded:", productsRes.data.data.length);
        } else {
          console.error("Products API error:", productsRes.data);
          setDataError("Failed to load products");
        }

        if (usersRes.data.success) {
          setUsers(usersRes.data.data);
          console.log("Users loaded:", usersRes.data.data.length);
        } else {
          console.error("Users API error:", usersRes.data);
          setDataError("Failed to load users");
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setDataError(error.response?.data?.message || "Failed to load data");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: ReviewFormData) => {
    try {
      setIsLoading(true);
      const response = await axios.put(`/api/reviews/${review._id}`, data);

      if (response.data.success) {
        alert("Review updated successfully!");
        router.push("/admin/reviews");
      } else {
        alert(response.data.message || "Failed to update review");
      }
    } catch (error: any) {
      console.error("Error updating review:", error);
      alert(
        error.response?.data?.message ||
          "Error updating review. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Convert data to options format for Select component
  const productOptions = products.map((product) => ({
    value: product._id,
    label: product.name,
  }));

  const userOptions = users.map((user) => ({
    value: user._id,
    label: user.name || user.email,
  }));

  const ratingOptions = [
    { value: "1", label: "1 Star" },
    { value: "2", label: "2 Stars" },
    { value: "3", label: "3 Stars" },
    { value: "4", label: "4 Stars" },
    { value: "5", label: "5 Stars" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
      {isLoadingData ? (
        <div className="text-center py-10 text-gray-500">
          Loading products and users...
        </div>
      ) : dataError ? (
        <div className="text-center py-10 text-red-500">Error: {dataError}</div>
      ) : (
        <>
          <ComponentCard title="Review Information">
            <div className="space-y-4">
              <div className="flex flex-col">
                <Label htmlFor="product">Product</Label>
                <Select
                  options={productOptions}
                  placeholder={
                    products.length === 0
                      ? "No products available"
                      : "Select a product"
                  }
                  onChange={(value) => setValue("product", value)}
                  className={errors.product ? "border-red-500" : ""}
                  defaultValue={review.product._id}
                />
                {products.length === 0 && (
                  <p className="text-yellow-500 text-sm mt-1">
                    No products found. Please add some products first.
                  </p>
                )}
                {errors.product && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.product.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col">
                <Label htmlFor="user">User</Label>
                <Select
                  options={userOptions}
                  placeholder={
                    users.length === 0 ? "No users available" : "Select a user"
                  }
                  onChange={(value) => setValue("user", value)}
                  className={errors.user ? "border-red-500" : ""}
                  defaultValue={review.user._id}
                />
                {users.length === 0 && (
                  <p className="text-yellow-500 text-sm mt-1">
                    No users found. Please add some users first.
                  </p>
                )}
                {errors.user && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.user.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col">
                <Label htmlFor="rating">Rating</Label>
                <Select
                  options={ratingOptions}
                  placeholder="Select rating"
                  onChange={(value) => setValue("rating", Number(value))}
                  className={errors.rating ? "border-red-500" : ""}
                  defaultValue={String(review.rating)}
                />
                {errors.rating && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.rating.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col">
                <Label htmlFor="comment">Comment</Label>
                <TextArea
                  value={watch("comment") || ""}
                  onChange={(value) => setValue("comment", value)}
                  placeholder="Enter review comment (optional)"
                  className={errors.comment ? "border-red-500" : ""}
                  rows={4}
                />
                {errors.comment && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.comment.message}
                  </p>
                )}
              </div>
            </div>
          </ComponentCard>

          {/* Submit Button */}
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={
                isSubmitting ||
                isLoading ||
                products.length === 0 ||
                users.length === 0
              }
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50 font-medium"
            >
              {isSubmitting || isLoading ? "Updating..." : "Update Review"}
            </button>
          </div>
        </>
      )}
    </form>
  );
};

export default ReviewEditForm;
