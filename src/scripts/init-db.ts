import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function init() {
  const db = await open({
    filename: './usage.sqlite',
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS reservation_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      action TEXT CHECK(action IN ('created', 'updated', 'deleted')) NOT NULL,
      calendar_id TEXT NOT NULL,
      event_start DATETIME NOT NULL,
      event_end DATETIME NOT NULL,
      duration_minutes INTEGER GENERATED ALWAYS AS (
        CAST((JULIANDAY(event_end) - JULIANDAY(event_start)) * 24 * 60 AS INTEGER)
      ) STORED
    );
  `);

  console.log('✅ Tietokanta alustettu!');
  await db.close();
}

init().catch((err) => {
  console.error('Virhe tietokannan alustuksessa:', err);
  process.exit(1);
});
