const authRoutes = require("./routes/authRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const profileRoutes = require("./routes/profileRoutes");
const supplierRoutes = require("./routes/supplierRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/suppliers", supplierRoutes);
