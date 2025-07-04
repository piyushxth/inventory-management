import connectMongoDB from "@/libs/connnectMongoDB";
import { registerModels } from "@/libs/registerModels";
import CredentialsProvider from "next-auth/providers/credentials";
import mongoose from "mongoose";
import { User as MongooseUser } from "@/libs/models/users";
import { compare } from "bcryptjs";
import type { NextAuthOptions, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      name: "CredentialsProvider",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "Email" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Password",
        },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }
          registerModels();
          // Ensure credentials are strings

          const email = credentials?.email as string;
          const password = credentials?.password as string;

          // Fetch user from your database
          await connectMongoDB();
          console.log("Connected to database");
          console.log(mongoose.models);
          const user = await MongooseUser.findOne({ email })
            .populate("roles") // Populate with role's name
            .exec();

          console.log("Hello from the outside", user);

          if (!user) {
            throw new Error("Invalid email or password");
          }

          if (!user.password) {
            throw new Error("Invalid email or password");
          }

          const isMatched = await compare(password, user.password);
          if (!isMatched) {
            throw new Error("Password did not match");
          }
          const role = user.roles?.name ? user.roles.name.toString() : "user";
          const userData = {
            id: user._id.toString(),
            name: user.name.toString(),
            email: user.email.toString(),
            role, // Return role's name as a string
          };
          console.log("user data after login", userData);
          return userData;
        } catch {
          throw new Error("An unknown error occurred.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.role = user.role; // Attach role to token
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role; // Attach role to session
      }
      return session;
    },
  },
};
