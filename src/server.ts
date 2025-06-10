import express from "express";
import dotenv from "dotenv";
import v1Routes from "./routes/v1";
import cors from "cors";
import { requestLogger } from "./middleware/requestLogger";
import { warmUpCache } from "./services/cacheWarmup";
import { initializeDataSource } from "./data-source";
import path from "path";

dotenv.config();

const app = express();
app.use(express.json());

// Tarjoillaan admin-panelin staattinen sisältö
const adminPath = path.join(__dirname, "..", "admin-panel", "dist");

// Tarjoillaan staattinen sisältö
app.use("/admin", express.static(adminPath));

// Fallback React-routerille
app.get(/^\/admin(\/.*)?$/, (req, res) => {
  res.sendFile(path.join(adminPath, "index.html"));
});

const allowedOrigins = [
  "http://localhost:5173", // esim. frontend dev
  "http://localhost:3000", // esim. admin-panel
  "http://172.30.132.212:80", // uus ip
  "https://f9f2-193-166-177-58.ngrok-free.app"
];

async function startServer() {
  try {
    await initializeDataSource(); // Alustaa tietokannan
    console.log("✅ Tietokanta valmis");

    await warmUpCache(); // Käyttää tietokantaa
    console.log("[Cache] Initial warmup complete");

    app.use(
      cors({
        origin: (origin, callback) => {

          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
        credentials: true,
      })
    );

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
