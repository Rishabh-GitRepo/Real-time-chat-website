const express = require("express");

const passport = require("passport");

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
  }),

  async (req, res) => {

    const jwt = require("jsonwebtoken");

    const token = jwt.sign(
      {
        userId: req.user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.redirect(
      `http://localhost:5173/oauth-success?token=${token}`
    );
  }
);

module.exports = router;