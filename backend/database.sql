-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: eyeclinic
-- ------------------------------------------------------
-- Server version	8.0.43

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment`
--

LOCK TABLES `appointment` WRITE;
/*!40000 ALTER TABLE `appointment` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice`
--

LOCK TABLES `invoice` WRITE;
/*!40000 ALTER TABLE `invoice` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient`
--

LOCK TABLES `patient` WRITE;
/*!40000 ALTER TABLE `patient` DISABLE KEYS */;
INSERT INTO `patient` VALUES (1,'Robert','J','Anderson','Male','1965-04-20','111 Main St, Houston, TX 77001',NULL,'robert.anderson@email.com','713-555-1001','emergency@anderson.com','713-555-1002','Nearsighted since childhood, wears glasses','Diabetes Type 2, Hypertension','Blue Cross PPO',NULL),(2,'Jennifer','K','Taylor','Female','1978-08-15','222 Oak Ave, Houston, TX 77002',NULL,'jennifer.taylor@email.com','713-555-1101','emergency@taylor.com','713-555-1102','Farsighted, requires reading glasses','No significant medical history','United Healthcare',NULL),(3,'William','L','Thomas','Male','1992-01-30','333 Pine St, Houston, TX 77003',NULL,'william.thomas@email.com','713-555-1201','emergency@thomas.com','713-555-1202','Perfect vision until recently','Seasonal allergies','Aetna HMO',NULL),(4,'Mary','M','Garcia','Female','1955-11-08','444 Elm Rd, Houston, TX 77004',NULL,'mary.garcia@email.com','713-555-1301','emergency@garcia.com','713-555-1302','Cataracts developing, glaucoma history','Arthritis, High cholesterol','Medicare + Supplemental',NULL),(5,'James','N','Martinez','Male','1988-06-22','555 Maple Dr, Houston, TX 77005',NULL,'james.martinez@email.com','713-555-1401','emergency@martinez.com','713-555-1402','Astigmatism, uses contact lenses','No significant medical history','Cigna',NULL),(6,'Patricia','O','Rodriguez','Female','1970-03-14','666 Cedar Ln, Houston, TX 77006',NULL,'patricia.rodriguez@email.com','713-555-1501','emergency@rodriguez.com','713-555-1502','Presbyopia, bifocals needed','Diabetes Type 1','Humana',NULL),(7,'Christopher','P','Lopez','Male','1985-09-05','777 Birch Way, Houston, TX 77007',NULL,'chris.lopez@email.com','713-555-1601','emergency@lopez.com','713-555-1602','Myopia, recently diagnosed','No significant medical history','Blue Cross HMO',NULL),(8,'Linda','Q','Gonzalez','Female','1960-12-18','888 Spruce Ct, Houston, TX 77008',NULL,'linda.gonzalez@email.com','713-555-1701','emergency@gonzalez.com','713-555-1702','Macular degeneration risk, family history','Hypertension, Osteoporosis','Kaiser Permanente',NULL),(9,'Dan','R','Wilson','Male','1995-07-28','999 Willow St, Houston, TX 77009',NULL,'daniel.wilson@email.com','713-555-1801','emergency@wilson.com','713-555-1802','Computer vision syndrome','No significant medical history','United Healthcare PPO',NULL),(10,'Barbara','S','Lee','Female','1968-02-11','1010 Ash Ave, Houston, TX 77010',NULL,'barbara.lee@email.com','713-555-1901','emergency@lee.com','713-555-1902','Dry eye syndrome, requires drops','Thyroid disorder','Aetna PPO',NULL),(12,'Kevin',NULL,'Pham',NULL,NULL,NULL,NULL,'kvp804@gmail.com','8329985834',NULL,NULL,NULL,NULL,NULL,1),(13,'tan',NULL,'nguyen',NULL,NULL,NULL,NULL,'abc123@gmail.com','1234567890',NULL,NULL,NULL,NULL,NULL,2);
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'kvp804@gmail.com','$2a$10$Ou4OFpmE7CgGLDYVZ3TVW./OAFMulEXO5/O8IBDbfzfTFb4MWG8aK','Patient','2025-11-15 16:16:08'),(2,'abc123@gmail.com','$2a$10$0vWGB7FFTdIS.IJ1HCIb0uJ4iXJbtYVcl1olh0ea1cOt6YV9jBZsi','Patient','2025-11-15 19:40:39');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-15 20:53:09
