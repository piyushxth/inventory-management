"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import Label from "@/components/admin/form/Label";
import Input from "@/components/admin/form/input/InputField";
import TextArea from "@/components/admin/form/input/TextArea";
import ComponentCard from "@/components/admin/common/ComponentCard";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

// Brand validation schema
const brandSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  description: z.string().optional(),
  logo: z.string().optional(),
});

type BrandFormData = z.infer<typeof brandSchema>;

interface Brand {
  _id: string;
  name: string;
  logo?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Custom Dropzone Component for Brand Logo
const LogoDropzone: React.FC<{
  logo: string;
  onLogoChange: (logo: string) => void;
  errors?: any;
}> = ({ logo, onLogoChange, errors }) => {
  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    try {
      const formData = new FormData();
      formData.append("entityType", "brands");
      formData.append("gallery", acceptedFiles[0]);

      const uploadRes = await fetch("/api/upload-demo", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Image upload failed");

      const uploadResult = await uploadRes.json();
      const uploadedUrl = uploadResult.files?.gallery?.[0];

      if (uploadedUrl) {
        onLogoChange(uploadedUrl);
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("Failed to upload logo. Please try again.");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
      "image/svg+xml": [],
    },
    maxFiles: 1,
  });

  const removeLogo = () => {
    onLogoChange("");
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center">
          <svg
            className="w-12 h-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-lg font-medium text-gray-700 mb-2">
            {isDragActive ? "Drop logo here" : "Drag & drop brand logo here"}
          </p>
          <p className="text-sm text-gray-500">or click to browse files</p>
        </div>
      </div>

      {/* Display logo preview */}
      {logo && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">Logo Preview</h4>
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
              <Image
                src={logo}
                alt="Brand logo"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={removeLogo}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {errors && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
    </div>
  );
};

const BrandEditForm = ({ brand }: { brand: Brand }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [logo, setLogo] = useState(brand.logo || "");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: brand.name,
      description: brand.description || "",
    },
  });

  const onSubmit = async (data: BrandFormData) => {
    try {
      setIsLoading(true);
      const brandData = {
        ...data,
        logo: logo || undefined,
      };

      const response = await axios.put(`/api/brands/${brand._id}`, brandData);

      if (response.data.success) {
        alert("Brand updated successfully!");
        router.push("/admin/brands");
      } else {
        alert(response.data.message || "Failed to update brand");
      }
    } catch (error: any) {
      console.error("Error updating brand:", error);
      alert(
        error.response?.data?.message ||
          "Error updating brand. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
      <ComponentCard title="Brand Information">
        <div className="space-y-4">
          <div className="flex flex-col">
            <Label htmlFor="name">Brand Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter brand name"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col">
            <Label htmlFor="description">Description</Label>
            <TextArea
              value={watch("description") || ""}
              onChange={(value) => setValue("description", value)}
              placeholder="Enter brand description (optional)"
              className={errors.description ? "border-red-500" : ""}
              rows={4}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex flex-col">
            <Label>Brand Logo</Label>
            <LogoDropzone
              logo={logo}
              onLogoChange={setLogo}
              errors={errors.logo}
            />
          </div>
        </div>
      </ComponentCard>

      {/* Submit Button */}
      <div className="flex justify-end mt-6">
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50 font-medium"
        >
          {isSubmitting || isLoading ? "Updating..." : "Update Brand"}
        </button>
      </div>
    </form>
  );
};

export default BrandEditForm;
