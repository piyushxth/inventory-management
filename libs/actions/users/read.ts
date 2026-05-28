import { getAdminUsersService } from "@/libs/services/user.service";
import { User } from "@/libs/users.type";

export async function getAdminUsers(): Promise<User[]> {
  return getAdminUsersService();
}
