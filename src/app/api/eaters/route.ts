import { NextRequest, NextResponse } from "next/server";
import { createEater, getAllEaters, initDb, getDb } from "@/lib/db";
import { SqliteError } from "better-sqlite3";

export async function GET() {
  initDb();
  const eaters = getAllEaters();
  return NextResponse.json(eaters);
}

export async function POST(request: NextRequest) {
  try {
    initDb();
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Naam is verplicht" }, { status: 400 });
    }

    createEater(name, 0);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (
      error instanceof SqliteError &&
      error.code === "SQLITE_CONSTRAINT_UNIQUE"
    ) {
      return NextResponse.json(
        { error: "Deze naam bestaat al" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Kon eter niet aanmaken" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    initDb();
    const { id, scoreChange } = await request.json();

    const db = getDb();
    db.prepare("UPDATE eaters SET score = score + ? WHERE id = ?").run(
      scoreChange,
      id
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update score" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    initDb();
    const { id } = await request.json();

    const db = getDb();
    db.prepare("DELETE FROM eaters WHERE id = ?").run(id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete eater" },
      { status: 500 }
    );
  }
}
