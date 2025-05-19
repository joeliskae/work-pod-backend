require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const path = require("path");
const { google } = require("googleapis");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static("public"));

// Passport config
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Google API client
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "service-account.json"),
  scopes: ["https://www.googleapis.com/auth/calendar"],
});
const calendar = google.calendar({ version: "v3", auth });

// Auth routes
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

// Auth check
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
}

// Frontend routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public/dashboard.html"));
});

// API: Create booking
app.post("/api/book", ensureAuthenticated, async (req, res) => {
  const { calendarId, start, end } = req.body;

  try {
    const event = {
      summary: `Kopin varaus – ${req.user.displayName}`,
      start: { dateTime: start },
      end: { dateTime: end },
    };

    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
    });

    res.json({ success: true, link: response.data.htmlLink });
  } catch (error) {
    console.error("Varaus epäonnistui:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Get busy times for multiple calendars
app.post("/api/busy", ensureAuthenticated, async (req, res) => {
  const { calendarIds, timeMin, timeMax } = req.body;

  try {
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        timeZone: "Europe/Helsinki",
        items: calendarIds.map((id) => ({ id })),
      },
    });

    res.json({ success: true, busyTimes: response.data.calendars });
  } catch (error) {
    console.error("Virhe haettaessa varauksia:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, () => console.log(`Palvelin käynnissä http://localhost:${PORT}`));
