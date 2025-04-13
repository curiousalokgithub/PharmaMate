@echo off
echo Starting Pharmacy Management System (Local Development)...

REM Check if MySQL is running
echo Checking MySQL connection...
mysql --host=localhost --user=root --password=1234567 -e "SELECT 'MySQL is running'" > NUL 2>&1
if %errorlevel% NEQ 0 (
  echo Error: Cannot connect to MySQL database.
  echo Please make sure:
  echo  - MySQL server is running
  echo  - Username and password in backend/.env are correct
  echo  - Port 3306 is available
  echo.
  echo Press any key to exit...
  pause > NUL
  exit /b 1
) else (
  echo MySQL connection successful.
)

REM Create database if it doesn't exist
echo Creating database if it doesn't exist...
mysql --host=localhost --user=root --password=1234567 -e "CREATE DATABASE IF NOT EXISTS pharmacy_db" > NUL 2>&1
if %errorlevel% NEQ 0 (
  echo Error: Failed to create database.
  echo Press any key to exit...
  pause > NUL
  exit /b 1
) else (
  echo Database pharmacy_db is ready.
)

echo Starting Backend Server...
start cmd /k "cd backend && echo Starting backend... && npm run dev"

echo Waiting for backend to initialize (10 seconds)...
timeout /t 10 /nobreak > NUL

echo Starting Frontend Server...
start cmd /k "cd frontend && echo Starting frontend... && npm start"

echo Pharmacy Management System is starting up.
echo Backend: http://localhost:5001
echo Frontend: http://localhost:3000
echo.
echo NOTE: If this is your first time running the application:
echo  - Navigate to http://localhost:3000/register to create an account
echo  - Then login with your credentials at http://localhost:3000/login
echo.
echo Press any key to shut down all servers
pause > NUL

echo Shutting down servers...
taskkill /f /im node.exe > NUL 2>&1
echo Servers shut down. 