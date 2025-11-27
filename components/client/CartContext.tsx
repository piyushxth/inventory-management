"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { IProduct } from "@/libs/models/product";

export interface CartItem {
  product: IProduct;
  quantity: number;
  variant?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (product: IProduct, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
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
          await fetch(`/api/carts/user/${session.user.id}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ items }),
          });
        } catch (error) {
          console.error("Error syncing cart with server:", error);
        }
      }
    }, 1000); // Delay of 1 second
    
    setSyncTimeout(newTimeout);
  };

  const addToCart = async (product: IProduct, quantity: number = 1) => {
    setIsLoading(true);
    try {
      // Update UI immediately for responsiveness
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.product._id === product._id);
        
        if (existingItem) {
          return prevItems.map(item =>
            item.product._id === product._id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          return [...prevItems, { product, quantity }];
        }
      });
      
      // For logged-in users, sync with server (debounced)
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
      console.error("Error adding to cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    setIsLoading(true);
    try {
      setCartItems(prevItems => {
        const updatedItems = prevItems.filter(item => item.product._id !== productId);
        // Sync with server if logged in (debounced)
        if (session?.user?.id) {
          debouncedSyncWithServer(updatedItems);
        }
        return updatedItems;
      });
    } catch (error) {
      console.error("Error removing from cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    
    setIsLoading(true);
    try {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.product._id === productId ? { ...item, quantity } : item
        )
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