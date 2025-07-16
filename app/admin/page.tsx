import { EcommerceMetrics } from "@/components/admin/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "@/components/admin/ecommerce/MonthlySalesChart";
import MonthlyTarget from "@/components/admin/ecommerce/MonthlyTarget";
import StatisticsChart from "@/components/admin/ecommerce/StatisticsChart";
import DemographicCard from "@/components/admin/ecommerce/DemographicCard";
import RecentOrders from "@/components/admin/ecommerce/RecentOrders";

import connectMongoDB from "@/libs/connnectMongoDB";
import { User } from "@/libs/models/users";
import Roles from "@/libs/models/roles";
import { Order } from "@/libs/models/order";
import { Product } from "@/libs/models/product";

export default async function Ecommerce() {
  await connectMongoDB();

  // 1. Counts
  const userRole = await Roles.findOne({ name: "user" });
  const usersCount = userRole
    ? await User.countDocuments({ roles: userRole._id })
    : 0;
  const [ordersCount] = await Promise.all([Order.countDocuments()]);

  // 2. Monthly sales data (example: last 12 months)
  const now = new Date();
  const year = 2025; // Use the year of your test data

  const monthlySales = await Order.aggregate([
    {
      $match: {
        createdDate: {
          $gte: new Date(`${year}-01-01T00:00:00.000Z`),
          $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
        },
        orderStatus: "Delivered",
        paymentStatus: "Paid",
      },
    },
    {
      $group: {
        _id: { month: { $month: "$createdDate" } },
        totalSales: { $sum: "$totalAmount" },
      },
    },
    { $sort: { "_id.month": 1 } },
  ]);

  const salesData = Array(12).fill(0);
  monthlySales.forEach(({ _id, totalSales }) => {
    salesData[_id.month - 1] = totalSales;
  });

  // 3. Current month revenue
  const monthlyTarget = 20000; // Set your monthly target (could be dynamic from DB/config)

  const startOfThisMonth = new Date(year, now.getMonth(), 1);
  const currentMonthRevenueAgg = await Order.aggregate([
    {
      $match: {
        createdDate: { $gte: startOfThisMonth },
        orderStatus: "Delivered",
        paymentStatus: "Paid",
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$totalAmount" },
      },
    },
  ]);
  const currentMonthRevenue = currentMonthRevenueAgg[0]?.total || 0;
  const progress = (currentMonthRevenue / monthlyTarget) * 100;

  // 4. Customers per country
  const customersByCountry = await User.aggregate([
    { $group: { _id: "$country", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // 5. Recent orders
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // Pass data as props
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <EcommerceMetrics usersCount={usersCount} ordersCount={ordersCount} />
        <MonthlySalesChart data={salesData} />
      </div>
      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget
          target={monthlyTarget}
          revenue={currentMonthRevenue}
          progress={progress}
        />
      </div>
      <div className="col-span-12">
        <StatisticsChart data={monthlySales} />
      </div>

      <div className="col-span-12 xl:col-span-12">
        <RecentOrders />
      </div>
    </div>
  );
}
