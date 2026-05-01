"use client";

import AdminTable, {
  AdminTableColumn,
} from "@/components/admin/common/AdminTable";
import { useEffect, useState } from "react";
import { Dropdown } from "./ui/dropdown/Dropdown";
import { DropdownItem } from "./ui/dropdown/DropdownItem";
import ProductActionModal from "./ProductsActionModels";
import ProductGeneralModal from "./ProductGeneralModal";
import { getProductBySlug } from "@/libs/actions/products/r";
import { AdminProductTableItem, ProductDetail } from "@/libs/products.types";

type ModalType = "actions" | "inventory" | "general" | "custom" | null;

export default function ProductsClient({
  products,
}: {
  products: AdminProductTableItem[];
}) {
  const [dropdownOpen, setDropdownOpen] = useState<string | number | null>(
    null,
  );
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(
    null,
  );
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [activeModal]);

  const columns: AdminTableColumn<AdminProductTableItem>[] = [
    {
      header: "Name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.primaryImageUrl || "/placeholder.png"}
            alt={row.name}
            className="w-10 h-10 object-cover rounded-md"
          />
          <span>{row.name}</span>
        </div>
      ),
    },

    {
      header: "Price",
      render: (row) => `${row.minPrice} - ${row.maxPrice}`,
    },
    {
      header: "Inventory",
      render: (row) => (
        <span>
          {row.totalStock} for {row.variantCount}{" "}
          {row.variantCount === 1 ? "variant" : "variants"}
        </span>
      ),
    },
    {
      header: "Status",
      render: (row) => {
        const isActive = row.isOnSale;

        return (
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              isActive
                ? "bg-green-100 text-green-500"
                : "bg-red-100 text-red-600"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      header: "Created",
      render: (row) => new Date(row.createdAt).toLocaleDateString("en-GB"),
    },
  ];

  return (
    <>
      <AdminTable
        columns={columns}
        data={products}
        onRowClick={async (row) => {
          setActiveModal("actions");

          const fullProduct = await getProductBySlug(row.slug);
          if (fullProduct) {
            console.log("Fetched full product:", fullProduct);
          } else {
            console.log(
              "Failed to fetch full product for slug:",
              products[0].slug,
            );
          }
          setSelectedProduct(fullProduct);
          setActiveModal("actions");
        }}
        actions={(row) => (
          <div className="flex items-center justify-center relative">
            <button
              className="dropdown-toggle text-gray-500 dark:text-gray-400"
              onClick={() =>
                setDropdownOpen(dropdownOpen === row.id ? null : row.id)
              }
              aria-label="Actions"
              type="button"
            >
              <svg
                className="fill-current"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.99902 10.245C6.96552 10.245 7.74902 11.0285 7.74902 11.995V12.005C7.74902 12.9715 6.96552 13.755 5.99902 13.755C5.03253 13.755 4.24902 12.9715 4.24902 12.005V11.995C4.24902 11.0285 5.03253 10.245 5.99902 10.245ZM17.999 10.245C18.9655 10.245 19.749 11.0285 19.749 11.995V12.005C19.749 12.9715 18.9655 13.755 17.999 13.755C17.0325 13.755 16.249 12.9715 16.249 12.005V11.995C16.249 11.0285 17.0325 10.245 17.999 10.245ZM13.749 11.995C13.749 11.0285 12.9655 10.245 11.999 10.245C11.0325 10.245 10.249 11.0285 10.249 11.995V12.005C10.249 12.9715 11.0325 13.755 11.999 13.755C12.9655 13.755 13.749 12.9715 13.749 12.005V11.995Z"
                  fill=""
                />
              </svg>
            </button>
            <Dropdown
              isOpen={dropdownOpen === row.id}
              onClose={() => setDropdownOpen(null)}
            >
              <DropdownItem>Edit</DropdownItem>
              <DropdownItem>Delete</DropdownItem>
            </Dropdown>
          </div>
        )}
      />

      {selectedProduct && (
        <>
          {activeModal === "actions" && (
            <ProductActionModal
              product={selectedProduct}
              onClose={() => {
                setActiveModal(null);
                setSelectedProduct(null);
              }}
              onSelect={(type) => setActiveModal(type)}
            />
          )}

          {activeModal === "general" && (
            <ProductGeneralModal
              product={selectedProduct}
              onClose={() => setActiveModal(null)}
            />
          )}
        </>
      )}
    </>
  );
}
