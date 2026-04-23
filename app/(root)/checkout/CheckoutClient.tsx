"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

import {
  selectCartItems,
  selectCartSubtotal,
  useCartStore,
} from "@/libs/cart/store";

type ShippingFields = {
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  contactEmail: string;
  notes: string;
};

const EMPTY_SHIPPING: ShippingFields = {
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  phone: "",
  contactEmail: "",
  notes: "",
};

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function CheckoutClient() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const items = useCartStore(selectCartItems);
  const subtotal = useCartStore(selectCartSubtotal);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const clearCart = useCartStore((s) => s.clear);

  const [form, setForm] = useState<ShippingFields>(EMPTY_SHIPPING);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill contactEmail from session once available.
  useEffect(() => {
    if (session?.user?.email && !form.contactEmail) {
      setForm((f) => ({ ...f, contactEmail: session.user.email ?? "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email]);

  const canSubmit = useMemo(() => {
    if (submitting) return false;
    if (items.length === 0) return false;
    return (
      form.fullName.trim().length > 0 &&
      form.line1.trim().length > 0 &&
      form.city.trim().length > 0 &&
      form.state.trim().length > 0 &&
      form.postalCode.trim().length > 0 &&
      form.country.trim().length > 0
    );
  }, [form, items.length, submitting]);

  function update<K extends keyof ShippingFields>(
    key: K,
    value: ShippingFields[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          shipping: {
            fullName: form.fullName.trim(),
            line1: form.line1.trim(),
            line2: form.line2.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            postalCode: form.postalCode.trim(),
            country: form.country.trim(),
            phone: form.phone.trim(),
            contactEmail: form.contactEmail.trim(),
            notes: form.notes.trim(),
          },
          items: items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        orderId?: string;
        error?: string;
      };
      if (!res.ok || !data.orderId) {
        setError(data.error ?? `Could not place order (HTTP ${res.status}).`);
        setSubmitting(false);
        return;
      }
      clearCart();
      router.push(`/checkout/success/${data.orderId}`);
    } catch {
      setError("Network error — please try again.");
      setSubmitting(false);
    }
  }

  // Render-state guards -----------------------------------------------------
  if (!hasHydrated || sessionStatus === "loading") {
    return (
      <div className="rounded-lg border p-6 text-sm text-neutral-500">
        Loading your cart…
      </div>
    );
  }

  if (!session?.user?.id) {
    return (
      <div className="rounded-lg border p-6">
        <p className="mb-4 text-sm">
          Please sign in to complete your order.
        </p>
        <Link
          href="/auth/client/login"
          className="inline-flex h-10 items-center rounded-full bg-neutral-900 px-5 text-sm font-medium text-white"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border p-6">
        <p className="mb-4 text-sm">Your bag is empty.</p>
        <Link
          href="/products"
          className="inline-flex h-10 items-center rounded-full border px-5 text-sm font-medium"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-lg border p-6"
        noValidate
      >
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Shipping address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Full name"
              required
              value={form.fullName}
              onChange={(v) => update("fullName", v)}
              autoComplete="name"
            />
            <Field
              label="Phone"
              value={form.phone}
              onChange={(v) => update("phone", v)}
              autoComplete="tel"
            />
          </div>
          <Field
            label="Address line 1"
            required
            value={form.line1}
            onChange={(v) => update("line1", v)}
            autoComplete="address-line1"
          />
          <Field
            label="Address line 2"
            value={form.line2}
            onChange={(v) => update("line2", v)}
            autoComplete="address-line2"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="City"
              required
              value={form.city}
              onChange={(v) => update("city", v)}
              autoComplete="address-level2"
            />
            <Field
              label="State / Province"
              required
              value={form.state}
              onChange={(v) => update("state", v)}
              autoComplete="address-level1"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Postal code"
              required
              value={form.postalCode}
              onChange={(v) => update("postalCode", v)}
              autoComplete="postal-code"
            />
            <Field
              label="Country"
              required
              value={form.country}
              onChange={(v) => update("country", v)}
              autoComplete="country-name"
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Contact</h2>
          <Field
            label="Contact email"
            type="email"
            value={form.contactEmail}
            onChange={(v) => update("contactEmail", v)}
            autoComplete="email"
          />
          <label className="block text-sm">
            <span className="mb-1 block text-neutral-700">Order notes</span>
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />
          </label>
        </section>

        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-neutral-900 text-sm font-medium text-white transition disabled:opacity-50"
        >
          {submitting ? "Placing order…" : "Place order"}
        </button>
      </form>

      <aside className="h-fit space-y-4 rounded-lg border p-6">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <ul className="divide-y">
          {items.map((item) => (
            <li key={item.variantId} className="flex gap-3 py-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col justify-between text-sm">
                <div className="flex items-start justify-between gap-2">
                  <span className="truncate font-medium">
                    {item.productName}
                  </span>
                  <span className="tabular-nums">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
                <span className="text-xs text-neutral-500">
                  {item.color.name} · Size {item.size.name} · Qty{" "}
                  {item.quantity}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex items-baseline justify-between border-t pt-4 text-sm">
          <span>Subtotal</span>
          <span className="text-base font-semibold">
            {formatPrice(subtotal)}
          </span>
        </div>
        <p className="text-[11px] text-neutral-500">
          Shipping and taxes are calculated after the order is placed.
        </p>
      </aside>
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (next: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
};

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  autoComplete,
}: FieldProps) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-neutral-700">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-neutral-500"
      />
    </label>
  );
}
