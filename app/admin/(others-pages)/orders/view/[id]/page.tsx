import React from "react";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import ComponentCard from "@/components/admin/common/ComponentCard";
import { notFound } from "next/navigation";
import axios from "axios";
import { TOrderRetrieve } from "@/libs/zod_schema/orderRetrieve";

const fetchOrderById = async (id: string): Promise<TOrderRetrieve> => {
  const orderData = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}`
  );
  return orderData.data.data;
};

const OrderViewPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const id = (await params).id;
  const order = await fetchOrderById(id);

  return (
    <div className="p-6">
      <PageBreadcrumb pageTitle="Order Details" />
      <a
        className="mb-4 inline-block bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
        href="/admin/orders"
      >
        Back to Orders
      </a>
      <div className="space-y-6">
        <ComponentCard title="Customer Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Name:</strong> {order.customer?.name}
            </div>
            <div>
              <strong>Email:</strong> {order.customer?.email}
            </div>
            <div>
              <strong>Phone:</strong> {order.customer?.phone}
            </div>
            <div>
              <strong>Province:</strong> {order.customer?.province}
            </div>
            <div>
              <strong>City:</strong> {order.customer?.city}
            </div>
            <div>
              <strong>Address:</strong> {order.customer?.address}
            </div>
            <div>
              <strong>Landmark:</strong> {order.customer?.landmark}
            </div>
          </div>
        </ComponentCard>
        <ComponentCard title="Order Items">
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Product</th>
                  <th className="px-4 py-2 border">Quantity</th>
                  <th className="px-4 py-2 border">Price</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 border">
                      {item.product?.name || item.product}
                    </td>
                    <td className="px-4 py-2 border">{item.quantity}</td>
                    <td className="px-4 py-2 border">
                      ${item.price.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ComponentCard>
        <ComponentCard title="Order Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Status:</strong> {order.orderStatus}
            </div>
            <div>
              <strong>Payment Status:</strong> {order.paymentStatus}
            </div>
            <div>
              <strong>Payment Method:</strong> {order.paymentMethod}
            </div>
            <div>
              <strong>Discount:</strong> ${order.discount?.toFixed(2) ?? 0}
            </div>
            <div>
              <strong>Additional Price:</strong> $
              {order.additionalPrice?.toFixed(2) ?? 0}
            </div>
            <div>
              <strong>Total Amount:</strong> $
              {order.totalAmount?.toFixed(2) ?? 0}
            </div>
            <div>
              <strong>Order Note:</strong> {order.orderNote || "-"}
            </div>
            <div>
              <strong>Created:</strong>{" "}
              {order.createdDate
                ? new Date(order.createdDate).toLocaleString()
                : "-"}
            </div>
            <div>
              <strong>Last Modified:</strong>{" "}
              {order.modifiedDate
                ? new Date(order.modifiedDate).toLocaleString()
                : "-"}
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
};

export default OrderViewPage;
