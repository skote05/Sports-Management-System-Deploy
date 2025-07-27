-- Create Database
CREATE DATABASE IF NOT EXISTS sports_management;
USE sports_management;

-- Users Table
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'player', 'coach', 'manager') DEFAULT 'player',
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(15),
    date_of_birth DATE,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    profile_picture VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Teams Table
CREATE TABLE teams (
    team_id INT PRIMARY KEY AUTO_INCREMENT,
    team_name VARCHAR(100) NOT NULL,
    sport VARCHAR(50) NOT NULL,
    max_players INT DEFAULT 15,
    coach_id INT,
    created_date DATE DEFAULT (CURRENT_DATE),
    status ENUM('active', 'inactive') DEFAULT 'active',
    team_logo VARCHAR(255),
    FOREIGN KEY (coach_id) REFERENCES users(user_id)
);

-- Venues Table
CREATE TABLE venues (
    venue_id INT PRIMARY KEY AUTO_INCREMENT,
    venue_name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    capacity INT,
    facility_type VARCHAR(50),
    status ENUM('available', 'maintenance', 'booked') DEFAULT 'available'
);

-- Tournaments Table
CREATE TABLE tournaments (
    tournament_id INT PRIMARY KEY AUTO_INCREMENT,
    tournament_name VARCHAR(100) NOT NULL,
    sport VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    entry_fee DECIMAL(10,2) DEFAULT 0.00,
    max_teams INT,
    status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
    description TEXT
);

-- Matches Table
CREATE TABLE matches (
    match_id INT PRIMARY KEY AUTO_INCREMENT,
    tournament_id INT,
    home_team_id INT NOT NULL,
    away_team_id INT NOT NULL,
    venue_id INT NOT NULL,
    match_date DATETIME NOT NULL,
    duration_minutes INT DEFAULT 90,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    home_score INT DEFAULT 0,
    away_score INT DEFAULT 0,
    weather_conditions VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(tournament_id),
    FOREIGN KEY (home_team_id) REFERENCES teams(team_id),
    FOREIGN KEY (away_team_id) REFERENCES teams(team_id),
    FOREIGN KEY (venue_id) REFERENCES venues(venue_id)
);

-- Team Players Junction Table
CREATE TABLE team_players (
    id INT PRIMARY KEY AUTO_INCREMENT,
    team_id INT NOT NULL,
    player_id INT NOT NULL,
    position VARCHAR(50),
    jersey_number INT,
    joined_date DATE DEFAULT (CURRENT_DATE),
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (team_id) REFERENCES teams(team_id),
    FOREIGN KEY (player_id) REFERENCES users(user_id),
    UNIQUE KEY unique_team_player (team_id, player_id)
);

-- Registrations Table
CREATE TABLE registrations (
    registration_id INT PRIMARY KEY AUTO_INCREMENT,
    player_id INT NOT NULL,
    tournament_id INT NOT NULL,
    team_id INT,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    registration_fee DECIMAL(10,2),
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    FOREIGN KEY (player_id) REFERENCES users(user_id),
    FOREIGN KEY (tournament_id) REFERENCES tournaments(tournament_id),
    FOREIGN KEY (team_id) REFERENCES teams(team_id)
);

-- Payments Table
CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    registration_id INT,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    FOREIGN KEY (registration_id) REFERENCES registrations(registration_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Prevent venue double booking
DELIMITER //
CREATE TRIGGER prevent_venue_conflict
BEFORE INSERT ON matches
FOR EACH ROW
BEGIN
    DECLARE conflict_count INT;
    SELECT COUNT(*) INTO conflict_count
    FROM matches 
    WHERE venue_id = NEW.venue_id 
    AND match_date BETWEEN 
        DATE_SUB(NEW.match_date, INTERVAL 2 HOUR) 
        AND DATE_ADD(NEW.match_date, INTERVAL 2 HOUR)
    AND status != 'cancelled';
    
    IF conflict_count > 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Venue conflict: Another match scheduled within 2 hours';
    END IF;
END//
DELIMITER ;

-- Check team capacity
DELIMITER //
CREATE TRIGGER check_team_capacity
BEFORE INSERT ON team_players
FOR EACH ROW
BEGIN
    DECLARE current_players INT;
    DECLARE max_capacity INT;
    
    SELECT COUNT(*) INTO current_players 
    FROM team_players 
    WHERE team_id = NEW.team_id AND is_active = TRUE;
    
    SELECT max_players INTO max_capacity 
    FROM teams WHERE team_id = NEW.team_id;
    
    IF current_players >= max_capacity THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Team is at maximum capacity';
    END IF;
END//
DELIMITER ;

-- Update payment status
DELIMITER //
CREATE TRIGGER update_registration_payment
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE registrations 
        SET payment_status = 'completed'
        WHERE registration_id = NEW.registration_id;
    END IF;
END//
DELIMITER ;

-- Create initial admin user
-- Make sure to change the password and email before running this
INSERT INTO users (
  username, 
  email, 
  password_hash, 
  role, 
  first_name, 
  last_name, 
  status
) VALUES (
  'admin',
  'admin@example.com',
  '2b$10$ONA6luqyTPuaPRpVcsjXNercpeH7P7PSIUyR7UsLJGeBjUTexefSe', -- password: admin123
  'admin',
  'System',
  'Administrator',
  'active'
);

-- Trigger to validate phone number length
DELIMITER //
CREATE TRIGGER validate_phone_number_before_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    -- Check phone number length if provided
    IF NEW.phone_number IS NOT NULL AND LENGTH(REPLACE(NEW.phone_number, ' ', '')) < 10 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Phone number must contain at least 10 digits';
    END IF;
    
    -- Check required fields
    IF NEW.username IS NULL OR NEW.username = '' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Username is required';
    END IF;
    
    IF NEW.email IS NULL OR NEW.email = '' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Email is required';
    END IF;
    
    IF NEW.first_name IS NULL OR NEW.first_name = '' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'First name is required';
    END IF;
    
    IF NEW.last_name IS NULL OR NEW.last_name = '' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Last name is required';
    END IF;
END//

-- Trigger to validate phone number length on update
CREATE TRIGGER validate_phone_number_before_update
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    -- Check phone number length if provided
    IF NEW.phone_number IS NOT NULL AND LENGTH(REPLACE(NEW.phone_number, ' ', '')) < 10 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Phone number must contain at least 10 digits';
    END IF;
    
    -- Check required fields
    IF NEW.username IS NULL OR NEW.username = '' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Username is required';
    END IF;
    
    IF NEW.email IS NULL OR NEW.email = '' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Email is required';
    END IF;
    
    IF NEW.first_name IS NULL OR NEW.first_name = '' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'First name is required';
    END IF;
    
    IF NEW.last_name IS NULL OR NEW.last_name = '' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Last name is required';
    END IF;
END//
DELIMITER ;

-- Add a sports preference table for players
CREATE TABLE IF NOT EXISTS player_sports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    player_id INT NOT NULL,
    sport VARCHAR(50) NOT NULL,
    skill_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_player_sport (player_id, sport)
);

-- Clear existing data and reset
DELETE FROM team_players WHERE id > 0;
DELETE FROM player_sports WHERE id > 0;
DELETE FROM teams WHERE team_id > 0;
DELETE FROM users WHERE role = 'player';

-- Reset auto increment
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE teams AUTO_INCREMENT = 1;
ALTER TABLE player_sports AUTO_INCREMENT = 1;

-- Insert 65 sample players with CLEAN usernames (no sport names)
INSERT INTO users (username, email, password_hash, role, first_name, last_name, phone_number, date_of_birth, status) VALUES
-- Football Players (20) - Clean usernames
('arjun_sharma', 'arjun.sharma@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Arjun', 'Sharma', '9876543210', '1995-03-15', 'active'),
('priya_singh', 'priya.singh@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Priya', 'Singh', '9876543211', '1996-07-20', 'active'),
('rahul_kumar', 'rahul.kumar@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Rahul', 'Kumar', '9876543212', '1994-11-08', 'active'),
('sneha_patel', 'sneha.patel@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Sneha', 'Patel', '9876543213', '1997-01-25', 'active'),
('amit_verma', 'amit.verma@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Amit', 'Verma', '9876543214', '1995-05-12', 'active'),
('riya_joshi', 'riya.joshi@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Riya', 'Joshi', '9876543215', '1996-09-18', 'active'),
('rohit_mehta', 'rohit.mehta@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Rohit', 'Mehta', '9876543216', '1993-04-30', 'active'),
('kavya_gupta', 'kavya.gupta@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Kavya', 'Gupta', '9876543217', '1994-08-16', 'active'),
('suresh_nair', 'suresh.nair@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Suresh', 'Nair', '9876543218', '1995-12-03', 'active'),
('divya_reddy', 'divya.reddy@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Divya', 'Reddy', '9876543219', '1996-06-14', 'active'),
('karan_agarwal', 'karan.agarwal@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Karan', 'Agarwal', '9876543220', '1997-02-28', 'active'),
('anita_desai', 'anita.desai@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Anita', 'Desai', '9876543221', '1994-10-09', 'active'),
('deepak_tiwari', 'deepak.tiwari@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Deepak', 'Tiwari', '9876543222', '1995-04-17', 'active'),
('pooja_yadav', 'pooja.yadav@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Pooja', 'Yadav', '9876543223', '1996-09-22', 'active'),
('vikash_pandey', 'vikash.pandey@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Vikash', 'Pandey', '9876543224', '1993-01-11', 'active'),
('neha_saxena', 'neha.saxena@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Neha', 'Saxena', '9876543225', '1995-03-17', 'active'),
('rajesh_mishra', 'rajesh.mishra@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Rajesh', 'Mishra', '9876543226', '1994-07-05', 'active'),
('shreya_chaturvedi', 'shreya.chaturvedi@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Shreya', 'Chaturvedi', '9876543227', '1996-02-07', 'active'),
('manish_shukla', 'manish.shukla@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Manish', 'Shukla', '9876543228', '1995-06-15', 'active'),
('sanjana_tripathi', 'sanjana.tripathi@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Sanjana', 'Tripathi', '9876543229', '1997-08-20', 'active'),

-- Cricket Players (20) - Clean usernames
('virat_kohli', 'virat.kohli@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Virat', 'Kohli', '9876543230', '1994-05-12', 'active'),
('smriti_mandhana', 'smriti.mandhana@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Smriti', 'Mandhana', '9876543231', '1995-09-18', 'active'),
('rohit_sharma', 'rohit.sharma@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Rohit', 'Sharma', '9876543232', '1993-04-30', 'active'),
('harmanpreet_kaur', 'harmanpreet.kaur@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Harmanpreet', 'Kaur', '9876543233', '1996-08-16', 'active'),
('ajinkya_rahane', 'ajinkya.rahane@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Ajinkya', 'Rahane', '9876543234', '1994-12-03', 'active'),
('mithali_raj', 'mithali.raj@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Mithali', 'Raj', '9876543235', '1995-06-14', 'active'),
('hardik_pandya', 'hardik.pandya@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Hardik', 'Pandya', '9876543236', '1993-02-28', 'active'),
('jemimah_rodrigues', 'jemimah.rodrigues@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Jemimah', 'Rodrigues', '9876543237', '1996-10-09', 'active'),
('shikhar_dhawan', 'shikhar.dhawan@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Shikhar', 'Dhawan', '9876543238', '1994-04-17', 'active'),
('shafali_verma', 'shafali.verma@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Shafali', 'Verma', '9876543239', '1997-09-22', 'active'),
('kl_rahul', 'kl.rahul@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'KL', 'Rahul', '9876543240', '1995-01-11', 'active'),
('richa_ghosh', 'richa.ghosh@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Richa', 'Ghosh', '9876543241', '1994-03-17', 'active'),
('rishabh_pant', 'rishabh.pant@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Rishabh', 'Pant', '9876543242', '1996-07-05', 'active'),
('deepti_sharma', 'deepti.sharma@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Deepti', 'Sharma', '9876543243', '1995-02-07', 'active'),
('ishan_kishan', 'ishan.kishan@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Ishan', 'Kishan', '9876543244', '1993-06-15', 'active'),
('taniya_bhatia', 'taniya.bhatia@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Taniya', 'Bhatia', '9876543245', '1996-08-20', 'active'),
('surya_yadav', 'surya.yadav@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Surya', 'Yadav', '9876543246', '1994-11-25', 'active'),
('pooja_vastrakar', 'pooja.vastrakar@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Pooja', 'Vastrakar', '9876543247', '1995-04-12', 'active'),
('yuzvendra_chahal', 'yuzvendra.chahal@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Yuzvendra', 'Chahal', '9876543248', '1993-09-08', 'active'),
('radha_yadav', 'radha.yadav@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Radha', 'Yadav', '9876543249', '1997-01-15', 'active'),

-- Volleyball Players (10) - Clean usernames
('ravi_kumar', 'ravi.kumar@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Ravi', 'Kumar', '9876543250', '1995-03-15', 'active'),
('maya_sethi', 'maya.sethi@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Maya', 'Sethi', '9876543251', '1996-07-20', 'active'),
('akash_bajaj', 'akash.bajaj@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Akash', 'Bajaj', '9876543252', '1994-11-08', 'active'),
('tanya_malhotra', 'tanya.malhotra@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Tanya', 'Malhotra', '9876543253', '1997-01-25', 'active'),
('dev_kapoor', 'dev.kapoor@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Dev', 'Kapoor', '9876543254', '1995-05-12', 'active'),
('sara_bhatia', 'sara.bhatia@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Sara', 'Bhatia', '9876543255', '1996-09-18', 'active'),
('nikhil_khanna', 'nikhil.khanna@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Nikhil', 'Khanna', '9876543256', '1993-04-30', 'active'),
('isha_aggarwal', 'isha.aggarwal@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Isha', 'Aggarwal', '9876543257', '1994-08-16', 'active'),
('varun_jindal', 'varun.jindal@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Varun', 'Jindal', '9876543258', '1995-12-03', 'active'),
('nisha_bansal', 'nisha.bansal@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Nisha', 'Bansal', '9876543259', '1996-06-14', 'active'),

-- Throwball Players (10) - Clean usernames
('arjun_goel', 'arjun.goel@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Arjun', 'Goel', '9876543260', '1997-02-28', 'active'),
('priya_mittal', 'priya.mittal@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Priya', 'Mittal', '9876543261', '1994-10-09', 'active'),
('rahul_arora', 'rahul.arora@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Rahul', 'Arora', '9876543262', '1995-04-17', 'active'),
('sneha_sood', 'sneha.sood@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Sneha', 'Sood', '9876543263', '1996-09-22', 'active'),
('amit_bhalla', 'amit.bhalla@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Amit', 'Bhalla', '9876543264', '1993-01-11', 'active'),
('riya_chadha', 'riya.chadha@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Riya', 'Chadha', '9876543265', '1995-03-17', 'active'),
('rohit_dua', 'rohit.dua@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Rohit', 'Dua', '9876543266', '1994-07-05', 'active'),
('kavya_chopra', 'kavya.chopra@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Kavya', 'Chopra', '9876543267', '1996-02-07', 'active'),
('suresh_grover', 'suresh.grover@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Suresh', 'Grover', '9876543268', '1995-06-15', 'active'),
('divya_sharma', 'divya.sharma@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Divya', 'Sharma', '9876543269', '1997-08-20', 'active'),

-- Badminton Players (5) - Clean usernames
('saina_nehwal', 'saina.nehwal@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Saina', 'Nehwal', '9876543270', '1995-03-17', 'active'),
('pv_sindhu', 'pv.sindhu@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'PV', 'Sindhu', '9876543271', '1993-07-05', 'active'),
('kidambi_srikanth', 'kidambi.srikanth@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Kidambi', 'Srikanth', '9876543272', '1992-02-07', 'active'),
('carolina_marin', 'carolina.marin@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Carolina', 'Marin', '9876543273', '1994-06-15', 'active'),
('tai_ying', 'tai.ying@example.com', '$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae', 'player', 'Tai Tzu', 'Ying', '9876543274', '1996-08-20', 'active');

-- Now assign sports to players in player_sports table
INSERT INTO player_sports (player_id, sport, skill_level, is_primary) VALUES
-- Football players (IDs 1-20)
(1, 'Football', 'advanced', TRUE), (2, 'Football', 'intermediate', TRUE), (3, 'Football', 'expert', TRUE), (4, 'Football', 'advanced', TRUE), (5, 'Football', 'intermediate', TRUE),
(6, 'Football', 'advanced', TRUE), (7, 'Football', 'expert', TRUE), (8, 'Football', 'intermediate', TRUE), (9, 'Football', 'advanced', TRUE), (10, 'Football', 'intermediate', TRUE),
(11, 'Football', 'advanced', TRUE), (12, 'Football', 'intermediate', TRUE), (13, 'Football', 'expert', TRUE), (14, 'Football', 'advanced', TRUE), (15, 'Football', 'intermediate', TRUE),
(16, 'Football', 'advanced', TRUE), (17, 'Football', 'intermediate', TRUE), (18, 'Football', 'expert', TRUE), (19, 'Football', 'advanced', TRUE), (20, 'Football', 'intermediate', TRUE),

-- Cricket players (IDs 21-40)
(21, 'Cricket', 'expert', TRUE), (22, 'Cricket', 'advanced', TRUE), (23, 'Cricket', 'expert', TRUE), (24, 'Cricket', 'advanced', TRUE), (25, 'Cricket', 'intermediate', TRUE),
(26, 'Cricket', 'expert', TRUE), (27, 'Cricket', 'advanced', TRUE), (28, 'Cricket', 'intermediate', TRUE), (29, 'Cricket', 'expert', TRUE), (30, 'Cricket', 'advanced', TRUE),
(31, 'Cricket', 'intermediate', TRUE), (32, 'Cricket', 'advanced', TRUE), (33, 'Cricket', 'expert', TRUE), (34, 'Cricket', 'advanced', TRUE), (35, 'Cricket', 'intermediate', TRUE),
(36, 'Cricket', 'advanced', TRUE), (37, 'Cricket', 'expert', TRUE), (38, 'Cricket', 'intermediate', TRUE), (39, 'Cricket', 'advanced', TRUE), (40, 'Cricket', 'expert', TRUE),

-- Volleyball players (IDs 41-50)
(41, 'Volleyball', 'advanced', TRUE), (42, 'Volleyball', 'intermediate', TRUE), (43, 'Volleyball', 'expert', TRUE), (44, 'Volleyball', 'advanced', TRUE), (45, 'Volleyball', 'intermediate', TRUE),
(46, 'Volleyball', 'advanced', TRUE), (47, 'Volleyball', 'expert', TRUE), (48, 'Volleyball', 'intermediate', TRUE), (49, 'Volleyball', 'advanced', TRUE), (50, 'Volleyball', 'intermediate', TRUE),

-- Throwball players (IDs 51-60)
(51, 'Throwball', 'advanced', TRUE), (52, 'Throwball', 'intermediate', TRUE), (53, 'Throwball', 'expert', TRUE), (54, 'Throwball', 'advanced', TRUE), (55, 'Throwball', 'intermediate', TRUE),
(56, 'Throwball', 'advanced', TRUE), (57, 'Throwball', 'expert', TRUE), (58, 'Throwball', 'intermediate', TRUE), (59, 'Throwball', 'advanced', TRUE), (60, 'Throwball', 'intermediate', TRUE),

-- Badminton players (IDs 61-65)
(61, 'Badminton', 'expert', TRUE), (62, 'Badminton', 'expert', TRUE), (63, 'Badminton', 'advanced', TRUE), (64, 'Badminton', 'expert', TRUE), (65, 'Badminton', 'advanced', TRUE);

-- Create some sample teams
INSERT INTO teams (team_name, sport, max_players, status) VALUES
-- Football Teams
('City United FC', 'Football', 15, 'active'),
('Rangers Football Club', 'Football', 15, 'active'),
('Warriors FC', 'Football', 15, 'active'),

-- Cricket Teams
('Mumbai Challengers', 'Cricket', 15, 'active'),
('Delhi Dynamites', 'Cricket', 15, 'active'),
('Bangalore Bolts', 'Cricket', 15, 'active'),

-- Volleyball Teams
('Spike Masters', 'Volleyball', 12, 'active'),
('Net Warriors', 'Volleyball', 12, 'active'),

-- Throwball Teams
('Thunder Throwers', 'Throwball', 10, 'active'),
('Lightning Team', 'Throwball', 10, 'active'),

-- Badminton Teams
('Shuttle Champions', 'Badminton', 8, 'active'),
('Racket Stars', 'Badminton', 8, 'active');

-- Verify the data
SELECT 'PLAYERS BY SPORT' as Info;
SELECT 
    ps.sport,
    COUNT(ps.player_id) as player_count,
    GROUP_CONCAT(CONCAT(u.first_name, ' ', u.last_name)) as players
FROM player_sports ps
JOIN users u ON ps.player_id = u.user_id
WHERE ps.is_primary = TRUE
GROUP BY ps.sport;

SELECT 'TEAMS AVAILABLE' as Info;
SELECT team_id, team_name, sport, max_players FROM teams ORDER BY sport, team_name;

-- Add sample venues
INSERT INTO venues (venue_name, location, capacity, facility_type) VALUES
('Main Stadium', 'Campus North Block', 5000, 'Stadium'),
('Basketball Court A', 'Sports Complex', 200, 'Court'),
('Cricket Ground', 'South Campus', 3000, 'Ground');

-- 1. Remove the is_active column from team_players
ALTER TABLE team_players DROP COLUMN is_active;

-- 2. Drop the capacity check trigger (it references is_active)
DROP TRIGGER IF EXISTS check_team_capacity;

-- 3. Recreate the trigger without is_active check
DELIMITER //
CREATE TRIGGER check_team_capacity
BEFORE INSERT ON team_players
FOR EACH ROW
BEGIN
    DECLARE current_players INT;
    DECLARE max_capacity INT;
    
    SELECT COUNT(*) INTO current_players 
    FROM team_players 
    WHERE team_id = NEW.team_id;
    
    SELECT max_players INTO max_capacity 
    FROM teams WHERE team_id = NEW.team_id;
    
    IF current_players >= max_capacity THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Team is at maximum capacity';
    END IF;
END//
DELIMITER ;
