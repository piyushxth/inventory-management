import mongoose, { Schema, Document } from "mongoose";

// Define the IRole interface for TypeScript typing
export interface IRole extends Document {
  _id: string;
  name?: string;
}

// Define the Role schema
const roleSchema: Schema = new Schema<IRole>(
  {
    name: { type: String, required: false, unique: true },
  },
  { timestamps: true }
);

// Avoid model overwrite errors in serverless environments
const Roles =
  mongoose.models?.Roles || mongoose.model<IRole>("Roles", roleSchema);

export default Roles;
