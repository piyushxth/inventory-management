import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/libs/connnectMongoDB";
import { Product } from "@/libs/models/product";
import { User } from "@/libs/models/users";
import { Order } from "@/libs/models/order";

export async function GET(req: NextRequest) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    if (q.length < 2) {
      // Return suggestions if query is too short
      const [products, users, orders] = await Promise.all([
        Product.find({})
          .sort({ createdAt: -1 })
          .limit(5)
          .select("_id name images availableQuantity selling_price"),
        User.find({})
          .sort({ createdAt: -1 })
          .limit(5)
          .select("_id name email profilePicture"),
        Order.find({})
          .sort({ createdDate: -1 })
          .limit(5)
          .select("_id customer items totalAmount orderStatus")
          .populate("items.product", "images name"),
      ]);
      return NextResponse.json({
        products: [],
        users: [],
        orders: [],
        suggestions: {
          products,
          users,
          orders,
        },
      });
    }

    // Search products by name or description
    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    })
      .limit(10)
      .select("_id name images availableQuantity selling_price");

    // Search users by name or email
    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    })
      .limit(10)
      .select("_id name email profilePicture");

    // Search orders by customer name, email, phone, or order _id
    let orderQuery: any = [
      { "customer.name": { $regex: q, $options: "i" } },
      { "customer.email": { $regex: q, $options: "i" } },
      { "customer.phone": { $regex: q, $options: "i" } },
    ];
    // If q looks like an ObjectId, also search by _id
    if (/^[a-f\d]{24}$/i.test(q)) {
      orderQuery.push({ _id: q });
    }
    const orders = await Order.find({ $or: orderQuery })
      .limit(10)
      .select("_id customer items totalAmount orderStatus")
      .populate("items.product", "images name");

    // If no results, provide suggestions
    let suggestions = undefined;
    if (products.length === 0 && users.length === 0 && orders.length === 0) {
      const [recentProducts, recentUsers, recentOrders] = await Promise.all([
        Product.find({})
          .sort({ createdAt: -1 })
          .limit(5)
          .select("_id name images availableQuantity selling_price"),
        User.find({})
          .sort({ createdAt: -1 })
          .limit(5)
          .select("_id name email profilePicture"),
        Order.find({})
          .sort({ createdDate: -1 })
          .limit(5)
          .select("_id customer items totalAmount orderStatus")
          .populate("items.product", "images name"),
      ]);
      suggestions = {
        products: recentProducts,
        users: recentUsers,
        orders: recentOrders,
      };
    }

    return NextResponse.json({
      products,
      users,
      orders,
      ...(suggestions ? { suggestions } : {}),
    });
  } catch (err) {
    return NextResponse.json(
      {
        products: [],
        users: [],
        orders: [],
        suggestions: { products: [], users: [], orders: [] },
        error: (err as Error).message,
      },
      { status: 500 }
    );
  }
}
