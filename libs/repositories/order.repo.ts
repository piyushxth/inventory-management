import mongoose, { PipelineStage } from "mongoose";

import connectMongoDB from "../connnectMongoDB";

import { Order } from "../models";

export async function findAdminOrdersRepo() {
  await connectMongoDB();

  const pipeline: PipelineStage[] = [
    // 👤 User
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },

    // 📦 Order Items
    {
      $lookup: {
        from: "orderitems",
        localField: "_id",
        foreignField: "orderId",
        as: "items",
      },
    },

    // 🚚 Shipping Address
    {
      $lookup: {
        from: "addresses",
        localField: "shippingAddressId",
        foreignField: "_id",
        as: "shippingAddress",
      },
    },

    // 🧾 Billing Address
    {
      $lookup: {
        from: "addresses",
        localField: "billingAddressId",
        foreignField: "_id",
        as: "billingAddress",
      },
    },

    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

    {
      $unwind: {
        path: "$shippingAddress",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $unwind: {
        path: "$billingAddress",
        preserveNullAndEmptyArrays: true,
      },
    },

    // 📊 Derived fields
    {
      $addFields: {
        itemCount: { $size: "$items" },
      },
    },

    // 🧹 Final shape
    {
      $project: {
        status: 1,

        totalAmount: 1,

        contactEmail: 1,

        notes: 1,

        createdAt: 1,

        itemCount: 1,

        user: {
          _id: "$user._id",
          name: "$user.name",
          email: "$user.email",
        },

        shippingAddress: {
          _id: "$shippingAddress._id",
          fullName: "$shippingAddress.fullName",
          addressLine1: "$shippingAddress.addressLine1",
        },

        billingAddress: {
          _id: "$billingAddress._id",
          fullName: "$billingAddress.fullName",
          addressLine1: "$billingAddress.addressLine1",
        },
      },
    },

    { $sort: { createdAt: -1 } },
  ];

  return Order.aggregate(pipeline);
}

export async function findOrderByIdRepo(orderId: string) {
  await connectMongoDB();

  return Order.findById(orderId);
}

export async function findUserOrdersRepo(userId: string) {
  await connectMongoDB();

  return Order.find({ userId }).sort({ createdAt: -1 });
}
