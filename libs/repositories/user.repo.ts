import connectMongoDB from "../connnectMongoDB";
import { User } from "../models";

export async function findAdminUsersRepo() {
  await connectMongoDB();
  return User.find().sort({ createdAt: -1 }).lean();
}

export async function findUserByIdRepo(userId: string) {
  await connectMongoDB();

  return User.findById(userId).lean();
}
