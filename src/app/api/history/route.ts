import { NextRequest, NextResponse } from "next/server";
import {
  initDb,
  getAllHistory,
  addHistory,
  getTotalHistoryCount,
} from "@/lib/db";

export async function GET(request: NextRequest) {
  initDb();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  const history = getAllHistory(limit, offset);
  const total = getTotalHistoryCount();

  return NextResponse.json({
    history,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    initDb();
    const { dishwashers, present, hasCooked, price } = await request.json();

    addHistory(dishwashers, present, hasCooked, price);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to add history" },
      { status: 500 }
    );
  }
}
