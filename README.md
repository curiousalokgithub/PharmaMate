To correctly display screenshots from GitHub in your `README.md` file, you need to **remove the broken `<img>` tags with incorrect syntax**, and only **use the raw URLs** of your uploaded images inside the markdown image syntax: `![alt text](image-url)`.

Here's the **corrected and final version** of your `README.md` with working screenshots embedded from your uploads:

---

```markdown
# PharmaMate - Pharmacy Management System

<div align="center">
  <img src="frontend/public/logo.png" alt="PharmaMate Logo" width="200" height="200" style="border-radius: 10px;">
  <h3>A Modern Solution for Pharmacy Management</h3>
</div>

## 📋 Overview

PharmaMate is a comprehensive web-based pharmacy management system designed to streamline operations for pharmacies of all sizes. It provides a user-friendly interface for managing inventory, tracking sales, monitoring expiring medicines, and more.

### 🌟 Live Demo

Try out the application at: [http://localhost:3000](http://localhost:3000)

## 📸 Screenshots

<details open>
<summary><h3>Dashboard</h3></summary>
<p>The main dashboard provides an overview of your pharmacy's status, including total medicines, low stock items, expiring medicines, and revenue information.</p>
<img src="https://github.com/user-attachments/assets/fd6a3df6-305a-4376-8737-484df2db8f45" alt="Dashboard" width="800"/>

<p>Navigation menu for easy access to all features:</p>
<img src="https://github.com/user-attachments/assets/79f4e441-16fd-4037-8009-d4c28e5e91ac" alt="Navigation Menu" width="400"/>
</details>

<details>
<summary><h3>Sales Tracking</h3></summary>
<p>Comprehensive sales tracking with calendar view to visualize daily revenue:</p>
<img src="https://github.com/user-attachments/assets/d4a9fb9b-4cc2-42bb-928c-aed0fd4eafa6" alt="Sales Calendar" width="800"/>

<p>List view of all sales with filtering options:</p>
<img src="screenshots/sales-list.png" alt="Sales List" width="800"/>

<p>Record new sales with an easy-to-use interface:</p>
<img src="https://github.com/user-attachments/assets/bc8ec878-a6be-4571-88cf-6b17c6cdd9de" alt="Record Sale" width="500"/>
</details>

<details>
<summary><h3>Inventory Management</h3></summary>
<p>Track inventory changes over time:</p>
<img src="https://github.com/user-attachments/assets/7a70417b-d077-4aa2-9882-f34ee7fd808a" alt="Inventory Logs" width="800"/>

<p>Update inventory quantities easily:</p>
<img src="https://github.com/user-attachments/assets/6228ca9d-2bbc-4029-9e7f-cc2b02345aa2" alt="Update Inventory" width="500"/>
</details>

<details>
<summary><h3>Medicine Management</h3></summary>
<p>Add new medicines to your inventory:</p>
<img src="https://github.com/user-attachments/assets/d04e326b-ed9c-4bd3-8c50-8827475f949f" alt="Add Medicine" width="800"/>
</details>

## ✨ Features

- **💊 Medicine Management**: Add, edit, and remove medicines from your inventory  
- **💰 Sales Tracking**: Record sales and visualize revenue on a calendar view  
- **📦 Inventory Control**: Monitor stock levels and get alerts for low stock items  
- **⏱️ Expiry Management**: Get notifications for medicines approaching expiry dates  
- **📊 Dashboard**: Get an overview of your pharmacy's performance at a glance  
- **🔒 Authentication**: Secure login and registration system  
- **📱 Responsive Design**: Works on desktops, tablets, and mobile devices  

## 🚀 Technologies Used

- **Frontend**: React, TypeScript, Ant Design  
- **Backend**: Node.js, Express  
- **Database**: MySQL  
- **Authentication**: JWT (JSON Web Tokens)  

## 🔧 Installation and Setup

### Prerequisites

- Node.js (v14 or higher)  
- MySQL (v5.7 or higher)  
- Web browser (Chrome, Firefox, Edge, etc.)  

### Quick Setup (Windows)

The easiest way to get started is to use the provided batch scripts:

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

Click "Skip Authentication & Go to Dashboard" on the login page for quick access.

### Common Tasks

#### Adding a Medicine

1. Click "Add Medicine" in the navigation menu  
2. Fill in the required details (name, description, price, quantity, expiry date)  
3. Click "Add Medicine" to save  

#### Recording a Sale

1. Navigate to "Sales" in the menu  
2. Click "New Sale"  
3. Select a medicine and enter the quantity  
4. Click "OK" to record the sale  

#### Updating Inventory

1. Go to "Inventory" in the menu  
2. Click "Update Inventory"  
3. Select a medicine, operation type (ADD/REMOVE), and quantity  
4. Click "OK" to update  

## 💬 Support

If you encounter any issues or have questions about the application, please contact:

- Email: support@pharmamate.com  
- GitHub: [curiousalokgithub](https://github.com/curiousalokgithub)

## 🔄 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/curiousalokgithub">Alok Kumar Tripathy</a>
</div>
```

---

### ✅ Notes:

- Be sure the `user-attachments` links remain publicly accessible (they are if generated during a GitHub issue or PR comment).
- If you’re using images **inside your repository** like `screenshots/sales-list.png`, ensure they exist at the correct path and are pushed to GitHub.

Let me know if you'd like a Markdown version downloadable or help to host it live!
