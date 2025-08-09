import { NextRequest, NextResponse } from "next/server";
import { createUser, initDb, getDb } from "@/lib/db";
import { SqliteError } from "better-sqlite3";

export async function GET() {
  initDb();
  const db = getDb();
  const users = db
    .prepare("SELECT id, username, role FROM users ORDER BY username")
    .all();
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  try {
    initDb();
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Gebruikersnaam en wachtwoord zijn verplicht" },
        { status: 400 }
      );
    }

    createUser(username, password, "user");
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (
      error instanceof SqliteError &&
      error.code === "SQLITE_CONSTRAINT_UNIQUE"
    ) {
      return NextResponse.json(
        { error: "Deze gebruikersnaam bestaat al" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Kon gebruiker niet aanmaken" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    initDb();
    const { id } = await request.json();

    const db = getDb();
    db.prepare("DELETE FROM users WHERE id = ?").run(id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
