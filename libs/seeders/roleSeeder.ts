import connectMongoDB from "../connnectMongoDB";
import Roles from "../models/roles";

export async function seedRole() {
  try {
    await connectMongoDB({ seed: true });
    await Roles.deleteMany({});
    console.log("🗑️ All existing roles deleted.");

    const rolesData = [{ name: "admin" }, { name: "user" }];

    for (const roleData of rolesData) {
      const newRole = new Roles(roleData);
      await newRole.save();
      console.log(`✅ Seeded role: ${roleData.name}`);
    }
    console.log("🎉 Role seeding completed.");
  } catch (err) {
    console.error("❌ Error during role seeding:", err);
    throw err;
  }
}
