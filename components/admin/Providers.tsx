"use client";
import React, { PropsWithChildren, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider, useSession } from "next-auth/react";

const client = new QueryClient();

const UserLogger = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.name) {
      console.log("Admin user logged in:", session.user.name);
    } else if (status === "unauthenticated") {
      console.log("No admin user is currently logged in");
    }
  }, [session, status]);

  return null; // This component doesn't render anything
};

const TanstackProviders = ({ children }: PropsWithChildren): JSX.Element => {
  return (
    <SessionProvider>
      <UserLogger />
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </SessionProvider>
  );
};

export default TanstackProviders;