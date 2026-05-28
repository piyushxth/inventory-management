import OrderTable from "@/components/admin/OrderTable";
import { getAdminOrders } from "@/libs/actions/orders/read";
import React from "react";

export default async function page() {
  const orders = await getAdminOrders();
  console.log(orders);
  return (
    <div>
      <OrderTable orders={orders} />
    </div>
  );
}
