import ShopFeature from "@/components/client/ShopFeature";
import Instagram from "@/components/client/Instagram";
import ProductGallery from "@/components/client/ProductGallery";
import ProductFeatures from "@/components/client/ProductFeatures";
import { IProduct } from "@/libs/models/product";
import connectMongoDB from "@/libs/connnectMongoDB";
import { Product } from "@/libs/models/product";
import { Variant, IVariant } from "@/libs/models/variant"; // Import the Variant model
import AddToCartButton from "@/components/client/AddToCartButton";
import ProductVariantSelector from "@/components/client/ProductVariantSelector";

// Function to fetch product data with populated variants
async function getProduct(id: string) {
  await connectMongoDB();
  // First get the product
  const productDoc = await Product.findById(id).populate("category", "name");
  
  if (!productDoc) {
    return null;
  }
  
  // Then get the variants
  const variantIds = productDoc.variants;
  const variants = await Variant.find({ _id: { $in: variantIds } });
  
  // Combine the product with its variants
  const product = productDoc.toObject();
  // Create a new object with the correct type
  const populatedProduct: any = {
    ...product,
    variants: variants.map(v => v.toObject())
  };
  
  return JSON.parse(JSON.stringify(populatedProduct));
}

// Function to validate and filter image URLs
function validateImages(images: string[]): string[] {
  if (!images || !Array.isArray(images)) return [];
  
  return images.filter(image => {
    // Check if it's a valid relative path (starts with /) or absolute URL
    return (
      typeof image === 'string' && 
      image.length > 0 && 
      (image.startsWith('/') || image.startsWith('http://') || image.startsWith('https://'))
    );
  });
}

const ProductPage = async ({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
  const productId = (await params).id;
  const { variant, size } = await searchParams;
  const product: any | null = await getProduct(productId);

  // If product not found, return a simple not found message
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
      </div>
    );
  }

  // Get images based on selected variant
  let productImages = [...validateImages(product.mainImage)];
  
  if (variant) {
    // If a variant is selected, show images from that variant
    const selectedVariant = product.variants.find((v: any) => v.colorHex === variant);
    if (selectedVariant && selectedVariant.images) {
      productImages = [...validateImages(selectedVariant.images)];
    }
  } else if (product.variants && product.variants.length > 0) {
    // If no variant is selected, show images from the first variant
    const firstVariant = product.variants[0];
    if (firstVariant.images) {
      productImages = [...validateImages(firstVariant.images)];
    }
  }

  // Remove duplicates
  const uniqueImages = [...new Set(productImages)];

  return (
    <>
      <section className="relative border flex flex-col lg:flex-row pb-5 px-4 lg:px-10 lg:gap-2 lg:pt-20 lg:pb-12 ">
        {/* CLIENT COMPONENT */}
        <ProductGallery images={uniqueImages} productId={productId} />

        {/* Right-side dynamic details */}
        <div className="relative flex-none basis-[calc((100%-88px)/12*5+32px)] pl-8">
          <ul className="sticky top-4 gap-4 flex flex-col">
            <li className="flex flex-col gap-1.5 pt-[40px]">
              <div className="flex flex-col items-start gap-1.5">
                <span className="py-[3px] px-[6px] text-xs uppercase tracking-wide border rounded-[2px]">
                  Best Seller
                </span>
              </div>
            </li>
            <li className="mt-2 min-h-[22px] ">
              <div className="flex justify-left mb-[5px] flex-wrap items-start">
                {product.category && product.category.name}
              </div>
            </li>
            <li className="flex flex-col flex-wrap mt-[4px] lg:mt-auto gap-2 items-start justify-between">
              <h1 className="font-bold text-4xl uppercase tracking-tighter leading-tight text-balance">
                {product.name}
              </h1>
              <h2 className="leading-tight uppercase tracking-tighter text-balance text-2xl fw-bold">
                Rs {product.basePrice}
              </h2>
            </li>
            {product.variants && product.variants.length > 0 && (
              <li className="flex flex-col gap-2 mt-4">
                <ProductVariantSelector product={product} selectedVariant={variant as string | undefined} />
              </li>
            )}
            <li className="flex flex-col gap-2 mt-[40px]">
              {/* Use client component for Add to Cart button */}
              <AddToCartButton product={product} />
            </li>
            <li className="flex flex-col mt-[24px] mb-4">
              <ul className="list-disc pl-[1em] gap-1 break-words flex flex-col leading-[1.4]">
                <li>
                  <strong>Product Details:</strong> {product.description}
                </li>
                <li>
                  <strong>Available Quantity:</strong> {product.availableQuantity} items in stock
                </li>
                <li>
                  <strong>Sold:</strong> {product.soldQuantity} items sold
                </li>
              </ul>
              <a
                href="#more"
                className="uppercase mt-2 text-sm fw-semibold tracking-wide text-balance"
              >
                View More
              </a>
            </li>
          </ul>
        </div>
      </section>

      <ShopFeature />
      <ProductFeatures />
      <Instagram />
    </>
  );
};

export default ProductPage;