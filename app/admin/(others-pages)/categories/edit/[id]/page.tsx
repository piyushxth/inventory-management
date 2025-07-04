"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import CategoryEditForm from "./CategoryEditForm";

interface Category {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const fetchCategory = async (id: string) => {
  const res = await axios.get(`/api/categories/${id}`);
  return res.data;
};

export default function EditCategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["category", categoryId],
    queryFn: () => fetchCategory(categoryId),
    enabled: !!categoryId,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <PageBreadcrumb pageTitle="Edit Category" />
        <div className="text-center py-10 text-gray-500">
          Loading category...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <PageBreadcrumb pageTitle="Edit Category" />
        <div className="text-center py-10 text-red-500">
          Error loading category: {error?.message}
        </div>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="p-6">
        <PageBreadcrumb pageTitle="Edit Category" />
        <div className="text-center py-10 text-red-500">Category not found</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageBreadcrumb pageTitle="Edit Category" />
      <CategoryEditForm category={data.data} />
    </div>
  );
}
