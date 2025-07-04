import mongoose, { Document, Schema, Model, Types } from "mongoose";

const wishlistSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export interface IWishlist extends Document {
  user: Types.ObjectId;
  products: Types.ObjectId[];
  updatedAt: Date;
}

export const Wishlist: Model<IWishlist> =
  mongoose.models.Wishlist ||
  mongoose.model<IWishlist>("Wishlist", wishlistSchema);
