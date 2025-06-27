import sqlite3 from "sqlite3";
import { open } from "sqlite";

async function init() {
  const db = await open({
    filename: "./usage.sqlite",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS reservation_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      action TEXT CHECK(action IN ('created', 'updated', 'deleted')) NOT NULL,
      calendar_id TEXT NOT NULL,
      event_start DATETIME NOT NULL,
      event_end DATETIME NOT NULL
    );
      CREATE TABLE IF NOT EXISTS calendars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alias TEXT NOT NULL,
    calendarId TEXT NOT NULL,
    isActive BOOLEAN NOT NULL DEFAULT 1,
    color TEXT
  );

  CREATE TABLE IF NOT EXISTS tablet (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    calendarId TEXT NOT NULL,
    ipAddress TEXT,
    color TEXT
  );

  CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT NOT NULL UNIQUE,
    role TEXT CHECK(role IN ('admin', 'user')) NOT NULL
  );
  `);

  console.log("✅ Tietokanta alustettu!");
  await db.close();
}

init().catch((err) => {
  console.error("Virhe tietokannan alustuksessa:", err);
  process.exit(1);
});
