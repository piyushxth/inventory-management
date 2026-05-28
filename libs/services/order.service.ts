import {
  findAdminOrdersRepo,
  findOrderByIdRepo,
  findUserOrdersRepo,
} from "@/libs/repositories/order.repo";
import { AdminOrderTableItem } from "../products.types";

export async function getAdminOrdersService(): Promise<AdminOrderTableItem[]> {
  const orders = await findAdminOrdersRepo();

  return orders.map((o: any) => ({
    id: String(o._id),

    status: o.status,

    totalAmount: o.totalAmount ?? 0,

    itemCount: o.itemCount ?? 0,

    contactEmail: o.contactEmail ?? "",

    notes: o.notes ?? "",

    createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : "",

    user: o.user
      ? {
          id: String(o.user._id),
          name: o.user.name ?? "",
          email: o.user.email ?? "",
        }
      : null,

    shippingAddress: o.shippingAddress
      ? {
          id: String(o.shippingAddress._id),
          label:
            o.shippingAddress.fullName ?? o.shippingAddress.addressLine1 ?? "",
        }
      : null,

    billingAddress: o.billingAddress
      ? {
          id: String(o.billingAddress._id),
          label:
            o.billingAddress.fullName ?? o.billingAddress.addressLine1 ?? "",
        }
      : null,
  }));
}

// export async function getOrderByIdService(
//   orderId: string,
// ): Promise<OrderDetail | null> {
//   return findOrderByIdRepo(orderId);
// }

// export async function getUserOrdersService(userId: string) {
//   return findUserOrdersRepo(userId);
// }
