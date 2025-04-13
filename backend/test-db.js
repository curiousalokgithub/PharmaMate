const mysql = require("mysql2/promise");
require("dotenv").config();

async function testConnection() {
  // Hardcoded for testing
  const config = {
    host: "localhost",
    user: "root",
    password: "root", // Use your MySQL password here
  };

  const dbName = "pharmacy_db";

  console.log("Attempting to connect with:", {
    host: config.host,
    user: config.user,
    password: config.password ? "******" : "(empty)",
  });

  try {
    // First connect without specifying a database
    const connection = await mysql.createConnection(config);
    console.log("✅ Database connection successful!");

    // Create database if it doesn't exist
    console.log(`⚙️ Creating database '${dbName}' if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✅ Database '${dbName}' is ready!`);

    // Switch to the database
    await connection.query(`USE ${dbName}`);
    console.log(`✅ Using database '${dbName}'`);

    // Test if users table exists
    const [tableResults] = await connection.query(`SHOW TABLES LIKE 'users'`);
    if (tableResults.length === 0) {
      console.log(`❌ Table 'users' does not exist!`);

      // Create users table if not exists
      const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          email VARCHAR(100) NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await connection.query(createUsersTable);
      console.log(`✅ Table 'users' created successfully!`);
    } else {
      console.log(`✅ Table 'users' exists!`);
    }

    // Test if medicines table exists
    const [medicinesTableResults] = await connection.query(
      `SHOW TABLES LIKE 'medicines'`
    );
    if (medicinesTableResults.length === 0) {
      console.log(`❌ Table 'medicines' does not exist!`);

      // Create medicines table
      const createMedicinesTable = `
        CREATE TABLE IF NOT EXISTS medicines (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          price DECIMAL(10, 2) NOT NULL,
          quantity INT NOT NULL,
          expiry_date DATE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await connection.query(createMedicinesTable);
      console.log(`✅ Table 'medicines' created successfully!`);

      // Insert sample medicines
      const insertSampleMedicines = `
        INSERT INTO medicines (name, description, price, quantity, expiry_date) VALUES
        ('Paracetamol', 'Pain reliever and fever reducer', 5.99, 100, '2024-12-31'),
        ('Ibuprofen', 'Anti-inflammatory and pain reliever', 7.99, 150, '2024-11-30'),
        ('Amoxicillin', 'Antibiotic for bacterial infections', 12.99, 75, '2024-10-31'),
        ('Loratadine', 'Antihistamine for allergies', 8.99, 120, '2024-09-30'),
        ('Omeprazole', 'Proton pump inhibitor for acid reflux', 15.99, 90, '2024-08-31')
      `;

      await connection.query(insertSampleMedicines);
      console.log(`✅ Sample medicines added successfully!`);
    } else {
      console.log(`✅ Table 'medicines' exists!`);
    }

    // Test if sales table exists
    const [salesTableResults] = await connection.query(
      `SHOW TABLES LIKE 'sales'`
    );
    if (salesTableResults.length === 0) {
      console.log(`❌ Table 'sales' does not exist!`);

      // Create sales table
      const createSalesTable = `
        CREATE TABLE IF NOT EXISTS sales (
          id INT AUTO_INCREMENT PRIMARY KEY,
          medicine_id INT,
          quantity INT NOT NULL,
          total_price DECIMAL(10, 2) NOT NULL,
          sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (medicine_id) REFERENCES medicines(id)
        )
      `;

      await connection.query(createSalesTable);
      console.log(`✅ Table 'sales' created successfully!`);
    } else {
      console.log(`✅ Table 'sales' exists!`);
    }

    // Test if inventory_logs table exists
    const [logsTableResults] = await connection.query(
      `SHOW TABLES LIKE 'inventory_logs'`
    );
    if (logsTableResults.length === 0) {
      console.log(`❌ Table 'inventory_logs' does not exist!`);

      // Create inventory_logs table
      const createLogsTable = `
        CREATE TABLE IF NOT EXISTS inventory_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          medicine_id INT,
          previous_quantity INT NOT NULL,
          new_quantity INT NOT NULL,
          change_type ENUM('ADD', 'REMOVE', 'UPDATE') NOT NULL,
          log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (medicine_id) REFERENCES medicines(id)
        )
      `;

      await connection.query(createLogsTable);
      console.log(`✅ Table 'inventory_logs' created successfully!`);
    } else {
      console.log(`✅ Table 'inventory_logs' exists!`);
    }

    await connection.end();
    console.log("✅ All database checks completed successfully!");
  } catch (error) {
    console.error("❌ Database connection or setup error:", error.message);
    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.log("\n🔧 Possible solutions:");
      console.log("1. Check if MySQL service is running");
      console.log("2. Verify username and password in .env file");
      console.log("3. Make sure the user has appropriate permissions");
    } else if (error.code === "ECONNREFUSED") {
      console.log("\n🔧 Possible solutions:");
      console.log(
        "1. Ensure MySQL server is running on the specified host and port"
      );
      console.log("2. Check firewall settings that might block the connection");
    }
  }
}

testConnection();
