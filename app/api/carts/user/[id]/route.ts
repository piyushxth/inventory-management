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
            const { product, quantity = 1, variant, size } = body;

            let cart = await Cart.findOne({ user: id });

            if (!cart) {
                // Create new cart
                cart = await Cart.create({
                    user: id,
                    items: [{
                        product: product._id || product,
                        quantity,
                        variant: variant ? {
                            color: variant.color,
                            colorHex: variant.colorHex,
                            images: variant.images
                        } : undefined,
                        size: size ? {
                            size: size.size,
                            price: size.price,
                            quantity: size.quantity,
                            sku: size.sku
                        } : undefined
                    }],
                });
                await cart.populate("items.product");
            } else {
                // Prepare item data
                const itemData = {
                    product: product._id || product,
                    quantity,
                    variant: variant ? {
                        color: variant.color,
                        colorHex: variant.colorHex,
                        images: variant.images
                    } : undefined,
                    size: size ? {
                        size: size.size,
                        price: size.price,
                        quantity: size.quantity,
                        sku: size.sku
                    } : undefined
                };

                // Check if product with same variant/size already exists in cart
                const existingItemIndex = cart.items.findIndex(
                    (item: any) => {
                        // Compare product ID
                        if (item.product.toString() !== (product._id || product).toString()) {
                            return false;
                        }
                        
                        // Compare variant
                        if (variant) {
                            if (!item.variant || item.variant.colorHex !== variant.colorHex) {
                                return false;
                            }
                        } else if (item.variant) {
                            return false;
                        }
                        
                        // Compare size
                        if (size) {
                            if (!item.size || item.size.size !== size.size) {
                                return false;
                            }
                        } else if (item.size) {
                            return false;
                        }
                        
                        return true;
                    }
                );

                if (existingItemIndex > -1) {
                    // Update quantity using atomic operation
                    cart = await Cart.findOneAndUpdate(
                        { 
                            user: id, 
                            "items.product": product._id || product,
                            ...(variant ? { "items.variant.colorHex": variant.colorHex } : { "items.variant": { $exists: false } }),
                            ...(size ? { "items.size.size": size.size } : { "items.size": { $exists: false } })
                        },
                        { $inc: { "items.$.quantity": quantity } },
                        { new: true }
                    ).populate("items.product");
                } else {
                    // Add new item using atomic operation
                    cart = await Cart.findOneAndUpdate(
                        { user: id },
                        { $push: { items: itemData } },
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
            // Process items to extract only product IDs and preserve variant/size info
            const processedItems = body.items.map((item: any) => ({
                product: item.product._id || item.product,
                quantity: item.quantity,
                variant: item.variant ? {
                    color: item.variant.color,
                    colorHex: item.variant.colorHex,
                    images: item.variant.images
                } : undefined,
                size: item.size ? {
                    size: item.size.size,
                    price: item.size.price,
                    quantity: item.size.quantity,
                    sku: item.size.sku
                } : undefined
            }));

            let cart = await Cart.findOneAndUpdate(
                { user: id },
                { $set: { items: processedItems } },
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