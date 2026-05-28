"use client";

import { CategoryType, Color, Size } from "@/libs/products.types";
import { productAddSchema, VariantSchema } from "@/libs/validations/product";
import React, { useEffect, useState } from "react";
import ComponentCard from "./common/ComponentCard";
import Label from "./form/Label";
import Input from "./form/input/InputField";
import TextArea from "./form/input/TextArea";
import { getColors } from "@/libs/actions/colors/read";
import { getSizes } from "@/libs/actions/sizes/read";
import VariantImageModal from "./VariantImageModal";
import { createProductWithVariants } from "@/libs/actions/products/a";
type VariantMap = Record<
  string,
  {
    id?: string;
    sku: string;
    price: number;
    salePrice?: number | null;
    inStock: number;
    images: {
      id: string;
      url: string;
      isPrimary: boolean;
      sortOrder: number;
    }[];
  }
>;
type Props = {
  categories: CategoryType[];
  genders: { id: string; label: string; slug: string }[];
  onClose: () => void;
};

type Step = 1 | 2;
function generateVariantRows(colorIds: string[], sizeIds: string[]) {
  const rows: { colorId: string | null; sizeId: string | null }[] = [];

  if (colorIds.length && sizeIds.length) {
    colorIds.forEach((c) => {
      sizeIds.forEach((s) => {
        rows.push({ colorId: c, sizeId: s });
      });
    });
    return rows;
  }

  if (colorIds.length) {
    return colorIds.map((c) => ({ colorId: c, sizeId: null }));
  }

  if (sizeIds.length) {
    return sizeIds.map((s) => ({ colorId: null, sizeId: s }));
  }

  return [];
}
function validateVariants(variantMap: VariantMap) {
  const errors: Record<string, string> = {};

  const variants = Object.entries(variantMap).map(([key, v]) => {
    const [colorId, sizeId] = key.split("-");

    return {
      key,
      data: {
        id: v.id,
        colorId,
        sizeId,
        sku: v.sku,
        price: v.price,
        salePrice: v.salePrice ?? null,
        inStock: v.inStock,
        images: v.images ?? [],
      },
    };
  });

  const skuMap = new Map<string, string>();
  variants.forEach(({ key, data }) => {
    if (!data.sku) return;

    // 🔥 normalize
    const normalizedSku = data.sku.trim().toUpperCase();

    if (skuMap.has(normalizedSku)) {
      // current field
      errors[`${key}.sku`] = "Duplicate SKU";

      // original field
      const originalKey = skuMap.get(normalizedSku)!;
      errors[`${originalKey}.sku`] = "Duplicate SKU";
    } else {
      skuMap.set(normalizedSku, key);
    }
  });

  variants.forEach(({ key, data }) => {
    const isEmpty =
      data.sku.trim() === "" &&
      data.price === 0 &&
      data.inStock === 0 &&
      data.images.length === 0;

    if (isEmpty) return;

    const result = VariantSchema.safeParse(data);

    if (!result.success) {
      result.error.errors.forEach((err) => {
        const field = err.path[0];
        errors[`${key}.${field}`] = err.message;
      });
    }

    if (data.salePrice && data.salePrice > data.price) {
      errors[`${key}.salePrice`] = "Sale price cannot exceed price";
    }
  });

  return errors;
}
const ProductAddModal = ({ onClose, categories, genders }: Props) => {
  const [step, setStep] = React.useState<Step>(1);
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [allColors, setAllColors] = useState<Color[]>([]);
  const [allSizes, setAllSizes] = useState<Size[]>([]);

  const [selectedColorIds, setSelectedColorIds] = useState<string[]>([]);
  const [selectedSizeIds, setSelectedSizeIds] = useState<string[]>([]);

  // EMPTY for create
  const [variantMap, setVariantMap] = useState<VariantMap>({});

  const [activeVariantKey, setActiveVariantKey] = useState<string | null>(null);
  const rows = generateVariantRows(selectedColorIds, selectedSizeIds);
  function updateVariant(key: string, updates: Partial<VariantMap[string]>) {
    setVariantMap((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {
          sku: "",
          price: 0,
          salePrice: null,
          inStock: 0,
          images: [],
        }),
        ...updates,
      },
    }));
  }
  const [general, setGeneral] = useState({
    name: "",
    slug: "",
    description: "",
    categoryId: "",
    genderId: "",
    isOnSale: true,
  });

  useEffect(() => {
    async function loadData() {
      const colors = await getColors();
      const sizes = await getSizes();

      setAllColors(colors);
      setAllSizes(sizes);
    }

    loadData();
  }, []);

  function updateGeneral(key: keyof typeof general, value: string | boolean) {
    setGeneral((prev) => ({
      ...prev,
      [key]: value,
    }));

    // clear error while typing
    setFieldErrors((prev) => {
      const clone = { ...prev };

      delete clone[key];

      return clone;
    });
  }

  function validateGeneral() {
    const result = productAddSchema.safeParse(general);

    if (result.success) {
      return {};
    }

    const errors: Record<string, string> = {};

    result.error.errors.forEach((err) => {
      const field = err.path[0] as string;

      errors[field] = err.message;
    });

    return errors;
  }

  function handleNext() {
    setSubmitError("");

    const errors = validateGeneral();

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    setStep(2);
  }
  function handleBack() {
    setSubmitError("");
    setFieldErrors({});
    setStep(1);
  }

  async function onSubmit() {
    try {
      setSubmitError("");
      setIsSaving(true);

      // -----------------------------------
      // STEP 1: VALIDATE GENERAL INFO FIRST
      // -----------------------------------

      const generalResult = productAddSchema.safeParse(general);

      if (!generalResult.success) {
        const errors: Record<string, string> = {};

        generalResult.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          errors[field] = err.message;
        });

        setFieldErrors(errors);
        setStep(1);
        return;
      }

      // -----------------------------------
      // STEP 2: BUILD VARIANTS PAYLOAD
      // -----------------------------------

      const variants = Object.entries(variantMap)
        .map(([key, v]) => {
          const [colorId, sizeId] = key.split("-");

          return {
            colorId,
            sizeId,
            sku: (v.sku || "").trim().toUpperCase(),
            price: Number(v.price || 0),
            salePrice: v.salePrice ?? null,
            inStock: Number(v.inStock || 0),

            images: (v.images || []).map((img, index) => ({
              url: img.url,
              isPrimary: img.isPrimary,
              sortOrder: index,
            })),
          };
        })

        // remove empty variants
        .filter(
          (v) => v.sku || v.price > 0 || v.inStock > 0 || v.images.length > 0,
        );

      // -----------------------------------
      // STEP 3: VALIDATE VARIANTS
      // -----------------------------------

      const variantErrors = validateVariants(variantMap);

      if (Object.keys(variantErrors).length > 0) {
        setFieldErrors(variantErrors);
        setStep(2);
        return;
      }

      // -----------------------------------
      // STEP 4: FINAL PAYLOAD
      // -----------------------------------

      const payload = {
        name: general.name,
        slug: general.slug,
        description: general.description,
        categoryId: general.categoryId,
        genderId: general.genderId,
        isOnSale: general.isOnSale,

        variants,
      };

      console.log("CREATE PAYLOAD 🚀", payload);

      // -----------------------------------
      // STEP 5: API CALL
      // -----------------------------------

      await createProductWithVariants(payload); // your server action

      onClose();
    } catch (err) {
      console.error(err);
      setSubmitError("Failed to create product");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] bg-white dark:bg-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-gray-700 sticky top-0 z-10">
          <h2 className="text-lg font-semibold dark:text-white">Add Product</h2>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
          >
            ✕
          </button>
        </header>

        {/* Step Indicator */}
        <div className="overflow-y-auto">
          <div className="flex items-center gap-4 border-b px-6 py-5">
            {/* Step 1 */}
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                  step === 1 ? "bg-black text-white" : "bg-green-500 text-white"
                }`}
              >
                {step === 2 ? "✓" : "1"}
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Step 1
                </p>

                <p
                  className={`text-sm font-semibold ${
                    step === 1 ? "text-black" : "text-green-600"
                  }`}
                >
                  General Information
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-[2px] flex-1 bg-gray-200" />

            {/* Step 2 */}
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                  step === 2
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Step 2
                </p>

                <p
                  className={`text-sm font-semibold ${
                    step === 2 ? "text-black" : "text-gray-400"
                  }`}
                >
                  Variants & Inventory
                </p>
              </div>
            </div>
          </div>
          {/* Form */}
          <form className="space-y-6">
            <div className="max-h-[70vh] px-6 py-6">
              {/* STEP 1 */}
              {step === 1 && (
                <ComponentCard className="space-y-6">
                  {/* NAME */}
                  <div>
                    <Label>Name</Label>

                    <Input
                      type="text"
                      value={general.name}
                      onChange={(e) => updateGeneral("name", e.target.value)}
                      placeholder="Enter product name"
                    />

                    {fieldErrors.name && (
                      <p className="mt-1 text-sm text-red-500">
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>

                  {/* SLUG */}
                  <div>
                    <Label>Slug</Label>

                    <Input
                      type="text"
                      value={general.slug}
                      onChange={(e) => updateGeneral("slug", e.target.value)}
                      placeholder="product-slug"
                    />

                    {fieldErrors.slug && (
                      <p className="mt-1 text-sm text-red-500">
                        {fieldErrors.slug}
                      </p>
                    )}
                  </div>

                  {/* DESCRIPTION */}
                  <div>
                    <Label>Description</Label>

                    <TextArea
                      placeholder="Enter description"
                      rows={5}
                      value={general.description}
                      onChange={(e) =>
                        updateGeneral("description", e.target.value)
                      }
                    />

                    {fieldErrors.description && (
                      <p className="mt-1 text-sm text-red-500">
                        {fieldErrors.description}
                      </p>
                    )}
                  </div>

                  {/* CATEGORY */}
                  <div>
                    <Label>Category</Label>

                    <select
                      value={general.categoryId}
                      onChange={(e) =>
                        updateGeneral("categoryId", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black dark:border-gray-600 dark:bg-gray-800"
                    >
                      <option value="">Select Category</option>

                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>

                    {fieldErrors.categoryId && (
                      <p className="mt-1 text-sm text-red-500">
                        {fieldErrors.categoryId}
                      </p>
                    )}
                  </div>

                  {/* GENDER */}
                  <div>
                    <Label>Gender</Label>

                    <select
                      value={general.genderId}
                      onChange={(e) =>
                        updateGeneral("genderId", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black dark:border-gray-600 dark:bg-gray-800"
                    >
                      <option value="">Select Gender</option>

                      {genders.map((gender) => (
                        <option key={gender.id} value={gender.id}>
                          {gender.label}
                        </option>
                      ))}
                    </select>

                    {fieldErrors.genderId && (
                      <p className="mt-1 text-sm text-red-500">
                        {fieldErrors.genderId}
                      </p>
                    )}
                  </div>

                  {/* STATUS */}
                  <div>
                    <Label>Status</Label>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => updateGeneral("isOnSale", true)}
                        className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                          general.isOnSale
                            ? "border-black bg-black text-white"
                            : "border-gray-300"
                        }`}
                      >
                        Active
                      </button>

                      <button
                        type="button"
                        onClick={() => updateGeneral("isOnSale", false)}
                        className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                          !general.isOnSale
                            ? "border-black bg-black text-white"
                            : "border-gray-300"
                        }`}
                      >
                        Inactive
                      </button>
                    </div>
                  </div>
                </ComponentCard>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="">
                  {/* COLORS */}
                  <div>
                    <p className="text-sm font-medium mb-2">Colors</p>

                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedColorIds.map((id) => {
                        const color = allColors.find((c) => c.id === id);

                        return (
                          <span
                            key={id}
                            className="px-2 py-1 bg-gray-200 rounded text-sm flex items-center gap-2"
                          >
                            {color?.name}

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedColorIds((prev) =>
                                  prev.filter((x) => x !== id),
                                )
                              }
                            >
                              ✕
                            </button>
                          </span>
                        );
                      })}
                    </div>

                    <select
                      onChange={(e) => {
                        const id = e.target.value;
                        if (!id) return;

                        if (!selectedColorIds.includes(id)) {
                          setSelectedColorIds((prev) => [...prev, id]);
                        }
                      }}
                      className="border p-2 rounded w-full"
                    >
                      <option value="">Select color</option>

                      {allColors.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* SIZES */}
                  <div>
                    <p className="text-sm font-medium mb-2">Sizes</p>

                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedSizeIds.map((id) => {
                        const size = allSizes.find((s) => s.id === id);

                        return (
                          <span
                            key={id}
                            className="px-2 py-1 bg-gray-200 rounded text-sm flex items-center gap-2"
                          >
                            {size?.name}

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedSizeIds((prev) =>
                                  prev.filter((x) => x !== id),
                                )
                              }
                            >
                              ✕
                            </button>
                          </span>
                        );
                      })}
                    </div>

                    <select
                      onChange={(e) => {
                        const id = e.target.value;
                        if (!id) return;

                        if (!selectedSizeIds.includes(id)) {
                          setSelectedSizeIds((prev) => [...prev, id]);
                        }
                      }}
                      className="border p-2 rounded w-full"
                    >
                      <option value="">Select size</option>

                      {allSizes.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <table className="w-full border">
                    <thead>
                      <tr className="bg-gray-100 text-left">
                        <th className="p-2">Variants</th>
                        <th className="p-2">Price</th>
                        <th className="p-2">Stock</th>
                        <th className="p-2">SKU</th>
                      </tr>
                    </thead>

                    <tbody>
                      {rows.map((row) => {
                        const key = `${row.colorId}-${row.sizeId}`;
                        const data = variantMap[key];

                        const color = allColors.find(
                          (c) => c.id === row.colorId,
                        );
                        const size = allSizes.find((s) => s.id === row.sizeId);

                        return (
                          <tr key={key} className="border-t">
                            {/* VARIANT NAME */}
                            <td className="p-2 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setActiveVariantKey(key)}
                                className="w-10 h-10 border rounded bg-gray-100"
                              >
                                {data?.images?.length ? (
                                  <img
                                    src={
                                      data.images.find((i) => i.isPrimary)
                                        ?.url || data.images[0].url
                                    }
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  "+"
                                )}
                              </button>

                              <span>
                                {color?.name || "-"}/{size?.name || "-"}
                              </span>
                            </td>

                            {/* PRICE */}
                            <td className="p-2">
                              <input
                                type="number"
                                value={data?.price ?? ""}
                                onChange={(e) =>
                                  updateVariant(key, {
                                    price: Number(e.target.value),
                                  })
                                }
                                className="border p-1 w-full"
                              />
                            </td>

                            {/* STOCK */}
                            <td className="p-2">
                              <input
                                type="number"
                                value={data?.inStock ?? ""}
                                onChange={(e) =>
                                  updateVariant(key, {
                                    inStock: Number(e.target.value),
                                  })
                                }
                                className="border p-1 w-full"
                              />
                            </td>

                            {/* SKU */}
                            <td className="p-2">
                              <input
                                type="text"
                                value={data?.sku ?? ""}
                                onChange={(e) =>
                                  updateVariant(key, {
                                    sku: e.target.value,
                                  })
                                }
                                className="border p-1 w-full"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {activeVariantKey && (
              <VariantImageModal
                images={variantMap[activeVariantKey]?.images || []}
                onClose={() => setActiveVariantKey(null)}
                onSave={(images) => {
                  updateVariant(activeVariantKey, { images });
                  setActiveVariantKey(null);
                }}
              />
            )}
            {/* Footer */}
            <div className="flex items-center justify-between border-t px-6 py-5">
              <div>
                {step === 2 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBack();
                    }}
                    className="rounded-lg border px-5 py-3 text-sm font-semibold transition-all hover:bg-gray-100"
                  >
                    Back
                  </button>
                )}
              </div>

              <div>
                {step === 1 ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onSubmit}
                    disabled={isSaving}
                    className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSaving ? "Creating Product..." : "Create Product"}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductAddModal;
