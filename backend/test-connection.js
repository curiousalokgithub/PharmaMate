const mysql = require("mysql2/promise");
require("dotenv").config();

async function testConnection() {
  console.log("Testing database connection...");
  console.log("Environment variables:");
  console.log(`DB_HOST: ${process.env.DB_HOST}`);
  console.log(`DB_USER: ${process.env.DB_USER}`);
  console.log(`DB_NAME: ${process.env.DB_NAME}`);
  console.log(
    `DB_PASSWORD: ${process.env.DB_PASSWORD ? "[HIDDEN]" : "Not set"}`
  );

  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "pharmacy_db",
    });

    console.log("Database connection successful!");

    // Test query to get medicine count
    const [rows] = await connection.execute(
      "SELECT COUNT(*) as count FROM medicines"
    );
    console.log(`Medicine count: ${rows[0].count}`);

    // Test query to get sales count
    const [salesRows] = await connection.execute(
      "SELECT COUNT(*) as count FROM sales"
    );
    console.log(`Sales count: ${salesRows[0].count}`);

    // Test query to get inventory logs count
    const [logsRows] = await connection.execute(
      "SELECT COUNT(*) as count FROM inventory_logs"
    );
    console.log(`Inventory logs count: ${logsRows[0].count}`);

    await connection.end();
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

testConnection()
  .then((success) => {
    if (success) {
      console.log("All database tests passed successfully!");
    } else {
      console.log("Database test failed.");
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error("Unexpected error during test:", err);
    process.exit(1);
  });
