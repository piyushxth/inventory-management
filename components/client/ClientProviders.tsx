"use client";

import React, { PropsWithChildren, useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { CartProvider } from "./CartContext";

const UserLogger = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.name) {
      console.log("Logged in user:", session.user.name);
    } else if (status === "unauthenticated") {
      console.log("No user is currently logged in");
    }
  }, [session, status]);

  return null; // This component doesn't render anything
};

const ClientProviders = ({ children }: PropsWithChildren): JSX.Element => {
    return (
        <SessionProvider>
            <CartProvider>
                <UserLogger />
                {children}
            </CartProvider>
        </SessionProvider>
    );
};

export default ClientProviders;