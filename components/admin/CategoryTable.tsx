"use client";
import React, { useState } from "react";
import AdminTable, { AdminTableColumn } from "./common/AdminTable";
import { Dropdown } from "./ui/dropdown/Dropdown";
import { DropdownItem } from "./ui/dropdown/DropdownItem";
import { CategoryType } from "@/libs/products.types";
import Input from "./form/input/InputField";
import Button from "./ui/button/Button";
import CategoryAddModal from "./CategoryAddModal";
import CategoryEditModal from "./CategoryEditModal";
import { getCategoryBySlug } from "@/libs/actions/categories/read";

const columns: AdminTableColumn<CategoryType>[] = [
  { header: "Name", accessor: "name", searchValue: (row) => row.name },
  { header: "Slug", accessor: "slug", searchValue: (row) => row.slug },

  {
    header: "Created",
    render: (row) => new Date(row.createdAt).toISOString().split("T")[0],
    searchValue: (row) => new Date(row.createdAt).toISOString().split("T")[0],
  },
];
type ModalType = "editCategory" | "addCategory" | null;

const CategoryTable = ({ categories }: { categories: CategoryType[] }) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(
    null,
  );
  const [dropdownOpen, setDropdownOpen] = useState<string | number | null>(
    null,
  );
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const filtered = categories.filter((row) => {
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
    <div>
      <div className="mb-4 flex flex-col gap-2 px-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Category
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
          <Button size="sm" onClick={() => setActiveModal("addCategory")}>
            Add Category
          </Button>
        </div>
      </div>
      <AdminTable
        columns={columns}
        data={filtered}
        onRowClick={async (row) => {
          setActiveModal("editCategory");
          try {
            const fullCategory = await getCategoryBySlug(row.slug);
            console.log("Fetched Category Details:", fullCategory);
            if (!fullCategory)
              console.log(
                "Failed to fetch category details for slug:",
                row.slug,
              );
            setSelectedCategory(fullCategory);
          } catch (error) {
            console.error(
              "Error fetching category details for slug:",
              row.slug,
              error,
            );
            setSelectedCategory(null);
          }
          // const fullProduct = await getProductBySlug(row.slug);
          // console.log("Fetched Product Details:", fullProduct);
          // if (!fullProduct)
          //   console.log("Failed to fetch product details for slug:", row.slug);
          // setSelectedProduct(fullProduct);
        }}
        actions={(row) => (
          <div className="flex items-center justify-left relative">
            <button
              className="dropdown-toggle text-red-500 dark:text-red-400"
              onClick={() =>
                setDropdownOpen(dropdownOpen === row.id ? null : row.id)
              }
              aria-label="delete"
              type="button"
            >
              X
            </button>
          </div>
        )}
      />
      {activeModal === "addCategory" && (
        <CategoryAddModal onClose={() => setActiveModal(null)} />
      )}
      {selectedCategory && (
        <>
          {activeModal === "editCategory" && (
            <CategoryEditModal
              data={selectedCategory}
              onClose={() => setActiveModal(null)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default CategoryTable;
