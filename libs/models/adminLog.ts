import mongoose, { Schema, Document, Types, Model } from "mongoose";

export interface IAdminLog extends Document {
  admin: Types.ObjectId; // Reference to the admin user
  action: string; // e.g., 'create', 'update', 'delete', 'login', etc.
  entity: string; // e.g., 'product', 'stock', 'user', 'order', etc.
  entityId?: Types.ObjectId | string; // ID of the affected entity (optional for some actions)
  details?: Record<string, any>; // Additional details (e.g., what changed)
  timestamp: Date;
}

const adminLogSchema = new Schema<IAdminLog>({
  admin: { type: Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: { type: Schema.Types.Mixed }, // Can be ObjectId or string
  details: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
});

export const AdminLog: Model<IAdminLog> =
  mongoose.models?.AdminLog ||
  mongoose.model<IAdminLog>("AdminLog", adminLogSchema);
