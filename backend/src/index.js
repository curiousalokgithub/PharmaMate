const express = require("express");
const cors = require("cors");
const { body, validationResult } = require("express-validator");
const pool = require("./config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authController = require("./controllers/authController");
const authRoutes = require("./routes/authRoutes");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS configuration
app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// Test endpoint for checking API status
app.get("/api", (req, res) => {
  res.json({ message: "Pharmacy API is running", status: "OK" });
});

// Initialize database tables
const initDatabase = async () => {
  try {
    console.log("Checking database tables...");

    // Check if users table exists
    const [usersTable] = await pool.execute(
      `
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
    `,
      [process.env.DB_NAME || "pharmacy_db"]
    );

    if (usersTable.length === 0) {
      console.log("Creating users table...");
      await pool.execute(`
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("Users table created successfully");
    }

    // Check if medicines table exists
    const [medicinesTable] = await pool.execute(
      `
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'medicines'
    `,
      [process.env.DB_NAME || "pharmacy_db"]
    );

    if (medicinesTable.length === 0) {
      console.log("Creating medicines table...");
      await pool.execute(`
        CREATE TABLE medicines (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          price DECIMAL(10, 2) NOT NULL,
          quantity INT NOT NULL DEFAULT 0,
          expiry_date DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("Medicines table created successfully");
    }

    // Check if sales table exists
    const [salesTable] = await pool.execute(
      `
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'sales'
    `,
      [process.env.DB_NAME || "pharmacy_db"]
    );

    if (salesTable.length === 0) {
      console.log("Creating sales table...");
      await pool.execute(`
        CREATE TABLE sales (
          id INT AUTO_INCREMENT PRIMARY KEY,
          medicine_id INT NOT NULL,
          quantity INT NOT NULL,
          total_price DECIMAL(10, 2) NOT NULL,
          sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (medicine_id) REFERENCES medicines(id)
        )
      `);
      console.log("Sales table created successfully");
    }

    // Check if inventory_logs table exists
    const [inventoryLogsTable] = await pool.execute(
      `
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'inventory_logs'
    `,
      [process.env.DB_NAME || "pharmacy_db"]
    );

    if (inventoryLogsTable.length === 0) {
      console.log("Creating inventory_logs table...");
      await pool.execute(`
        CREATE TABLE inventory_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          medicine_id INT NOT NULL,
          previous_quantity INT NOT NULL,
          new_quantity INT NOT NULL,
          change_type ENUM('ADD', 'REMOVE', 'UPDATE') NOT NULL,
          log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (medicine_id) REFERENCES medicines(id)
        )
      `);
      console.log("Inventory_logs table created successfully");
    }

    console.log("Database initialization completed");
  } catch (error) {
    console.error("Database initialization error:", error);
  }
};

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Check JWT Secret - log warning if using default
if (JWT_SECRET === "your-secret-key") {
  console.warn("======================================================");
  console.warn("WARNING: Using default JWT secret. This is insecure!");
  console.warn("Please set JWT_SECRET in your .env file for security.");
  console.warn("======================================================");
}

// Run database initialization
initDatabase().catch((error) => {
  console.error("Database initialization failed:", error);
  console.error(
    "The application will continue, but database operations might fail."
  );
});

// Use auth routes from the module
app.use("/api/auth", authRoutes);

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied" });
  }

  // Special handling for demo token
  if (token === "demo-token-for-bypassing-auth") {
    req.user = { id: 999, username: "demo-user" };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

// Medicine routes
app.get("/api/medicines", authenticateToken, async (req, res) => {
  try {
    console.log("GET /api/medicines request received");
    const [medicines] = await pool.execute(
      "SELECT * FROM medicines ORDER BY name ASC"
    );
    console.log(`Returning ${medicines.length} medicines`);
    res.json(medicines);
  } catch (error) {
    console.error("Error in GET /api/medicines:", error);
    res
      .status(500)
      .json({ message: "Error fetching medicines", error: error.message });
  }
});

app.get("/api/medicines/:id", authenticateToken, async (req, res) => {
  try {
    console.log(`GET /api/medicines/${req.params.id} request received`);
    const [medicines] = await pool.execute(
      "SELECT * FROM medicines WHERE id = ?",
      [req.params.id]
    );

    if (medicines.length === 0) {
      console.log(`Medicine with ID ${req.params.id} not found`);
      return res.status(404).json({ message: "Medicine not found" });
    }

    console.log(`Returning medicine with ID ${req.params.id}`);
    res.json(medicines[0]);
  } catch (error) {
    console.error(`Error in GET /api/medicines/${req.params.id}:`, error);
    res
      .status(500)
      .json({ message: "Error fetching medicine", error: error.message });
  }
});

app.post("/api/medicines", authenticateToken, async (req, res) => {
  try {
    console.log("POST /api/medicines request received:", req.body);
    const { name, description, price, quantity, expiry_date } = req.body;

    // Validate input
    if (!name || !price) {
      console.log("Invalid request: Missing required fields");
      return res.status(400).json({ message: "Name and price are required" });
    }

    const [result] = await pool.execute(
      "INSERT INTO medicines (name, description, price, quantity, expiry_date) VALUES (?, ?, ?, ?, ?)",
      [
        name,
        description || "",
        Number(price) || 0,
        Number(quantity) || 0,
        expiry_date,
      ]
    );

    console.log(`Medicine added successfully with ID ${result.insertId}`);
    res.status(201).json({
      message: "Medicine added successfully",
      id: result.insertId,
      medicine: {
        id: result.insertId,
        name,
        description,
        price,
        quantity,
        expiry_date,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/medicines:", error);
    res
      .status(500)
      .json({ message: "Error adding medicine", error: error.message });
  }
});

app.put("/api/medicines/:id", authenticateToken, async (req, res) => {
  try {
    console.log(
      `PUT /api/medicines/${req.params.id} request received:`,
      req.body
    );
    const { name, description, price, quantity, expiry_date } = req.body;

    // Validate input
    if (!name || !price) {
      console.log("Invalid request: Missing required fields");
      return res.status(400).json({ message: "Name and price are required" });
    }

    const [result] = await pool.execute(
      "UPDATE medicines SET name = ?, description = ?, price = ?, quantity = ?, expiry_date = ? WHERE id = ?",
      [
        name,
        description || "",
        Number(price) || 0,
        Number(quantity) || 0,
        expiry_date,
        req.params.id,
      ]
    );

    if (result.affectedRows === 0) {
      console.log(`Medicine with ID ${req.params.id} not found for update`);
      return res.status(404).json({ message: "Medicine not found" });
    }

    console.log(`Medicine with ID ${req.params.id} updated successfully`);
    res.json({
      message: "Medicine updated successfully",
      medicine: {
        id: parseInt(req.params.id),
        name,
        description,
        price,
        quantity,
        expiry_date,
      },
    });
  } catch (error) {
    console.error(`Error in PUT /api/medicines/${req.params.id}:`, error);
    res
      .status(500)
      .json({ message: "Error updating medicine", error: error.message });
  }
});

app.delete("/api/medicines/:id", authenticateToken, async (req, res) => {
  try {
    console.log(`DELETE /api/medicines/${req.params.id} request received`);

    // First check if medicine exists
    const [medicines] = await pool.execute(
      "SELECT * FROM medicines WHERE id = ?",
      [req.params.id]
    );

    if (medicines.length === 0) {
      console.log(`Medicine with ID ${req.params.id} not found for deletion`);
      return res.status(404).json({ message: "Medicine not found" });
    }

    // Delete the medicine
    const [result] = await pool.execute("DELETE FROM medicines WHERE id = ?", [
      req.params.id,
    ]);

    console.log(`Medicine with ID ${req.params.id} deleted successfully`);
    res.json({ message: "Medicine deleted successfully" });
  } catch (error) {
    console.error(`Error in DELETE /api/medicines/${req.params.id}:`, error);

    // Check if it's a foreign key constraint error
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(400).json({
        message:
          "Cannot delete medicine because it's referenced in sales or inventory records",
        error: error.message,
      });
    }

    res
      .status(500)
      .json({ message: "Error deleting medicine", error: error.message });
  }
});

// Sales routes
app.get("/api/sales", authenticateToken, async (req, res) => {
  try {
    const [sales] = await pool.execute(`
      SELECT s.*, m.name as medicine_name 
      FROM sales s
      JOIN medicines m ON s.medicine_id = m.id
      ORDER BY s.sale_date DESC
    `);
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sales" });
  }
});

app.post("/api/sales", authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { medicine_id, quantity, total_price } = req.body;

    // Check if medicine exists and has enough stock
    const [medicines] = await connection.execute(
      "SELECT * FROM medicines WHERE id = ?",
      [medicine_id]
    );

    if (medicines.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Medicine not found" });
    }

    const medicine = medicines[0];
    if (medicine.quantity < quantity) {
      await connection.rollback();
      return res.status(400).json({ message: "Insufficient stock" });
    }

    // Add sale record
    const [saleResult] = await connection.execute(
      "INSERT INTO sales (medicine_id, quantity, total_price) VALUES (?, ?, ?)",
      [medicine_id, quantity, total_price]
    );

    // Update medicine quantity
    const newQuantity = medicine.quantity - quantity;
    await connection.execute("UPDATE medicines SET quantity = ? WHERE id = ?", [
      newQuantity,
      medicine_id,
    ]);

    // Add inventory log
    await connection.execute(
      "INSERT INTO inventory_logs (medicine_id, previous_quantity, new_quantity, change_type) VALUES (?, ?, ?, ?)",
      [medicine_id, medicine.quantity, newQuantity, "REMOVE"]
    );

    await connection.commit();
    res
      .status(201)
      .json({ message: "Sale recorded successfully", id: saleResult.insertId });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: "Error recording sale" });
  } finally {
    connection.release();
  }
});

app.get("/api/sales/reports", authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let query = `
      SELECT 
        m.name as medicine_name,
        SUM(s.quantity) as total_quantity,
        SUM(s.total_price) as total_revenue
      FROM sales s
      JOIN medicines m ON s.medicine_id = m.id
    `;

    const params = [];

    if (start_date && end_date) {
      query += ` WHERE s.sale_date BETWEEN ? AND ?`;
      params.push(start_date, end_date);
    }

    query += ` GROUP BY s.medicine_id ORDER BY total_revenue DESC`;

    const [results] = await pool.execute(query, params);

    // Get total revenue
    const [totalRevenue] = await pool.execute(
      `SELECT SUM(total_price) as total FROM sales ${
        start_date && end_date ? "WHERE sale_date BETWEEN ? AND ?" : ""
      }`,
      start_date && end_date ? [start_date, end_date] : []
    );

    res.json({
      reports: results,
      total_revenue: totalRevenue[0].total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Error generating reports" });
  }
});

// Inventory routes
app.get("/api/inventory/logs", authenticateToken, async (req, res) => {
  try {
    const [logs] = await pool.execute(`
      SELECT l.*, m.name as medicine_name 
      FROM inventory_logs l
      JOIN medicines m ON l.medicine_id = m.id
      ORDER BY l.log_date DESC
    `);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching inventory logs" });
  }
});

app.post("/api/inventory/update", authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { medicine_id, quantity, change_type } = req.body;

    // Check if medicine exists
    const [medicines] = await connection.execute(
      "SELECT * FROM medicines WHERE id = ?",
      [medicine_id]
    );

    if (medicines.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Medicine not found" });
    }

    const medicine = medicines[0];
    let newQuantity;

    if (change_type === "ADD") {
      newQuantity = medicine.quantity + quantity;
    } else if (change_type === "REMOVE") {
      if (medicine.quantity < quantity) {
        await connection.rollback();
        return res.status(400).json({ message: "Insufficient stock" });
      }
      newQuantity = medicine.quantity - quantity;
    } else {
      newQuantity = quantity; // For UPDATE type
    }

    // Update medicine quantity
    await connection.execute("UPDATE medicines SET quantity = ? WHERE id = ?", [
      newQuantity,
      medicine_id,
    ]);

    // Add inventory log
    await connection.execute(
      "INSERT INTO inventory_logs (medicine_id, previous_quantity, new_quantity, change_type) VALUES (?, ?, ?, ?)",
      [medicine_id, medicine.quantity, newQuantity, change_type]
    );

    await connection.commit();
    res.status(200).json({ message: "Inventory updated successfully" });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: "Error updating inventory" });
  } finally {
    connection.release();
  }
});

// Database connection test endpoint
app.get("/api/check-db-connection", async (req, res) => {
  try {
    // Test database connection
    const connection = await pool.getConnection();

    // Get database info
    const [dbVersion] = await connection.execute("SELECT VERSION() as version");

    // Get table info
    const [tables] = await connection.execute(
      `
      SELECT TABLE_NAME, TABLE_ROWS
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ?
    `,
      [process.env.DB_NAME || "pharmacy_db"]
    );

    connection.release();

    res.json({
      status: "Connected",
      database: process.env.DB_NAME || "pharmacy_db",
      version: dbVersion[0].version,
      tables: tables.map((t) => ({
        name: t.TABLE_NAME,
        approximate_rows: t.TABLE_ROWS,
      })),
    });
  } catch (error) {
    const errorInfo = {
      status: "Error",
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
    };

    console.error("Database connection test failed:", errorInfo);
    res.status(500).json(errorInfo);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
