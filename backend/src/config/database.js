const mysql = require("mysql2/promise");
require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "pharmacy_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Adding connection timeout to avoid hanging
  connectTimeout: 10000, // 10 seconds
};

console.log("Database configuration:", {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  // Not logging password for security
});

// Create a pool with automatic reconnection
const pool = mysql.createPool(dbConfig);

// Test the connection and handle common errors
const testConnection = async (retries = 3) => {
  let attempt = 0;

  while (attempt < retries) {
    try {
      const connection = await pool.getConnection();
      console.log(
        `Database connection established successfully on attempt ${attempt + 1}`
      );
      connection.release();
      return true;
    } catch (error) {
      attempt++;
      console.error(
        `Database connection error (attempt ${attempt}/${retries}):`,
        {
          message: error.message,
          code: error.code,
          errno: error.errno,
          sqlState: error.sqlState,
          sqlMessage: error.sqlMessage,
        }
      );

      let errorMessage = "Unknown database error";

      switch (error.code) {
        case "ER_ACCESS_DENIED_ERROR":
          errorMessage =
            "Database access denied - check your username and password";
          break;
        case "ECONNREFUSED":
          errorMessage =
            "Database connection refused - check if database server is running";
          break;
        case "ER_BAD_DB_ERROR":
          errorMessage = `Database '${dbConfig.database}' doesn't exist`;
          // Try to create the database if it doesn't exist
          if (attempt === retries) {
            console.log("Attempting to create database...");
            try {
              // Create a connection without specifying a database
              const tempConfig = { ...dbConfig };
              delete tempConfig.database;
              const tempPool = mysql.createPool(tempConfig);
              await tempPool.execute(
                `CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`
              );
              console.log(
                `Database '${dbConfig.database}' created successfully`
              );
              await tempPool.end();
              // Return false to continue with the next attempt after creating the DB
              return false;
            } catch (createError) {
              console.error("Failed to create database:", createError.message);
            }
          }
          break;
        case "ER_DBACCESS_DENIED_ERROR":
          errorMessage = "No access to the database";
          break;
        case "PROTOCOL_CONNECTION_LOST":
          errorMessage = "Database connection was closed";
          break;
      }

      console.error(`Database Error: ${errorMessage}`);

      if (attempt < retries) {
        console.log(`Retrying connection in 2 seconds...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else {
        console.error(`Failed to connect after ${retries} attempts`);
        return false;
      }
    }
  }

  return false;
};

// Create a wrapper for executing queries with better error handling
const executeQuery = async (query, params = []) => {
  try {
    const [results] = await pool.execute(query, params);
    return [results, null];
  } catch (error) {
    console.error("Query execution error:", {
      query: query.substring(0, 100) + (query.length > 100 ? "..." : ""), // Truncate long queries
      params,
      error: {
        message: error.message,
        code: error.code,
        errno: error.errno,
      },
    });
    return [null, error];
  }
};

// Add helper functions
pool.executeQuery = executeQuery;
pool.testConnection = testConnection;

// Run test connection
testConnection().then((success) => {
  if (success) {
    console.log("Database is ready to accept connections");
  } else {
    console.warn(
      "Database connection issues detected - application may work with limited functionality"
    );
  }
});

module.exports = pool;
