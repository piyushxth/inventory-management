import connectMongoDB from "../connnectMongoDB";
import { Order } from "../models/order";
import { Product } from "../models/product";
import mongoose from "mongoose";

export async function seedOrder() {
  try {
    await connectMongoDB({ seed: true });
    await Order.deleteMany({});
    console.log("🗑️ All existing orders deleted.");

    // Fetch the first product
    const firstProduct = await Product.findOne();
    if (!firstProduct) {
      throw new Error("No products found. Please seed products first.");
    }
    const firstProductId = firstProduct._id;

    const orderData = {
      customer: {
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "+1234567890",
        province: "California",
        city: "Los Angeles",
        address: "456 Elm St",
        landmark: "Near City Mall",
      },
      items: [
        {
          product: firstProductId, // Use the first product's ObjectId
          quantity: 1,
          price: 150,
        },
      ],
      totalAmount: 150,
      discount: 10,
      additionalPrice: 0,
      orderStatus: "Pending",
      paymentStatus: "Unpaid",
      paymentMethod: "COD",
      orderNote: "Please deliver between 9am-5pm.",
    };

    const newOrder = new Order(orderData);
    await newOrder.save();
    console.log(`✅ Seeded order for customer: ${orderData.customer.name}`);
    console.log("🎉 Order seeding completed.");
  } catch (err) {
    console.error("❌ Error during order seeding:", err);
    throw err;
  }
}
