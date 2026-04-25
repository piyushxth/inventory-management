import { NextResponse } from "next/server";

import { addItemToServerCart, getCartForUser } from "@/libs/cart/server";
import { addItemSchema } from "@/libs/validations/cart";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cart = await getCartForUser(session.user.id);
  return NextResponse.json(cart, {
    headers: { "cache-control": "no-store" },
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = addItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const cart = await addItemToServerCart(session.user.id, parsed.data);
  return NextResponse.json(cart, {
    headers: { "cache-control": "no-store" },
  });
}
