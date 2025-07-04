import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import { TProductCreate } from "@/libs/zod_schema/products/productCreate";
import axios from "axios";
import ProductEditForm from "../ProductEditForm";

const fetchProductById = async (id: string) => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`
  );

  console.log("Product", response.data.data);
  return response.data.data;
};

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const id = (await params).id;
  const productData: TProductCreate = await fetchProductById(id);
  console.log("Package ID Page Rendered: ", id);

  return (
    <div className="p-6">
      <PageBreadcrumb pageTitle="Edit Product" />
      <ProductEditForm product={productData} />
    </div>
  );
};

export default page;
