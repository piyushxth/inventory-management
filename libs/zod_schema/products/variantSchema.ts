import { z } from "zod";
import { sizeOptionSchema } from "./productCreate";

export { sizeOptionSchema };

// 🎨 Variant schema (standalone variant, e.g. when editing a single variant)
export const variantSchema = z.object({
  _id: z.string().optional(),
  product: z.string().min(1, "Product ID is required"),
  color: z.string().min(1, "Color is required"),
  colorHex: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Color hex must be a valid hex color"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  options: z
    .array(sizeOptionSchema)
    .min(1, "At least one size option is required"),
});

export type TVariant = z.infer<typeof variantSchema>;
