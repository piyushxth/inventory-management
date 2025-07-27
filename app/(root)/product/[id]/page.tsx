import ShopFeature from "@/components/client/ShopFeature";
import Instagram from "@/components/client/Instagram";
import ProductGallery from "@/components/client/ProductGallery";
import ProductFeatures from "@/components/client/ProductFeatures";

const allImages = [
  "/client/product/f1.jpg",
  "/client/product/product1.webp",
  "/client/product/product1.webp",
  "/client/product/product1.webp",
  "/client/product/product1.webp",
  "/client/product/product1.webp",
  "/client/product/product1.webp",
  "/client/product/product1.webp",
  "/client/product/product1.webp",
  "/client/product/product1.webp",
  "/client/product/product1.webp",
  "/client/product/product1.webp",
];

const page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const productId = (await params).slug;

  return (
    <>
      <section className="relative border flex flex-col lg:flex-row pb-5 px-4 lg:px-10 lg:gap-2 lg:pt-20 lg:pb-12 ">
        {/* CLIENT COMPONENT */}
        <ProductGallery images={allImages} productId={productId} />

        {/* Right-side static details */}
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
                asdf
              </div>
            </li>
            <li className="flex flex-col flex-wrap mt-[4px] lg:mt-auto gap-2 items-start justify-between">
              <h1 className="font-bold text-4xl uppercase tracking-tighter leading-tight text-balance">
                Hybrid Backpack 30L
              </h1>
              <h2 className="leading-tight uppercase tracking-tighter text-balance text-2xl fw-bold">
                Rs 37300
              </h2>
            </li>
            <li className="flex flex-col gap-2 mt-4">
              <div className="relative bg-black w-5 h-5 rounded-[2px] border outline-offset-2outline outline-[0.5px] outline-transparent"></div>
              <span className="text-xs">All Black</span>
            </li>
            <li className="flex flex-col gap-2 mt-[40px]">
              <button className="bg-[#e6ff5b] flex text-black bg-background max-w-[320px] items-center relative rounded-[3px] pt-2 pr-2.5 pb-2 pl-2 border justify-between">
                Add To Cart
                <span>---</span>
              </button>
            </li>
            <li className="flex flex-col mt-[24px] mb-4">
              <ul className="list-disc pl-[1em] gap-1 break-words flex flex-col leading-[1.4]">
                <li>
                  <strong>Clamshell easy packing</strong> with split zoned
                  compartments. Separate your laptop and organise your gym kit,
                  clothes and essentials.
                </li>
                <li>
                  <strong>Clamshell easy packing</strong> with split zoned
                  compartments. Separate your laptop and organise your gym kit,
                  clothes and essentials.
                </li>
                <li>
                  <strong>Clamshell easy packing</strong> with split zoned
                  compartments. Separate your laptop and organise your gym kit,
                  clothes and essentials.
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

export default page;
