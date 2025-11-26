import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "../../../../../libs/connnectMongoDB";
import { Cart } from "../../../../../libs/models/cart";
import mongoose from "mongoose";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid user ID" },
                { status: 400 }
            );
        }

        await connectMongoDB();
        const cart = await Cart.findOne({ user: id }).populate("items.product");

        if (!cart) {
            return NextResponse.json(
                { success: false, message: "Cart not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: cart }, { status: 200 });
    } catch (error) {
        console.error("Error fetching user cart:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch cart" },
            { status: 500 }
        );
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid user ID" },
                { status: 400 }
            );
        }

        await connectMongoDB();

        // Check if we're adding a single product or updating entire cart
        if (body.product) {
            // Adding a single product to cart
            const { product, quantity = 1 } = body;

            let cart = await Cart.findOne({ user: id });

            if (!cart) {
                // Create new cart
                cart = await Cart.create({
                    user: id,
                    items: [{ product: product._id || product, quantity }],
                });
                await cart.populate("items.product");
            } else {
                // Check if product already exists in cart
                const existingItemIndex = cart.items.findIndex(
                    (item: any) => item.product.toString() === (product._id || product).toString()
                );

                if (existingItemIndex > -1) {
                    // Update quantity using atomic operation
                    cart = await Cart.findOneAndUpdate(
                        { user: id, "items.product": product._id || product },
                        { $inc: { "items.$.quantity": quantity } },
                        { new: true }
                    ).populate("items.product");
                } else {
                    // Add new item using atomic operation
                    cart = await Cart.findOneAndUpdate(
                        { user: id },
                        { $push: { items: { product: product._id || product, quantity } } },
                        { new: true }
                    ).populate("items.product");
                }
            }

            return NextResponse.json(
                {
                    success: true,
                    message: "Product added to cart successfully",
                    data: cart,
                },
                { status: 200 }
            );
        } else if (body.items) {
            // Updating entire cart
            const { items } = body;

            let cart = await Cart.findOneAndUpdate(
                { user: id },
                { $set: { items } },
                { new: true, upsert: true }
            ).populate("items.product");

            return NextResponse.json(
                {
                    success: true,
                    message: "Cart updated successfully",
                    data: cart,
                },
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                { success: false, message: "Invalid request body" },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Error updating user cart:", error);
        return NextResponse.json(
            {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to update cart",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid user ID" },
                { status: 400 }
            );
        }

        await connectMongoDB();
        const cart = await Cart.findOneAndDelete({ user: id });

        if (!cart) {
            return NextResponse.json(
                { success: false, message: "Cart not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: "Cart cleared successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting user cart:", error);
        return NextResponse.json(
            { success: false, message: "Failed to clear cart" },
            { status: 500 }
        );
    }
}
