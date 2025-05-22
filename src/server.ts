import express from "express";
import dotenv from "dotenv";
import v1Routes from "./routes/v1";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173", // frontin osoite
  credentials: true,
}));

// Ei tarvita sessiota tai passportia!
// app.use(session(...));
// app.use(passport.initialize());

app.use("/api/v1", v1Routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});