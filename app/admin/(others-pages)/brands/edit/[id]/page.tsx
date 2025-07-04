"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import BrandEditForm from "./BrandEditForm";

interface Brand {
  _id: string;
  name: string;
  logo?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const fetchBrand = async (id: string) => {
  const res = await axios.get(`/api/brands/${id}`);
  return res.data;
};

export default function EditBrandPage() {
  const params = useParams();
  const brandId = params.id as string;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["brand", brandId],
    queryFn: () => fetchBrand(brandId),
    enabled: !!brandId,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <PageBreadcrumb pageTitle="Edit Brand" />
        <div className="text-center py-10 text-gray-500">Loading brand...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <PageBreadcrumb pageTitle="Edit Brand" />
        <div className="text-center py-10 text-red-500">
          Error loading brand: {error?.message}
        </div>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="p-6">
        <PageBreadcrumb pageTitle="Edit Brand" />
        <div className="text-center py-10 text-red-500">Brand not found</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageBreadcrumb pageTitle="Edit Brand" />
      <BrandEditForm brand={data.data} />
    </div>
  );
}
