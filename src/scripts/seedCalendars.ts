import { AppDataSource } from "../data-source";
import { Calendar } from "../entities/Calendar";

const calendarsToSeed: { alias: string; calendarId: string }[] = [
    { alias: "C238-1", calendarId: "59596f673673a4c675c2f8dc36245e1338b3470bcb7d7b08d4c67e793e941f87@group.calendar.google.com" },
    { alias: "C238-2", calendarId: "c74deb30d3039fa279ead11aa732bcb23caf5d6b274935020cc9aee7b819b054@group.calendar.google.com" },
    { alias: "C238-3", calendarId: "95538ac1d09e17571308a2e85960becc6734ffca46f1b518a6e68fdb9a085359@group.calendar.google.com" },
    { alias: "C203-1", calendarId: "8ebdeee5f8eedf87dcbfce229f59f069fdc400e9adf5b35b81a58806f59c05e9@group.calendar.google.com" },
    { alias: "C203-2", calendarId: "39a2fa3db1cba9ba07ea310adefa7acdaaf5e4ec5f45c63d4b5329ddb9eb9a90@group.calendar.google.com" },
  // "C221-2": "your_calendar_id_6@group.calendar.google.com",
  // lisää tarvittaessa
];

async function seed() {
  try {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(Calendar);

    for (const cal of calendarsToSeed) {
      const exists = await repo.findOneBy({ alias: cal.alias });
      if (!exists) {
        await repo.save(cal);
        console.log(`✅ Added: ${cal.alias}`);
      } else {
        console.log(`ℹ️ Already exists: ${cal.alias}`);
      }
    }

    console.log("✅ Calendar seed complete.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding calendars:", err);
    process.exit(1);
  }
}

seed();
