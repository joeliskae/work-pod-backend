import express from "express";
import dotenv from "dotenv";
import v1Routes from "./routes/v1";
import cors from "cors";
import { requestLogger } from "./middleware/requestLogger";
import { warmUpCache } from "./services/cacheWarmup";

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173", // frontin osoite
  credentials: true,
}));

app.use(requestLogger);

app.use("/api/v1", v1Routes);

warmUpCache()
  .then(() => console.log("[Cache] Initial warmup complete"))
  .catch((err) => console.error("[Cache] Warmup error", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});