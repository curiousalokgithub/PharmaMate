-- Create database
CREATE DATABASE IF NOT EXISTS pharmacy_db;
USE pharmacy_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create medicines table
CREATE TABLE IF NOT EXISTS medicines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    expiry_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample medicines
INSERT INTO medicines (name, description, price, quantity, expiry_date) VALUES
('Paracetamol', 'Pain reliever and fever reducer', 5.99, 100, '2024-12-31'),
('Ibuprofen', 'Anti-inflammatory and pain reliever', 7.99, 150, '2024-11-30'),
('Amoxicillin', 'Antibiotic for bacterial infections', 12.99, 75, '2024-10-31'),
('Loratadine', 'Antihistamine for allergies', 8.99, 120, '2024-09-30'),
('Omeprazole', 'Proton pump inhibitor for acid reflux', 15.99, 90, '2024-08-31'),
('Metformin', 'Diabetes medication', 9.99, 60, '2024-07-31'),
('Atorvastatin', 'Cholesterol-lowering medication', 18.99, 45, '2024-06-30'),
('Levothyroxine', 'Thyroid hormone replacement', 11.99, 80, '2024-05-31'),
('Lisinopril', 'Blood pressure medication', 6.99, 110, '2024-04-30'),
('Metoprolol', 'Beta blocker for heart conditions', 14.99, 70, '2024-03-31');

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_id INT,
    quantity INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id)
);

-- Create inventory_logs table
CREATE TABLE IF NOT EXISTS inventory_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_id INT,
    previous_quantity INT NOT NULL,
    new_quantity INT NOT NULL,
    change_type ENUM('ADD', 'REMOVE', 'UPDATE') NOT NULL,
    log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id)
); 