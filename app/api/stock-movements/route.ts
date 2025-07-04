import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/libs/connnectMongoDB";
import { StockMovement } from "@/libs/models/stockMovement";
import { Parser } from "json2csv";

export async function GET(req: NextRequest) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const query: any = {};
    if (searchParams.get("product"))
      query.product = searchParams.get("product");
    if (searchParams.get("type")) query.type = searchParams.get("type");
    if (searchParams.get("user")) query.createdBy = searchParams.get("user");
    if (searchParams.get("startDate") && searchParams.get("endDate")) {
      query.createdAt = {
        $gte: new Date(searchParams.get("startDate")!),
        $lte: new Date(searchParams.get("endDate")!),
      };
    }
    if (searchParams.get("search")) {
      query.note = { $regex: searchParams.get("search"), $options: "i" };
    }
    let movements = await StockMovement.find(query)
      .populate("product", "name")
      .populate("createdBy", "name");

    // CSV export
    if (searchParams.get("export") === "csv") {
      const fields = [
        "product.name",
        "quantity",
        "type",
        "note",
        "createdBy.name",
        "createdAt",
      ];
      const parser = new Parser({ fields });
      const data = movements.map((m) => ({
        "product.name":
          typeof m.product === "object" &&
          m.product !== null &&
          "name" in m.product
            ? (m.product as any).name
            : m.product,
        quantity: m.quantity,
        type: m.type,
        note: m.note,
        "createdBy.name":
          typeof m.createdBy === "object" &&
          m.createdBy !== null &&
          "name" in m.createdBy
            ? (m.createdBy as any).name
            : m.createdBy,
        createdAt: m.createdAt,
      }));
      const csv = parser.parse(data);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=stock-movements.csv",
        },
      });
    }

    return NextResponse.json(
      { success: true, data: movements },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch stock movements" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    await connectMongoDB();
    const movement = new StockMovement(data);
    const saved = await movement.save();
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to create stock movement" },
      { status: 500 }
    );
  }
}
