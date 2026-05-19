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
import {
  AdminProductTableItem,
  CategoryType,
  Gender,
  ProductDetail,
} from "@/libs/products.types";
import { getCategories } from "@/libs/actions/categories/read";
import { getGenders } from "@/libs/actions/genders/read";
import ProductInventoryModal from "./ProductsInventoryModal";
import Input from "./form/input/InputField";
import Button from "./ui/button/Button";
import ProductAddModal from "./ProductAddModal";

type ModalType =
  | "addProduct"
  | "actions"
  | "inventory"
  | "general"
  | "custom"
  | null;

export default function ProductsClient({
  products,
}: {
  products: AdminProductTableItem[];
}) {
  const [search, setSearch] = useState("");

  const [dropdownOpen, setDropdownOpen] = useState<string | number | null>(
    null,
  );
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(
    null,
  );
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [genders, setGenders] = useState<Gender[]>([]);

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  // useEffect(() => {
  //   console.log("Active Modal Changed:", activeModal);
  // }, [activeModal]);
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

  useEffect(() => {
    async function fetchMeta() {
      const [cats, gens] = await Promise.all([getCategories(), getGenders()]);

      setCategories(cats);
      setGenders(gens);
    }

    fetchMeta();
  }, []);

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

      searchValue: (row) => row.name,
    },

    {
      header: "Price",

      render: (row) => `${row.minPrice} - ${row.maxPrice}`,

      searchValue: (row) => `${row.minPrice} ${row.maxPrice}`,
    },

    {
      header: "Inventory",

      render: (row) => (
        <span>
          {row.totalStock} for {row.variantCount}{" "}
          {row.variantCount === 1 ? "variant" : "variants"}
        </span>
      ),

      searchValue: (row) => `${row.totalStock} ${row.variantCount}`,
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

      searchValue: (row) => (row.isOnSale ? "active" : "inactive"),
    },

    {
      header: "Created",

      render: (row) => new Date(row.createdAt).toISOString().split("T")[0],

      searchValue: (row) => new Date(row.createdAt).toISOString().split("T")[0],
    },
  ];
  const filtered = products.filter((row) => {
    return columns.some((col) => {
      let value = "";

      if (col.searchValue) {
        value = col.searchValue(row);
      } else if (col.accessor) {
        value = String(row[col.accessor] ?? "");
      }

      return value.toLowerCase().includes(search.toLowerCase());
    });
  });
  return (
    <>
      <div className="mb-4 flex flex-col gap-2 px-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Products
        </h3>
        <div className="flex items-center gap-2">
          <form
            className="flex-1 max-w-xs"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2">
                <svg
                  className="fill-gray-500 dark:fill-gray-400"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.04199 9.37381C3.04199 5.87712 5.87735 3.04218 9.37533 3.04218C12.8733 3.04218 15.7087 5.87712 15.7087 9.37381C15.7087 12.8705 12.8733 15.7055 9.37533 15.7055C5.87735 15.7055 3.04199 12.8705 3.04199 9.37381ZM9.37533 1.54218C5.04926 1.54218 1.54199 5.04835 1.54199 9.37381C1.54199 13.6993 5.04926 17.2055 9.37533 17.2055C11.2676 17.2055 13.0032 16.5346 14.3572 15.4178L17.1773 18.2381C17.4702 18.531 17.945 18.5311 18.2379 18.2382C18.5308 17.9453 18.5309 17.4704 18.238 17.1775L15.4182 14.3575C16.5367 13.0035 17.2087 11.2671 17.2087 9.37381C17.2087 5.04835 13.7014 1.54218 9.37533 1.54218Z"
                    fill=""
                  />
                </svg>
              </span>
              <Input
                type="text"
                placeholder="Search..."
                className="pl-[42px] h-[42px]"
                onChange={(e) => {
                  setSearch(e.target.value);
                  // setPage(1);
                }}
              />
            </div>
          </form>
          <Button size="sm" onClick={() => setActiveModal("addProduct")}>
            Add Product
          </Button>
        </div>
      </div>
      <AdminTable
        columns={columns}
        data={filtered}
        onRowClick={async (row) => {
          setActiveModal("actions");
          try {
            const fullProduct = await getProductBySlug(row.slug);
            console.log("Fetched Product Details:", fullProduct);
            if (!fullProduct)
              console.log(
                "Failed to fetch product details for slug:",
                row.slug,
              );
            setSelectedProduct(fullProduct);
          } catch (error) {
            console.error(
              "Error fetching product details for slug:",
              row.slug,
              error,
            );
            setSelectedProduct(null);
          }
          // const fullProduct = await getProductBySlug(row.slug);
          // console.log("Fetched Product Details:", fullProduct);
          // if (!fullProduct)
          //   console.log("Failed to fetch product details for slug:", row.slug);
          // setSelectedProduct(fullProduct);
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
      {activeModal === "addProduct" && (
        <ProductAddModal onClose={() => setActiveModal(null)} />
      )}
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
              product={selectedProduct!}
              categories={categories}
              genders={genders}
              onClose={() => setActiveModal(null)}
            />
          )}

          {activeModal === "inventory" && (
            <ProductInventoryModal
              product={selectedProduct}
              onClose={() => setActiveModal(null)}
            />
          )}
        </>
      )}
    </>
  );
}
