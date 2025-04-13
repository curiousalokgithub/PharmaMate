const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplierController");
const { authenticateToken } = require("../middleware/authMiddleware");

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all suppliers
router.get("/", supplierController.getAllSuppliers);

// Get a specific supplier
router.get("/:id", supplierController.getSupplierById);

// Add a new supplier
router.post("/", supplierController.addSupplier);

// Update a supplier
router.put("/:id", supplierController.updateSupplier);

// Delete a supplier
router.delete("/:id", supplierController.deleteSupplier);

// Get medicines for a supplier
router.get("/:id/medicines", supplierController.getSupplierMedicines);

module.exports = router;
