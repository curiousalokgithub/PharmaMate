const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// Check username/email availability
router.get("/check-availability", authController.checkUsername);

// Register a new user
router.post(
  "/register",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("email").isEmail().withMessage("Please provide a valid email address"),
  ],
  authController.register
);

// Login user
router.post(
  "/login",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  authController.login
);

// Get current user info
router.get("/me", authenticateToken, authController.getCurrentUser);

module.exports = router;
