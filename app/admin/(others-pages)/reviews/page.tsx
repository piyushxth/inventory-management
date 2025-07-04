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

interface ReviewWithId extends Review {
  id: string;
}

const fetchReviews = async () => {
  const res = await axios.get("/api/reviews");
  return res.data;
};

const columns: AdminTableColumn<any>[] = [
  {
    header: "Product",
    render: (row) => row.product?.name || "Unknown Product",
    className: "min-w-[150px] max-w-[200px]",
  },
  {
    header: "User",
    render: (row) => row.user?.name || row.user?.email || "Unknown User",
    className: "min-w-[120px] max-w-[180px]",
  },
  {
    header: "Rating",
    render: (row) => (
      <div className="flex items-center">
        <span className="mr-2 text-sm">{row.rating}/5</span>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-3 h-3 ${
                i < row.rating ? "text-yellow-400" : "text-gray-300"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>
    ),
    className: "min-w-[100px] max-w-[120px]",
  },
  {
    header: "Comment",
    render: (row) =>
      row.comment ? (
        <span className="truncate block max-w-[200px] text-sm">
          {row.comment}
        </span>
      ) : (
        <span className="text-gray-400 text-sm">No comment</span>
      ),
    className: "min-w-[150px] max-w-[250px]",
  },
  {
    header: "Created",
    render: (row) => new Date(row.createdAt).toLocaleDateString(),
    className: "min-w-[100px] max-w-[120px]",
  },
];

export default function ReviewsPage() {
  const [dropdownOpen, setDropdownOpen] = useState<string | number | null>(
    null
  );
  const [selectedReviews, setSelectedReviews] = useState<ReviewWithId[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["reviews"],
    queryFn: fetchReviews,
  });

  // Map _id to id for table row key and selection
  const reviews: ReviewWithId[] = (data?.data || []).map((item: Review) => ({
    ...item,
    id: item._id,
  }));

  const handleEdit = (reviewId: string) => {
    router.push(`/admin/reviews/edit/${reviewId}`);
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      setIsDeleting(true);
      await axios.delete(`/api/reviews/${reviewId}`);
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      alert("Review deleted successfully");
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedReviews.length === 0) {
      alert("Please select reviews to delete");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedReviews.length} review(s)?`
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      const reviewIds = selectedReviews.map((review) => review._id);
      await axios.delete("/api/reviews", {
        data: { ids: reviewIds },
      });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      setSelectedReviews([]);
      alert(`${selectedReviews.length} review(s) deleted successfully`);
    } catch (error) {
      console.error("Error bulk deleting reviews:", error);
      alert("Failed to delete reviews");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRowSelect = (selected: ReviewWithId[]) => {
    setSelectedReviews(selected);
  };

  return (
    <div className="p-6">
      <PageBreadcrumb pageTitle="Reviews" />
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          {selectedReviews.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              {isDeleting
                ? "Deleting..."
                : `Delete Selected (${selectedReviews.length})`}
            </button>
          )}
        </div>
        <Link
          href="/admin/reviews/add"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          Add Review
        </Link>
      </div>
      {isLoading ? (
        <div className="text-center py-10 text-gray-500">
          Loading reviews...
        </div>
      ) : isError ? (
        <div className="text-center py-10 text-red-500">
          Error loading reviews: {error?.message}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <AdminTable
            columns={columns}
            data={reviews}
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
