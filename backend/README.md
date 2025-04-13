# Pharmacy Management System - Backend

This is the backend for the PharmaMate Pharmacy Management System, a complete solution for managing medicines, sales, and inventory.

## Setup Instructions

### Prerequisites

1. Node.js (v14 or higher)
2. MySQL (v5.7 or higher)

### Installation Steps

1. Clone the repository (if you haven't already)
2. Navigate to the backend directory:
   ```bash
   cd pharmacy/backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the backend directory with the following content:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=pharmacy_db
   PORT=5001
   JWT_SECRET=your_secret_key
   ```
   Replace `your_mysql_password` with your actual MySQL password and `your_secret_key` with a strong secret key.

### Database Setup

#### Option 1: Automatic Setup (Recommended)

Run the database seeding script to create the database, tables, and populate with sample data:

```bash
node db-seed.js
```

This will:

- Create the database if it doesn't exist
- Create all required tables
- Add an admin user (username: admin, password: admin123)
- Insert 40 sample medicines with realistic data
- Generate 100 random sales records
- Create inventory logs to track stock changes

#### Option 2: Manual Setup

If you prefer to set up the database manually, you can create the database and tables using:

1. Create the database:

   ```sql
   CREATE DATABASE IF NOT EXISTS pharmacy_db;
   USE pharmacy_db;
   ```

2. Create tables:

   ```sql
   CREATE TABLE users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     username VARCHAR(255) NOT NULL UNIQUE,
     password VARCHAR(255) NOT NULL,
     email VARCHAR(255) NOT NULL UNIQUE,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE medicines (
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     description TEXT,
     price DECIMAL(10, 2) NOT NULL,
     quantity INT NOT NULL DEFAULT 0,
     expiry_date DATE,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE sales (
     id INT AUTO_INCREMENT PRIMARY KEY,
     medicine_id INT NOT NULL,
     quantity INT NOT NULL,
     total_price DECIMAL(10, 2) NOT NULL,
     sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (medicine_id) REFERENCES medicines(id)
   );

   CREATE TABLE inventory_logs (
     id INT AUTO_INCREMENT PRIMARY KEY,
     medicine_id INT NOT NULL,
     previous_quantity INT NOT NULL,
     new_quantity INT NOT NULL,
     change_type ENUM('ADD', 'REMOVE', 'UPDATE') NOT NULL,
     log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (medicine_id) REFERENCES medicines(id)
   );
   ```

### Starting the Server

To start the backend server, run:

```bash
node src/index.js
```

The server will start on port 5001 (or the port specified in your .env file).

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get an authentication token
- `GET /api/auth/me` - Get current user info
- `GET /api/auth/check-availability` - Check if username or email is available

### Medicines

- `GET /api/medicines` - Get all medicines
- `GET /api/medicines/:id` - Get a medicine by ID
- `POST /api/medicines` - Add a new medicine
- `PUT /api/medicines/:id` - Update a medicine
- `DELETE /api/medicines/:id` - Delete a medicine
- `GET /api/medicines/search` - Search medicines

### Sales

- `GET /api/sales` - Get all sales
- `POST /api/sales` - Create a new sale
- `GET /api/sales/reports` - Get sales reports

### Inventory

- `GET /api/inventory/logs` - Get inventory logs
- `POST /api/inventory/update` - Update inventory

## Demo Mode

To bypass database requirements and use the system with demo data:

1. Use the "Skip Authentication" button on the login/register page
2. The system will use demo data instead of actual database records

## Database Troubleshooting

If you encounter database connection issues, check:

1. MySQL service is running
2. Credentials in the .env file are correct
3. The database exists
4. The user has proper permissions

You can test the database connection using:

```bash
node test-db.js
```

Or access the test endpoint:

```
GET /api/check-db-connection
```
