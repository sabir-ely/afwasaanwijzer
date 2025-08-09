import { NextResponse } from "next/server";
import { initDb, getDb } from "@/lib/db";

export async function POST() {
  try {
    initDb();
    const db = getDb();
    db.prepare("UPDATE eaters SET score = 0").run();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to reset scores" },
      { status: 500 }
    );
  }
}
