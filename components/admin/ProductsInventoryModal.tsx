"use client";
import {
  Color,
  ProductDetail,
  ProductVariantInput,
  ProductVariantsModalForm,
  Size,
} from "@/libs/products.types";
import {
  ProductVariantsSchema,
  VariantSchema,
} from "@/libs/validations/product";

import { useEffect, useRef, useState } from "react";
import { getColors } from "@/libs/actions/colors/read";
import { getSizes } from "@/libs/actions/sizes/read";
import VariantImageModal from "./VariantImageModal";
import { updateProductVariantsWithImages } from "@/libs/actions/variants/write";

type Props = {
  product: ProductDetail;
  onClose: () => void;
};
function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}
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
function buildInitialVariantMap(variants: ProductVariantInput[]): VariantMap {
  const map: VariantMap = {};

  variants.forEach((v) => {
    const key = `${v.color.id}-${v.size.id}`;

    map[key] = {
      id: v.id,
      sku: v.sku,
      price: v.price,
      salePrice: v.salePrice,
      inStock: v.inStock,
      images: v.images,
    };
  });

  return map;
}

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

export default function ProductInventoryModal({ product, onClose }: Props) {
  // console.log("Product:", product);
  const [allColors, setAllColors] = useState<Color[]>([]);
  const [allSizes, setAllSizes] = useState<Size[]>([]);
  const [selectedColorIds, setSelectedColorIds] = useState<string[]>([]);
  const [selectedSizeIds, setSelectedSizeIds] = useState<string[]>([]);
  const selectedColors = allColors.filter((c) =>
    selectedColorIds.includes(c.id),
  );

  const selectedSizes = allSizes.filter((s) => selectedSizeIds.includes(s.id));
  const [variantMap, setVariantMap] = useState<VariantMap>(() =>
    buildInitialVariantMap(product.variants),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const rows = generateVariantRows(selectedColorIds, selectedSizeIds);

  const [activeVariantKey, setActiveVariantKey] = useState<string | null>(null);
  const initialPayloadRef = useRef("");

  useEffect(() => {
    const initialVariants = Object.entries(
      buildInitialVariantMap(product.variants),
    ).map(([key, v]) => {
      const [colorId, sizeId] = key.split("-");

      return {
        id: v.id,
        colorId,
        sizeId,
        sku: v.sku,
        price: v.price,
        salePrice: v.salePrice ?? null,
        inStock: v.inStock,
        images: v.images ?? [],
      };
    });

    initialPayloadRef.current = JSON.stringify(initialVariants);
  }, [product]);

  function openImageModal(key: string) {
    setActiveVariantKey(key);
  }

  function updateVariant(key: string, updates: Partial<VariantMap[string]>) {
    setVariantMap((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...updates,
      },
    }));
  }

  useEffect(() => {
    async function loadData() {
      const colors = await getColors(); // your server action / API
      const sizes = await getSizes();

      setAllColors(colors);
      setAllSizes(sizes);
    }

    loadData();
  }, []);

  useEffect(() => {
    const colors = unique(product.variants.map((v) => v.color.id));
    const sizes = unique(product.variants.map((v) => v.size.id));

    setSelectedColorIds(colors);
    setSelectedSizeIds(sizes);
  }, [product]);

  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function onSubmit() {
    try {
      setSubmitError("");

      const variants = Object.entries(variantMap)
        .map(([key, v]) => {
          const [colorId, sizeId] = key.split("-");

          return {
            id: v.id,
            colorId,
            sizeId,
            sku: v.sku.trim().toUpperCase(),
            price: v.price,
            salePrice: v.salePrice ?? null,
            inStock: v.inStock,

            // normalize image sort order
            images: (v.images ?? []).map((img, index) => ({
              ...img,
              sortOrder: index,
            })),
          };
        })

        // 🔥 remove completely empty rows
        .filter(
          (v) => v.sku || v.price > 0 || v.inStock > 0 || v.images.length > 0,
        );

      // -----------------------------------
      // VALIDATION
      // -----------------------------------
      const currentSnapshot = JSON.stringify(variants);

      if (currentSnapshot === initialPayloadRef.current) {
        // console.log("No changes detected");

        onClose();
        return;
      }

      const errors = validateVariants(variantMap);

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }

      setFieldErrors({});

      // -----------------------------------
      // PAYLOAD
      // -----------------------------------

      const payload = {
        productId: product.id,
        variants,
      };

      console.log("FINAL PAYLOAD 🚀", payload);

      // -----------------------------------
      // SAVE
      // -----------------------------------

      setIsSaving(true);

      await updateProductVariantsWithImages(payload);

      onClose();
    } catch (error) {
      console.error(error);

      setSubmitError("Failed to save variants");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] bg-white dark:bg-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-gray-700 sticky top-0 z-10">
          <h2 className="text-lg font-semibold dark:text-white">
            Edit Variants
            <span className="text-gray-600 dark:text-gray-400 ml-1">
              [{product.name}]
            </span>
          </h2>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
          >
            ✕
          </button>
        </header>
        <div className="px-6  py-4 overflow-y-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
            className="space-y-6"
          >
            <div className="overflow-x-auto border rounded-lg">
              <div className="space-y-4">
                {/* COLORS */}
                <div>
                  <p className="text-sm font-medium mb-2">Colors</p>

                  {/* Selected tags */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedColors.map((color) => (
                      <span
                        key={color.id}
                        className="px-2 py-1 bg-gray-200 rounded text-sm flex items-center gap-2"
                      >
                        {color.name}
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedColorIds((prev) =>
                              prev.filter((id) => id !== color.id),
                            )
                          }
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Dropdown */}
                  <select
                    onChange={(e) => {
                      const id = e.target.value;
                      if (!id) return;

                      if (!selectedColorIds.includes(id)) {
                        const next = [...selectedColorIds, id];
                        setSelectedColorIds(next);

                        // ensureVariants(next, selectedSizeIds); // 🔥 important
                      }
                    }}
                    className="border p-2 rounded w-full"
                  >
                    <option value="">Select color</option>
                    {allColors.map((color) => (
                      <option key={color.id} value={color.id}>
                        {color.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SIZES */}
                <div>
                  <p className="text-sm font-medium mb-2">Sizes</p>

                  {/* Selected tags */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedSizes.map((size) => (
                      <span
                        key={size.id}
                        className="px-2 py-1 bg-gray-200 rounded text-sm flex items-center gap-2"
                      >
                        {size.name}
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedSizeIds((prev) =>
                              prev.filter((id) => id !== size.id),
                            )
                          }
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Dropdown */}
                  <select
                    onChange={(e) => {
                      const id = e.target.value;
                      if (!id) return;

                      if (!selectedSizeIds.includes(id)) {
                        const next = [...selectedSizeIds, id];
                        setSelectedSizeIds(next);

                        // ensureVariants(selectedColorIds, next); // 🔥 important
                      }
                    }}
                    className="border p-2 rounded w-full"
                  >
                    <option value="">Select size</option>
                    {allSizes.map((size) => (
                      <option key={size.id} value={size.id}>
                        {size.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="p-2">Variants</th>
                      <th className="p-2">Price</th>
                      <th className="p-2">Stock</th>
                      <th className="p-2">Sku</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((row) => {
                      const key = `${row.colorId}-${row.sizeId}`;
                      const data = variantMap[key];

                      const color = allColors.find((c) => c.id === row.colorId);
                      const size = allSizes.find((s) => s.id === row.sizeId);

                      return (
                        <tr key={key} className="border-t">
                          <td className="p-2 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openImageModal(key)}
                              className="w-10 h-10 border rounded overflow-hidden bg-gray-100"
                            >
                              {data?.images?.length ? (
                                <img
                                  src={
                                    data.images.find((img) => img.isPrimary)
                                      ?.url || data.images[0].url
                                  }
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-xs">+</span>
                              )}
                            </button>

                            <span>
                              {color?.name || "-"}/{size?.name || "-"}
                            </span>
                          </td>

                          <td className="p-2">
                            <input
                              type="number"
                              value={data?.price ?? ""}
                              onChange={(e) =>
                                updateVariant(key, {
                                  price: Number(e.target.value),
                                })
                              }
                              className={`border p-1 w-full ${
                                fieldErrors[`${key}.price`]
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                            {fieldErrors[`${key}.price`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {fieldErrors[`${key}.price`]}
                              </p>
                            )}
                          </td>

                          <td className="p-2">
                            <input
                              type="number"
                              value={data?.inStock ?? ""}
                              onChange={(e) =>
                                updateVariant(key, {
                                  inStock: Number(e.target.value),
                                })
                              }
                              className={`border p-1 w-full ${
                                fieldErrors[`${key}.inStock`]
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                            {fieldErrors[`${key}.inStock`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {fieldErrors[`${key}.inStock`]}
                              </p>
                            )}
                          </td>

                          <td className="p-2">
                            <input
                              type="text"
                              value={data?.sku ?? ""}
                              onChange={(e) =>
                                updateVariant(key, {
                                  sku: e.target.value,
                                })
                              }
                              className={`border p-1 w-full ${
                                fieldErrors[`${key}.sku`]
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                            {fieldErrors[`${key}.sku`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {fieldErrors[`${key}.sku`]}
                              </p>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSaving}
              className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Variants"}
            </button>
            {submitError && (
              <p className="text-red-500 text-sm">{submitError}</p>
            )}
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
          </form>
        </div>
      </div>
    </div>
  );
}
