"use client";
import React from "react";
import OrderForm from "../edit/[id]/OrderEditForm";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";

export default function AddOrderPage() {
  return (
    <div className="p-6">
      <PageBreadcrumb pageTitle="Add Order" />
      <OrderForm mode="add" />
    </div>
  );
}
