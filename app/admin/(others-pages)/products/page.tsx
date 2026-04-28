import ProductsClient from "@/components/admin/ProductsClient";
import { getAdminProducts } from "@/libs/actions/products/read";

export default async function page() {
  const products = await getAdminProducts();
  console.log("Fetched products:", products);
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Products</h1>
      <ProductsClient products={products} />
    </div>
  );
}
