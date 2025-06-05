import express from "express";
import dotenv from "dotenv";
import v1Routes from "./routes/v1";
import cors from "cors";
import { requestLogger } from "./middleware/requestLogger";
import { warmUpCache } from "./services/cacheWarmup";
import { initializeDataSource } from "./data-source";

dotenv.config();

const app = express();
app.use(express.json());

async function startServer() {
  try {
    await initializeDataSource(); // Alustaa tietokannan
    console.log("✅ Tietokanta valmis");

    await warmUpCache(); // Käyttää tietokantaa
    console.log("[Cache] Initial warmup complete");

    app.use(cors({
      origin: "http://localhost:5173",
      credentials: true,
    }));

    app.use(requestLogger);
    app.use("/api/v1", v1Routes);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Server initialization error:", error);
  }
}

startServer();
