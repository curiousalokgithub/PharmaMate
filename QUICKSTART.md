# PharmaMate - Quick Start Guide for Windows

This guide will help you get PharmaMate running on your Windows machine in just a few minutes.

## Prerequisites

1. **MySQL** - Make sure MySQL is installed and running

   - Default username: `root`
   - Your password (set during MySQL installation)

2. **Web Browser** - Chrome, Firefox, or Edge

## Quick Start (Easy Mode)

1. **Double-click** on `start-local.bat` in the main folder

   This will:

   - Check your MySQL connection
   - Create the pharmacy database if needed
   - Start both the backend and frontend servers

2. **Wait** about 30 seconds for everything to initialize

3. **Open** your browser and go to:

   ```
   http://localhost:3000
   ```

4. **Create an account** by clicking "Register"
   - Or use the "Skip Authentication" button to explore without creating an account

## If You Have Problems

### MySQL Connection Error

If you see a MySQL connection error:

1. Check if MySQL is running
2. Open `backend/.env` in a text editor
3. Update these lines with your MySQL details:
   ```
   DB_USER=root
   DB_PASSWORD=your_password_here
   ```
4. Try running `start-local.bat` again

### Ports Already in Use

If ports 3000 or 5001 are already in use:

1. Close any other applications that might be using these ports
2. Try again

### Need to Stop the Application

Press any key in the command window to shut down all servers.

## Using the System

- **Dashboard**: Overview of inventory, low stock, and expiring medicines
- **Medicines**: Add, edit and remove medicines from inventory
- **Sales**: Record sales and view sales history
- **Inventory**: Track stock levels and movements

## Need Help?

See the full `README.md` for more detailed instructions and troubleshooting tips.
