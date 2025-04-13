const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Check if username or email exists
exports.checkUsername = async (req, res) => {
  try {
    const { username, email } = req.query;

    if (!username && !email) {
      return res.status(400).json({ message: "Username or email is required" });
    }

    let query = "SELECT username, email FROM users WHERE ";
    const params = [];

    if (username) {
      query += "username = ?";
      params.push(username);
    }

    if (email) {
      if (username) query += " OR ";
      query += "email = ?";
      params.push(email);
    }

    const [existingUsers] = await pool.execute(query, params);

    if (existingUsers.length > 0) {
      const exists = {
        username: username
          ? existingUsers.some((u) => u.username === username)
          : false,
        email: email ? existingUsers.some((u) => u.email === email) : false,
      };
      return res.json({ exists });
    }

    res.json({ exists: { username: false, email: false } });
  } catch (error) {
    console.error("Check username error:", error);
    res.status(500).json({
      message: "Error checking username/email availability",
      detail: error.message,
    });
  }
};

// Register new user
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ message: "Validation error", errors: errors.array() });
  }

  try {
    const { username, password, email } = req.body;

    // Check if username already exists
    const [existingUsers] = await pool.execute(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existingUsers.length > 0) {
      const field =
        existingUsers[0].username === username ? "username" : "email";
      return res.status(400).json({ message: `${field} already exists` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
      [username, hashedPassword, email]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: { id: result.insertId, username, email },
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Improved error handling with specific messages
    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      return res.status(500).json({
        message: "Database connection failed - Access denied",
        detail: "Please check your database credentials",
      });
    } else if (error.code === "ECONNREFUSED") {
      return res.status(500).json({
        message: "Database connection failed - Connection refused",
        detail: "Please check if the database server is running",
      });
    } else if (error.code === "ER_NO_SUCH_TABLE") {
      return res.status(500).json({
        message: "Database table missing",
        detail: "The users table does not exist",
      });
    } else if (error.code === "ER_BAD_FIELD_ERROR") {
      return res.status(500).json({
        message: "Database schema error",
        detail: "Database column mismatch",
      });
    }

    res.status(500).json({
      message: "Error registering user",
      detail: error.message || "Unknown database error",
    });
  }
};

// Login user
exports.login = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const { username, password } = req.body;

  try {
    // Find user
    const [users] = await pool.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: "Invalid credentials",
        error: "user_not_found",
      });
    }

    const user = users[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log(
        `Failed login attempt for user ${username}: Invalid password`
      );
      return res.status(401).json({
        message: "Invalid credentials",
        error: "invalid_password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    console.log(`User ${username} logged in successfully`);

    // Return user data and token (exclude password)
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at,
    };

    res.json({
      message: "Login successful",
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Error during login",
      error: error.message,
    });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const [users] = await pool.execute(
      "SELECT id, username, email, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(users[0]);
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Error fetching user information" });
  }
};
