require("dotenv").config();

const express = require("express");
const cors = require("cors");
const passport = require("passport");

require("./config/passport");

const authRoutes = require("./routes/AuthRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use(passport.initialize());

app.use("/auth", authRoutes);

app.get("/health", (req, res) => {
  res.json({
    service: "auth-service",
    status: "running",
  });
});

const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log(`Auth Service running on ${PORT}`);
  console.log(`JWT Secret: ${process.env.GOOGLE_CLIENT_ID}`);
});