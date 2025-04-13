@echo off
echo Starting Pharmacy Management System...

echo Starting Backend Server...
start cmd /k "cd backend && node src/index.js"

echo Waiting for backend to initialize (5 seconds)...
timeout /t 5 /nobreak > NUL

echo Starting Frontend Server...
start cmd /k "cd frontend && npm start"

echo Pharmacy Management System is starting up.
echo Backend: http://localhost:5001
echo Frontend: http://localhost:3000
echo.
echo NOTE: If you see connection errors, please make sure:
echo  - MySQL is running on your system
echo  - Database 'pharmacy_db' exists
echo  - Username and password in backend/.env are correct
echo.
echo Press any key to shut down all servers
pause > NUL

echo Shutting down servers...
taskkill /f /im node.exe > NUL 2>&1
echo Servers shut down. 