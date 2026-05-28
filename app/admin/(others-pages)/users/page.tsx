import UserTable from "@/components/admin/UserTable";
import { getAdminUsers } from "@/libs/actions/users/read";

export default async function page() {
  const users = await getAdminUsers();

  return (
    <div>
      <UserTable users={users} />
    </div>
  );
}
