-- ===================================
-- DROP TABLES (in correct dependency order)
-- ===================================
DROP TABLE IF EXISTS Notification;
DROP TABLE IF EXISTS Sensor_Reading;
DROP TABLE IF EXISTS Sensor;
DROP TABLE IF EXISTS Rule_Preferred_Vehicle_Type;
DROP TABLE IF EXISTS VehicleAssignmentRule;
DROP TABLE IF EXISTS Assignment;
DROP TABLE IF EXISTS Incident;
DROP TABLE IF EXISTS Vehicle_Staff;
DROP TABLE IF EXISTS Vehicle;
DROP TABLE IF EXISTS Station;
DROP TABLE IF EXISTS User_Role;
DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS Role;
DROP TABLE IF EXISTS Address;

-- ===================================
-- ADDRESS TABLE
-- ===================================
CREATE TABLE Address (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    city VARCHAR(100),
    neighborhood VARCHAR(100),
    street VARCHAR(100),
    building_no VARCHAR(100),
    apartment_no VARCHAR(100),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7)
);

-- ===================================
-- ROLE TABLE
-- ===================================
CREATE TABLE Role (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name ENUM('Dispatcher','Responder','Administrator'),
    description VARCHAR(255)
);

-- ===================================
-- USER TABLE
-- ===================================
CREATE TABLE User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    full_name VARCHAR(150),
    email VARCHAR(150) UNIQUE,
    password_hash VARCHAR(512),
    phone VARCHAR(30),
    status ENUM('active','disabled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- ===================================
-- USER_ROLE TABLE
-- ===================================
CREATE TABLE User_Role (
    user_id INT,
    role_id INT,
    PRIMARY KEY(user_id, role_id),
    FOREIGN KEY(user_id) REFERENCES User(user_id),
    FOREIGN KEY(role_id) REFERENCES Role(role_id)
);

-- ===================================
-- STATION TABLE
-- ===================================
CREATE TABLE Station (
    station_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    service_type ENUM('medical','fire','police'),
    address_id INT,
    contact_number VARCHAR(30),
    capacity INT,
    FOREIGN KEY(address_id) REFERENCES Address(address_id)
);

-- ===================================
-- VEHICLE TABLE
-- ===================================
CREATE TABLE Vehicle (
    vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
    registration_number VARCHAR(50) UNIQUE,
    vehicle_type ENUM('ambulance','police_car','fire_truck'),
    driver_user_id INT,
    station_id INT,
    capacity INT,
    status ENUM('available','on_route','at_service_center') DEFAULT 'available',
    last_latitude DECIMAL(10,7),
    last_longitude DECIMAL(10,7),
    last_updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY(driver_user_id) REFERENCES User(user_id),
    FOREIGN KEY(station_id) REFERENCES Station(station_id)
);

-- ===================================
-- VEHICLE_STAFF TABLE
-- ===================================
CREATE TABLE Vehicle_Staff (
    vehicle_id INT,
    user_id INT,
    role_on_vehicle VARCHAR(50),
    PRIMARY KEY(vehicle_id, user_id),
    FOREIGN KEY(vehicle_id) REFERENCES Vehicle(vehicle_id),
    FOREIGN KEY(user_id) REFERENCES User(user_id)
);

-- ===================================
-- INCIDENT TABLE
-- ===================================
CREATE TABLE Incident (
    incident_id INT AUTO_INCREMENT PRIMARY KEY,
    incident_type ENUM('medical','fire','police'),
    reported_by_user_id INT,
    address_id INT,
    severity_level INT,
    time_reported TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    time_assigned TIMESTAMP NULL,
    time_resolved TIMESTAMP NULL,
    life_cycle_status ENUM('reported','assigned','resolved','cancelled') DEFAULT 'reported',
    FOREIGN KEY(reported_by_user_id) REFERENCES User(user_id),
    FOREIGN KEY(address_id) REFERENCES Address(address_id)
);

-- ===================================
-- ASSIGNMENT TABLE
-- ===================================
CREATE TABLE Assignment (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    incident_id INT,
    vehicle_id INT,
    assigned_by_user_id INT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP NULL,
    arrived_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    assignment_status ENUM('assigned','accepted','enroute','arrived','completed','cancelled') DEFAULT 'assigned',
    notes VARCHAR(255),
    FOREIGN KEY(incident_id) REFERENCES Incident(incident_id),
    FOREIGN KEY(vehicle_id) REFERENCES Vehicle(vehicle_id),
    FOREIGN KEY(assigned_by_user_id) REFERENCES User(user_id)
);

-- ===================================
-- VEHICLE ASSIGNMENT RULE TABLE
-- ===================================
CREATE TABLE VehicleAssignmentRule (
    rule_id INT AUTO_INCREMENT PRIMARY KEY,
    incident_location_pattern VARCHAR(255),
    incident_type ENUM('medical','fire','police'),
    min_vehicles_needed INT DEFAULT 1,
    priority INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE
);

-- ===================================
-- RULE_PREFERRED_VEHICLE_TYPE TABLE
-- ===================================
CREATE TABLE Rule_Preferred_Vehicle_Type (
    rule_id INT,
    vehicle_type ENUM('ambulance','police_car','fire_truck'),
    PRIMARY KEY(rule_id, vehicle_type),
    FOREIGN KEY(rule_id) REFERENCES VehicleAssignmentRule(rule_id)
);

-- ===================================
-- SENSOR TABLE
-- ===================================
CREATE TABLE Sensor (
    sensor_id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT,
    sensor_type ENUM('geolocation','speed','temperature'),
    installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description VARCHAR(255),
    FOREIGN KEY(vehicle_id) REFERENCES Vehicle(vehicle_id)
);

-- ===================================
-- SENSOR_READING TABLE
-- ===================================
CREATE TABLE Sensor_Reading (
    reading_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sensor_id INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    value VARCHAR(255),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    FOREIGN KEY(sensor_id) REFERENCES Sensor(sensor_id)
);

-- ===================================
-- NOTIFICATION TABLE
-- ===================================
CREATE TABLE Notification (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('dispatcher','responder','system'),
    message VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('unread','read') DEFAULT 'unread',
    receiver_user_id INT NULL,
    role_id INT NULL,
    related_incident_id INT NULL,
    FOREIGN KEY(receiver_user_id) REFERENCES User(user_id),
    FOREIGN KEY(role_id) REFERENCES Role(role_id),
    FOREIGN KEY(related_incident_id) REFERENCES Incident(incident_id)
);

-- ===================================
-- SAMPLE DATA
-- ===================================

-- Insert Roles
INSERT INTO Role (role_name, description) VALUES
('Dispatcher', 'Manages incident assignment and vehicle dispatch'),
('Responder', 'Emergency vehicle operator and first responder'),
('Administrator', 'System administration and user management');

-- Insert Sample Addresses
INSERT INTO Address (city, neighborhood, street, building_no, apartment_no, latitude, longitude) VALUES
('Cairo', 'Downtown', 'Tahrir Square', '15', NULL, 30.0444, 31.2357),
('Cairo', 'Heliopolis', 'El Nozha Street', '25', NULL, 30.0956, 31.3372),
('Cairo', 'Maadi', 'Road 9', '12', '5A', 29.9627, 31.2597),
('Cairo', 'Zamalek', '26th July Street', '8', NULL, 30.0626, 31.2199),
('Cairo', 'Nasr City', 'Abbas El Akkad', '30', '12', 30.0626, 31.3377);

-- Insert Users
INSERT INTO User (username, full_name, email, password_hash, phone, status) VALUES
('dispatcher1', 'Ahmed Hassan', 'ahmed.hassan@emergency.gov', '$2y$10$abcdefghijklmnopqrstuvwxyz1234567890', '+20-10-1234-5678', 'active'),
('responder1', 'Mohamed Samir', 'mohamed.samir@emergency.gov', '$2y$10$abcdefghijklmnopqrstuvwxyz1234567892', '+20-11-1234-5678', 'active'),
('admin1', 'Youssef Gamal', 'youssef.gamal@emergency.gov', '$2y$10$abcdefghijklmnopqrstuvwxyz1234567899', '+20-10-9234-5678', 'active');

-- Insert User_Role mappings
INSERT INTO User_Role (user_id, role_id) VALUES
(1, 1), (2, 2), (3, 3);

-- Insert Stations
INSERT INTO Station (name, service_type, address_id, contact_number, capacity) VALUES
('Central Medical Station', 'medical', 1, '+20-2-2345-6789', 10),
('Heliopolis Fire Station', 'fire', 2, '+20-2-2345-6790', 8),
('Maadi Police Station', 'police', 3, '+20-2-2345-6791', 12);