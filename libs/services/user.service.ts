import {
  findAdminUsersRepo,
  findUserByIdRepo,
} from "../repositories/user.repo";
import { User } from "../users.type";

export async function getAdminUsersService(): Promise<User[]> {
  const users = await findAdminUsersRepo();

  return users.map((u: any) => ({
    id: String(u._id),

    name: u.name,
    email: u.email,

    image: u.image ?? undefined,

    role: u.role,

    provider: u.provider,

    createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : "",

    updatedAt: u.updatedAt ? new Date(u.updatedAt).toISOString() : "",
  }));
}

export async function getUserByIdService(userId: string): Promise<User | null> {
  const u: any = await findUserByIdRepo(userId);

  if (!u) return null;

  return {
    id: String(u._id),

    name: u.name,
    email: u.email,

    image: u.image ?? undefined,

    role: u.role,

    provider: u.provider,

    createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : "",

    updatedAt: u.updatedAt ? new Date(u.updatedAt).toISOString() : "",
  };
}
