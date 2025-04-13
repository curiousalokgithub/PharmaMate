const express = require("express");
const { body } = require("express-validator");
const medicineController = require("../controllers/medicineController");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Search medicines
router.get("/search", medicineController.searchMedicines);

// Get low stock medicines
router.get("/low-stock", medicineController.getLowStockMedicines);

// Get expiring medicines
router.get("/expiring", medicineController.getExpiringMedicines);

// Get all medicines
router.get("/", medicineController.getAllMedicines);

// Get a single medicine
router.get("/:id", medicineController.getMedicineById);

// Add a new medicine
router.post(
  "/",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("price").isNumeric().withMessage("Price must be a number"),
    body("quantity")
      .isInt({ min: 0 })
      .withMessage("Quantity must be a non-negative integer"),
    body("expiry_date")
      .isDate()
      .withMessage("Expiry date must be a valid date"),
  ],
  medicineController.addMedicine
);

// Update a medicine
router.put(
  "/:id",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("price").isNumeric().withMessage("Price must be a number"),
    body("quantity")
      .isInt({ min: 0 })
      .withMessage("Quantity must be a non-negative integer"),
    body("expiry_date")
      .isDate()
      .withMessage("Expiry date must be a valid date"),
  ],
  medicineController.updateMedicine
);

// Delete a medicine
router.delete("/:id", medicineController.deleteMedicine);

module.exports = router;
