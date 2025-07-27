-- MySQL dump 10.13  Distrib 9.3.0, for macos15.2 (arm64)
--
-- Host: localhost    Database: sports_management
-- ------------------------------------------------------
-- Server version	9.0.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `matches`
--

DROP TABLE IF EXISTS `matches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `matches` (
  `match_id` int NOT NULL AUTO_INCREMENT,
  `tournament_id` int DEFAULT NULL,
  `home_team_id` int NOT NULL,
  `away_team_id` int NOT NULL,
  `venue_id` int NOT NULL,
  `match_date` datetime NOT NULL,
  `duration_minutes` int DEFAULT '90',
  `status` enum('scheduled','in_progress','completed','cancelled') DEFAULT 'scheduled',
  `home_score` int DEFAULT '0',
  `away_score` int DEFAULT '0',
  `weather_conditions` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`match_id`),
  KEY `tournament_id` (`tournament_id`),
  KEY `home_team_id` (`home_team_id`),
  KEY `away_team_id` (`away_team_id`),
  KEY `venue_id` (`venue_id`),
  CONSTRAINT `matches_ibfk_1` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`tournament_id`),
  CONSTRAINT `matches_ibfk_2` FOREIGN KEY (`home_team_id`) REFERENCES `teams` (`team_id`),
  CONSTRAINT `matches_ibfk_3` FOREIGN KEY (`away_team_id`) REFERENCES `teams` (`team_id`),
  CONSTRAINT `matches_ibfk_4` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`venue_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `matches`
--

LOCK TABLES `matches` WRITE;
/*!40000 ALTER TABLE `matches` DISABLE KEYS */;
INSERT INTO `matches` VALUES (1,1,4,14,3,'2025-07-17 14:30:00',90,'scheduled',0,0,NULL,'2025-07-25 20:09:01'),(2,1,14,4,3,'2025-07-27 13:15:00',90,'scheduled',0,0,NULL,'2025-07-26 13:16:15'),(4,NULL,14,4,1,'2025-07-29 13:35:00',90,'scheduled',0,0,NULL,'2025-07-26 13:35:44'),(5,NULL,14,4,1,'2025-07-30 10:00:00',90,'scheduled',0,0,NULL,'2025-07-26 19:43:20'),(9,NULL,1,21,1,'2025-07-30 07:54:00',90,'scheduled',0,0,NULL,'2025-07-26 19:54:30'),(13,9,21,1,1,'2025-07-29 07:58:00',90,'scheduled',0,0,NULL,'2025-07-26 19:58:22'),(17,NULL,1,21,1,'2025-08-20 04:30:00',90,'scheduled',0,0,NULL,'2025-07-26 20:20:20'),(18,1,14,4,1,'2025-07-29 04:30:00',90,'scheduled',0,0,NULL,'2025-07-26 20:20:20'),(20,NULL,14,25,3,'2025-07-29 16:30:00',90,'scheduled',0,0,NULL,'2025-07-27 16:36:35');
/*!40000 ALTER TABLE `matches` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `prevent_venue_conflict` BEFORE INSERT ON `matches` FOR EACH ROW BEGIN
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
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `registration_id` int DEFAULT NULL,
  `user_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `payment_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
  PRIMARY KEY (`payment_id`),
  KEY `registration_id` (`registration_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`registration_id`),
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `update_registration_payment` AFTER UPDATE ON `payments` FOR EACH ROW BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE registrations 
        SET payment_status = 'completed'
        WHERE registration_id = NEW.registration_id;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `player_sports`
--

DROP TABLE IF EXISTS `player_sports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_sports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `player_id` int NOT NULL,
  `sport` varchar(50) NOT NULL,
  `skill_level` enum('beginner','intermediate','advanced','expert') DEFAULT 'intermediate',
  `is_primary` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_player_sport` (`player_id`,`sport`),
  CONSTRAINT `player_sports_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=132 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player_sports`
--

LOCK TABLES `player_sports` WRITE;
/*!40000 ALTER TABLE `player_sports` DISABLE KEYS */;
INSERT INTO `player_sports` VALUES (21,21,'Cricket','expert',1,'2025-07-24 20:30:26'),(22,22,'Cricket','advanced',1,'2025-07-24 20:30:26'),(23,23,'Cricket','expert',1,'2025-07-24 20:30:26'),(24,24,'Cricket','advanced',1,'2025-07-24 20:30:26'),(25,25,'Cricket','intermediate',1,'2025-07-24 20:30:26'),(26,26,'Cricket','expert',1,'2025-07-24 20:30:26'),(27,27,'Cricket','advanced',1,'2025-07-24 20:30:26'),(28,28,'Cricket','intermediate',1,'2025-07-24 20:30:26'),(29,29,'Cricket','expert',1,'2025-07-24 20:30:26'),(30,30,'Cricket','advanced',1,'2025-07-24 20:30:26'),(31,31,'Cricket','intermediate',1,'2025-07-24 20:30:26'),(32,32,'Cricket','advanced',1,'2025-07-24 20:30:26'),(33,33,'Cricket','expert',1,'2025-07-24 20:30:26'),(34,34,'Cricket','advanced',1,'2025-07-24 20:30:26'),(35,35,'Cricket','intermediate',1,'2025-07-24 20:30:26'),(36,36,'Cricket','advanced',1,'2025-07-24 20:30:26'),(37,37,'Cricket','expert',1,'2025-07-24 20:30:26'),(38,38,'Cricket','intermediate',1,'2025-07-24 20:30:26'),(39,39,'Cricket','advanced',1,'2025-07-24 20:30:26'),(40,40,'Cricket','expert',1,'2025-07-24 20:30:26'),(41,41,'Volleyball','advanced',1,'2025-07-24 20:30:26'),(42,42,'Volleyball','intermediate',1,'2025-07-24 20:30:26'),(43,43,'Volleyball','expert',1,'2025-07-24 20:30:26'),(44,44,'Volleyball','advanced',1,'2025-07-24 20:30:26'),(45,45,'Volleyball','intermediate',1,'2025-07-24 20:30:26'),(46,46,'Volleyball','advanced',1,'2025-07-24 20:30:26'),(47,47,'Volleyball','expert',1,'2025-07-24 20:30:26'),(48,48,'Volleyball','intermediate',1,'2025-07-24 20:30:26'),(49,49,'Volleyball','advanced',1,'2025-07-24 20:30:26'),(50,50,'Volleyball','intermediate',1,'2025-07-24 20:30:26'),(51,51,'Throwball','advanced',1,'2025-07-24 20:30:27'),(52,52,'Throwball','intermediate',1,'2025-07-24 20:30:27'),(53,53,'Throwball','expert',1,'2025-07-24 20:30:27'),(54,54,'Throwball','advanced',1,'2025-07-24 20:30:27'),(55,55,'Throwball','intermediate',1,'2025-07-24 20:30:27'),(56,56,'Throwball','advanced',1,'2025-07-24 20:30:27'),(57,57,'Throwball','expert',1,'2025-07-24 20:30:27'),(59,59,'Throwball','advanced',1,'2025-07-24 20:30:27'),(60,60,'Throwball','intermediate',1,'2025-07-24 20:30:27'),(61,61,'Badminton','expert',1,'2025-07-24 20:30:27'),(62,62,'Badminton','expert',1,'2025-07-24 20:30:27'),(63,63,'Badminton','advanced',1,'2025-07-24 20:30:27'),(64,64,'Badminton','expert',1,'2025-07-24 20:30:27'),(65,65,'Badminton','advanced',1,'2025-07-24 20:30:27'),(74,6,'Volleyball','intermediate',1,'2025-07-24 20:31:07'),(75,68,'Throwball','intermediate',1,'2025-07-24 20:46:50'),(76,69,'Football','beginner',1,'2025-07-24 20:47:00'),(77,67,'Football','beginner',1,'2025-07-25 18:29:50'),(78,66,'Throwball','intermediate',1,'2025-07-25 18:29:58'),(81,15,'Volleyball','advanced',1,'2025-07-25 18:30:27'),(82,16,'Football','expert',1,'2025-07-25 18:30:35'),(83,17,'Badminton','intermediate',1,'2025-07-25 18:30:44'),(84,18,'Football','beginner',1,'2025-07-25 18:30:51'),(85,19,'Volleyball','intermediate',1,'2025-07-25 18:30:57'),(86,20,'Throwball','intermediate',1,'2025-07-25 18:31:03'),(89,72,'Cricket','expert',1,'2025-07-25 20:10:05'),(90,10,'Football','intermediate',1,'2025-07-26 11:31:02'),(91,76,'Cricket','expert',1,'2025-07-26 11:37:16'),(94,73,'Throwball','intermediate',1,'2025-07-26 11:37:41'),(95,77,'Volleyball','expert',1,'2025-07-26 11:50:59'),(98,81,'Cricket','intermediate',1,'2025-07-26 15:15:29'),(101,80,'Volleyball','advanced',1,'2025-07-26 15:30:50'),(111,71,'Cricket','expert',1,'2025-07-26 20:11:40'),(115,78,'Badminton','intermediate',1,'2025-07-26 20:22:14'),(116,8,'Badminton','intermediate',1,'2025-07-26 20:22:27'),(119,75,'Cricket','intermediate',1,'2025-07-26 20:23:34'),(120,71,'Volleyball','intermediate',0,'2025-07-26 20:24:02'),(121,5,'Football','intermediate',1,'2025-07-26 20:31:11'),(123,74,'Football','intermediate',1,'2025-07-26 20:31:39'),(124,12,'Volleyball','intermediate',1,'2025-07-26 20:31:49'),(125,87,'Cricket','expert',1,'2025-07-27 14:39:59'),(126,14,'Throwball','expert',1,'2025-07-27 16:33:08'),(129,87,'Volleyball','intermediate',0,'2025-07-27 16:49:05');
/*!40000 ALTER TABLE `player_sports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registrations`
--

DROP TABLE IF EXISTS `registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registrations` (
  `registration_id` int NOT NULL AUTO_INCREMENT,
  `player_id` int NOT NULL,
  `tournament_id` int NOT NULL,
  `team_id` int DEFAULT NULL,
  `registration_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `registration_fee` decimal(10,2) DEFAULT NULL,
  `payment_status` enum('pending','completed','failed') DEFAULT 'pending',
  PRIMARY KEY (`registration_id`),
  KEY `player_id` (`player_id`),
  KEY `tournament_id` (`tournament_id`),
  KEY `team_id` (`team_id`),
  CONSTRAINT `registrations_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `registrations_ibfk_2` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`tournament_id`),
  CONSTRAINT `registrations_ibfk_3` FOREIGN KEY (`team_id`) REFERENCES `teams` (`team_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registrations`
--

LOCK TABLES `registrations` WRITE;
/*!40000 ALTER TABLE `registrations` DISABLE KEYS */;
INSERT INTO `registrations` VALUES (1,71,5,NULL,'2025-07-26 17:06:20','pending',100.00,'pending');
/*!40000 ALTER TABLE `registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_players`
--

DROP TABLE IF EXISTS `team_players`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_players` (
  `id` int NOT NULL AUTO_INCREMENT,
  `team_id` int NOT NULL,
  `player_id` int NOT NULL,
  `position` varchar(50) DEFAULT NULL,
  `jersey_number` int DEFAULT NULL,
  `joined_date` date DEFAULT (curdate()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_team_player` (`team_id`,`player_id`),
  KEY `player_id` (`player_id`),
  CONSTRAINT `team_players_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`team_id`),
  CONSTRAINT `team_players_ibfk_2` FOREIGN KEY (`player_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=99 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_players`
--

LOCK TABLES `team_players` WRITE;
/*!40000 ALTER TABLE `team_players` DISABLE KEYS */;
INSERT INTO `team_players` VALUES (95,25,87,'Opener',45,'2025-07-27'),(97,25,72,'Opener',17,'2025-07-27'),(98,14,26,'Batsman',18,'2025-07-27');
/*!40000 ALTER TABLE `team_players` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `check_team_capacity` BEFORE INSERT ON `team_players` FOR EACH ROW BEGIN
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
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teams` (
  `team_id` int NOT NULL AUTO_INCREMENT,
  `team_name` varchar(100) NOT NULL,
  `sport` varchar(50) NOT NULL,
  `max_players` int DEFAULT '15',
  `coach_id` int DEFAULT NULL,
  `created_date` date DEFAULT (curdate()),
  `status` enum('active','inactive') DEFAULT 'active',
  `team_logo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`team_id`),
  KEY `coach_id` (`coach_id`),
  CONSTRAINT `teams_ibfk_1` FOREIGN KEY (`coach_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
INSERT INTO `teams` VALUES (1,'City United FC','Football',15,74,'2025-07-25','active',NULL),(4,'Mumbai Challengers','Cricket',15,75,'2025-07-25','active',NULL),(14,'Royal Challenger Banglore','Cricket',11,76,'2025-07-26','active',NULL),(21,'Football United','Football',15,74,'2025-07-27','active',NULL),(23,'Throw1','Throwball',15,75,'2025-07-27','active',NULL),(24,'Throe2','Throwball',15,76,'2025-07-27','active',NULL),(25,'New Team','Cricket',12,75,'2025-07-27','active',NULL);
/*!40000 ALTER TABLE `teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tournaments`
--

DROP TABLE IF EXISTS `tournaments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tournaments` (
  `tournament_id` int NOT NULL AUTO_INCREMENT,
  `tournament_name` varchar(100) NOT NULL,
  `sport` varchar(50) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `entry_fee` decimal(10,2) DEFAULT '0.00',
  `max_teams` int DEFAULT NULL,
  `status` enum('upcoming','ongoing','completed','cancelled') DEFAULT 'upcoming',
  `description` text,
  PRIMARY KEY (`tournament_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tournaments`
--

LOCK TABLES `tournaments` WRITE;
/*!40000 ALTER TABLE `tournaments` DISABLE KEYS */;
INSERT INTO `tournaments` VALUES (1,'PES Tournament','Cricket','2025-07-27','2025-07-30',500.00,6,'upcoming',NULL),(5,'IPL','Cricket','2025-07-29','2025-08-06',20000.00,8,'upcoming','IPL Tournament'),(9,'Football Championship','Football','2025-08-10','2025-08-15',500.00,4,'upcoming',NULL),(11,'Craxy','Throwball','2025-07-15','2025-07-27',3000.00,20,'upcoming','Craxy'),(12,'Man','Volleyball','2025-07-22','2025-08-01',300.00,20,'upcoming','Man Volleyball');
/*!40000 ALTER TABLE `tournaments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','player','coach','manager') DEFAULT 'player',
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `status` enum('active','inactive','deleted') DEFAULT 'active',
  `profile_picture` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=88 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (3,'admin','admin@example.com','$2b$10$ONA6luqyTPuaPRpVcsjXNercpeH7P7PSIUyR7UsLJGeBjUTexefSe','admin','System','Administrator',NULL,NULL,'active',NULL,'2025-07-24 18:30:32','2025-07-24 18:48:18'),(5,'Management Administrator','management@mail.com','$2b$10$d2DYh1pg65q4uzTtkCYTleN.VDLBJ2c.wTpYLq06AywWDvW5qXd/K','admin','Mohan','Kumar','9999999999','1987-02-01','active',NULL,'2025-07-24 19:02:25','2025-07-26 19:35:20'),(6,'arjun_sharma','arjun.sharma@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Arjun','Sharma','9876543210','1995-03-15','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(8,'rahul_kumar','rahul.kumar@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Rahul','Kumar','9876543212','1994-11-08','active',NULL,'2025-07-24 19:55:48','2025-07-26 19:29:38'),(10,'amit_verma','amit.verma@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Amit','Verma','9876543214','1995-05-12','inactive',NULL,'2025-07-24 19:55:48','2025-07-24 20:32:48'),(11,'riya_joshi','riya.joshi@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Riya','Joshi','9876543215','1996-09-18','inactive',NULL,'2025-07-24 19:55:48','2025-07-24 20:32:51'),(12,'rohit_mehta','rohit.mehta@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Rohit','Mehta','9876543216','1993-04-30','inactive',NULL,'2025-07-24 19:55:48','2025-07-24 20:32:54'),(14,'suresh_nair','suresh.nair@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Suresh','Nair','9876543218','1995-12-03','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(15,'divya_reddy','divya.reddy@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Divya','Reddy','9876543219','1996-06-14','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(16,'karan_agarwal','karan.agarwal@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Karan','Agarwal','9876543220','1997-02-28','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(17,'anita_desai','anita.desai@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Anita','Desai','9876543221','1994-10-09','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(18,'deepak_tiwari','deepak.tiwari@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Deepak','Tiwari','9876543222','1995-04-17','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(19,'pooja_yadav','pooja.yadav@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Pooja','Yadav','9876543223','1996-09-22','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(20,'vikash_pandey','vikash.pandey@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Vikash','Pandey','9876543224','1993-01-11','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(21,'neha_saxena','neha.saxena@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Neha','Saxena','9876543225','1995-03-17','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(22,'rajesh_mishra','rajesh.mishra@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Rajesh','Mishra','9876543226','1994-07-05','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(23,'shreya_chaturvedi','shreya.chaturvedi@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Shreya','Chaturvedi','9876543227','1996-02-07','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(24,'manish_shukla','manish.shukla@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Manish','Shukla','9876543228','1995-06-15','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(25,'sanjana_tripathi','sanjana.tripathi@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Sanjana','Tripathi','9876543229','1997-08-20','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(26,'virat_kohli','virat.kohli@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Virat','Kohli','9876543230','1994-05-12','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(27,'smriti_mandhana','smriti.mandhana@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Smriti','Mandhana','9876543231','1995-09-18','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(28,'rohit_sharma','rohit.sharma@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Rohit','Sharma','9876543232','1993-04-30','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(29,'harmanpreet_kaur','harmanpreet.kaur@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Harmanpreet','Kaur','9876543233','1996-08-16','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(30,'ajinkya_rahane','ajinkya.rahane@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Ajinkya','Rahane','9876543234','1994-12-03','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(31,'mithali_raj','mithali.raj@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Mithali','Raj','9876543235','1995-06-14','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(32,'hardik_pandya','hardik.pandya@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Hardik','Pandya','9876543236','1993-02-28','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(33,'jemimah_rodrigues','jemimah.rodrigues@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Jemimah','Rodrigues','9876543237','1996-10-09','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(34,'shikhar_dhawan','shikhar.dhawan@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Shikhar','Dhawan','9876543238','1994-04-17','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(35,'shafali_verma','shafali.verma@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Shafali','Verma','9876543239','1997-09-22','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(36,'kl_rahul','kl.rahul@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','KL','Rahul','9876543240','1995-01-11','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(37,'richa_ghosh','richa.ghosh@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Richa','Ghosh','9876543241','1994-03-17','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(38,'rishabh_pant','rishabh.pant@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Rishabh','Pant','9876543242','1996-07-05','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(39,'deepti_sharma','deepti.sharma@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Deepti','Sharma','9876543243','1995-02-07','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(40,'ishan_kishan','ishan.kishan@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Ishan','Kishan','9876543244','1993-06-15','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(41,'taniya_bhatia','taniya.bhatia@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Taniya','Bhatia','9876543245','1996-08-20','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(42,'surya_yadav','surya.yadav@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Surya','Yadav','9876543246','1994-11-25','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(43,'pooja_vastrakar','pooja.vastrakar@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Pooja','Vastrakar','9876543247','1995-04-12','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(44,'yuzvendra_chahal','yuzvendra.chahal@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Yuzvendra','Chahal','9876543248','1993-09-08','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(45,'radha_yadav','radha.yadav@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Radha','Yadav','9876543249','1997-01-15','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(46,'ravi_kumar','ravi.kumar@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Ravi','Kumar','9876543250','1995-03-15','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(47,'maya_sethi','maya.sethi@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Maya','Sethi','9876543251','1996-07-20','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(48,'akash_bajaj','akash.bajaj@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Akash','Bajaj','9876543252','1994-11-08','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(49,'tanya_malhotra','tanya.malhotra@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Tanya','Malhotra','9876543253','1997-01-25','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(50,'dev_kapoor','dev.kapoor@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Dev','Kapoor','9876543254','1995-05-12','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(51,'sara_bhatia','sara.bhatia@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Sara','Bhatia','9876543255','1996-09-18','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(52,'nikhil_khanna','nikhil.khanna@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Nikhil','Khanna','9876543256','1993-04-30','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(53,'isha_aggarwal','isha.aggarwal@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Isha','Aggarwal','9876543257','1994-08-16','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(54,'varun_jindal','varun.jindal@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Varun','Jindal','9876543258','1995-12-03','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(55,'nisha_bansal','nisha.bansal@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Nisha','Bansal','9876543259','1996-06-14','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(56,'arjun_goel','arjun.goel@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Arjun','Goel','9876543260','1997-02-28','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(57,'priya_mittal','priya.mittal@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Priya','Mittal','9876543261','1994-10-09','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(59,'sneha_sood','sneha.sood@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Sneha','Sood','9876543263','1996-09-22','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(60,'amit_bhalla','amit.bhalla@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Amit','Bhalla','9876543264','1993-01-11','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(61,'riya_chadha','riya.chadha@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Riya','Chadha','9876543265','1995-03-17','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(62,'rohit_dua','rohit.dua@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Rohit','Dua','9876543266','1994-07-05','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(63,'kavya_chopra','kavya.chopra@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Kavya','Chopra','9876543267','1996-02-07','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(64,'suresh_grover','suresh.grover@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Suresh','Grover','9876543268','1995-06-15','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(65,'divya_sharma','divya.sharma@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Divya','Sharma','9876543269','1997-08-20','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(66,'saina_nehwal','saina.nehwal@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Saina','Nehwal','9876543270','1995-03-17','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(67,'pv_sindhu','pv.sindhu@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','PV','Sindhu','9876543271','1993-07-05','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(68,'kidambi_srikanth','kidambi.srikanth@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Kidambi','Srikanth','9876543272','1992-02-07','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(69,'carolina_marin','carolina.marin@example.com','$2b$10$rGXmm9F7VXGhJ0U6/iFz3.O4f1oE7O4U9bK8mF3zH9kH8V7U4d4Ae','player','Carolina','Marin','9876543273','1994-06-15','active',NULL,'2025-07-24 19:55:48','2025-07-24 19:55:48'),(71,'Sundar','sundar@gmail.com','$2b$10$ernw2af5aObXfYcCZZ6mY.F/cZCd9OSsooYUMe2jX/WTuAMfafoM6','player','Washington','Sundar','9090909098',NULL,'active',NULL,'2025-07-25 18:37:56','2025-07-26 19:48:23'),(72,'ADB','abd@gmail.com','$2b$10$gkbMLu6bU/7ML.IpCKIT5unHNmrI7Rm2j9SDBbTUjMOAuAj/ndmqe','player','AB','Delivers','9879780878','1984-06-04','active',NULL,'2025-07-25 18:58:43','2025-07-26 20:03:42'),(73,'Ravi','ravi@gmail.com','$2b$10$.QXj8UwscFqNhdLQUvzbYeCDoW0S2REpM.RXxIIeN5sLGckuEEZpK','coach','Ravi','Shastri','9352648364','1967-11-03','active',NULL,'2025-07-25 18:59:59','2025-07-25 18:59:59'),(74,'Anuj','anuj@gmail.com','$2b$10$OGaKiWAj0RhljRVyPs7W1ORCoND/IfNSVOFOUFXd14Gx/aYDke5l.','coach','Anuj','Kumar','8374834898','1968-03-01','active',NULL,'2025-07-26 08:47:18','2025-07-26 08:47:18'),(75,'somesh','somesh@gmail.com','$2b$10$XPDaoAjNxanVomTDOk4nYOxlobZI.R2IZ65/zRXdP1n9XAvDZ8g.y','coach','Somesh','M','38574894543','1980-04-02','active',NULL,'2025-07-26 08:48:26','2025-07-26 14:23:59'),(76,'sk','sk@gmail.com','$2b$10$/bbKrCOtbjZDDBCu1CmOyOkveKXxdiahQSkWPijg7fEk38o2bhW5O','coach','Shashank','K','3483834343','1997-02-03','active',NULL,'2025-07-26 08:57:33','2025-07-26 08:57:33'),(77,'Ranjan','ranjan@gmail.com','$2b$12$h0f8hpWbxIOyMO8PzRs7.uRJWQuGc/dEcxq8E4oqG6uIPKhQ5Rte6','coach','Ranjan','Singh','8787847833','1990-12-20','active',NULL,'2025-07-26 11:50:59','2025-07-26 11:50:59'),(78,'pvsindhu','pvsindu@gmail.com','$2b$12$O7cP8luoVnl5.LOt3ucVX.HqexROtpFaRH4IWjq3jj7xnnDLyR45C','coach','Sindhu','PV','9000000000','1998-04-28','active',NULL,'2025-07-26 14:16:26','2025-07-26 19:51:38'),(80,'samrudhShetty','samrudh@gmail.com','$2b$12$gNpHZHWpmRUryVhZtzCog.loz3qT745BnPieEOg6Y1VJPz8S/aX9K','player','Samrudh','Shetty','8374834898','2025-07-07','active',NULL,'2025-07-26 14:40:07','2025-07-26 14:40:07'),(81,'abhi','abhi@gmail.com','$2b$12$B1PR9kuOTnbgedflbDw5b.Rlkb6CEvCLy3HaQe6iZiyc0.O./yCce','player','Abhi','Joshi','9879780878','2004-02-06','active',NULL,'2025-07-26 15:14:21','2025-07-26 19:29:25'),(83,'rahul','rahul@gmail.com','$2b$12$b/0VLP9A0Re0tE3UNAHcIO0JZuU1UvHChPTTozJL8bcb3QImsQjvC','admin','Rahul','Chaturvedi','9898989090','2000-07-01','active',NULL,'2025-07-26 19:36:36','2025-07-26 20:23:19'),(86,'Shivam','shivam@gmail.com','$2b$12$4segKXBdZlPgs8mpJ65iiOYTm3bVdeLFLoFS/D6fUoDKxwubwhyX.','admin','Shivam','Kalloli','9879780878','2003-01-16','active',NULL,'2025-07-26 20:35:17','2025-07-27 16:34:42'),(87,'Shashikiran','shashi@gmail.com','$2b$12$6zZtqox1G44OjRVWbbDIJeqMAWGdxZxcXHrszEGCetzoNaZJpyjzy','player','Shashi','Kiran','8475974839','2006-11-01','active',NULL,'2025-07-27 14:39:13','2025-07-27 14:39:13');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `validate_phone_number_before_insert` BEFORE INSERT ON `users` FOR EACH ROW BEGIN
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
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `validate_phone_number_before_update` BEFORE UPDATE ON `users` FOR EACH ROW BEGIN
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
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `venues`
--

DROP TABLE IF EXISTS `venues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `venues` (
  `venue_id` int NOT NULL AUTO_INCREMENT,
  `venue_name` varchar(100) NOT NULL,
  `location` varchar(255) NOT NULL,
  `capacity` int DEFAULT NULL,
  `facility_type` varchar(50) DEFAULT NULL,
  `status` enum('available','maintenance','booked') DEFAULT 'available',
  PRIMARY KEY (`venue_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venues`
--

LOCK TABLES `venues` WRITE;
/*!40000 ALTER TABLE `venues` DISABLE KEYS */;
INSERT INTO `venues` VALUES (1,'Main Stadium','Campus North Block',5000,'Stadium','available'),(2,'Basketball Court A','Sports Complex',200,'Court','available'),(3,'Cricket Ground','South Campus',3000,'Ground','available');
/*!40000 ALTER TABLE `venues` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-27 22:41:42
