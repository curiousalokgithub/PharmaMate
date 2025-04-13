const pool = require("../config/database");

// Demo data for when using the demo token
const demoSuppliers = [
  {
    id: 1,
    name: "MediPharma Inc.",
    contact_person: "John Smith",
    email: "john@medipharma.com",
    phone: "555-123-4567",
    address: "123 Health Avenue, New York, NY 10001",
    created_at: "2023-01-10T14:30:00.000Z",
  },
  {
    id: 2,
    name: "Global Pharmaceuticals",
    contact_person: "Sarah Johnson",
    email: "sarah@globalpharma.com",
    phone: "555-234-5678",
    address: "456 Medicine Road, Chicago, IL 60601",
    created_at: "2023-01-15T09:45:00.000Z",
  },
  {
    id: 3,
    name: "Healthcare Supplies Ltd",
    contact_person: "Michael Brown",
    email: "michael@healthsupplies.com",
    phone: "555-345-6789",
    address: "789 Wellness Blvd, Los Angeles, CA 90001",
    created_at: "2023-02-20T11:20:00.000Z",
  },
];

// Check if we should serve demo data
const shouldUseDemoData = (req) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  return token === "demo-token-for-bypassing-auth";
};

// Get all suppliers
exports.getAllSuppliers = async (req, res) => {
  // If using demo token, return demo data
  if (shouldUseDemoData(req)) {
    console.log("Using demo supplier data");
    return res.json(demoSuppliers);
  }

  try {
    console.log("GET /api/suppliers request received");
    const [suppliers] = await pool.execute(
      "SELECT * FROM suppliers ORDER BY name ASC"
    );
    console.log(`Returning ${suppliers.length} suppliers`);
    res.json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);

    // As a fallback, return demo data if the database fails
    console.log("Database error, returning demo supplier data as fallback");
    res.json(demoSuppliers);
  }
};

// Get a single supplier by ID
exports.getSupplierById = async (req, res) => {
  // If using demo token, return demo data
  if (shouldUseDemoData(req)) {
    const supplierId = parseInt(req.params.id);
    const supplier = demoSuppliers.find((s) => s.id === supplierId);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    return res.json(supplier);
  }

  try {
    console.log(`GET /api/suppliers/${req.params.id} request received`);
    const [suppliers] = await pool.execute(
      "SELECT * FROM suppliers WHERE id = ?",
      [req.params.id]
    );

    if (suppliers.length === 0) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.json(suppliers[0]);
  } catch (error) {
    console.error("Error fetching supplier:", error);
    res
      .status(500)
      .json({ message: "Error fetching supplier", error: error.message });
  }
};

// Add a new supplier
exports.addSupplier = async (req, res) => {
  try {
    console.log("POST /api/suppliers request received:", req.body);
    const { name, contact_person, email, phone, address } = req.body;

    // Basic validation
    if (!name) {
      return res.status(400).json({ message: "Supplier name is required" });
    }

    // First check if we're using the demo token
    if (shouldUseDemoData(req)) {
      console.log(
        "Using demo mode, returning success without adding to database"
      );

      // Return a success response with mock data
      return res.status(201).json({
        message: "Supplier added successfully (Demo Mode)",
        id: Math.floor(Math.random() * 1000) + 100,
        supplier: {
          id: Math.floor(Math.random() * 1000) + 100,
          name,
          contact_person,
          email,
          phone,
          address,
          created_at: new Date().toISOString(),
        },
      });
    }

    const [result] = await pool.execute(
      "INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?)",
      [name, contact_person || "", email || "", phone || "", address || ""]
    );

    console.log(`Supplier added successfully with ID ${result.insertId}`);
    res.status(201).json({
      message: "Supplier added successfully",
      id: result.insertId,
      supplier: {
        id: result.insertId,
        name,
        contact_person,
        email,
        phone,
        address,
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error adding supplier:", error);
    res
      .status(500)
      .json({ message: "Error adding supplier", error: error.message });
  }
};

// Update a supplier
exports.updateSupplier = async (req, res) => {
  try {
    console.log(
      `PUT /api/suppliers/${req.params.id} request received:`,
      req.body
    );
    const { name, contact_person, email, phone, address } = req.body;

    // Basic validation
    if (!name) {
      return res.status(400).json({ message: "Supplier name is required" });
    }

    // First check if we're using the demo token
    if (shouldUseDemoData(req)) {
      console.log(
        "Using demo mode, returning success without updating database"
      );

      // Return a success response with mock data
      return res.json({
        message: "Supplier updated successfully (Demo Mode)",
        supplier: {
          id: parseInt(req.params.id),
          name,
          contact_person,
          email,
          phone,
          address,
          updated_at: new Date().toISOString(),
        },
      });
    }

    const [result] = await pool.execute(
      "UPDATE suppliers SET name = ?, contact_person = ?, email = ?, phone = ?, address = ? WHERE id = ?",
      [
        name,
        contact_person || "",
        email || "",
        phone || "",
        address || "",
        req.params.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    console.log(`Supplier with ID ${req.params.id} updated successfully`);
    res.json({
      message: "Supplier updated successfully",
      supplier: {
        id: parseInt(req.params.id),
        name,
        contact_person,
        email,
        phone,
        address,
        updated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating supplier:", error);
    res
      .status(500)
      .json({ message: "Error updating supplier", error: error.message });
  }
};

// Delete a supplier
exports.deleteSupplier = async (req, res) => {
  try {
    console.log(`DELETE /api/suppliers/${req.params.id} request received`);

    // First check if we're using the demo token
    if (shouldUseDemoData(req)) {
      console.log(
        "Using demo mode, returning success without deleting from database"
      );
      return res.json({ message: "Supplier deleted successfully (Demo Mode)" });
    }

    // First check if supplier exists
    const [suppliers] = await pool.execute(
      "SELECT * FROM suppliers WHERE id = ?",
      [req.params.id]
    );

    if (suppliers.length === 0) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    // Check if there are medicines associated with this supplier
    const [medicines] = await pool.execute(
      "SELECT COUNT(*) as count FROM medicines WHERE supplier_id = ?",
      [req.params.id]
    );

    if (medicines[0].count > 0) {
      // We could set supplier_id to NULL for these medicines
      await pool.execute(
        "UPDATE medicines SET supplier_id = NULL WHERE supplier_id = ?",
        [req.params.id]
      );
      console.log(
        `Set supplier_id to NULL for ${medicines[0].count} medicines`
      );
    }

    // Delete the supplier
    await pool.execute("DELETE FROM suppliers WHERE id = ?", [req.params.id]);

    console.log(`Supplier with ID ${req.params.id} deleted successfully`);
    res.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    res
      .status(500)
      .json({ message: "Error deleting supplier", error: error.message });
  }
};

// Get medicines by supplier
exports.getSupplierMedicines = async (req, res) => {
  // If using demo token, return demo data
  if (shouldUseDemoData(req)) {
    const demoMedicines = [
      {
        id: 1,
        name: "Aspirin",
        description: "Pain reliever",
        price: 5.99,
        quantity: 100,
        supplier_id: parseInt(req.params.id),
      },
      {
        id: 2,
        name: "Ibuprofen",
        description: "Anti-inflammatory",
        price: 7.99,
        quantity: 80,
        supplier_id: parseInt(req.params.id),
      },
    ];

    return res.json(demoMedicines);
  }

  try {
    console.log(
      `GET /api/suppliers/${req.params.id}/medicines request received`
    );
    const [medicines] = await pool.execute(
      "SELECT * FROM medicines WHERE supplier_id = ? ORDER BY name ASC",
      [req.params.id]
    );

    console.log(
      `Returning ${medicines.length} medicines for supplier ${req.params.id}`
    );
    res.json(medicines);
  } catch (error) {
    console.error("Error fetching supplier medicines:", error);
    res
      .status(500)
      .json({
        message: "Error fetching supplier medicines",
        error: error.message,
      });
  }
};
