const pool = require("../config/database");

// Demo data for when using the demo token
const demoInventoryLogs = [
  {
    id: 1,
    medicine_id: 1,
    medicine_name: "Aspirin",
    previous_quantity: 95,
    new_quantity: 100,
    change_type: "ADD",
    log_date: new Date(Date.now() - 3 * 86400000).toISOString(), // 3 days ago
  },
  {
    id: 2,
    medicine_id: 2,
    medicine_name: "Amoxicillin",
    previous_quantity: 45,
    new_quantity: 50,
    change_type: "ADD",
    log_date: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
  },
  {
    id: 3,
    medicine_id: 1,
    medicine_name: "Aspirin",
    previous_quantity: 100,
    new_quantity: 95,
    change_type: "REMOVE",
    log_date: new Date(Date.now() - 1 * 86400000).toISOString(), // 1 day ago
  },
  {
    id: 4,
    medicine_id: 3,
    medicine_name: "Ibuprofen",
    previous_quantity: 72,
    new_quantity: 75,
    change_type: "ADD",
    log_date: new Date().toISOString(), // Today
  },
];

// Demo inventory summary
const demoInventorySummary = {
  total_medicines: 5,
  low_stock_count: 1,
  total_value: 1492.25,
  most_active_medicines: [
    { id: 1, name: "Aspirin", changes_count: 2 },
    { id: 3, name: "Ibuprofen", changes_count: 1 },
    { id: 2, name: "Amoxicillin", changes_count: 1 },
  ],
};

// Check if we should serve demo data
const shouldUseDemoData = (req) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  return token === "demo-token-for-bypassing-auth";
};

// Get all inventory logs
exports.getAllInventoryLogs = async (req, res) => {
  // If using demo token, return demo data
  if (shouldUseDemoData(req)) {
    console.log("Using demo inventory logs data");
    return res.json(demoInventoryLogs);
  }

  try {
    const [logs] = await pool.execute(`
      SELECT l.*, m.name as medicine_name 
      FROM inventory_logs l
      JOIN medicines m ON l.medicine_id = m.id
      ORDER BY l.log_date DESC
    `);
    res.json(logs);
  } catch (error) {
    console.error("Error fetching inventory logs:", error);

    // As a fallback, return demo data
    console.log("Database error, returning demo inventory logs as fallback");
    res.json(demoInventoryLogs);
  }
};

// Get inventory logs for a specific medicine
exports.getInventoryLogsByMedicine = async (req, res) => {
  try {
    const [logs] = await pool.execute(
      `
      SELECT l.*, m.name as medicine_name 
      FROM inventory_logs l
      JOIN medicines m ON l.medicine_id = m.id
      WHERE l.medicine_id = ?
      ORDER BY l.log_date DESC
    `,
      [req.params.medicineId]
    );
    res.json(logs);
  } catch (error) {
    console.error("Error fetching inventory logs for medicine:", error);
    res
      .status(500)
      .json({ message: "Error fetching inventory logs for medicine" });
  }
};

// Update inventory
exports.updateInventory = async (req, res) => {
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
    } else if (change_type === "UPDATE") {
      newQuantity = quantity;
    } else {
      await connection.rollback();
      return res
        .status(400)
        .json({ message: "Invalid change type. Use ADD, REMOVE, or UPDATE" });
    }

    // Update medicine quantity
    await connection.execute("UPDATE medicines SET quantity = ? WHERE id = ?", [
      newQuantity,
      medicine_id,
    ]);

    // Add inventory log
    const [logResult] = await connection.execute(
      "INSERT INTO inventory_logs (medicine_id, previous_quantity, new_quantity, change_type) VALUES (?, ?, ?, ?)",
      [medicine_id, medicine.quantity, newQuantity, change_type]
    );

    await connection.commit();

    const [newLog] = await connection.execute(
      `
      SELECT l.*, m.name as medicine_name 
      FROM inventory_logs l
      JOIN medicines m ON l.medicine_id = m.id
      WHERE l.id = ?
    `,
      [logResult.insertId]
    );

    res.status(200).json({
      message: "Inventory updated successfully",
      log: newLog[0],
      medicine: {
        id: medicine.id,
        name: medicine.name,
        previous_quantity: medicine.quantity,
        new_quantity: newQuantity,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error updating inventory:", error);
    res.status(500).json({ message: "Error updating inventory" });
  } finally {
    connection.release();
  }
};

// Get inventory summary
exports.getInventorySummary = async (req, res) => {
  // If using demo token, return demo data
  if (shouldUseDemoData(req)) {
    console.log("Using demo inventory summary data");
    return res.json(demoInventorySummary);
  }

  try {
    // Get total medicines count
    const [totalResult] = await pool.execute(
      "SELECT COUNT(*) as total FROM medicines"
    );

    // Get low stock count
    const [lowStockResult] = await pool.execute(
      "SELECT COUNT(*) as count FROM medicines WHERE quantity <= ?",
      [10] // Threshold for low stock
    );

    // Get total inventory value
    const [valueResult] = await pool.execute(
      "SELECT SUM(price * quantity) as total_value FROM medicines"
    );

    // Get most active medicines (most inventory changes)
    const [activeMedicines] = await pool.execute(`
      SELECT 
        m.id, 
        m.name, 
        COUNT(l.id) as changes_count
      FROM medicines m
      JOIN inventory_logs l ON m.id = l.medicine_id
      GROUP BY m.id
      ORDER BY changes_count DESC
      LIMIT 5
    `);

    res.json({
      total_medicines: totalResult[0].total,
      low_stock_count: lowStockResult[0].count,
      total_value: valueResult[0].total_value || 0,
      most_active_medicines: activeMedicines,
    });
  } catch (error) {
    console.error("Error generating inventory summary:", error);
    res.status(500).json({ message: "Error generating inventory summary" });
  }
};

// Bulk update inventory
exports.bulkUpdateInventory = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { updates } = req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: "Invalid updates format" });
    }

    const results = [];

    for (const update of updates) {
      const { medicine_id, quantity, change_type } = update;

      // Check if medicine exists
      const [medicines] = await connection.execute(
        "SELECT * FROM medicines WHERE id = ?",
        [medicine_id]
      );

      if (medicines.length === 0) {
        results.push({
          medicine_id,
          status: "error",
          message: "Medicine not found",
        });
        continue;
      }

      const medicine = medicines[0];
      let newQuantity;

      if (change_type === "ADD") {
        newQuantity = medicine.quantity + quantity;
      } else if (change_type === "REMOVE") {
        if (medicine.quantity < quantity) {
          results.push({
            medicine_id,
            status: "error",
            message: "Insufficient stock",
          });
          continue;
        }
        newQuantity = medicine.quantity - quantity;
      } else if (change_type === "UPDATE") {
        newQuantity = quantity;
      } else {
        results.push({
          medicine_id,
          status: "error",
          message: "Invalid change type. Use ADD, REMOVE, or UPDATE",
        });
        continue;
      }

      // Update medicine quantity
      await connection.execute(
        "UPDATE medicines SET quantity = ? WHERE id = ?",
        [newQuantity, medicine_id]
      );

      // Add inventory log
      await connection.execute(
        "INSERT INTO inventory_logs (medicine_id, previous_quantity, new_quantity, change_type) VALUES (?, ?, ?, ?)",
        [medicine_id, medicine.quantity, newQuantity, change_type]
      );

      results.push({
        medicine_id,
        name: medicine.name,
        status: "success",
        previous_quantity: medicine.quantity,
        new_quantity: newQuantity,
      });
    }

    await connection.commit();
    res.status(200).json({
      message: "Bulk inventory update completed",
      results,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error performing bulk inventory update:", error);
    res.status(500).json({ message: "Error performing bulk inventory update" });
  } finally {
    connection.release();
  }
};
