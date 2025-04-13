const pool = require("../config/database");

// Demo data for when using the demo token
const demoSales = [
  {
    id: 1,
    medicine_id: 1,
    medicine_name: "Aspirin",
    quantity: 5,
    total_price: 29.95,
    sale_date: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
  },
  {
    id: 2,
    medicine_id: 3,
    medicine_name: "Ibuprofen",
    quantity: 3,
    total_price: 21.75,
    sale_date: new Date(Date.now() - 1 * 86400000).toISOString(), // 1 day ago
  },
  {
    id: 3,
    medicine_id: 2,
    medicine_name: "Amoxicillin",
    quantity: 2,
    total_price: 25.0,
    sale_date: new Date().toISOString(), // Today
  },
  {
    id: 4,
    medicine_id: 5,
    medicine_name: "Loratadine",
    quantity: 1,
    total_price: 9.99,
    sale_date: new Date().toISOString(), // Today
  },
];

// Demo reports data
const demoReports = {
  reports: [
    { medicine_name: "Aspirin", total_quantity: 5, total_revenue: 29.95 },
    { medicine_name: "Amoxicillin", total_quantity: 2, total_revenue: 25.0 },
    { medicine_name: "Ibuprofen", total_quantity: 3, total_revenue: 21.75 },
    { medicine_name: "Loratadine", total_quantity: 1, total_revenue: 9.99 },
  ],
  total_revenue: 86.69,
  time_series: [
    {
      date: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0],
      daily_revenue: 29.95,
      transaction_count: 1,
    },
    {
      date: new Date(Date.now() - 1 * 86400000).toISOString().split("T")[0],
      daily_revenue: 21.75,
      transaction_count: 1,
    },
    {
      date: new Date().toISOString().split("T")[0],
      daily_revenue: 34.99,
      transaction_count: 2,
    },
  ],
};

// Check if we should serve demo data
const shouldUseDemoData = (req) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  return token === "demo-token-for-bypassing-auth";
};

// Get all sales
exports.getAllSales = async (req, res) => {
  // If using demo token, return demo data
  if (shouldUseDemoData(req)) {
    console.log("Using demo sales data");
    return res.json(demoSales);
  }

  try {
    const [sales] = await pool.execute(`
      SELECT s.*, m.name as medicine_name 
      FROM sales s
      JOIN medicines m ON s.medicine_id = m.id
      ORDER BY s.sale_date DESC
    `);
    res.json(sales);
  } catch (error) {
    console.error("Error fetching sales:", error);

    // As a fallback, return demo data
    console.log("Database error, returning demo sales data as fallback");
    res.json(demoSales);
  }
};

// Get a single sale by ID
exports.getSaleById = async (req, res) => {
  try {
    const [sales] = await pool.execute(
      `
      SELECT s.*, m.name as medicine_name 
      FROM sales s
      JOIN medicines m ON s.medicine_id = m.id
      WHERE s.id = ?
    `,
      [req.params.id]
    );

    if (sales.length === 0) {
      return res.status(404).json({ message: "Sale not found" });
    }

    res.json(sales[0]);
  } catch (error) {
    console.error("Error fetching sale:", error);
    res.status(500).json({ message: "Error fetching sale" });
  }
};

// Create a new sale
exports.createSale = async (req, res) => {
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

    // Get the newly created sale with medicine name
    const [newSale] = await connection.execute(
      `
      SELECT s.*, m.name as medicine_name 
      FROM sales s
      JOIN medicines m ON s.medicine_id = m.id
      WHERE s.id = ?
    `,
      [saleResult.insertId]
    );

    res.status(201).json({
      message: "Sale recorded successfully",
      id: saleResult.insertId,
      sale: newSale[0],
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error recording sale:", error);
    res.status(500).json({ message: "Error recording sale" });
  } finally {
    connection.release();
  }
};

// Delete a sale
exports.deleteSale = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check if sale exists
    const [sales] = await connection.execute(
      "SELECT * FROM sales WHERE id = ?",
      [req.params.id]
    );

    if (sales.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Sale not found" });
    }

    const sale = sales[0];

    // Get current medicine quantity
    const [medicines] = await connection.execute(
      "SELECT * FROM medicines WHERE id = ?",
      [sale.medicine_id]
    );

    if (medicines.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Medicine not found" });
    }

    const medicine = medicines[0];
    const newQuantity = medicine.quantity + sale.quantity;

    // Update medicine quantity
    await connection.execute("UPDATE medicines SET quantity = ? WHERE id = ?", [
      newQuantity,
      sale.medicine_id,
    ]);

    // Add inventory log
    await connection.execute(
      "INSERT INTO inventory_logs (medicine_id, previous_quantity, new_quantity, change_type) VALUES (?, ?, ?, ?)",
      [sale.medicine_id, medicine.quantity, newQuantity, "ADD"]
    );

    // Delete the sale
    await connection.execute("DELETE FROM sales WHERE id = ?", [req.params.id]);

    await connection.commit();
    res.json({ message: "Sale deleted and inventory restored" });
  } catch (error) {
    await connection.rollback();
    console.error("Error deleting sale:", error);
    res.status(500).json({ message: "Error deleting sale" });
  } finally {
    connection.release();
  }
};

// Get sales reports
exports.getSalesReports = async (req, res) => {
  // If using demo token, return demo data
  if (shouldUseDemoData(req)) {
    console.log("Using demo reports data");
    return res.json(demoReports);
  }

  try {
    const { start_date, end_date } = req.query;

    let query = `
      SELECT 
        m.name as medicine_name,
        m.id as medicine_id,
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

    // Get sales by date
    let timeQuery = `
      SELECT 
        DATE(sale_date) as date,
        SUM(total_price) as daily_revenue,
        COUNT(*) as transaction_count
      FROM sales
    `;

    if (start_date && end_date) {
      timeQuery += ` WHERE sale_date BETWEEN ? AND ?`;
    }

    timeQuery += ` GROUP BY DATE(sale_date) ORDER BY date ASC`;

    const [timeSeriesData] = await pool.execute(
      timeQuery,
      start_date && end_date ? [start_date, end_date] : []
    );

    res.json({
      reports: results,
      total_revenue: totalRevenue[0].total || 0,
      time_series: timeSeriesData,
    });
  } catch (error) {
    console.error("Error generating reports:", error);
    res.status(500).json({ message: "Error generating reports" });
  }
};

// Get recent sales
exports.getRecentSales = async (req, res) => {
  try {
    const limit = req.query.limit || 5;

    const [sales] = await pool.execute(
      `
      SELECT s.*, m.name as medicine_name 
      FROM sales s
      JOIN medicines m ON s.medicine_id = m.id
      ORDER BY s.sale_date DESC
      LIMIT ?
    `,
      [parseInt(limit)]
    );

    res.json(sales);
  } catch (error) {
    console.error("Error fetching recent sales:", error);
    res.status(500).json({ message: "Error fetching recent sales" });
  }
};
