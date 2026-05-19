import { z } from "zod";

export const categorySchema = z.object({
  id: z.string().min(1, "Category ID is required"),

  name: z.string().min(1, "Name is required").max(200, "Name too long"),

  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase, no spaces"),
  parentId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CategoryCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(80, "Name too long"),

  slug: z
    .string()
    .min(1, "Slug is required")
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),

  parentId: z.string().optional().nullable(),
});
export type CategoryCreateInput = z.infer<typeof CategoryCreateSchema>;
