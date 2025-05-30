import sqlite3 from "sqlite3";
import { open } from "sqlite";

async function showDbContents() {
  const db = await open({
    filename: "./usage.sqlite", // Oikea nimi ja polku
    driver: sqlite3.Database,
  });

  const tables = await db.all(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
  );

  if (tables.length === 0) {
    console.log("⚠️  Tietokannassa ei ole käyttäjän tauluja.");
    return;
  }

  for (const { name } of tables) {
    console.log(`\n📄 Taulu: \x1b[1m${name}\x1b[0m`);

    const rows = await db.all(
        `SELECT * FROM (
        SELECT * FROM ${name} ORDER BY id DESC LIMIT 10
        ) sub ORDER BY id ASC`
    );
    
    if (rows.length === 0) {
      console.log("   (ei rivejä)");
    } else {
      console.table(rows);
    }
  }

  await db.close();
}

showDbContents().catch((err) => {
  console.error("❌ Virhe tietokannan luvussa:", err);
});
