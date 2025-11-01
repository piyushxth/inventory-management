import { Control, UseFormRegister, useFieldArray } from "react-hook-form";
import { ProductFormValues, TProductCreate } from "@/libs/zod_schema/products/productCreate";
import Label from "../admin/form/Label";
import Button from "../admin/ui/button/Button";
import Input from "../admin/form/input/InputField";

interface VariantFieldsProps {
  control: Control<ProductFormValues>;
  register: UseFormRegister<ProductFormValues>;
  variantIndex: number;
  removeVariant: () => void;
}

export function VariantFields({
  control,
  register,
  variantIndex,
  removeVariant,
}: VariantFieldsProps) {
  // 👇 Manage nested "options" field array for each variant
  const { fields, append, remove } = useFieldArray({
    control,
    name: `variants.${variantIndex}.options`,
  });

  return (
    <div className="border p-4 rounded-lg space-y-3 bg-gray-50">
      <div className="flex justify-between items-center">
        <Label className="text-lg font-semibold">Variant {variantIndex + 1}</Label>
        <Button
          onClick={removeVariant}
          className="text-sm"
        >
          Remove Variant
        </Button>
      </div>

      {/* Variant color */}
      <div>
        <Label htmlFor={`variants.${variantIndex}.color`}>Color</Label>
        <Input
          {...register(`variants.${variantIndex}.color` as const)}
          placeholder="Enter color (e.g., Black)"
        />
      </div>

      {/* Variant colorHex */}

   <div>
        <Label htmlFor={`variants.${variantIndex}.colorHex`}>Color</Label>
        <Input type="color"
          {...register(`variants.${variantIndex}.colorHex` as const)}
          placeholder="Enter color Hex (e.g., #000000)"
        />
        
      </div>

      {/* Variant images (array of URLs for now) */}
      <div>
        <Label htmlFor={`variants.${variantIndex}.images`}>Images</Label>
        <Input
          {...register(`variants.${variantIndex}.images.0` as const)}
          placeholder="Image URL"
        />
      </div>

      {/* Options list */}
      <div className="space-y-3 border-t pt-3">
        <Label className="font-medium">Options (Size / Price / Qty / SKU)</Label>

        {fields.map((field, optionIndex) => (
          <div
            key={field.id}
            className="grid grid-cols-4 gap-2 items-end border p-2 rounded-md"
          >
            <Input
              {...register(
                `variants.${variantIndex}.options.${optionIndex}.size` as const
              )}
              placeholder="Size"
            />
            <Input
              type="number"
              {...register(
                `variants.${variantIndex}.options.${optionIndex}.price` as const,
                { valueAsNumber: true }
              )}
              placeholder="Price"
            />
            <Input
              type="number"
              {...register(
                `variants.${variantIndex}.options.${optionIndex}.quantity` as const,
                { valueAsNumber: true }
              )}
              placeholder="Qty"
            />
            <Input
              {...register(
                `variants.${variantIndex}.options.${optionIndex}.sku` as const
              )}
              placeholder="SKU"
            />

            <Button
          
              onClick={() => remove(optionIndex)}
            >
              Remove
            </Button>
          </div>
        ))}

        <Button
          onClick={() =>
            append({ size: "", price: 0, quantity: 0, sku: "" })
          }
          className="mt-2"
        >
          + Add Option
        </Button>
      </div>
    </div>
  );
}
