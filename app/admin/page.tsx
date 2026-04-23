import { EcommerceMetrics } from "@/components/admin/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "@/components/admin/ecommerce/MonthlySalesChart";
import MonthlyTarget from "@/components/admin/ecommerce/MonthlyTarget";
import StatisticsChart from "@/components/admin/ecommerce/StatisticsChart";
import DemographicCard from "@/components/admin/ecommerce/DemographicCard";
import RecentOrders from "@/components/admin/ecommerce/RecentOrders";

import connectMongoDB from "@/libs/connnectMongoDB";

// Admin dashboard reads live data from MongoDB on every request.
export const dynamic = "force-dynamic";

export default async function Ecommerce() {
  const data = [1, 2, 3];

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <EcommerceMetrics />

        <MonthlySalesChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <DemographicCard />
      </div>
    </div>
  );
}
