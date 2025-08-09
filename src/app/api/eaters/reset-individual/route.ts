import { NextRequest, NextResponse } from "next/server";
import { initDb, resetEaterScore } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    initDb();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    resetEaterScore(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to reset eater score" },
      { status: 500 }
    );
  }
}
