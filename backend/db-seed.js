const mysql = require("mysql2/promise");
require("dotenv").config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Sample data for medicines
const medicines = [
  {
    name: "Aspirin",
    description: "Pain reliever and fever reducer",
    price: 5.99,
    quantity: 150,
    expiry_date: "2025-06-30",
  },
  {
    name: "Amoxicillin",
    description: "Antibiotic used to treat bacterial infections",
    price: 12.5,
    quantity: 80,
    expiry_date: "2024-12-15",
  },
  {
    name: "Ibuprofen",
    description: "Non-steroidal anti-inflammatory drug",
    price: 7.25,
    quantity: 200,
    expiry_date: "2025-03-22",
  },
  {
    name: "Paracetamol",
    description: "Fever reducer and pain reliever",
    price: 4.5,
    quantity: 300,
    expiry_date: "2024-09-18",
  },
  {
    name: "Loratadine",
    description: "Antihistamine for allergy relief",
    price: 9.99,
    quantity: 100,
    expiry_date: "2023-11-30",
  },
  {
    name: "Omeprazole",
    description: "Reduces stomach acid production",
    price: 15.75,
    quantity: 75,
    expiry_date: "2024-10-05",
  },
  {
    name: "Simvastatin",
    description: "Lowers cholesterol levels",
    price: 18.99,
    quantity: 60,
    expiry_date: "2025-01-15",
  },
  {
    name: "Metformin",
    description: "Oral diabetes medication",
    price: 8.5,
    quantity: 120,
    expiry_date: "2024-08-22",
  },
  {
    name: "Amlodipine",
    description: "Treats high blood pressure",
    price: 11.25,
    quantity: 90,
    expiry_date: "2025-04-10",
  },
  {
    name: "Atorvastatin",
    description: "Lowers cholesterol and triglycerides",
    price: 22.5,
    quantity: 45,
    expiry_date: "2024-11-30",
  },
  {
    name: "Lisinopril",
    description: "ACE inhibitor for high blood pressure",
    price: 14.75,
    quantity: 85,
    expiry_date: "2025-02-28",
  },
  {
    name: "Levothyroxine",
    description: "Treats hypothyroidism",
    price: 10.99,
    quantity: 110,
    expiry_date: "2024-10-15",
  },
  {
    name: "Albuterol",
    description: "Bronchodilator for asthma relief",
    price: 25.99,
    quantity: 50,
    expiry_date: "2025-05-20",
  },
  {
    name: "Cetirizine",
    description: "Antihistamine for allergies",
    price: 8.99,
    quantity: 95,
    expiry_date: "2024-09-25",
  },
  {
    name: "Metoprolol",
    description: "Beta-blocker for hypertension",
    price: 12.75,
    quantity: 70,
    expiry_date: "2025-01-10",
  },
  {
    name: "Losartan",
    description: "Angiotensin II receptor blocker",
    price: 15.5,
    quantity: 65,
    expiry_date: "2024-11-05",
  },
  {
    name: "Gabapentin",
    description: "Anticonvulsant and nerve pain medication",
    price: 19.99,
    quantity: 55,
    expiry_date: "2025-03-15",
  },
  {
    name: "Citalopram",
    description: "SSRI antidepressant",
    price: 16.75,
    quantity: 60,
    expiry_date: "2024-12-20",
  },
  {
    name: "Sertraline",
    description: "SSRI for depression and anxiety",
    price: 17.5,
    quantity: 70,
    expiry_date: "2025-04-05",
  },
  {
    name: "Fluoxetine",
    description: "Antidepressant medication",
    price: 14.99,
    quantity: 80,
    expiry_date: "2024-10-10",
  },
  {
    name: "Hydrochlorothiazide",
    description: "Diuretic for high blood pressure",
    price: 9.5,
    quantity: 95,
    expiry_date: "2025-02-15",
  },
  {
    name: "Tramadol",
    description: "Pain medication for moderate to severe pain",
    price: 13.99,
    quantity: 65,
    expiry_date: "2024-08-30",
  },
  {
    name: "Warfarin",
    description: "Blood thinner (anticoagulant)",
    price: 11.5,
    quantity: 50,
    expiry_date: "2025-01-25",
  },
  {
    name: "Azithromycin",
    description: "Antibiotic for bacterial infections",
    price: 20.75,
    quantity: 45,
    expiry_date: "2024-09-20",
  },
  {
    name: "Prednisone",
    description: "Corticosteroid to treat inflammation",
    price: 7.99,
    quantity: 110,
    expiry_date: "2025-05-10",
  },
  {
    name: "Diazepam",
    description: "Benzodiazepine for anxiety and muscle spasms",
    price: 16.25,
    quantity: 40,
    expiry_date: "2024-07-15",
  },
  {
    name: "Furosemide",
    description: "Loop diuretic for fluid retention",
    price: 8.75,
    quantity: 90,
    expiry_date: "2025-03-30",
  },
  {
    name: "Pantoprazole",
    description: "Proton pump inhibitor for acid reflux",
    price: 12.99,
    quantity: 85,
    expiry_date: "2024-12-05",
  },
  {
    name: "Montelukast",
    description: "Leukotriene receptor antagonist for asthma",
    price: 18.5,
    quantity: 55,
    expiry_date: "2025-02-20",
  },
  {
    name: "Escitalopram",
    description: "SSRI for anxiety and depression",
    price: 16.99,
    quantity: 60,
    expiry_date: "2024-10-25",
  },
  {
    name: "Ranitidine",
    description: "H2 blocker for acid reflux",
    price: 7.5,
    quantity: 75,
    expiry_date: "2023-07-10",
  },
  {
    name: "Venlafaxine",
    description: "SNRI antidepressant",
    price: 15.25,
    quantity: 50,
    expiry_date: "2024-11-15",
  },
  {
    name: "Clonazepam",
    description: "Benzodiazepine for seizures and panic disorder",
    price: 14.5,
    quantity: 45,
    expiry_date: "2025-01-05",
  },
  {
    name: "Clopidogrel",
    description: "Antiplatelet medication",
    price: 21.99,
    quantity: 40,
    expiry_date: "2024-08-15",
  },
  {
    name: "Meloxicam",
    description: "NSAID for pain and inflammation",
    price: 10.75,
    quantity: 80,
    expiry_date: "2025-04-25",
  },
  {
    name: "Duloxetine",
    description: "SNRI for depression and nerve pain",
    price: 19.5,
    quantity: 55,
    expiry_date: "2024-12-10",
  },
  {
    name: "Rosuvastatin",
    description: "Statin for high cholesterol",
    price: 23.75,
    quantity: 50,
    expiry_date: "2025-03-05",
  },
  {
    name: "Buspirone",
    description: "Anti-anxiety medication",
    price: 13.25,
    quantity: 70,
    expiry_date: "2024-09-30",
  },
  {
    name: "Carvedilol",
    description: "Beta-blocker for heart failure",
    price: 15.99,
    quantity: 65,
    expiry_date: "2025-01-20",
  },
  {
    name: "Cyclobenzaprine",
    description: "Muscle relaxant",
    price: 9.25,
    quantity: 85,
    expiry_date: "2024-11-25",
  },
];

// Sample suppliers data
const suppliers = [
  {
    name: "MediPharma Inc.",
    contact_person: "John Smith",
    email: "john@medipharma.com",
    phone: "555-123-4567",
    address: "123 Health Avenue, New York, NY 10001",
  },
  {
    name: "Global Pharmaceuticals",
    contact_person: "Sarah Johnson",
    email: "sarah@globalpharma.com",
    phone: "555-234-5678",
    address: "456 Medicine Road, Chicago, IL 60601",
  },
  {
    name: "Healthcare Supplies Ltd",
    contact_person: "Michael Brown",
    email: "michael@healthsupplies.com",
    phone: "555-345-6789",
    address: "789 Wellness Blvd, Los Angeles, CA 90001",
  },
  {
    name: "BioMed Solutions",
    contact_person: "Emily Davis",
    email: "emily@biomed.com",
    phone: "555-456-7890",
    address: "101 Science Park, Boston, MA 02108",
  },
  {
    name: "PharmaPlus Distributors",
    contact_person: "Robert Wilson",
    email: "robert@pharmaplus.com",
    phone: "555-567-8901",
    address: "202 Distribution Center, Houston, TX 77001",
  },
];

async function initDatabase() {
  let connection;
  try {
    console.log("Starting database initialization...");

    // Create connection to MySQL server (without selecting a database)
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || "pharmacy_db";
    console.log(`Creating database: ${dbName} if it doesn't exist`);
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);

    // Use the database
    await connection.query(`USE ${dbName}`);

    // Create tables
    console.log("Creating tables...");

    // Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Suppliers table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Medicines table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS medicines (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        quantity INT NOT NULL DEFAULT 0,
        supplier_id INT,
        expiry_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
      )
    `);

    // Sales table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        medicine_id INT NOT NULL,
        quantity INT NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (medicine_id) REFERENCES medicines(id)
      )
    `);

    // Inventory logs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS inventory_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        medicine_id INT NOT NULL,
        previous_quantity INT NOT NULL,
        new_quantity INT NOT NULL,
        change_type ENUM('ADD', 'REMOVE', 'UPDATE') NOT NULL,
        log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (medicine_id) REFERENCES medicines(id)
      )
    `);

    // Check if admin user exists
    const [adminUsers] = await connection.execute(
      "SELECT * FROM users WHERE username = 'admin'"
    );

    // Create admin user if it doesn't exist
    if (adminUsers.length === 0) {
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash("admin123", 10);

      await connection.execute(
        "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
        ["admin", hashedPassword, "admin@pharmacy.com"]
      );
      console.log("Admin user created");
    }

    // Insert medicines if table is empty
    const [existingMedicines] = await connection.execute(
      "SELECT COUNT(*) as count FROM medicines"
    );
    if (existingMedicines[0].count === 0) {
      console.log("Inserting sample medicines...");

      // Prepare statement for batch insertion
      const insertQuery =
        "INSERT INTO medicines (name, description, price, quantity, expiry_date) VALUES (?, ?, ?, ?, ?)";

      // Insert each medicine
      for (const medicine of medicines) {
        await connection.execute(insertQuery, [
          medicine.name,
          medicine.description,
          medicine.price,
          medicine.quantity,
          medicine.expiry_date,
        ]);
      }
      console.log(`${medicines.length} medicines inserted`);

      // Generate random sales (last 30 days)
      console.log("Generating sample sales...");
      const [medicineRows] = await connection.execute(
        "SELECT id, price, quantity FROM medicines"
      );
      const medicineIds = medicineRows.map((row) => ({
        id: row.id,
        price: row.price,
        availableQty: row.quantity,
      }));

      const today = new Date();
      const salesData = [];

      // Generate 100 random sales across the last 30 days
      for (let i = 0; i < 100; i++) {
        const randomMedicine =
          medicineIds[Math.floor(Math.random() * medicineIds.length)];
        const randomQuantity = Math.floor(Math.random() * 5) + 1; // 1-5 items
        const totalPrice = randomMedicine.price * randomQuantity;

        // Random date in the last 30 days
        const saleDate = new Date(today);
        saleDate.setDate(saleDate.getDate() - Math.floor(Math.random() * 30));

        salesData.push({
          medicine_id: randomMedicine.id,
          quantity: randomQuantity,
          total_price: totalPrice,
          sale_date: saleDate.toISOString().split("T")[0],
        });
      }

      // Insert sales data
      const insertSaleQuery =
        "INSERT INTO sales (medicine_id, quantity, total_price, sale_date) VALUES (?, ?, ?, ?)";
      for (const sale of salesData) {
        await connection.execute(insertSaleQuery, [
          sale.medicine_id,
          sale.quantity,
          sale.total_price,
          sale.sale_date,
        ]);
      }
      console.log(`${salesData.length} sales records generated`);

      // Generate inventory logs
      console.log("Generating inventory logs...");
      const inventoryLogs = [];

      // Initial stock records (ADD)
      for (const medicine of medicineRows) {
        inventoryLogs.push({
          medicine_id: medicine.id,
          previous_quantity: 0,
          new_quantity: medicine.quantity,
          change_type: "ADD",
          log_date: new Date(
            today.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000
          ), // Random date in the last 60 days
        });
      }

      // Some random updates
      for (let i = 0; i < 50; i++) {
        const randomMedicine =
          medicineIds[Math.floor(Math.random() * medicineIds.length)];
        const changeType = Math.random() > 0.5 ? "ADD" : "REMOVE";
        const changeAmount = Math.floor(Math.random() * 20) + 1; // 1-20 items
        const previousQty = randomMedicine.availableQty;

        let newQty;
        if (changeType === "ADD") {
          newQty = previousQty + changeAmount;
          randomMedicine.availableQty = newQty;
        } else {
          // Ensure we don't go below 0
          newQty = Math.max(
            0,
            previousQty - Math.min(changeAmount, previousQty)
          );
          randomMedicine.availableQty = newQty;
        }

        // Random date in the last 30 days
        const logDate = new Date(today);
        logDate.setDate(logDate.getDate() - Math.floor(Math.random() * 30));

        inventoryLogs.push({
          medicine_id: randomMedicine.id,
          previous_quantity: previousQty,
          new_quantity: newQty,
          change_type: changeType,
          log_date: logDate,
        });
      }

      // Insert inventory logs
      const insertLogQuery =
        "INSERT INTO inventory_logs (medicine_id, previous_quantity, new_quantity, change_type, log_date) VALUES (?, ?, ?, ?, ?)";
      for (const log of inventoryLogs) {
        await connection.execute(insertLogQuery, [
          log.medicine_id,
          log.previous_quantity,
          log.new_quantity,
          log.change_type,
          log.log_date,
        ]);
      }
      console.log(`${inventoryLogs.length} inventory logs generated`);
    } else {
      console.log(
        "Medicines table already has data. Skipping sample data insertion."
      );
    }

    // Populate suppliers and update medicines
    await populateSuppliersAndUpdateMedicines(connection);

    console.log("Database initialization completed successfully");
  } catch (error) {
    console.error("Error during database initialization:", error);
  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed");
    }
  }
}

async function populateSuppliersAndUpdateMedicines(connection) {
  console.log("Checking for existing suppliers...");
  const [existingSuppliers] = await connection.execute(
    "SELECT COUNT(*) as count FROM suppliers"
  );

  if (existingSuppliers[0].count === 0) {
    console.log("Adding sample suppliers...");

    // Insert suppliers
    const insertSupplierQuery =
      "INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?)";
    for (const supplier of suppliers) {
      await connection.execute(insertSupplierQuery, [
        supplier.name,
        supplier.contact_person,
        supplier.email,
        supplier.phone,
        supplier.address,
      ]);
    }
    console.log(`${suppliers.length} suppliers added`);

    // Get all suppliers
    const [addedSuppliers] = await connection.execute(
      "SELECT id FROM suppliers"
    );
    const supplierIds = addedSuppliers.map((supplier) => supplier.id);

    // Update medicines with random supplier_id
    console.log("Updating medicines with supplier references...");
    const [medicineRows] = await connection.execute("SELECT id FROM medicines");

    for (const medicine of medicineRows) {
      const randomSupplierId =
        supplierIds[Math.floor(Math.random() * supplierIds.length)];
      await connection.execute(
        "UPDATE medicines SET supplier_id = ? WHERE id = ?",
        [randomSupplierId, medicine.id]
      );
    }
    console.log(
      `Updated ${medicineRows.length} medicines with supplier references`
    );
  } else {
    console.log("Suppliers already exist, skipping supplier creation");
  }
}

// Run the initialization
initDatabase()
  .then(() => {
    console.log("Database setup script completed");
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
  });
