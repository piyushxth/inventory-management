"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { IProduct, IPopulatedProduct } from "@/libs/models/product";
import { IVariant, ISizeOption } from "@/libs/models/variant";

// Products in the cart may be either fully populated or minimally populated,
// but we always require `_id` + `name` + `basePrice`.
type ProductType = IProduct | IPopulatedProduct;

// Cart-safe subsets — we only persist the fields we need to render and
// re-identify the line item so the shape is JSON-serializable.
export type CartVariant = Pick<
  IVariant,
  "_id" | "color" | "colorHex" | "images"
>;
export type CartSize = ISizeOption;

export interface CartItem {
  product: ProductType;
  quantity: number;
  variant?: CartVariant;
  size?: CartSize;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (
    product: ProductType,
    quantity?: number,
    variant?: CartVariant,
    size?: CartSize
  ) => Promise<void>;
  removeFromCart: (
    productId: string,
    variant?: CartVariant,
    size?: CartSize
  ) => Promise<void>;
  updateQuantity: (
    productId: string,
    quantity: number,
    variant?: CartVariant,
    size?: CartSize
  ) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncTimeout, setSyncTimeout] = useState<NodeJS.Timeout | null>(null);
  const { data: session } = useSession();

  // Load cart from localStorage or API on initial load
  useEffect(() => {
    const loadCart = async () => {
      try {
        // If user is logged in, try to load from API
        if (session?.user?.id) {
          const response = await fetch(`/api/carts/user/${session.user.id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              setCartItems(data.data.items || []);
              // Also save to localStorage for offline access
              localStorage.setItem("cart", JSON.stringify(data.data.items || []));
              return;
            }
          }
        }
        
        // Fallback to localStorage if API fails or user not logged in
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error("Error loading cart:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, [session?.user?.id]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isLoading]);

  // Debounced sync with server
  const debouncedSyncWithServer = (items: CartItem[]) => {
    if (syncTimeout) {
      clearTimeout(syncTimeout);
    }
    
    const newTimeout = setTimeout(async () => {
      if (session?.user?.id) {
        try {
          // For full cart updates, send all items
          const apiItems = items.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            variant: item.variant,
            size: item.size
          }));
          
          await fetch(`/api/carts/user/${session.user.id}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ items: apiItems }),
          });
        } catch (error) {
          console.error("Error syncing cart with server:", error);
        }
      }
    }, 1000); // Delay of 1 second
    
    setSyncTimeout(newTimeout);
  };

  const addToCart = async (product: ProductType, quantity: number = 1, variant?: CartVariant, size?: CartSize) => {
    setIsLoading(true);
    try {
      // Update UI immediately for responsiveness
      setCartItems(prevItems => {
        // Create a unique key for the cart item based on product, variant, and size
        const itemKey = `${product._id}-${variant?.colorHex || ''}-${size?.size || ''}`;
        
        const existingItem = prevItems.find(item => {
          const existingItemKey = `${item.product._id}-${item.variant?.colorHex || ''}-${item.size?.size || ''}`;
          return existingItemKey === itemKey;
        });
        
        if (existingItem) {
          return prevItems.map(item => {
            const existingItemKey = `${item.product._id}-${item.variant?.colorHex || ''}-${item.size?.size || ''}`;
            return existingItemKey === itemKey
              ? { ...item, quantity: item.quantity + quantity }
              : item;
          });
        } else {
          return [...prevItems, { product, quantity, variant, size }];
        }
      });
      
      // For logged-in users, sync with server
      if (session?.user?.id) {
        try {
          // For single product additions, send just the product data
          await fetch(`/api/carts/user/${session.user.id}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ product: product._id, quantity, variant, size }),
          });
        } catch (error) {
          console.error("Error adding product to cart:", error);
        }
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: string, variant?: CartVariant, size?: CartSize) => {
    setIsLoading(true);
    try {
      setCartItems(prevItems => {
        // If variant and size are provided, remove only that specific variant
        if (variant || size) {
          const filteredItems = prevItems.filter(item => {
            // Create a unique key for comparison
            const itemKey = `${item.product._id}-${item.variant?.colorHex || ''}-${item.size?.size || ''}`;
            const targetKey = `${productId}-${variant?.colorHex || ''}-${size?.size || ''}`;
            
            return itemKey !== targetKey;
          });
          
          // Sync with server if logged in (debounced)
          if (session?.user?.id) {
            debouncedSyncWithServer(filteredItems);
          }
          return filteredItems;
        } else {
          // If no variant specified, remove all instances of the product
          const updatedItems = prevItems.filter(item => item.product._id !== productId);
          // Sync with server if logged in (debounced)
          if (session?.user?.id) {
            debouncedSyncWithServer(updatedItems);
          }
          return updatedItems;
        }
      });
    } catch (error) {
      console.error("Error removing from cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number, variant?: CartVariant, size?: CartSize) => {
    if (quantity <= 0) {
      await removeFromCart(productId, variant, size);
      return;
    }
    
    setIsLoading(true);
    try {
      setCartItems(prevItems =>
        prevItems.map(item => {
          // Create a unique key for comparison
          const itemKey = `${item.product._id}-${item.variant?.colorHex || ''}-${item.size?.size || ''}`;
          const targetKey = `${productId}-${variant?.colorHex || ''}-${size?.size || ''}`;
          
          return itemKey === targetKey ? { ...item, quantity } : item;
        })
      );
      
      // Sync with server if logged in (debounced)
      if (session?.user?.id) {
        // Wait a bit for state to update, then sync
        setTimeout(() => {
          setCartItems(currentItems => {
            debouncedSyncWithServer(currentItems);
            return currentItems;
          });
        }, 0);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    try {
      setCartItems([]);
      // Clear server cart if logged in (debounced)
      if (session?.user?.id) {
        debouncedSyncWithServer([]);
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isLoading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};