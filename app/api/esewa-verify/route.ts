import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { oid, refId, amt } = await req.json();
    
    // Verify payment with eSewa
    const response = await fetch(process.env.ESEWA_VERIFY_URL || "https://uat.esewa.com.np/epay/transrec", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        amt: amt.toString(),
        rid: refId,
        pid: oid,
        scd: process.env.ESEWA_MERCHANT_ID || "EPAYTEST",
      }),
    });
    
    const data = await response.text();
    
    // eSewa returns "Success" or "failure" in the response
    if (data.includes("Success")) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    console.error("eSewa verification error:", error);
    return NextResponse.json({ success: false, message: "An error occurred during verification" });
  }
}