import React from "react";
import OrderForm from "./OrderEditForm";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const id = (await params).id;
  return (
    <div className="p-6">
      <PageBreadcrumb pageTitle="Edit Order" />
      <OrderForm mode="edit" orderId={id} />
    </div>
  );
};
export default page;
