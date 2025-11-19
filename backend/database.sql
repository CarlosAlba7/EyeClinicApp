-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: eyeclinic-mysql-eyeclinic.e.aivencloud.com    Database: defaultdb
-- ------------------------------------------------------
-- Server version	8.0.35

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '6e818e22-b3a9-11f0-b1b8-862ccfb0545b:1-142,
f76d7e1a-c3de-11f0-8d46-862ccfb0288b:1-29';

--
-- Table structure for table `appointment`
--

DROP TABLE IF EXISTS `appointment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointment` (
  `apptID` int NOT NULL AUTO_INCREMENT,
  `patientID` int NOT NULL,
  `employeeID` int DEFAULT NULL,
  `appointmentDate` date NOT NULL,
  `appointmentTime` time NOT NULL,
  `appointmentStatus` varchar(40) DEFAULT NULL,
  `reason` text,
  PRIMARY KEY (`apptID`),
  KEY `fk_appt_patient` (`patientID`),
  KEY `fk_appt_employee` (`employeeID`),
  CONSTRAINT `fk_appt_employee` FOREIGN KEY (`employeeID`) REFERENCES `employee` (`employeeID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_appt_patient` FOREIGN KEY (`patientID`) REFERENCES `patient` (`patientID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment`
--

LOCK TABLES `appointment` WRITE;
/*!40000 ALTER TABLE `appointment` DISABLE KEYS */;
INSERT INTO `appointment` VALUES (1,10,2,'2025-10-27','23:53:00','Completed',''),(2,9,2,'2025-10-29','12:00:00','Scheduled','safasd'),(3,5,2,'2003-01-05','22:56:00','Scheduled',''),(4,11,2,'2025-11-06','21:54:00','Scheduled','Need eyes checked');
/*!40000 ALTER TABLE `appointment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coveredby`
--

DROP TABLE IF EXISTS `coveredby`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coveredby` (
  `patientID` int NOT NULL,
  `insuranceID` int NOT NULL,
  PRIMARY KEY (`patientID`,`insuranceID`),
  KEY `fk_cov_insurance` (`insuranceID`),
  CONSTRAINT `fk_cov_insurance` FOREIGN KEY (`insuranceID`) REFERENCES `insurance` (`insuranceID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cov_patient` FOREIGN KEY (`patientID`) REFERENCES `patient` (`patientID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coveredby`
--

LOCK TABLES `coveredby` WRITE;
/*!40000 ALTER TABLE `coveredby` DISABLE KEYS */;
/*!40000 ALTER TABLE `coveredby` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dependents`
--

DROP TABLE IF EXISTS `dependents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dependents` (
  `dependentID` int NOT NULL AUTO_INCREMENT,
  `employeeID` int NOT NULL,
  `dependentName` varchar(100) NOT NULL,
  `relationship` varchar(50) NOT NULL,
  `dependentSSN` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`dependentID`),
  UNIQUE KEY `dependentSSN` (`dependentSSN`),
  KEY `fk_dependent_employee` (`employeeID`),
  CONSTRAINT `fk_dependent_employee` FOREIGN KEY (`employeeID`) REFERENCES `employee` (`employeeID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dependents`
--

LOCK TABLES `dependents` WRITE;
/*!40000 ALTER TABLE `dependents` DISABLE KEYS */;
/*!40000 ALTER TABLE `dependents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee` (
  `employeeID` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(50) DEFAULT NULL,
  `middleInit` char(1) DEFAULT NULL,
  `lastName` varchar(50) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `birthdate` date DEFAULT NULL,
  `employeeAddress` varchar(255) DEFAULT NULL,
  `employeeType` varchar(50) DEFAULT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `yearsExperience` int DEFAULT NULL,
  `startedOn` date DEFAULT NULL,
  `endedOn` date DEFAULT NULL,
  `employeeSSN` varchar(20) DEFAULT NULL,
  `employeeContact` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `emergencyPhone` varchar(20) DEFAULT NULL,
  `emergencyEmail` varchar(100) DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`employeeID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee`
--

LOCK TABLES `employee` WRITE;
/*!40000 ALTER TABLE `employee` DISABLE KEYS */;
INSERT INTO `employee` VALUES (1,'Admin',NULL,'User',NULL,NULL,NULL,'Admin',NULL,NULL,'2024-01-01',NULL,NULL,NULL,'admin@eyeclinic.com',NULL,NULL,NULL,80000.00),(2,'John',NULL,'Doctor',NULL,NULL,NULL,'Doctor','Ophthalmology',NULL,'2024-01-01',NULL,NULL,NULL,'doctor@eyeclinic.com',NULL,NULL,NULL,180000.00),(3,'Jane',NULL,'Receptionist',NULL,NULL,NULL,'Receptionist',NULL,NULL,'2024-01-01',NULL,NULL,NULL,'receptionist@eyeclinic.com',NULL,NULL,NULL,45000.00);
/*!40000 ALTER TABLE `employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employeecontact`
--

DROP TABLE IF EXISTS `employeecontact`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employeecontact` (
  `contactID` int NOT NULL AUTO_INCREMENT,
  `employeeID` int NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(25) DEFAULT NULL,
  `emergencyEmail` varchar(100) DEFAULT NULL,
  `emergencyPhone` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`contactID`),
  UNIQUE KEY `employeeID` (`employeeID`),
  UNIQUE KEY `email` (`email`),
  CONSTRAINT `fk_empcontact_employee` FOREIGN KEY (`employeeID`) REFERENCES `employee` (`employeeID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employeecontact`
--

LOCK TABLES `employeecontact` WRITE;
/*!40000 ALTER TABLE `employeecontact` DISABLE KEYS */;
/*!40000 ALTER TABLE `employeecontact` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam`
--

DROP TABLE IF EXISTS `exam`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam` (
  `examID` int NOT NULL AUTO_INCREMENT,
  `apptID` int NOT NULL,
  `examType` varchar(80) NOT NULL,
  `results` text,
  `diagnosis` text,
  PRIMARY KEY (`examID`),
  KEY `fk_exam_appt` (`apptID`),
  CONSTRAINT `fk_exam_appt` FOREIGN KEY (`apptID`) REFERENCES `appointment` (`apptID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam`
--

LOCK TABLES `exam` WRITE;
/*!40000 ALTER TABLE `exam` DISABLE KEYS */;
/*!40000 ALTER TABLE `exam` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `insurance`
--

DROP TABLE IF EXISTS `insurance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `insurance` (
  `insuranceID` int NOT NULL AUTO_INCREMENT,
  `companyName` varchar(120) NOT NULL,
  `plansCovered` text,
  PRIMARY KEY (`insuranceID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `insurance`
--

LOCK TABLES `insurance` WRITE;
/*!40000 ALTER TABLE `insurance` DISABLE KEYS */;
/*!40000 ALTER TABLE `insurance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice`
--

DROP TABLE IF EXISTS `invoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice` (
  `invoiceID` int NOT NULL AUTO_INCREMENT,
  `apptID` int NOT NULL,
  `patientID` int NOT NULL,
  `createdBy` int DEFAULT NULL,
  `dateIssued` date NOT NULL,
  `invoiceStatus` varchar(40) DEFAULT NULL,
  `methodOfPay` varchar(40) DEFAULT NULL,
  `invoiceTotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `specialistRefer` varchar(120) DEFAULT NULL,
  `summary` text,
  PRIMARY KEY (`invoiceID`),
  UNIQUE KEY `apptID` (`apptID`),
  KEY `fk_inv_patient` (`patientID`),
  KEY `fk_inv_creator` (`createdBy`),
  CONSTRAINT `fk_inv_appt` FOREIGN KEY (`apptID`) REFERENCES `appointment` (`apptID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_inv_creator` FOREIGN KEY (`createdBy`) REFERENCES `employee` (`employeeID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_inv_patient` FOREIGN KEY (`patientID`) REFERENCES `patient` (`patientID`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice`
--

LOCK TABLES `invoice` WRITE;
/*!40000 ALTER TABLE `invoice` DISABLE KEYS */;
INSERT INTO `invoice` VALUES (1,1,10,3,'2025-10-30','Pending','Cash',10000.00,'asfdafds','sdafdsaf');
/*!40000 ALTER TABLE `invoice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient`
--

DROP TABLE IF EXISTS `patient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient` (
  `patientID` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(50) NOT NULL,
  `middleInit` char(1) DEFAULT NULL,
  `lastName` varchar(50) NOT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `patientBirthdate` date DEFAULT NULL,
  `patientAddress` varchar(255) DEFAULT NULL,
  `patientContact` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(25) DEFAULT NULL,
  `emergencyEmail` varchar(100) DEFAULT NULL,
  `emergencyPhone` varchar(25) DEFAULT NULL,
  `visionHistory` text,
  `medHistory` text,
  `insuranceNote` varchar(120) DEFAULT NULL,
  `userID` int DEFAULT NULL,
  PRIMARY KEY (`patientID`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_patient_user` (`userID`),
  CONSTRAINT `fk_patient_user` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient`
--

LOCK TABLES `patient` WRITE;
/*!40000 ALTER TABLE `patient` DISABLE KEYS */;
INSERT INTO `patient` VALUES (1,'Robert','J','Anderson','Male','1965-04-20','111 Main St, Houston, TX 77001',NULL,'robert.anderson@email.com','713-555-1001','emergency@anderson.com','713-555-1002','Nearsighted since childhood, wears glasses','Diabetes Type 2, Hypertension','Blue Cross PPO',NULL),(2,'Jennifer','K','Taylor','Female','1978-08-15','222 Oak Ave, Houston, TX 77002',NULL,'jennifer.taylor@email.com','713-555-1101','emergency@taylor.com','713-555-1102','Farsighted, requires reading glasses','No significant medical history','United Healthcare',NULL),(3,'William','L','Thomas','Male','1992-01-30','333 Pine St, Houston, TX 77003',NULL,'william.thomas@email.com','713-555-1201','emergency@thomas.com','713-555-1202','Perfect vision until recently','Seasonal allergies','Aetna HMO',NULL),(4,'Mary','M','Garcia','Female','1955-11-08','444 Elm Rd, Houston, TX 77004',NULL,'mary.garcia@email.com','713-555-1301','emergency@garcia.com','713-555-1302','Cataracts developing, glaucoma history','Arthritis, High cholesterol','Medicare + Supplemental',NULL),(5,'James','N','Martinez','Male','1988-06-22','555 Maple Dr, Houston, TX 77005',NULL,'james.martinez@email.com','713-555-1401','emergency@martinez.com','713-555-1402','Astigmatism, uses contact lenses','No significant medical history','Cigna',NULL),(6,'Patricia','O','Rodriguez','Female','1970-03-14','666 Cedar Ln, Houston, TX 77006',NULL,'patricia.rodriguez@email.com','713-555-1501','emergency@rodriguez.com','713-555-1502','Presbyopia, bifocals needed','Diabetes Type 1','Humana',NULL),(7,'Christopher','P','Lopez','Male','1985-09-05','777 Birch Way, Houston, TX 77007',NULL,'chris.lopez@email.com','713-555-1601','emergency@lopez.com','713-555-1602','Myopia, recently diagnosed','No significant medical history','Blue Cross HMO',NULL),(8,'Linda','Q','Gonzalez','Female','1960-12-18','888 Spruce Ct, Houston, TX 77008',NULL,'linda.gonzalez@email.com','713-555-1701','emergency@gonzalez.com','713-555-1702','Macular degeneration risk, family history','Hypertension, Osteoporosis','Kaiser Permanente',NULL),(9,'Daniel','R','Wilson','Male','1995-07-28','999 Willow St, Houston, TX 77009',NULL,'daniel.wilson@email.com','713-555-1801','emergency@wilson.com','713-555-1802','Computer vision syndrome','No significant medical history','United Healthcare PPO',NULL),(10,'Barb','','Lee','Female','1968-02-11','1010 Ash Ave, Houston, TX 77010',NULL,'barbara.lee@email.com','713-555-1901','emergency@lee.com','713-555-1902','Dry eye syndrome, requires drops','Thyroid disorder','Aetna PPO',NULL),(11,'Carlos','','Alba','Male','2004-09-13','120 sesame street',NULL,'carlos@gmail.com','99999999999','','','','','',NULL),(14,'Tan','','Oliver','Male','2001-04-25','',NULL,'abcd123@gmail.com','','','','','','',9),(15,'Kyle',NULL,'Gen',NULL,NULL,NULL,NULL,'abc123@gmail.com','1324567890',NULL,NULL,NULL,NULL,NULL,10),(16,'car',NULL,'al',NULL,NULL,NULL,NULL,'carl@gmail.com','9238909090',NULL,NULL,NULL,NULL,NULL,11),(17,'Tuam',NULL,'Olive',NULL,NULL,NULL,NULL,'abcd1@gmail.com','8329906834',NULL,NULL,NULL,NULL,NULL,12);
/*!40000 ALTER TABLE `patient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescription`
--

DROP TABLE IF EXISTS `prescription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescription` (
  `prescriptionID` int NOT NULL AUTO_INCREMENT,
  `patientID` int NOT NULL,
  `examID` int DEFAULT NULL,
  `employeeID` int DEFAULT NULL,
  `companyRef` varchar(120) DEFAULT NULL,
  `prescriptionType` varchar(80) DEFAULT NULL,
  `issueDate` date NOT NULL,
  `expDate` date DEFAULT NULL,
  PRIMARY KEY (`prescriptionID`),
  KEY `fk_rx_patient` (`patientID`),
  KEY `fk_rx_exam` (`examID`),
  KEY `fk_rx_employee` (`employeeID`),
  CONSTRAINT `fk_rx_employee` FOREIGN KEY (`employeeID`) REFERENCES `employee` (`employeeID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_rx_exam` FOREIGN KEY (`examID`) REFERENCES `exam` (`examID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_rx_patient` FOREIGN KEY (`patientID`) REFERENCES `patient` (`patientID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_rx_dates` CHECK (((`expDate` is null) or (`expDate` > `issueDate`)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescription`
--

LOCK TABLES `prescription` WRITE;
/*!40000 ALTER TABLE `prescription` DISABLE KEYS */;
/*!40000 ALTER TABLE `prescription` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `userID` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `role` enum('Admin','Doctor','Receptionist','Patient') NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`userID`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (9,'abcd123@gmail.com','','Patient','2025-11-18 03:25:41'),(10,'abc123@gmail.com','$2a$10$XTnIY20Kq5pKt2g4zWu0qeamQjaewrWUGbMWXKqiP4c77uFboI6GW','Patient','2025-11-18 04:25:04'),(11,'carl@gmail.com','$2a$10$5RV76.aM5m3vvrScxpeS8OAxOxoA3oX.8j/KqGPH1U5eflkXxh72O','Patient','2025-11-18 04:58:05'),(12,'abcd1@gmail.com','$2a$10$3fc5wBy3V06qb4i85fEhvegkKVDxsz/w/eAC0Yh79PzlUywDkc5xO','Patient','2025-11-18 05:07:15');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'defaultdb'
--
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

--
-- Table structure for table `shop_items`
--

DROP TABLE IF EXISTS `shop_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shop_items` (
  `itemID` int NOT NULL AUTO_INCREMENT,
  `itemName` varchar(120) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `stockQuantity` int NOT NULL DEFAULT '0',
  `category` varchar(80) DEFAULT NULL,
  `imageURL` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`itemID`),
  CHECK (`price` >= 0),
  CHECK (`stockQuantity` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shop_items`
--

LOCK TABLES `shop_items` WRITE;
/*!40000 ALTER TABLE `shop_items` DISABLE KEYS */;
INSERT INTO `shop_items` VALUES
(1,'Contact Solution','Multi-purpose contact lens solution for cleaning and storing contact lenses',12.99,50,'Contact Care',NULL,NOW(),NOW()),
(2,'Glasses Cleaner Spray','Professional glasses cleaning spray for lenses and frames',8.99,75,'Cleaning',NULL,NOW(),NOW()),
(3,'Soft Microfiber Cloth','Ultra-soft microfiber cleaning cloth for eyewear',4.99,100,'Cleaning',NULL,NOW(),NOW()),
(4,'Contact Lens Case','Durable contact lens storage case with left/right markings',3.49,80,'Contact Care',NULL,NOW(),NOW()),
(5,'Anti-Fog Wipes','Individually wrapped anti-fog wipes for glasses',9.99,60,'Cleaning',NULL,NOW(),NOW()),
(6,'Eyeglass Repair Kit','Complete repair kit with screws, screwdriver, and nose pads',7.99,40,'Accessories',NULL,NOW(),NOW());
/*!40000 ALTER TABLE `shop_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `cartID` int NOT NULL AUTO_INCREMENT,
  `userID` int NOT NULL,
  `itemID` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `addedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cartID`),
  UNIQUE KEY `unique_user_item` (`userID`, `itemID`),
  KEY `fk_cart_user` (`userID`),
  KEY `fk_cart_item` (`itemID`),
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cart_item` FOREIGN KEY (`itemID`) REFERENCES `shop_items` (`itemID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CHECK (`quantity` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shop_orders`
--

DROP TABLE IF EXISTS `shop_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shop_orders` (
  `orderID` int NOT NULL AUTO_INCREMENT,
  `userID` int NOT NULL,
  `totalAmount` decimal(12,2) NOT NULL,
  `customerName` varchar(100) NOT NULL,
  `cardNumber` varchar(20) NOT NULL,
  `orderStatus` varchar(40) DEFAULT 'Completed',
  `orderDate` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`orderID`),
  KEY `fk_order_user` (`userID`),
  CONSTRAINT `fk_order_user` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shop_orders`
--

LOCK TABLES `shop_orders` WRITE;
/*!40000 ALTER TABLE `shop_orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `shop_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `orderItemID` int NOT NULL AUTO_INCREMENT,
  `orderID` int NOT NULL,
  `itemID` int NOT NULL,
  `quantity` int NOT NULL,
  `priceAtPurchase` decimal(10,2) NOT NULL,
  PRIMARY KEY (`orderItemID`),
  KEY `fk_orderitem_order` (`orderID`),
  KEY `fk_orderitem_item` (`itemID`),
  CONSTRAINT `fk_orderitem_order` FOREIGN KEY (`orderID`) REFERENCES `shop_orders` (`orderID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_orderitem_item` FOREIGN KEY (`itemID`) REFERENCES `shop_items` (`itemID`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `low_stock_notifications`
--

DROP TABLE IF EXISTS `low_stock_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `low_stock_notifications` (
  `notificationID` int NOT NULL AUTO_INCREMENT,
  `itemID` int NOT NULL,
  `itemName` varchar(120) NOT NULL,
  `currentStock` int NOT NULL,
  `notifiedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `isRead` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`notificationID`),
  KEY `fk_notification_item` (`itemID`),
  CONSTRAINT `fk_notification_item` FOREIGN KEY (`itemID`) REFERENCES `shop_items` (`itemID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `low_stock_notifications`
--

LOCK TABLES `low_stock_notifications` WRITE;
/*!40000 ALTER TABLE `low_stock_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `low_stock_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Trigger for low stock notifications
--

DELIMITER $$

DROP TRIGGER IF EXISTS `check_low_stock_after_update` $$
CREATE TRIGGER `check_low_stock_after_update`
AFTER UPDATE ON `shop_items`
FOR EACH ROW
BEGIN
  -- Check if stock quantity is 3 or lower
  IF NEW.stockQuantity <= 3 AND NEW.stockQuantity >= 0 THEN
    -- Check if a notification already exists for this item with the same stock level
    IF NOT EXISTS (
      SELECT 1 FROM low_stock_notifications
      WHERE itemID = NEW.itemID
      AND currentStock = NEW.stockQuantity
      AND isRead = 0
    ) THEN
      -- Insert a new low stock notification
      INSERT INTO low_stock_notifications (itemID, itemName, currentStock, notifiedAt, isRead)
      VALUES (NEW.itemID, NEW.itemName, NEW.stockQuantity, NOW(), 0);
    END IF;
  END IF;
END$$

DROP TRIGGER IF EXISTS `check_low_stock_after_insert` $$
CREATE TRIGGER `check_low_stock_after_insert`
AFTER INSERT ON `shop_items`
FOR EACH ROW
BEGIN
  -- Check if stock quantity is 3 or lower
  IF NEW.stockQuantity <= 3 AND NEW.stockQuantity >= 0 THEN
    -- Insert a new low stock notification
    INSERT INTO low_stock_notifications (itemID, itemName, currentStock, notifiedAt, isRead)
    VALUES (NEW.itemID, NEW.itemName, NEW.stockQuantity, NOW(), 0);
  END IF;
END$$

-- Dump completed on 2025-11-18  9:33:29
