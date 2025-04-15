# PharmaMate - Pharmacy Management System

<div align="center">
  <img src="https://github.com/user-attachments/assets/4b82e812-35ce-45a3-86c5-596af8bc2474" alt="PharmaMate Logo" width="200" height="200" style="border-radius: 10px;">
  <h3>A Modern Solution for Pharmacy Management</h3>
</div>

## 📋 Overview

PharmaMate is a comprehensive web-based pharmacy management system designed to streamline operations for pharmacies of all sizes. It provides a user-friendly interface for managing inventory, tracking sales, monitoring expiring medicines, and more.

### 🌟 Live Demo

Try out the application at: [http://localhost:3000](http://localhost:3000)

## 📸 Screenshots

### 📊 Complete Dashboard
![Complete Dashboard](https://github.com/user-attachments/assets/16d4a17d-14ae-41b2-9a93-5d57b8ac55bf)

### 🔢 Navigation Options
![Navigation Options](https://github.com/user-attachments/assets/f2722dfc-34f7-4db8-a03a-249e338036eb)

### 💰 Sales Calendar View
![Sales Calendar](https://github.com/user-attachments/assets/59f62b68-c2bb-40d4-9a3f-5e774326d83c)

### 📝 Add Medicine
![Add Medicine](https://github.com/user-attachments/assets/0ad22150-36c1-4769-8bea-bf1403394f05)

### 📈 List of Sales
![List of Sales](https://github.com/user-attachments/assets/4a3de8b7-e617-4dfe-9eae-bdb0a2caa0dc)

### ✅ Record a Sale
![Record Sale](https://github.com/user-attachments/assets/de05c3de-a5b1-4da9-8fd5-6acd7e42bc27)

### 💼 Inventory Sale Log
![Inventory Sale](https://github.com/user-attachments/assets/b86bf055-1fe9-4e1e-bf03-fd2bc807f9ee)

### ➕ Update Inventory
![Update Inventory](https://github.com/user-attachments/assets/46b8f240-3425-464c-848e-0baf43a04f46)

## ✨ Features

- 💊 Medicine Management: Add, edit, and remove medicines from your inventory
- 💰 Sales Tracking: Record sales and visualize revenue on a calendar view
- 🛆 Inventory Control: Monitor stock levels and get alerts for low stock items
- ⏱️ Expiry Management: Get notifications for medicines approaching expiry dates
- 📊 Dashboard: Get an overview of your pharmacy's performance at a glance
- 🔐 Authentication: Secure login and registration system
- 📱 Responsive Design: Works on desktops, tablets, and mobile devices

## 🚀 Technologies Used

- **Frontend**: React, TypeScript, Ant Design
- **Backend**: Node.js, Express
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)

## Currently the project is under production stage so the deployed link might not work.It is taking mock data fetched with API.If u want to see the result kindly run it on local host by following the below instructions

## 🔧 Installation and Setup

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- Web browser (Chrome, Firefox, Edge, etc.)

### Quick Setup (Windows)

1. Ensure MySQL is running on your machine
2. Double-click the `start-local.bat` file
3. Open your browser and navigate to `http://localhost:3000`

### Manual Setup

#### Database Configuration

1. Create a MySQL database named `pharmacy_db`
2. Configure your database connection in `backend/.env`:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=pharmacy_db
PORT=5001
JWT_SECRET=your_secret_key_here
```

#### Backend Setup

```bash
cd backend
npm install
npm run dev
```

#### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## 📖 Usage Guide

### First Time Access

1. Register an account at `/register`
2. Log in with your credentials
3. You'll be directed to the dashboard

### Demo Mode

Click "Skip Authentication & Go to Dashboard" on the login page for a quick preview.

### Common Tasks

#### Add Medicine
1. Click "Add Medicine" in the menu
2. Fill details and submit

#### Record Sale
1. Go to "Sales > New Sale"
2. Choose medicine and quantity, click OK

#### Update Inventory
1. Go to "Inventory > Update Inventory"
2. Choose medicine, action (ADD/REMOVE), and quantity, then submit

## 💬 Support

- Email: support@pharmamate.com
- GitHub: [curiousalokgithub](https://github.com/curiousalokgithub)

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/curiousalokgithub">Alok Kumar Tripathy</a>
</div>

