"use client";

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useCart } from './CartContext';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
    const { cartItems, removeFromCart, updateQuantity } = useCart();

    // Close on Escape key and prevent body scroll
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    const subtotal = cartItems.reduce((sum, item) => sum + (item.product.basePrice * item.quantity), 0);

    return (
        <>
            {/* Backdrop with ::before element and blur */}
            <div
                className={`z-50 desktop-header ${isOpen ? 'has-open-drawer' : ''}`}
                onClick={onClose}
            >
                <style jsx>{`
                    @supports (backdrop-filter: blur(4px)) {
                        .desktop-header.has-open-drawer:before {
                            -webkit-backdrop-filter: blur(4px);
                            backdrop-filter: blur(4px);
                        }
                    }

                    .desktop-header.has-open-drawer:before {
                        position: fixed;
                        top: 0;
                        right: 0;
                        bottom: 0;
                        left: 0;
                        z-index: 50;
                        height: 100vh;
                        background: #00000080;
                        content: "";
                        pointer-events: auto;
                    }

                    .desktop-header:not(.has-open-drawer):before {
                        content: none;
                    }
                `}</style>
            </div>

            {/* Cart Drawer */}
            <div
                className={`fixed top-0 right-0 h-screen bg-white shadow-2xl transition-transform duration-300 ease-in-out z-50 w-full md:w-[470px] ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-2xl fw-bold">Your Cart</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Close cart"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {cartItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="64"
                                    height="64"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mb-4 text-gray-300"
                                >
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>
                                <p className="text-gray-500 text-lg mb-2">Your cart is empty</p>
                                <p className="text-gray-400 text-sm">Add items to get started</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item.product._id} className="flex gap-4 pb-4 border-b border-gray-100">
                                        {/* Product Image */}
                                        <div className="w-24 h-24 bg-gray-200 rounded flex-shrink-0 relative overflow-hidden">
                                            <Image
                                                src={item.product.mainImage[0]}
                                                alt={item.product.name}
                                                fill
                                                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                                                className="object-cover"
                                            />
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                                            {item.variant && <p className="text-sm text-gray-500 mt-1">Variant: {item.variant}</p>}
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateQuantity(item.product._id as string, item.quantity - 1)}
                                                        className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                                                    >
                                                        <span className="text-lg">−</span>
                                                    </button>
                                                    <span className="w-8 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.product._id as string, item.quantity + 1)}
                                                        className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                                                    >
                                                        <span className="text-lg">+</span>
                                                    </button>
                                                </div>
                                                <p className="font-semibold">₹{(item.product.basePrice * item.quantity).toFixed(2)}</p>
                                            </div>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => removeFromCart(item.product._id as string)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer - Subtotal and Checkout */}
                    <div className="border-t border-gray-200 p-6 space-y-4">
                        <div className="flex justify-between items-center text-lg">
                            <span className="font-semibold">Subtotal</span>
                            <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-gray-500">Shipping and taxes calculated at checkout</p>
                        <button className="w-full bg-black text-white py-3 px-6 rounded hover:bg-gray-800 transition-colors fw-semibold uppercase">
                            Checkout
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full border border-black text-black py-3 px-6 rounded hover:bg-gray-50 transition-colors fw-semibold uppercase"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CartDrawer;
