// libs/connnectMongoDB.ts
import mongoose from "mongoose";

declare global {
  var mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Lazy env lookup so importing this module does not crash at build time
// (e.g. on Vercel's build step where MONGODB_URI isn't available). The
// variable is only required when an actual connection is established.
async function connectMongoDB({ seed = false } = {}) {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("Please define the MONGODB_URI environment variable.");
    }
    cached.promise = mongoose
      .connect(uri, { bufferCommands: false })
      .then((mongooseInstance) => mongooseInstance.connection);
  }

  cached.conn = await cached.promise;

  return cached.conn;
}

export default connectMongoDB;
