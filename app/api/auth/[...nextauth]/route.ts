// // import { handlers } from "@/auth";
// // export const { GET, POST } = handlers;

// import NextAuth from "next-auth";
// import Credentials from "next-auth/providers/credentials";
// import { compare } from "bcryptjs"; // To compare hashed passwords
// import connectMongoDB from "@/libs/connnectMongoDB";
// import { User } from "@/libs/mongoose_models/users";
// import mongoose from "mongoose";
// import { registerModels } from "@/libs/registerModels";

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   session: {
//     strategy: "jwt",
//   },
//   providers: [
//     Credentials({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       authorize: async (credentials) => {
//         try {
//           registerModels();
//           // Ensure credentials are strings
//           const email = credentials?.email as string;
//           const password = credentials?.password as string;

//           // Fetch user from your database
//           await connectMongoDB();
//           console.log("Connected to database");
//           console.log(mongoose.models);
//           const user = await User.findOne({ email })
//             .populate("roles") // Populate with role's name
//             .exec();

//           console.log("Hello from the outside", user);

//           if (!user) {
//             throw new Error("Invalid email or password");
//           }

//           if (!user.password) {
//             throw new Error("Invalid email or password");
//           }

//           const isMatched = await compare(password, user.password);
//           if (!isMatched) {
//             throw new Error("Password did not match");
//           }

//           // Return the user data with role's name (as string)
//           const userData = {
//             _id: user._id.toString(),
//             name: user.name,
//             email: user.email,
//             role: user.roles?.name as string, // Return role's name as a string
//           };

//           return userData; // This matches the expected type (string for role)
//         } catch (error: unknown) {
//           if (error instanceof Error) {
//             console.error("Error during authentication:", error.message);
//             throw new Error("Error authenticating with the database.");
//           }
//           console.error("Unknown error occurred:", error);
//           throw new Error("An unknown error occurred.");
//         }
//       },
//     }),
//   ],
//   pages: {
//     signIn: "/login",
//   },
//   secret: process.env.NEXTAUTH_SECRET,

//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user._id.toString();
//         token.name = user.name;
//         token.email = user.email;
//         token.role = user.role; // Ensure this matches the session's role
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (token) {
//         session.user.role = token.role; // Add role to session user
//       }
//       return session;
//     },
//   },
// });

// export const { GET, POST } = handlers;

// import connectMongoDB from "@/libs/connnectMongoDB";
// import { registerModels } from "@/libs/registerModels";
// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import mongoose from "mongoose";
// import { User as MongooseUser } from "@/libs/mongoose_models/users";
// import { compare } from "bcryptjs";
// import type { NextAuthOptions, Session, User } from "next-auth";
// import type { JWT } from "next-auth/jwt";

//  const authOptions: NextAuthOptions = {
//   // Configure one or more authentication providers
//   providers: [
//     CredentialsProvider({
//       name: "CredentialsProvider",
//       credentials: {
//         email: { label: "Email", type: "email", placeholder: "Email" },
//         password: {
//           label: "Password",
//           type: "password",
//           placeholder: "Password",
//         },
//       },
//       async authorize(credentials) {
//         try {
//           if (!credentials?.email || !credentials?.password) {
//             return null;
//           }
//           registerModels();
//           // Ensure credentials are strings

//           const email = credentials?.email as string;
//           const password = credentials?.password as string;

//           // Fetch user from your database
//           await connectMongoDB();
//           console.log("Connected to database");
//           console.log(mongoose.models);
//           const user = await MongooseUser.findOne({ email })
//             .populate("roles") // Populate with role's name
//             .exec();

//           console.log("Hello from the outside", user);

//           if (!user) {
//             throw new Error("Invalid email or password");
//           }

//           if (!user.password) {
//             throw new Error("Invalid email or password");
//           }

//           const isMatched = await compare(password, user.password);
//           if (!isMatched) {
//             throw new Error("Password did not match");
//           }
//           const role = user.roles?.name ? user.roles.name.toString() : "user";
//           const userData = {
//             id: user._id.toString(),
//             name: user.name.toString(),
//             email: user.email.toString(),
//             role, // Return role's name as a string
//           };
//           console.log("user data after login", userData);
//           return userData;
//         } catch {
//           throw new Error("An unknown error occurred.");
//         }
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user }: { token: JWT; user?: User }) {
//       if (user) {
//         token.id = user.id;
//         token.role = user.role; // Attach role to token
//       }
//       return token;
//     },
//     async session({ session, token }: { session: Session; token: JWT }) {
//       if (session.user) {
//         session.user.id = token.id;
//         session.user.role = token.role; // Attach role to session
//       }
//       return session;
//     },
//   },
// };

// // export default NextAuth(authOptions);
// const handler = NextAuth(authOptions);
// const auth = NextAuth(authOptions);
// export { handler as GET, handler as POST, auth };

import { authOptions } from "@/libs/authOptions";
import NextAuth from "next-auth";

const handler = NextAuth(authOptions);
// export const auth = NextAuth(authOptions);
export { handler as GET, handler as POST };
