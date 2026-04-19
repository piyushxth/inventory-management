"use client";

import React, { PropsWithChildren } from "react";
import { SessionProvider } from "next-auth/react";
import { CartProvider } from "./CartContext";

const ClientProviders = ({ children }: PropsWithChildren) => {
  return (
    <SessionProvider>
      <CartProvider>{children}</CartProvider>
    </SessionProvider>
  );
};

export default ClientProviders;
