import connectMongoDB from "@/libs/connnectMongoDB";
import { registerModels } from "@/libs/registerModels";
import CredentialsProvider from "next-auth/providers/credentials";
import mongoose from "mongoose";
import { compare } from "bcryptjs";
import type { NextAuthOptions, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { User as MongooseUser } from "@/libs/models/users";

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
          // console.log("[authorize] Called with credentials:", credentials);
          if (!credentials?.email || !credentials?.password) {
            console.log("[authorize] Missing email or password");
            return null;
          }
          registerModels();
          // Ensure credentials are strings

          const email = credentials?.email as string;
          const password = credentials?.password as string;

          // Fetch user from your database
          await connectMongoDB();
          console.log("[authorize] Connected to database");
          console.log("[authorize] Mongoose models:", mongoose.models);
          const user = await MongooseUser.findOne({ email })
            .populate("roles") // Populate with role's name
            .exec();

          console.log("[authorize] User found:", user);

          if (!user) {
            console.log("[authorize] No user found for email:", email);
            throw new Error("Invalid email or password");
          }

          if (!user.password) {
            console.log("[authorize] User has no password field:", user);
            throw new Error("Invalid email or password");
          }

          const isMatched = await compare(password, user.password);
          console.log("[authorize] Password match result:", isMatched);
          if (!isMatched) {
            console.log("[authorize] Password did not match for user:", email);
            throw new Error("Password did not match");
          }

          // Check if user is admin
          if (user.roles?.name !== "admin") {
            // Throw a JSON stringified error so the frontend can detect it
            throw new Error(JSON.stringify({ code: "not_admin" }));
          }

          const role = user.roles?.name ? user.roles.name.toString() : "user";
          const userData = {
            id: user._id.toString(),
            name: user.name.toString(),
            email: user.email.toString(),
            role, // Return role's name as a string
          };
          console.log("[authorize] User data after login:", userData);
          return userData;
        } catch (err) {
          console.log("[authorize] Error during login:", err);
          throw err;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.role = user.role; // Attach role to token
        token.profilePicture = user.profilePicture;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.profilePicture =
          (token.profilePicture as string | null | undefined) || null;
      }
      // Fetch the user's profilePicture from DB if not present
      if (!session.user.profilePicture && session.user.id) {
        try {
          const dbUser = await MongooseUser.findById(session.user.id)
            .select("profilePicture")
            .lean();
          session.user.profilePicture = dbUser?.profilePicture || null;
        } catch (e) {
          session.user.profilePicture = null;
        }
      }
      return session;
    },
  },
};
