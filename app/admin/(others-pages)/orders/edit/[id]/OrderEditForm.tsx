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
  const [items, setItems] = useState([{ product: "", quantity: 1, price: 0 }]);
  const [discount, setDiscount] = useState(0);
  const [additionalPrice, setAdditionalPrice] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
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

  // Fetch products
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
      } catch (error: any) {
        setDataError(error.response?.data?.message || "Failed to load data");
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // Calculate total amount dynamically
  useEffect(() => {
    const total =
      items.reduce((sum, item) => sum + item.price, 0) -
      (discount || 0) +
      (additionalPrice || 0);
    setTotalAmount(total >= 0 ? total : 0);
    setValue("totalAmount", total >= 0 ? total : 0);
    setValue("items", items);
    setValue("discount", discount);
    setValue("additionalPrice", additionalPrice);
  }, [items, discount, additionalPrice, setValue]);

  const handleProductChange = (index: number, productId: string) => {
    const selectedProduct = products.find((p) => p._id === productId);
    if (!selectedProduct) return;
    setItems((prev) => {
      const newItems = [...prev];
      newItems[index] = {
        product: productId,
        quantity: 1,
        price: selectedProduct.selling_price,
      };
      return newItems;
    });
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    setItems((prev) => {
      const newItems = [...prev];
      const selectedProduct = products.find(
        (p) => p._id === newItems[index].product
      );
      if (!selectedProduct) return newItems;
      newItems[index].quantity = quantity < 1 ? 1 : quantity;
      newItems[index].price =
        selectedProduct.selling_price * newItems[index].quantity;
      return newItems;
    });
  };

  const addItem = () => {
    setItems((prev) => [...prev, { product: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems((prev) =>
      prev.length === 1 ? prev : prev.filter((_, i) => i !== index)
    );
  };

  const onSubmit = async (data: OrderFormData) => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/orders", {
        ...data,
        items,
        discount,
        additionalPrice,
        totalAmount,
      });
      if (response.data.success) {
        alert("Order created successfully!");
        router.push("/admin/orders");
      } else {
        alert(response.data.message || "Failed to create order");
      }
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          `Error creating order. Please try again.`
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
            {items.map((item, index) => (
              <div
                key={index}
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
                    onChange={(value) => handleProductChange(index, value)}
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
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(index, Number(e.target.value))
                    }
                  />
                  {errors.items?.[index]?.quantity && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.items[index]?.quantity?.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Price</Label>
                  <Input
                    type="number"
                    value={item.price}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-3 py-2 rounded-lg transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
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
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
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
                  value={additionalPrice}
                  onChange={(e) => setAdditionalPrice(Number(e.target.value))}
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
                  value={totalAmount}
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
