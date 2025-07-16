import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { AdminLog } from "@/libs/models/adminLog";
import { User as MongooseUser } from "@/libs/models/users";
import connectMongoDB from "@/libs/connnectMongoDB";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectMongoDB();
    // Fetch latest 100 logs, newest first
    const logs = await AdminLog.find({})
      .sort({ timestamp: -1 })
      .limit(100)
      .populate({ path: "admin", select: "name email" })
      .lean();
    // Format logs for frontend
    const formatted = logs.map((log: any) => ({
      _id: log._id,
      admin: log.admin?._id,
      adminName: log.admin?.name || log.admin?.email || "-",
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      details: log.details,
      timestamp: log.timestamp,
    }));
    return NextResponse.json({ logs: formatted });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
