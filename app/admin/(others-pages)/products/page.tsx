import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import ProductsClient from "@/components/admin/ProductsClient";
import { getAdminProducts } from "@/libs/actions/products/r";

export default async function page() {
  const products = await getAdminProducts();

  return (
    <div>
      {/* <PageBreadcrumb pageTitle="Products" /> */}

      <ProductsClient products={products} />
    </div>
  );
}
