"use server";

import { AdminOrderTableItem } from "@/libs/products.types";
import { getAdminOrdersService } from "@/libs/services/order.service";

export async function getAdminOrders(): Promise<AdminOrderTableItem[]> {
  return getAdminOrdersService();
}

// export async function getOrderById(orderId: string) {
//   return getOrderByIdService(orderId);
// }

// export async function getUserOrders(userId: string) {
//   return getUserOrdersService(userId);
// }
