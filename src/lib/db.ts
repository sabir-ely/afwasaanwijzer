import { readFileSync } from "node:fs";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { Count, User } from "@/lib/types";

const dbPath = process.env.DATABASE_PATH || './afwasaanwijzer.db';
const db = new Database(dbPath);

export function getDb() {
  return db;
}

// Initialize database
export function initDb() {
  const schemaPath = "src/schema.sql";
  const schema = readFileSync(schemaPath, "utf-8");

  db.exec(schema);
}

export function createUser(
  username: string,
  password: string,
  role: string = "user"
) {
  const hashedPassword = bcrypt.hashSync(password, 10);
  db.prepare(
    "INSERT INTO users (username, password, role) VALUES (?, ?, ?)"
  ).run(username, hashedPassword, role);
}

export function verifyUser(username: string, password: string) {
  const user = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username) as User & { role: string };
  if (user && bcrypt.compareSync(password, user.password)) {
    return { id: user.id.toString(), name: user.username, role: user.role };
  }
  return null;
}

export function hasUsers() {
  const result = db
    .prepare("SELECT COUNT(*) as count FROM users")
    .get() as Count;
  return result.count > 0;
}

export function createEater(name: string, score: number = 0) {
  db.prepare("INSERT INTO eaters (name, score) VALUES (?, ?)").run(name, score);
}

export function getAllEaters() {
  return db.prepare("SELECT * FROM eaters ORDER BY name").all();
}

export function addHistory(
  dishwashers: string[],
  present: string[],
  hasCooked: string[]
) {
  db.prepare(
    "INSERT INTO history (dishwashers, present, hasCooked) VALUES (?, ?, ?)"
  ).run(
    JSON.stringify(dishwashers),
    JSON.stringify(present),
    JSON.stringify(hasCooked)
  );
}

export function getAllHistory(limit?: number, offset?: number) {
  if (limit && offset !== undefined) {
    return db
      .prepare("SELECT * FROM history ORDER BY timestamp DESC LIMIT ? OFFSET ?")
      .all(limit, offset);
  }
  return db.prepare("SELECT * FROM history ORDER BY timestamp DESC").all();
}

export function getTotalHistoryCount() {
  const result = db
    .prepare("SELECT COUNT(*) as count FROM history")
    .get() as Count;
  return result.count;
}

export function resetEaterScore(id: number) {
  db.prepare("UPDATE eaters SET score = 0 WHERE id = ?").run(id);
}
