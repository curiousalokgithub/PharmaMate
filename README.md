# PharmaMate - Pharmacy Management System

PharmaMate is a comprehensive web-based pharmacy management system that helps pharmacy owners and staff manage inventory, track sales, and monitor medicine expiry dates efficiently.

![PharmaMate Dashboard](https://i.imgur.com/placeholder.png)

## 🚀 Features

- **Dashboard**: Get an overview of inventory status, sales, and alerts for low stock and expiring medicines
- **Medicine Management**: Add, update, and remove medicines from inventory
- **Sales Tracking**: Record sales and view sales history
- **Inventory Management**: Track stock levels and receive alerts for low stock
- **Expiry Monitoring**: Get notifications for medicines approaching expiry
- **User Authentication**: Secure login and registration system
- **Reporting**: Generate reports on sales and inventory status

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MySQL](https://www.mysql.com/) (v5.7 or higher)
- A web browser (Chrome, Firefox, Edge, etc.)

## 🔧 Setup and Installation

### Database Setup

1. Install MySQL if you haven't already
2. Create a database named `pharmacy_db`
   ```sql
   CREATE DATABASE pharmacy_db;
   ```
3. Ensure your MySQL server is running on localhost:3306

### Configuration

1. Navigate to the `backend` folder
2. Edit the `.env` file to match your MySQL configuration:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password_here
   DB_NAME=pharmacy_db
   PORT=5001
   JWT_SECRET=your_secret_key_here
   ```

### Running the Application

#### Option 1: Using start.bat (For Windows)

1. Simply double-click the `start.bat` file in the root directory
2. This will start both the backend and frontend servers
3. Open your browser and navigate to http://localhost:3000

#### Option 2: Using start-local.bat (For Windows Development)

1. Double-click the `start-local.bat` file in the root directory
2. This script will:
   - Check your MySQL connection
   - Create the database if it doesn't exist
   - Start the backend server with development settings
   - Start the frontend development server
3. Open your browser and navigate to http://localhost:3000

#### Option 3: Manual Start

If you're not using Windows or prefer to start the servers manually:

1. Start the backend server:

   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. Start the frontend server (in another terminal):
   ```bash
   cd frontend
   npm install
   npm start
   ```

## 🔐 First-time Access

1. Navigate to http://localhost:3000/register
2. Create a new account with your preferred username, email, and password
3. Log in with your new credentials
4. You'll be redirected to the dashboard

## 🧪 Demo Mode

If you want to explore the application without setting up a database or creating an account:

1. Navigate to the login page
2. Click the "Skip Authentication & Go to Dashboard" button
3. This will use demo data to showcase the application's features

## 📱 Using the Application

### Adding Medicines

1. Click on "Add Medicine" in the navigation bar
2. Fill in the details like name, description, price, quantity, and expiry date
3. Click "Save" to add the medicine to inventory

### Recording Sales

1. Go to the "Sales" page
2. Click on "New Sale"
3. Select the medicine, specify the quantity
4. Submit to record the sale

### Monitoring Inventory

1. Check the "Dashboard" for an overview of low stock items
2. Visit the "Inventory" page for detailed inventory management

## 🛠️ Troubleshooting

### Common Issues

#### Database Connection Error

- Ensure MySQL is running
- Verify your database credentials in the `.env` file
- Check if the `pharmacy_db` database exists

#### Application Won't Start

- Make sure ports 3000 and 5001 are not in use
- Ensure Node.js is properly installed
- Check if all dependencies are installed by running `npm install` in both frontend and backend directories

#### Login Issues

- If you can't log in, try the "Skip Authentication" button to access the demo version
- Ensure you've created an account with the correct credentials

## 📚 Tech Stack

- **Frontend**: React, TypeScript, Ant Design
- **Backend**: Node.js, Express
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contact

For support or inquiries, please contact support@pharmamate.com
