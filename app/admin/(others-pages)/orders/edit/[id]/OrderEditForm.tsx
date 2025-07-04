"use client";
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import Label from "@/components/admin/form/Label";
import Input from "@/components/admin/form/input/InputField";
import TextArea from "@/components/admin/form/input/TextArea";
import Select from "@/components/admin/form/Select";
import ComponentCard from "@/components/admin/common/ComponentCard";

const orderSchema = z.object({
  customer: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(1, "Phone is required"),
    province: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    landmark: z.string().optional(),
  }),
  items: z
    .array(
      z.object({
        product: z.string().min(1, "Product is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        price: z.number().min(0, "Price must be at least 0"),
      })
    )
    .min(1, "At least one item is required"),
  discount: z.number().min(0).optional(),
  additionalPrice: z.number().min(0).optional(),
  totalAmount: z.number().min(0),
  orderStatus: z.enum([
    "Pending",
    "Processing",
    "Dispatched",
    "Delivered",
    "Cancelled",
    "Returned",
  ]),
  paymentStatus: z.enum(["Paid", "Unpaid", "Refunded"]),
  paymentMethod: z.enum(["COD", "Online"]),
  orderNote: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface Product {
  _id: string;
  name: string;
  selling_price: number;
  availableQuantity: number;
}

interface OrderEditFormProps {
  mode: "add" | "edit";
  orderId?: string;
}

const defaultCustomer = {
  name: "",
  email: "",
  phone: "",
  province: "",
  city: "",
  address: "",
  landmark: "",
};

export default function OrderEditForm({ mode, orderId }: OrderEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<OrderFormData | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    control,
    reset,
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customer: defaultCustomer,
      items: [{ product: "", quantity: 1, price: 0 }],
      discount: 0,
      additionalPrice: 0,
      totalAmount: 0,
      orderStatus: "Pending",
      paymentStatus: "Unpaid",
      paymentMethod: "COD",
      orderNote: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // Fetch products and (if edit) order data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        setDataError(null);
        const productsRes = await axios.get("/api/products");
        if (productsRes.data.success) {
          setProducts(productsRes.data.data);
        } else {
          setDataError("Failed to load products");
        }
        if (mode === "edit" && orderId) {
          const orderRes = await axios.get(`/api/orders/${orderId}`);
          if (orderRes.data.success) {
            // Convert items to correct format
            const order = orderRes.data.data;
            reset({
              ...order,
              discount: order.discount || 0,
              additionalPrice: order.additionalPrice || 0,
              totalAmount: order.totalAmount || 0,
              orderStatus: order.orderStatus,
              paymentStatus: order.paymentStatus,
              paymentMethod: order.paymentMethod,
              orderNote: order.orderNote || "",
              items: order.items.map((item: any) => ({
                product: item.product?._id || item.product,
                quantity: item.quantity,
                price: item.price,
              })),
            });
          } else {
            setDataError("Failed to load order");
          }
        }
      } catch (error: any) {
        setDataError(error.response?.data?.message || "Failed to load data");
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, [mode, orderId, reset]);

  // Calculate total amount
  useEffect(() => {
    const items = watch("items");
    const discount = watch("discount") || 0;
    const additionalPrice = watch("additionalPrice") || 0;
    const total =
      (items?.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
        0
      ) || 0) -
      discount +
      additionalPrice;
    setValue("totalAmount", total >= 0 ? total : 0);
    // eslint-disable-next-line
  }, [watch("items"), watch("discount"), watch("additionalPrice")]);

  const onSubmit = async (data: OrderFormData) => {
    try {
      setIsLoading(true);
      if (mode === "add") {
        const response = await axios.post("/api/orders", data);
        if (response.data.success) {
          alert("Order created successfully!");
          router.push("/admin/orders");
        } else {
          alert(response.data.message || "Failed to create order");
        }
      } else if (mode === "edit" && orderId) {
        const response = await axios.put(`/api/orders/${orderId}`, data);
        if (response.data.success) {
          alert("Order updated successfully!");
          router.push("/admin/orders");
        } else {
          alert(response.data.message || "Failed to update order");
        }
      }
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          `Error ${
            mode === "add" ? "creating" : "updating"
          } order. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const productOptions = products.map((product) => ({
    value: product._id,
    label: `${product.name} - $${product.selling_price} (Stock: ${product.availableQuantity})`,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl">
      {isLoadingData ? (
        <div className="text-center py-10 text-gray-500">
          Loading products...
        </div>
      ) : dataError ? (
        <div className="text-center py-10 text-red-500">Error: {dataError}</div>
      ) : (
        <>
          <ComponentCard title="Customer Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input {...register("customer.name")} />
                {errors.customer?.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.customer.name.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Email</Label>
                <Input {...register("customer.email")} />
                {errors.customer?.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.customer.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Phone</Label>
                <Input {...register("customer.phone")} />
                {errors.customer?.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.customer.phone.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Province</Label>
                <Input {...register("customer.province")} />
              </div>
              <div>
                <Label>City</Label>
                <Input {...register("customer.city")} />
              </div>
              <div>
                <Label>Address</Label>
                <Input {...register("customer.address")} />
              </div>
              <div>
                <Label>Landmark</Label>
                <Input {...register("customer.landmark")} />
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Order Items">
            {fields.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border rounded-lg"
              >
                <div>
                  <Label>Product *</Label>
                  <Select
                    options={productOptions}
                    placeholder={
                      products.length === 0
                        ? "No products available"
                        : "Select a product"
                    }
                    onChange={(value) =>
                      setValue(`items.${index}.product`, value)
                    }
                    defaultValue={item.product}
                  />
                  {errors.items?.[index]?.product && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.items[index]?.product?.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    min={1}
                    {...register(`items.${index}.quantity`, {
                      valueAsNumber: true,
                    })}
                  />
                  {errors.items?.[index]?.quantity && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.items[index]?.quantity?.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Price *</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    {...register(`items.${index}.price`, {
                      valueAsNumber: true,
                    })}
                  />
                  {errors.items?.[index]?.price && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.items[index]?.price?.message}
                    </p>
                  )}
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-3 py-2 rounded-lg transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => append({ product: "", quantity: 1, price: 0 })}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
            >
              Add Item
            </button>
          </ComponentCard>

          <ComponentCard title="Order Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Order Status</Label>
                <Select
                  options={[
                    { value: "Pending", label: "Pending" },
                    { value: "Processing", label: "Processing" },
                    { value: "Dispatched", label: "Dispatched" },
                    { value: "Delivered", label: "Delivered" },
                    { value: "Cancelled", label: "Cancelled" },
                    { value: "Returned", label: "Returned" },
                  ]}
                  defaultValue={watch("orderStatus")}
                  onChange={(value) =>
                    setValue(
                      "orderStatus",
                      value as OrderFormData["orderStatus"]
                    )
                  }
                />
                {errors.orderStatus && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.orderStatus.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Payment Status</Label>
                <Select
                  options={[
                    { value: "Unpaid", label: "Unpaid" },
                    { value: "Paid", label: "Paid" },
                    { value: "Refunded", label: "Refunded" },
                  ]}
                  defaultValue={watch("paymentStatus")}
                  onChange={(value) =>
                    setValue(
                      "paymentStatus",
                      value as OrderFormData["paymentStatus"]
                    )
                  }
                />
                {errors.paymentStatus && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.paymentStatus.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Payment Method</Label>
                <Select
                  options={[
                    { value: "COD", label: "Cash on Delivery" },
                    { value: "Online", label: "Online Payment" },
                  ]}
                  defaultValue={watch("paymentMethod")}
                  onChange={(value) =>
                    setValue(
                      "paymentMethod",
                      value as OrderFormData["paymentMethod"]
                    )
                  }
                />
                {errors.paymentMethod && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.paymentMethod.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Discount ($)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  {...register("discount", { valueAsNumber: true })}
                />
                {errors.discount && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.discount.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Additional Price ($)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  {...register("additionalPrice", { valueAsNumber: true })}
                />
                {errors.additionalPrice && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.additionalPrice.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Total Amount</Label>
                <Input
                  type="number"
                  value={watch("totalAmount")}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
            </div>
            <div className="mt-4">
              <Label>Order Note</Label>
              <TextArea
                value={watch("orderNote") || ""}
                onChange={(value) => setValue("orderNote", value)}
                placeholder="Enter order notes..."
                rows={3}
              />
            </div>
          </ComponentCard>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={() => router.push("/admin/orders")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            >
              {isSubmitting || isLoading
                ? mode === "add"
                  ? "Creating..."
                  : "Updating..."
                : mode === "add"
                ? "Create Order"
                : "Update Order"}
            </button>
          </div>
        </>
      )}
    </form>
  );
}
