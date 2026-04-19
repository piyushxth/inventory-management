import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const envVars = {
    NEXT_PUBLIC_ESEWA_PAYMENT_URL: process.env.NEXT_PUBLIC_ESEWA_PAYMENT_URL,
    NEXT_PUBLIC_ESEWA_MERCHANT_ID: process.env.NEXT_PUBLIC_ESEWA_MERCHANT_ID,
    ESEWA_VERIFY_URL: process.env.ESEWA_VERIFY_URL,
    ESEWA_MERCHANT_ID: process.env.ESEWA_MERCHANT_ID,
  };

  return NextResponse.json({
    success: true,
    envVars,
  });
}