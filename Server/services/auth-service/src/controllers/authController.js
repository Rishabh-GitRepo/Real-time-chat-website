const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const prisma = require("../config/db");

// Helper function to validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to validate password strength
const isValidPassword = (password) => {
  return password && password.length >= 6;
};

const signup = async (req, res) => {

  try {

    const { email, password, username } = req.body;

    // Input validation
    if (!email || !password || !username) {
      return res.status(400).json({
        message: "Email, password, and username are required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists. Please login or use forgot password.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        provider: "local",
      },
    });

    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Signup failed",
    });
  }
};

const login = async (req, res) => {

  try {

    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials. User not found. Please signup first.",
      });
    }

    // Only local users with password can login with email/password
    if (user.provider !== "local" || !user.password) {
      return res.status(401).json({
        message: "This account uses a different login method",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Login failed",
    });
  }
};

// Forgot password - generate reset token
const forgotPassword = async (req, res) => {

  try {

    const { email } = req.body;

    // Input validation
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists for security reasons
      return res.status(200).json({
        message: "If an account exists with this email, a password reset link will be sent",
      });
    }

    // Only local users can reset password
    if (user.provider !== "local") {
      return res.status(400).json({
        message: "This account uses a different login method. Cannot reset password.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Set token expiry to 30 minutes from now
    const expireTime = new Date();
    expireTime.setMinutes(expireTime.getMinutes() + 30);

    // Save hashed token and expiry in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: expireTime,
      },
    });

    // In a real application, you would send this token via email
    // For now, returning it (in production, only send via email)
    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

    res.json({
      message: "Password reset link generated",
      // In production, remove this - only send via email
      resetLink: resetUrl,
      resetToken: resetToken,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Failed to process forgot password request",
    });
  }
};

// Reset password with token
const resetPassword = async (req, res) => {

  try {

    const { token, newPassword } = req.body;

    // Input validation
    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token and new password are required",
      });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          gt: new Date(), // Token must not be expired
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    res.json({
      message: "Password reset successful. Please login with your new password.",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Failed to reset password",
    });
  }
};


module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
};