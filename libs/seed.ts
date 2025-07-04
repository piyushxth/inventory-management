import dotenv from "dotenv";
dotenv.config();

import { seedRole } from "./seeders/roleSeeder";
import { seedUser } from "./seeders/userSeeder";
import { seedBrand } from "./seeders/brandSeeder";
import { seedCategory } from "./seeders/categorySeeder";
import { seedCoupon } from "./seeders/couponSeeder";
import { seedReview } from "./seeders/reviewSeeder";
import { seedOrder } from "./seeders/orderSeeder";
import { seedAddress } from "./seeders/addressSeeder";
import { seedWishlist } from "./seeders/wishlistSeeder";
import { seedCart } from "./seeders/cartSeeder";
import { seedProduct } from "./seeders/productSeeder";

async function runSeeders() {
  try {
    console.log("Starting database seeding...");

    // Seed roles (no dependencies)
    console.log("\nSeeding roles...");
    await seedRole();

    // Seed users (depends on roles)
    console.log("\nSeeding users...");
    await seedUser();

    // Seed brands (no dependencies)
    console.log("\nSeeding brands...");
    await seedBrand();

    // Seed categories (no dependencies)
    console.log("\nSeeding categories...");
    await seedCategory();

    // Seed products (depends on brands and categories, uses placeholder IDs)
    console.log("\nSeeding products...");
    await seedProduct();

    // Seed coupons (no dependencies)
    console.log("\nSeeding coupons...");
    await seedCoupon();

    // Seed reviews (depends on products and users, but uses placeholder IDs)
    console.log("\nSeeding reviews...");
    await seedReview();

    // Seed orders (depends on users and products, but uses placeholder IDs)
    console.log("\nSeeding orders...");
    await seedOrder();

    // Seed addresses (depends on users, but uses placeholder IDs)
    console.log("\nSeeding addresses...");
    await seedAddress();

    // Seed wishlists (depends on users and products, but uses placeholder IDs)
    console.log("\nSeeding wishlists...");
    await seedWishlist();

    // Seed carts (depends on users and products, but uses placeholder IDs)
    console.log("\nSeeding carts...");
    await seedCart();

    console.log("\nDatabase seeding completed successfully!");
  } catch (error) {
    console.error("Error during database seeding:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  runSeeders()
    .then(() => {
      console.log("Seeding process completed.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Unhandled error during seeding:", error);
      process.exit(1);
    });
}
