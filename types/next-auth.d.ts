// src/next-auth.d.ts
import NextAuth from "next-auth";
import { DefaultUser, DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

// Extend the User interface
declare module "next-auth" {
  interface User extends DefaultUser {
    role: string;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      role: string;
      name: string;
    };
  }
}

// Extend the JWT interface
declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    id: string;
  }
}
