import mongoose, { Document, Schema, Model, Types, ObjectId } from "mongoose";
import Roles, { IRole } from "./roles";

// Define the User schema
const userSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: null },
    roles: { type: Schema.Types.ObjectId, ref: "Roles", required: true },
    address: { type: String, required: false },
  },
  { timestamps: true }
);

// Define the IUser interface for TypeScript typing
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  profilePicture?: string;
  roles: IRole;
  address?: string;
}

// Define a type for users returned in NextAuth
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roles: IRole;
  profilePicture?: string;
}

// Export the User model
export const User: Model<IUser> =
  mongoose.models?.User || mongoose.model<IUser>("User", userSchema);
