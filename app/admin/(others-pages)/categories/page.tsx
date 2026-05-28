import CategoryTable from "@/components/admin/CategoryTable";
import { getCategories } from "@/libs/actions/categories/read";

export default async function CategoriesPage() {
  const categories = await getCategories();
  console.log("Fetched categories:", categories);
  return (
    <div>
      {/* <PageBreadcrumb pageTitle="Categories" /> */}
      <CategoryTable categories={categories} />
    </div>
  );
}
