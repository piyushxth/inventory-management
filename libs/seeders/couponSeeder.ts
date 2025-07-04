import connectMongoDB from "../connnectMongoDB";
import { Coupon } from "../models/coupon";

export async function seedCoupon() {
  try {
    await connectMongoDB({ seed: true });
    await Coupon.deleteMany({});
    console.log("🗑️ All existing coupons deleted.");

    const couponData = {
      code: "WELCOME10",
      discountType: "percentage",
      discountValue: 10,
      minOrderAmount: 50,
      maxDiscount: 20,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      isActive: true,
      usageLimit: 100,
      usedCount: 0,
    };

    const newCoupon = new Coupon(couponData);
    await newCoupon.save();
    console.log(`✅ Seeded: ${couponData.code}`);
    console.log("🎉 Coupon seeding completed.");
  } catch (err) {
    console.error("❌ Error during coupon seeding:", err);
    throw err;
  }
}
