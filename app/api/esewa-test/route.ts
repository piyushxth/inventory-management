import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // Test if we can reach eSewa's verification endpoint
    const response = await fetch("https://uat.esewa.com.np/epay/transrec", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        amt: "100",
        rid: "TEST_REF_123",
        pid: "TEST_ORDER_123",
        scd: "EPAYTEST",
      }),
    });
    
    const data = await response.text();
    
    return NextResponse.json({
      success: true,
      message: "Successfully connected to eSewa",
      response: data.substring(0, 100) + "...", // First 100 characters
      status: response.status
    });
  } catch (error) {
    console.error("eSewa connection test error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to connect to eSewa",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}