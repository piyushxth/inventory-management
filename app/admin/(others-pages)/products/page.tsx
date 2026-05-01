import ProductsClient from "@/components/admin/ProductsClient";
import { getAdminProducts } from "@/libs/actions/products/r";

export default async function page() {
  const products = await getAdminProducts();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Products</h1>
      <ProductsClient products={products} />
    </div>
  );
}
