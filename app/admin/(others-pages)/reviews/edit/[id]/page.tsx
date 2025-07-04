"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import ReviewEditForm from "./ReviewEditForm";

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

const fetchReview = async (id: string) => {
  const res = await axios.get(`/api/reviews/${id}`);
  return res.data;
};

export default function EditReviewPage() {
  const params = useParams();
  const reviewId = params.id as string;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["review", reviewId],
    queryFn: () => fetchReview(reviewId),
    enabled: !!reviewId,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <PageBreadcrumb pageTitle="Edit Review" />
        <div className="text-center py-10 text-gray-500">Loading review...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <PageBreadcrumb pageTitle="Edit Review" />
        <div className="text-center py-10 text-red-500">
          Error loading review: {error?.message}
        </div>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="p-6">
        <PageBreadcrumb pageTitle="Edit Review" />
        <div className="text-center py-10 text-red-500">Review not found</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageBreadcrumb pageTitle="Edit Review" />
      <ReviewEditForm review={data.data} />
    </div>
  );
}
