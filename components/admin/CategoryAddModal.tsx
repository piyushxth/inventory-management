"use client";
import React from "react";
import ComponentCard from "./common/ComponentCard";
import Label from "./form/Label";
import Input from "./form/input/InputField";
import { useForm } from "react-hook-form";
import {
  CategoryCreateInput,
  CategoryCreateSchema,
  categorySchema,
} from "@/libs/validations/category";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCategory } from "@/libs/actions/categories/write";

type Props = {
  onClose: () => void;
};

const CategoryAddModal = ({ onClose }: Props) => {
  const [serverError, setServerError] = React.useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryCreateInput>({
    resolver: zodResolver(CategoryCreateSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  async function onSubmit(data: CategoryCreateInput) {
    console.log("Submitting form with data:", data);
    setServerError("");

    const res = await createCategory(data);

    if (!res.success) {
      setServerError("Failed to add category");
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
            Add Category
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
            </ComponentCard>

            {/* Server Error */}
            {errors && (
              <p style={{ color: "red" }}>
                {`Errors: ${JSON.stringify(errors)}`}
              </p>
            )}
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
};

export default CategoryAddModal;
