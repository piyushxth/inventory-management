import mongoose, { Schema, Document, Types, Model } from "mongoose";

export interface INotification extends Document {
  type: string; // e.g., 'order', 'stock', 'user', 'product', etc.
  message: string;
  entity: string; // e.g., 'order', 'product', etc.
  entityId?: Types.ObjectId | string;
  recipient: Types.ObjectId | string; // 'admin', 'all', or specific user/admin ID
  read: boolean;
  createdAt: Date;
  meta?: Record<string, any>; // Extra info (optional)
}

const notificationSchema = new Schema<INotification>({
  type: { type: String, required: true },
  message: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: { type: Schema.Types.Mixed },
  recipient: { type: Schema.Types.Mixed, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  meta: { type: Schema.Types.Mixed },
});

export const Notification: Model<INotification> =
  mongoose.models?.Notification ||
  mongoose.model<INotification>("Notification", notificationSchema);
