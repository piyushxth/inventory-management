"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productGeneralSchema } from "@/libs/validations/product";
import { updateProductGeneral } from "@/libs/actions/products/write";
import { ProductDetail, ProductGeneralFormValues } from "@/libs/products.types";
import ComponentCard from "./common/ComponentCard";
import Label from "./form/Label";
import Input from "./form/input/InputField";
import TextArea from "./form/input/TextArea";
import Checkbox from "./form/input/Checkbox";
import Select from "./form/Select";

type Props = {
  product: ProductDetail;
  categories: { id: string; name: string; slug: string }[];
  genders: { id: string; label: string; slug: string }[];
  onClose: () => void;
};

export default function ProductGeneralModal({
  product,
  categories,
  genders,
  onClose,
}: Props) {
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductGeneralFormValues>({
    resolver: zodResolver(productGeneralSchema),
    defaultValues: {
      id: product.id,
      name: product.name || "",
      slug: product.slug || "",
      description: product.description || "",
      isOnSale: product.isOnSale ?? false,
      categoryId: product.category?.id || "",
      genderId: product.gender?.id || "",
    },
  });

  async function onSubmit(data: ProductGeneralFormValues) {
    console.log("Submitting form with data:", data);
    setServerError("");

    const res = await updateProductGeneral(data);

    if (!res.success) {
      setServerError("Failed to update product");
      return;
    }

    onClose();
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
            Edit Product
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <ComponentCard>
              <div>
                <Label>Name</Label>
                <Input {...register("name")} />
                {errors.name && <p>{errors.name.message}</p>}
              </div>
              {/* Slug */}
              <div>
                <Label>Slug</Label>
                <Input {...register("slug")} />
                {errors.slug && <p>{errors.slug.message}</p>}
              </div>

              {/* Description */}
              <div>
                <Label>Description</Label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div>
                      <TextArea
                        placeholder="Enter description"
                        rows={4}
                        value={field.value}
                        onChange={field.onChange}
                        error={!!fieldState.error}
                      />
                      {fieldState.error && <p>{fieldState.error.message}</p>}
                    </div>
                  )}
                />
                {errors.description && <p>{errors.description.message}</p>}
              </div>
            </ComponentCard>

            {/* Category */}
            <div>
              <Label>Category</Label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select
                    options={[
                      { label: "Select category", value: "" },
                      ...categories.map((c) => ({
                        label: c.name,
                        value: c.id,
                      })),
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.categoryId && <p>{errors.categoryId.message}</p>}
            </div>

            {/* Gender */}
            <div>
              <Label>Gender</Label>

              <Controller
                name="genderId"
                control={control}
                render={({ field }) => (
                  <Select
                    options={[
                      { label: "Select Gender", value: "" },
                      ...genders.map((c) => ({
                        label: c.label,
                        value: c.id,
                      })),
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.genderId && <p>{errors.genderId.message}</p>}
            </div>

            {/* On Sale */}
            <div>
              <Controller
                name="isOnSale"
                control={control}
                render={({ field }) => {
                  console.log("checkbox value:", field.value);
                  return (
                    <Checkbox
                      label="On Sale"
                      checked={field.value}
                      onChange={(checked) => field.onChange(checked)} // 👈 FIX
                      className="text-black"
                    />
                  );
                }}
              />
            </div>

            {/* Server Error */}
            {serverError && <p style={{ color: "red" }}>{serverError}</p>}

            {/* Buttons */}
            <div className="flex gap-2.5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="border text-sm
              rounded-lg bg-blue-500 hover:bg-blue-600 py-2 px-3"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
