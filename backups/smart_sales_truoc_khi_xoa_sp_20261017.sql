-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: smart_sales
-- ------------------------------------------------------
-- Server version	8.0.46

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
-- Table structure for table `ai_conversations`
--

DROP TABLE IF EXISTS `ai_conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_conversations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `question` text NOT NULL,
  `answer` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_ai_conversations_user` (`user_id`),
  CONSTRAINT `fk_ai_conversations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_conversations`
--

LOCK TABLES `ai_conversations` WRITE;
/*!40000 ALTER TABLE `ai_conversations` DISABLE KEYS */;
/*!40000 ALTER TABLE `ai_conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Điện thoại','Các sản phẩm Điện thoại','ACTIVE','2026-08-13 15:36:24'),(2,'Laptop','Các sản phẩm Laptop','ACTIVE','2026-08-13 15:36:24'),(14,'Máy tính bảng','Các sản phẩm Máy tính bảng','ACTIVE',NULL),(15,'Tai nghe','Các sản phẩm Tai nghe','ACTIVE',NULL),(16,'Màn hình máy tính','Các sản phẩm Màn hình máy tính','ACTIVE',NULL),(17,'Bàn phím và chuột','Các sản phẩm Bàn phím và chuột','ACTIVE',NULL),(18,'Đồng hồ thông minh','Các sản phẩm Đồng hồ thông minh','ACTIVE',NULL),(19,'Máy ảnh','Các sản phẩm Máy ảnh','ACTIVE',NULL);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_conversations`
--

DROP TABLE IF EXISTS `chat_conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_conversations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `customer_id` bigint NOT NULL,
  `staff_id` bigint DEFAULT NULL,
  `product_id` bigint DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'WAITING',
  `requested_at` datetime NOT NULL,
  `accepted_at` datetime DEFAULT NULL,
  `last_message_at` datetime DEFAULT NULL,
  `ai_handoff_suggested` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_chat_conversation_product` (`product_id`),
  KEY `idx_chat_conversation_customer` (`customer_id`),
  KEY `idx_chat_conversation_staff_status` (`staff_id`,`status`),
  KEY `idx_chat_conversation_status` (`status`),
  CONSTRAINT `fk_chat_conversation_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `fk_chat_conversation_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `fk_chat_conversation_staff` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_conversations`
--

LOCK TABLES `chat_conversations` WRITE;
/*!40000 ALTER TABLE `chat_conversations` DISABLE KEYS */;
INSERT INTO `chat_conversations` VALUES (1,4,NULL,NULL,'CLOSED','2026-10-07 21:21:36',NULL,'2026-10-07 21:21:36',0),(2,4,NULL,NULL,'CLOSED','2026-10-07 21:21:59',NULL,'2026-10-07 21:22:43',0),(3,4,NULL,1,'CLOSED','2026-10-07 21:24:47',NULL,'2026-10-07 21:24:47',0),(4,4,NULL,1,'CLOSED','2026-10-07 21:25:18',NULL,'2026-10-07 21:25:18',0),(5,4,18,1,'CLOSED','2026-10-08 20:59:15','2026-10-08 20:59:31','2026-10-08 21:01:16',0),(6,4,18,10,'CLOSED','2026-10-08 21:10:04','2026-10-08 21:10:12','2026-10-08 21:10:15',0),(7,4,18,10,'CLOSED','2026-10-08 21:23:27','2026-10-08 21:23:31','2026-10-08 21:23:38',0),(8,4,NULL,NULL,'CLOSED','2026-10-09 22:25:27',NULL,'2026-10-09 22:25:27',0),(9,4,NULL,NULL,'CLOSED','2026-10-10 16:39:39',NULL,'2026-10-10 16:39:39',0),(10,4,NULL,NULL,'CLOSED','2026-10-10 16:59:40',NULL,'2026-10-10 16:59:40',0),(11,4,NULL,NULL,'CLOSED','2026-10-10 17:12:06',NULL,NULL,0),(12,4,NULL,NULL,'CLOSED','2026-10-10 17:23:17',NULL,'2026-10-11 17:04:13',0),(13,4,NULL,NULL,'CLOSED','2026-10-11 17:08:29',NULL,'2026-10-11 21:02:01',0),(14,4,NULL,NULL,'CLOSED','2026-10-11 21:07:36',NULL,'2026-10-11 21:07:36',0),(15,4,NULL,NULL,'CLOSED','2026-10-11 21:07:47',NULL,'2026-10-11 21:07:47',0),(16,4,18,NULL,'CLOSED','2026-10-11 21:14:46','2026-10-11 21:16:22','2026-10-11 21:14:46',0),(17,5,18,NULL,'CLOSED','2026-10-11 21:23:47','2026-10-11 21:24:21','2026-10-11 21:25:59',0),(18,4,18,NULL,'CLOSED','2026-10-11 21:29:01','2026-10-11 21:29:26','2026-10-11 21:29:26',0),(19,4,18,NULL,'CLOSED','2026-10-11 21:33:59','2026-10-11 21:43:39','2026-10-11 21:43:39',0);
/*!40000 ALTER TABLE `chat_conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_messages`
--

DROP TABLE IF EXISTS `chat_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `conversation_id` bigint NOT NULL,
  `sender_id` bigint NOT NULL,
  `content` text NOT NULL,
  `sent_at` datetime NOT NULL,
  `read_at` datetime DEFAULT NULL,
  `sender_type` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_chat_message_sender` (`sender_id`),
  KEY `idx_chat_message_conversation` (`conversation_id`,`id`),
  CONSTRAINT `fk_chat_message_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `chat_conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_chat_message_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_messages`
--

LOCK TABLES `chat_messages` WRITE;
/*!40000 ALTER TABLE `chat_messages` DISABLE KEYS */;
INSERT INTO `chat_messages` VALUES (1,1,12,'r','2026-10-07 21:21:36',NULL,NULL),(2,2,12,'Sản phẩm này còn hàng không ạ?','2026-10-07 21:21:59',NULL,NULL),(3,2,12,'Sản phẩm này còn hàng không ạ?','2026-10-07 21:22:01',NULL,NULL),(4,2,12,'Sản phẩm này còn hàng không ạ?','2026-10-07 21:22:03',NULL,NULL),(5,2,12,'Cho mình hỏi sản phẩm này.','2026-10-07 21:22:23',NULL,NULL),(6,2,12,'Cho mình hỏi sản phẩm này.','2026-10-07 21:22:43',NULL,NULL),(7,3,12,'s','2026-10-07 21:24:47',NULL,NULL),(8,4,12,'xzx','2026-10-07 21:25:18',NULL,NULL),(9,5,12,'helooo','2026-10-08 20:59:15','2026-10-08 20:59:29',NULL),(10,5,12,'chàoooooooooo','2026-10-08 20:59:25','2026-10-08 20:59:29',NULL),(11,5,18,'xin chào bạn','2026-10-08 20:59:44','2026-10-08 20:59:45',NULL),(12,5,18,'bạn có câu hỏi nào a','2026-10-08 20:59:51','2026-10-08 20:59:53',NULL),(13,5,12,'không a','2026-10-08 21:00:05','2026-10-08 21:00:07',NULL),(14,5,12,'s','2026-10-08 21:01:16','2026-10-08 21:01:17',NULL),(15,6,12,'helooooooo','2026-10-08 21:10:04','2026-10-08 21:10:10',NULL),(16,6,18,'aaaaaaaaaaaaaaaaaaaaa','2026-10-08 21:10:15','2026-10-08 21:10:16',NULL),(17,7,12,'eeeeeeeeeeee','2026-10-08 21:23:27','2026-10-08 21:23:30',NULL),(18,7,18,'ssssssssssssssssssssssss','2026-10-08 21:23:38','2026-10-08 21:23:38',NULL),(19,8,12,'heloi','2026-10-09 22:25:27',NULL,NULL),(20,9,12,'heloo','2026-10-10 16:39:39',NULL,'CUSTOMER'),(21,10,12,'sssss','2026-10-10 16:59:40',NULL,'CUSTOMER'),(22,12,12,'tư vấn laptop 15 triệu','2026-10-11 17:03:20',NULL,NULL),(23,12,12,'n','2026-10-11 17:04:13',NULL,NULL),(24,13,12,'tư vấn laptop 15 triệu','2026-10-11 17:08:29',NULL,NULL),(25,13,12,'d','2026-10-11 21:02:01',NULL,NULL),(26,14,12,'tôi muốn nói chuyện với nhân viên','2026-10-11 21:07:36',NULL,NULL),(27,15,12,'nhân viên','2026-10-11 21:07:47',NULL,NULL),(28,16,12,'nhân viên','2026-10-11 21:14:46','2026-10-11 21:16:21',NULL),(29,17,13,'tôi muốn nhân viên hỗ trợ','2026-10-11 21:23:47','2026-10-11 21:24:16',NULL),(30,17,13,'hello','2026-10-11 21:23:53','2026-10-11 21:24:16',NULL),(31,17,18,'Xin chào bạn! Mình là Nguyễn Khắc Bằng, nhân viên tư vấn của SmartSales. Mình có thể giúp gì cho bạn ạ?','2026-10-11 21:24:21',NULL,NULL),(32,17,18,'hihi','2026-10-11 21:25:43',NULL,NULL),(33,17,18,'helooo','2026-10-11 21:25:49',NULL,NULL),(34,17,18,'hello','2026-10-11 21:25:54',NULL,NULL),(35,17,18,'aaaaaaa','2026-10-11 21:25:59',NULL,NULL),(36,18,12,'Tôi muốn chat với nhân viên','2026-10-11 21:29:01','2026-10-11 21:29:10',NULL),(37,18,12,'Xin chào bạn! Chúng tôi đang kết nối bạn với nhân viên tư vấn. Vui lòng chờ trong giây lát nhé!','2026-10-11 21:29:01','2026-10-11 21:29:10',NULL),(38,18,18,'Xin chào bạn! Mình là Nguyễn Khắc Bằng, nhân viên tư vấn của SmartSales. Mình có thể giúp gì cho bạn ạ?','2026-10-11 21:29:26','2026-10-11 21:29:27',NULL),(39,19,12,'tôi muốn nch với nhân viên','2026-10-11 21:34:00','2026-10-11 21:34:03',NULL),(40,19,18,'Xin chào bạn! Mình là Nguyễn Khắc Bằng, nhân viên tư vấn của SmartSales. Mình có thể giúp gì cho bạn ạ?','2026-10-11 21:43:39',NULL,NULL);
/*!40000 ALTER TABLE `chat_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `fk_customers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (4,12,'0901234567','Hà Nội','2026-08-19 15:40:46'),(5,13,'0123456789','hvbbb','2026-09-07 15:03:13');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_id` (`product_id`),
  CONSTRAINT `fk_inventory_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_inventory_quantity` CHECK ((`quantity` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory`
--

LOCK TABLES `inventory` WRITE;
/*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_details`
--

DROP TABLE IF EXISTS `order_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_details` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(15,2) NOT NULL,
  `subtotal` decimal(15,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_order_details_order` (`order_id`),
  KEY `fk_order_details_product` (`product_id`),
  CONSTRAINT `fk_order_details_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_order_details_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_order_detail_quantity` CHECK ((`quantity` > 0)),
  CONSTRAINT `chk_order_detail_subtotal` CHECK ((`subtotal` >= 0)),
  CONSTRAINT `chk_order_detail_unit_price` CHECK ((`unit_price` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_details`
--

LOCK TABLES `order_details` WRITE;
/*!40000 ALTER TABLE `order_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `customer_id` bigint NOT NULL,
  `total_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `status` enum('PENDING','CONFIRMED','PROCESSING','COMPLETED','CANCELLED') DEFAULT 'PENDING',
  `order_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `shipping_name` varchar(150) DEFAULT NULL,
  `shipping_phone` varchar(20) DEFAULT NULL,
  `shipping_address` varchar(500) DEFAULT NULL,
  `shipping_note` varchar(500) DEFAULT NULL,
  `promotion_code` varchar(50) DEFAULT NULL,
  `discount_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `fk_orders_customer` (`customer_id`),
  CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_order_total` CHECK ((`total_amount` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `otp` varchar(6) NOT NULL,
  `expires_at` datetime NOT NULL,
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
INSERT INTO `password_reset_tokens` VALUES (1,'tuyenhoang2261978@gmail.com','891058','2026-09-14 23:45:07',0),(2,'tuyenhoang2261978@gmail.com','080461','2026-09-14 23:45:22',0);
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `payment_method` enum('CASH','BANK_TRANSFER','CREDIT_CARD','E_WALLET') NOT NULL,
  `payment_status` enum('PENDING','PAID','FAILED','REFUNDED') DEFAULT 'PENDING',
  `paid_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id` (`order_id`),
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_payment_amount` CHECK ((`amount` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `display_order` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_product_images_product` (`product_id`),
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=88 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (8,16,'/uploads/efbc5d22-d94e-4311-a895-4bd73339d2f5.jpg',1,1),(9,17,'/uploads/37bf1a4e-ea66-4cc2-8da4-12332b648c5f.jpg',1,1),(10,18,'/uploads/b1034ffe-9c55-4328-91c3-1c639de0d7f5.jpg',1,1),(11,19,'/uploads/06b1760f-b9f0-43e0-9334-5a9f234402ce.jpg',1,1),(12,20,'/uploads/aebea019-348b-44bb-a1a4-5d69fcbfc939.jpg',1,1),(13,21,'/uploads/8ba31624-7982-4c58-be91-e410cde3e953.jpg',1,1),(14,22,'/uploads/7153031a-bdf7-4c9c-8fc1-24c079be1de3.jpg',1,1),(15,23,'/uploads/404e5981-1885-4c0f-918b-4b23dbeeda1e.jpg',1,1),(16,24,'/uploads/d2aefabb-f669-42c0-b150-ec5065aead95.jpg',1,1),(17,25,'/uploads/5a34e0ea-86a2-4049-93a5-3c24eea8bef1.jpg',1,1),(18,26,'/uploads/eeb92311-fd31-46da-b850-aff7c20e1da9.jpg',1,1),(19,27,'/uploads/5c9eeb80-fada-4231-b203-83e62918bb10.jpg',1,1),(20,28,'/uploads/b2d7ebb1-8e14-410e-95a3-22026b27ce11.jpg',1,1),(21,29,'/uploads/42e238f1-1292-4cda-a484-6312c07920b1.jpg',1,1),(22,30,'/uploads/aa4a9e34-49e9-4221-b92f-0c68f53f2c99.jpg',1,1),(23,31,'/uploads/e22fcd08-38b0-4ac2-bd0f-bace04eb23bc.jpg',1,1),(24,32,'/uploads/2c84b89e-5446-4310-a011-ede4e465c419.jpg',1,1),(25,33,'/uploads/bfe8b292-e960-429a-9ddd-91be12af0474.jpg',1,1),(26,34,'/uploads/37359c69-c7aa-47e6-a4f7-07dd1f0dc36b.jpg',1,1),(27,35,'/uploads/a05843aa-a0ac-468a-b0eb-67c5f7526388.jpg',1,1),(28,36,'/uploads/4d40f562-7f33-4585-848d-306392adf44e.jpg',1,1),(29,37,'/uploads/064d8ebb-94a2-4d78-9dba-69ddf3369221.jpg',1,1),(30,38,'/uploads/4f7232b8-dd76-4e4b-a7fc-5d629b37c4a5.jpg',1,1),(31,39,'/uploads/55802324-8d02-44f5-875c-a438b6b2de78.jpg',1,1),(32,40,'/uploads/0703a90b-b7a3-42f1-b563-27f06c82a969.jpg',1,1),(33,41,'/uploads/4df95c85-287f-436c-8671-fddad023278a.jpg',1,1),(34,42,'/uploads/9c849d8d-654c-43e5-a453-7d85139aa95b.jpg',1,1),(35,43,'/uploads/201bdb54-3559-4877-8565-934f0b1276af.jpg',1,1),(36,44,'/uploads/ae8ae804-c946-41fe-870b-c40444bb2eaf.jpg',1,1),(37,45,'/uploads/09886167-8418-49e7-a705-3823c22c7077.jpg',1,1),(38,46,'/uploads/6da3be52-2e7b-42c6-9945-4a5bfeda2982.jpg',1,1),(39,47,'/uploads/77502e6e-4d99-4f27-a26d-372b154a4709.jpg',1,1),(40,48,'/uploads/e717885e-618c-4602-9fee-44d192fd9f43.jpg',1,1),(41,49,'/uploads/3425e2cf-c4a2-4717-aa36-0dd246f7d872.jpg',1,1),(42,50,'/uploads/bc87dd7a-d0a6-4a8c-9ff6-1b4889194f48.jpg',1,1),(43,51,'/uploads/167b55fb-13ff-402b-a58c-2d4af84b5c9a.jpg',1,1),(44,52,'/uploads/e1426819-1124-41c6-aef1-8817d09c1914.jpg',1,1),(45,53,'/uploads/9fa631f3-cd38-4adb-bc85-fa96d04127db.jpg',1,1),(46,54,'/uploads/3eb4e80c-550e-41be-8467-a03f91e5d0b0.jpg',1,1),(47,55,'/uploads/5209ade2-c5fe-41f9-8d5f-c9c9cc635598.jpg',1,1),(48,56,'/uploads/215c0678-f9f7-40e2-ae2f-d176bd788e1d.jpg',1,1),(49,57,'/uploads/b2f85a87-1307-4f1d-8ca4-a8dc50e2e09a.jpg',1,1),(50,58,'/uploads/06c2ec9d-d17f-4e3b-84d5-d42ab7dd295c.jpg',1,1),(51,59,'/uploads/38a68084-9af1-4fa5-ba5a-cf80f1e87767.jpg',1,1),(52,60,'/uploads/efce1296-cc31-4fad-959b-887fe1fd2eb6.jpg',1,1),(53,61,'/uploads/e7417ff6-6c30-4c88-8c13-cc29a76a2e44.jpg',1,1),(54,62,'/uploads/ffe227c8-f645-4722-a87b-e876002281c0.jpg',1,1),(55,63,'/uploads/5b5120e9-cb61-44c4-8665-7cb163845619.jpg',1,1),(56,64,'/uploads/f33e69f6-d1af-4806-88fc-cf23517ddc2e.jpg',1,1),(57,65,'/uploads/16204e59-1953-4f56-b1a9-3415e816c033.jpg',1,1),(58,66,'/uploads/15744494-4a3b-463f-8126-bd5be83ab261.jpg',1,1),(59,67,'/uploads/297b659e-9fce-4196-b253-06fe61cb11be.jpg',1,1),(60,68,'/uploads/0fe18893-4505-4144-a08e-e41eac19362d.jpg',1,1),(61,69,'/uploads/0d9377f3-fe8e-49c9-bd0a-95a1d4183c9d.jpg',1,1),(62,70,'/uploads/df9a07fc-52a2-4e25-9a5c-8c8b0b7d3395.jpg',1,1),(63,71,'/uploads/3120451a-a85d-4db9-95af-311283e9a936.jpg',1,1),(64,72,'/uploads/a8ab4b16-2877-465b-843d-4b6abeb8e98e.jpg',1,1),(65,73,'/uploads/453e83f4-6d4f-4245-9158-8a56f332ea2e.jpg',1,1),(66,74,'/uploads/c6406d49-e69d-4a06-9647-f27565640b57.jpg',1,1),(67,75,'/uploads/ff0231da-e57f-4bf9-b3e4-b4fad3da1848.jpg',1,1),(68,76,'/uploads/d7f2c09e-2450-4e03-aaff-de6146b90e7f.jpg',1,1),(69,77,'/uploads/673730d5-b17c-4ae8-8d18-c01ea1743da4.jpg',1,1),(70,78,'/uploads/73e514ce-dab3-4f54-85bc-e249feb97562.jpg',1,1),(71,79,'/uploads/84754751-7834-46d8-9622-f10fd0570bf2.jpg',1,1),(72,80,'/uploads/7a48b480-202a-4f6e-8729-b1717588c3b3.jpg',1,1),(73,81,'/uploads/dc6676d2-2411-471f-9de6-fc7311bb5986.jpg',1,1),(74,82,'/uploads/4d71c0b5-10a4-4c73-8814-2f52232958a9.jpg',1,1),(75,83,'/uploads/f8d56ad0-f449-407d-b87c-e9d6ee482174.jpg',1,1),(76,84,'/uploads/e281a848-a38f-4c50-87e3-79b0ef951bd1.jpg',1,1),(77,85,'/uploads/04902fdd-0d35-4e42-a639-bfa008b1e6f5.jpg',1,1),(78,86,'/uploads/b31a4ecf-2366-4281-b477-2d4b1185818f.jpg',1,1),(79,87,'/uploads/0580ca17-d969-4996-b22e-dd61f5b7f461.jpg',1,1),(80,88,'/uploads/e3ba50a5-16bd-41a1-9f96-21e0b86b8755.jpg',1,1),(81,89,'/uploads/f0472bf6-3dc5-42b9-af5a-a7d376497238.jpg',1,1),(82,90,'/uploads/93cd1ffc-00b7-42d9-bc78-f68bc44d5050.jpg',1,1),(83,91,'/uploads/28fecfeb-70d6-4fe8-9e42-71a378069ed1.jpg',1,1),(84,92,'/uploads/3d545c87-4d1d-42c2-94a8-c1f697a6b243.jpg',1,1),(85,93,'/uploads/8f69d38d-0c48-4153-886b-99df4809a443.jpg',1,1),(86,94,'/uploads/0195aec8-d5d3-4902-bc28-9b735aa70fd0.jpg',1,1),(87,95,'/uploads/7406c0f7-95aa-4ac9-baf5-d9e22eaa018f.jpg',1,1);
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_review_media`
--

DROP TABLE IF EXISTS `product_review_media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_review_media` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `review_id` bigint NOT NULL,
  `media_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_url` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` bigint DEFAULT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration_seconds` int DEFAULT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_review_media_review` (`review_id`),
  CONSTRAINT `fk_review_media_review` FOREIGN KEY (`review_id`) REFERENCES `product_reviews` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_review_media`
--

LOCK TABLES `product_review_media` WRITE;
/*!40000 ALTER TABLE `product_review_media` DISABLE KEYS */;
INSERT INTO `product_review_media` VALUES (1,3,'IMAGE','/uploads/reviews/01f4c1eb-5b56-4c20-8bd1-0418d4370550.png','Screenshot 2025-02-04 214236.png',720395,'image/png',NULL,0,'2026-10-04 19:55:36');
/*!40000 ALTER TABLE `product_review_media` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_reviews`
--

DROP TABLE IF EXISTS `product_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `customer_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `order_detail_id` bigint DEFAULT NULL,
  `rating` int NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_product_review_product` (`product_id`),
  KEY `fk_product_review_order_detail` (`order_detail_id`),
  KEY `idx_product_reviews_customer` (`customer_id`),
  CONSTRAINT `fk_product_review_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_product_review_order_detail` FOREIGN KEY (`order_detail_id`) REFERENCES `order_details` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_product_review_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_product_review_rating` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_reviews`
--

LOCK TABLES `product_reviews` WRITE;
/*!40000 ALTER TABLE `product_reviews` DISABLE KEYS */;
INSERT INTO `product_reviews` VALUES (1,4,10,NULL,5,'dsas','2026-10-03 16:17:17','2026-10-03 16:17:30'),(3,5,1,NULL,5,'sss','2026-10-04 19:48:10','2026-10-04 19:55:36');
/*!40000 ALTER TABLE `product_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category_id` bigint NOT NULL,
  `name` varchar(150) NOT NULL,
  `short_description` varchar(500) DEFAULT NULL,
  `description` text,
  `specifications` text,
  `price` decimal(15,2) NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `quantity` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_products_category` (`category_id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_product_price` CHECK ((`price` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,'iPhone 17 Pro 256GB | Chính hãng | Màu cam',NULL,'Tên sản phẩm: Samsung Galaxy S25\nMàn hnh: Dynamic AMOLED 2X, kích thước 6,2 inch, độ phân giải FHD+, tần số quét thích ứng đến 120 Hz.\nBộ xử lý: Snapdragon 8 Elite for Galaxy.\nRAM và bộ nhớ: RAM 12 GB; bộ nhớ trong tùy phiên bản 128 GB, 256 GB hoặc 512 GB.\nCamera sau: Camera chính 50 MP, camera siêu rộng 12 MP, camera tele 10 M\nCamera trước: 12 MP.\nPin: 4.000 mAh.\nKết nối: 5G, Wi-Fi, Bluetooth, NFC và USB-C.\nHệ điều hành: Android với giao diện One UI.\nKhả năng kháng nước, bụi: IP68.\nTính năng nổi bật: Galaxy AI, cảm biến vân tay siêu âm, bảo mật Samsung Knox.\nBảo hành: Điền theo chính sách của nhà bán hàng.',NULL,31.99,NULL,'ACTIVE','2026-08-13 15:36:24','2026-08-13 15:36:24',100),(4,2,'iPhone 15',NULL,'Điện thoại Apple iPhone 15',NULL,18990000.00,NULL,'ACTIVE','2026-08-13 15:36:24','2026-08-13 15:36:24',998),(8,1,'Laptop Dell Inspiron',NULL,'Laptop phục vụ học tập và làm việc',NULL,15990000.00,NULL,'ACTIVE',NULL,NULL,10),(9,1,'San pham test ton kho',NULL,'a',NULL,50000.00,NULL,'ACTIVE',NULL,NULL,0),(10,2,'Sony WH-1000XM5',NULL,'Tai nghe chống ồn cao cấp Sony',NULL,7490000.00,NULL,'ACTIVE',NULL,NULL,6),(14,1,'Laptop Dell Inspiron 15',NULL,'Laptop phục vụ học tập và làm việc',NULL,15990000.00,NULL,'ACTIVE',NULL,NULL,10),(15,1,'Laptop ASUS Vivobook 14',NULL,'Laptop mỏng nhẹ',NULL,14990000.00,NULL,'ACTIVE',NULL,NULL,5),(16,1,'Apple iPhone 17',NULL,'Apple iPhone 17 – thương hiệu Apple. Điện thoại thông minh chạy iOS, màn hình Super Retina XDR OLED, chip Apple thế hệ mới, hệ thống camera sau độ phân giải cao, hỗ trợ 5G, Face ID, sạc USB‑C và hệ sinh thái Apple. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,24990000.00,'/uploads/efbc5d22-d94e-4311-a895-4bd73339d2f5.jpg','ACTIVE',NULL,NULL,10),(17,1,'Apple iPhone 17 Pro',NULL,'Apple iPhone 17 Pro – thương hiệu Apple. Phiên bản iPhone cao cấp với màn hình Super Retina XDR, chip dòng Pro, hệ thống camera đa tiêu cự phục vụ chụp ảnh và quay video nâng cao, kết nối 5G, Face ID, USB‑C và các tính năng iOS mới. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,34990000.00,'/uploads/37bf1a4e-ea66-4cc2-8da4-12332b648c5f.jpg','ACTIVE',NULL,NULL,10),(18,1,'Apple iPhone 16',NULL,'Apple iPhone 16 – thương hiệu Apple. Điện thoại iOS với màn hình Super Retina XDR OLED 6,1 inch, chip A18, camera chính 48 MP kết hợp camera siêu rộng, nút Camera Control, USB‑C, Face ID và hỗ trợ 5G. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,18990000.00,'/uploads/b1034ffe-9c55-4328-91c3-1c639de0d7f5.jpg','ACTIVE',NULL,NULL,10),(19,1,'Samsung Galaxy S25',NULL,'Samsung Galaxy S25 – thương hiệu Samsung. Điện thoại Android màn hình Dynamic AMOLED 2X 6,2 inch, tần số quét thích ứng, chip Snapdragon 8 Elite for Galaxy, camera sau 50 MP cùng camera tele và siêu rộng, pin 4.000 mAh, IP68 và Galaxy AI. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,22990000.00,'/uploads/06b1760f-b9f0-43e0-9334-5a9f234402ce.jpg','ACTIVE',NULL,NULL,10),(20,1,'Samsung Galaxy S25 Ultra',NULL,'Samsung Galaxy S25 Ultra – thương hiệu Samsung. Mẫu flagship màn hình Dynamic AMOLED 2X lớn, chip Snapdragon 8 Elite for Galaxy, camera chính 200 MP cùng các camera zoom chuyên dụng, bút S Pen tích hợp, kháng nước bụi IP68 và tính năng Galaxy AI. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,33990000.00,'/uploads/aebea019-348b-44bb-a1a4-5d69fcbfc939.jpg','ACTIVE',NULL,NULL,10),(21,1,'Samsung Galaxy A56 5G',NULL,'Samsung Galaxy A56 5G – thương hiệu Samsung. Điện thoại tầm trung 5G với màn hình Super AMOLED 6,7 inch, tần số quét 120 Hz, camera chính 50 MP có chống rung quang học, pin 5.000 mAh, sạc nhanh và khả năng kháng nước bụi IP67. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,9990000.00,'/uploads/8ba31624-7982-4c58-be91-e410cde3e953.jpg','ACTIVE',NULL,NULL,10),(22,1,'Xiaomi 15',NULL,'Xiaomi 15 – thương hiệu Xiaomi. Điện thoại cao cấp với chip Snapdragon 8 Elite tiến trình 3 nm, màn hình AMOLED CrystalRes 1–120 Hz, hệ thống camera quang học Leica, pin 5.240 mAh và giao diện Xiaomi HyperOS. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,22990000.00,'/uploads/7153031a-bdf7-4c9c-8fc1-24c079be1de3.jpg','ACTIVE',NULL,NULL,10),(23,1,'Xiaomi Redmi Note 14 Pro 5G',NULL,'Xiaomi Redmi Note 14 Pro 5G – thương hiệu Xiaomi. Điện thoại 5G với màn hình AMOLED độ phân giải cao, tần số quét 120 Hz, camera chính 200 MP có chống rung quang học, pin dung lượng lớn và sạc nhanh; cấu hình có thể khác theo thị trường. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,8990000.00,'/uploads/404e5981-1885-4c0f-918b-4b23dbeeda1e.jpg','ACTIVE',NULL,NULL,10),(24,1,'OPPO Reno13 5G',NULL,'OPPO Reno13 5G – thương hiệu OPPO. Điện thoại 5G thiết kế mỏng nhẹ, màn hình AMOLED tần số quét cao, camera chân dung và selfie, các công cụ AI chỉnh sửa ảnh, pin dung lượng lớn và sạc nhanh SUPERVOOC. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,15990000.00,'/uploads/d2aefabb-f669-42c0-b150-ec5065aead95.jpg','ACTIVE',NULL,NULL,10),(25,1,'vivo V50',NULL,'vivo V50 – thương hiệu vivo. Điện thoại 5G hướng đến chụp chân dung với hệ thống camera ZEISS, màn hình AMOLED, pin BlueVolt dung lượng lớn, sạc nhanh và giao diện Funtouch OS; thông số tùy phiên bản. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,13990000.00,'/uploads/5a34e0ea-86a2-4049-93a5-3c24eea8bef1.jpg','ACTIVE',NULL,NULL,10),(26,2,'Apple MacBook Air 13-inch M4',NULL,'Apple MacBook Air 13-inch M4 – thương hiệu Apple. Laptop mỏng nhẹ sử dụng chip Apple M4, màn hình Liquid Retina 13,6 inch, camera 12 MP Center Stage, hệ thống loa hỗ trợ âm thanh không gian, thời lượng pin dài và macOS. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,26990000.00,'/uploads/eeb92311-fd31-46da-b850-aff7c20e1da9.jpg','ACTIVE',NULL,NULL,10),(27,2,'Apple MacBook Pro 14-inch M4 Pro',NULL,'Apple MacBook Pro 14-inch M4 Pro – thương hiệu Apple. Laptop chuyên nghiệp với chip Apple M4 Pro, màn hình Liquid Retina XDR, hiệu năng CPU/GPU cao, nhiều cổng kết nối gồm Thunderbolt, HDMI và khe thẻ SDXC, phù hợp sáng tạo nội dung và lập trình. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,54990000.00,'/uploads/5c9eeb80-fada-4231-b203-83e62918bb10.jpg','ACTIVE',NULL,NULL,10),(28,2,'ASUS Vivobook 15 OLED',NULL,'ASUS Vivobook 15 OLED – thương hiệu ASUS. Laptop phổ thông với màn hình OLED 15,6 inch trên các cấu hình tương ứng, bộ xử lý Intel hoặc AMD tùy mã, SSD, webcam và kết nối Wi‑Fi; phù hợp học tập, văn phòng và giải trí. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,16990000.00,'/uploads/b2d7ebb1-8e14-410e-95a3-22026b27ce11.jpg','ACTIVE',NULL,NULL,10),(29,2,'ASUS Zenbook 14 OLED UX3405',NULL,'ASUS Zenbook 14 OLED UX3405 – thương hiệu ASUS. Laptop siêu di động với màn hình OLED 14 inch, bộ xử lý Intel Core Ultra tùy cấu hình, thiết kế kim loại gọn nhẹ, SSD NVMe và các cổng kết nối phục vụ công việc di động. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,29990000.00,'/uploads/42e238f1-1292-4cda-a484-6312c07920b1.jpg','ACTIVE',NULL,NULL,10),(30,2,'Dell XPS 13',NULL,'Dell XPS 13 – thương hiệu Dell. Laptop cao cấp kích thước 13 inch, thiết kế mỏng nhẹ, màn hình độ phân giải cao tùy phiên bản, bộ xử lý Intel Core Ultra, SSD và hệ thống kết nối không dây cho công việc chuyên nghiệp. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,39990000.00,'/uploads/aa4a9e34-49e9-4221-b92f-0c68f53f2c99.jpg','ACTIVE',NULL,NULL,10),(31,2,'Dell Inspiron 14',NULL,'Dell Inspiron 14 – thương hiệu Dell. Laptop 14 inch cho học tập và văn phòng, trang bị bộ xử lý Intel hoặc AMD theo cấu hình, RAM và SSD, webcam, Wi‑Fi và các cổng USB/HDMI tùy phiên bản. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,18990000.00,'/uploads/e22fcd08-38b0-4ac2-bd0f-bace04eb23bc.jpg','ACTIVE',NULL,NULL,10),(32,2,'Lenovo ThinkPad E14 Gen 6',NULL,'Lenovo ThinkPad E14 Gen 6 – thương hiệu Lenovo. Laptop doanh nghiệp 14 inch, tùy chọn bộ xử lý Intel hoặc AMD, bàn phím ThinkPad, các tính năng bảo mật, SSD và cổng kết nối đa dạng; thích hợp làm việc văn phòng. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,20990000.00,'/uploads/2c84b89e-5446-4310-a011-ede4e465c419.jpg','ACTIVE',NULL,NULL,10),(33,2,'Lenovo Yoga 7 2-in-1 14',NULL,'Lenovo Yoga 7 2-in-1 14 – thương hiệu Lenovo. Laptop chuyển đổi 2-trong-1 với bản lề xoay 360 độ, màn hình cảm ứng 14 inch, hỗ trợ bút ở cấu hình tương thích, bộ xử lý hiện đại và thiết kế linh hoạt cho học tập, ghi chú. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,27990000.00,'/uploads/bfe8b292-e960-429a-9ddd-91be12af0474.jpg','ACTIVE',NULL,NULL,10),(34,2,'HP Pavilion Plus 14',NULL,'HP Pavilion Plus 14 – thương hiệu HP. Laptop 14 inch phục vụ học tập và công việc, có các tùy chọn màn hình độ phân giải cao/OLED tùy cấu hình, bộ xử lý Intel hoặc AMD, SSD, webcam và kết nối không dây. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,22990000.00,'/uploads/37359c69-c7aa-47e6-a4f7-07dd1f0dc36b.jpg','ACTIVE',NULL,NULL,10),(35,2,'Acer Nitro V 15',NULL,'Acer Nitro V 15 – thương hiệu Acer. Laptop gaming 15,6 inch với đồ họa rời NVIDIA GeForce RTX tùy cấu hình, màn hình tần số quét cao, hệ thống tản nhiệt và bàn phím gaming; phù hợp chơi game và sáng tạo. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,23990000.00,'/uploads/a05843aa-a0ac-468a-b0eb-67c5f7526388.jpg','ACTIVE',NULL,NULL,10),(36,14,'Apple iPad (A16)',NULL,'Apple iPad (A16) – thương hiệu Apple. Máy tính bảng màn hình Liquid Retina 11 inch, chip A16, camera trước ngang hỗ trợ gọi video, cổng USB‑C và tương thích phụ kiện Apple Pencil phù hợp phiên bản. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,9990000.00,'/uploads/4d40f562-7f33-4585-848d-306392adf44e.jpg','ACTIVE',NULL,NULL,10),(37,14,'Apple iPad Air 11-inch M3',NULL,'Apple iPad Air 11-inch M3 – thương hiệu Apple. Máy tính bảng mỏng nhẹ với chip M3, màn hình Liquid Retina 11 inch, hỗ trợ Apple Pencil Pro và Magic Keyboard tương thích, phù hợp học tập, vẽ và làm việc. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,16990000.00,'/uploads/064d8ebb-94a2-4d78-9dba-69ddf3369221.jpg','ACTIVE',NULL,NULL,10),(38,14,'Apple iPad Pro 11-inch M4',NULL,'Apple iPad Pro 11-inch M4 – thương hiệu Apple. Máy tính bảng cao cấp với màn hình Ultra Retina XDR OLED trên dòng M4, chip M4, thiết kế mỏng, camera và micro phục vụ sáng tạo, hỗ trợ Apple Pencil Pro và bàn phím tương thích. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,27990000.00,'/uploads/4f7232b8-dd76-4e4b-a7fc-5d629b37c4a5.jpg','ACTIVE',NULL,NULL,10),(39,14,'Samsung Galaxy Tab S10+',NULL,'Samsung Galaxy Tab S10+ – thương hiệu Samsung. Máy tính bảng Android với màn hình Dynamic AMOLED 2X 12,4 inch, bút S Pen, tính năng đa nhiệm và Galaxy AI, pin dung lượng lớn và khả năng kháng nước bụi IP68. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,24990000.00,'/uploads/55802324-8d02-44f5-875c-a438b6b2de78.jpg','ACTIVE',NULL,NULL,10),(40,14,'Samsung Galaxy Tab S10 FE',NULL,'Samsung Galaxy Tab S10 FE – thương hiệu Samsung. Máy tính bảng màn hình lớn, hỗ trợ S Pen, tính năng ghi chú và đa nhiệm, pin dung lượng lớn cùng khả năng kháng nước bụi IP68; cấu hình kết nối tùy phiên bản. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,13990000.00,'/uploads/0703a90b-b7a3-42f1-b563-27f06c82a969.jpg','ACTIVE',NULL,NULL,10),(41,14,'Xiaomi Pad 7',NULL,'Xiaomi Pad 7 – thương hiệu Xiaomi. Máy tính bảng màn hình 3.2K 11,2 inch tần số quét cao, chip Snapdragon 7+ Gen 3, pin dung lượng lớn, bốn loa và giao diện HyperOS phục vụ học tập, xem phim và làm việc. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,9990000.00,'/uploads/4df95c85-287f-436c-8671-fddad023278a.jpg','ACTIVE',NULL,NULL,10),(42,14,'Lenovo Tab P12',NULL,'Lenovo Tab P12 – thương hiệu Lenovo. Máy tính bảng màn hình 12,7 inch độ phân giải cao, hệ thống nhiều loa, pin lớn và hỗ trợ bút Lenovo Tab Pen Plus tùy gói bán, phù hợp học trực tuyến và giải trí. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,8990000.00,'/uploads/9c849d8d-654c-43e5-a453-7d85139aa95b.jpg','ACTIVE',NULL,NULL,10),(43,14,'Huawei MatePad 11.5 S',NULL,'Huawei MatePad 11.5 S – thương hiệu Huawei. Máy tính bảng màn hình 11,5 inch PaperMatte ở phiên bản tương ứng, hỗ trợ bút M-Pencil và ứng dụng ghi chú, thiết kế mỏng và pin phục vụ làm việc, học tập. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,12990000.00,'/uploads/201bdb54-3559-4877-8565-934f0b1276af.jpg','ACTIVE',NULL,NULL,10),(44,14,'HONOR Pad 9',NULL,'HONOR Pad 9 – thương hiệu HONOR. Máy tính bảng màn hình 12,1 inch 2.5K tần số quét 120 Hz, hệ thống tám loa, pin dung lượng lớn và thiết kế phù hợp xem phim, học online, đọc tài liệu. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,6990000.00,'/uploads/ae8ae804-c946-41fe-870b-c40444bb2eaf.jpg','ACTIVE',NULL,NULL,10),(45,14,'Samsung Galaxy Tab A9+',NULL,'Samsung Galaxy Tab A9+ – thương hiệu Samsung. Máy tính bảng phổ thông màn hình 11 inch, loa stereo hỗ trợ Dolby Atmos, pin lớn và giao diện Android; phù hợp học trực tuyến, đọc tài liệu và giải trí. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,6490000.00,'/uploads/09886167-8418-49e7-a705-3823c22c7077.jpg','ACTIVE',NULL,NULL,10),(46,15,'Apple AirPods Pro 2 (USB-C)',NULL,'Apple AirPods Pro 2 (USB-C) – thương hiệu Apple. Tai nghe không dây dạng nhét tai với chống ồn chủ động, chế độ Xuyên âm, âm thanh thích ứng, hộp sạc USB‑C, âm thanh không gian và tích hợp sâu với thiết bị Apple. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,5990000.00,'/uploads/6da3be52-2e7b-42c6-9945-4a5bfeda2982.jpg','ACTIVE',NULL,NULL,10),(47,15,'Apple AirPods 4',NULL,'Apple AirPods 4 – thương hiệu Apple. Tai nghe true wireless thiết kế mở, chip H2, âm thanh không gian cá nhân hóa, cảm biến và điều khiển bằng cử chỉ; phiên bản ANC có chống ồn chủ động và hộp sạc không dây. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,3490000.00,'/uploads/77502e6e-4d99-4f27-a26d-372b154a4709.jpg','ACTIVE',NULL,NULL,10),(48,15,'Sony WH-1000XM6',NULL,'Sony WH-1000XM6 – thương hiệu Sony. Tai nghe chụp tai không dây cao cấp, chống ồn chủ động, nhiều micro hỗ trợ cuộc gọi rõ, kết nối đa điểm, điều khiển cảm ứng và thiết kế đệm tai hướng đến đeo lâu. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,10390000.00,'/uploads/e717885e-618c-4602-9fee-44d192fd9f43.jpg','ACTIVE',NULL,NULL,10),(49,15,'Sony WF-1000XM5',NULL,'Sony WF-1000XM5 – thương hiệu Sony. Tai nghe true wireless với chống ồn chủ động, driver Dynamic Driver X, xử lý âm thanh nâng cao, micro cuộc gọi, kết nối Bluetooth và hộp sạc nhỏ gọn. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,5990000.00,'/uploads/3425e2cf-c4a2-4717-aa36-0dd246f7d872.jpg','ACTIVE',NULL,NULL,10),(50,15,'Samsung Galaxy Buds3 Pro',NULL,'Samsung Galaxy Buds3 Pro – thương hiệu Samsung. Tai nghe true wireless với âm thanh Hi‑Fi, chống ồn chủ động, âm thanh môi trường, micro tích hợp và tính năng tương thích hệ sinh thái Galaxy. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,5490000.00,'/uploads/bc87dd7a-d0a6-4a8c-9ff6-1b4889194f48.jpg','ACTIVE',NULL,NULL,10),(51,15,'JBL Tune 770NC',NULL,'JBL Tune 770NC – thương hiệu JBL. Tai nghe chụp tai Bluetooth có chống ồn chủ động, JBL Pure Bass Sound, kết nối đa điểm, thời lượng pin dài và thiết kế gập để mang theo. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,2490000.00,'/uploads/167b55fb-13ff-402b-a58c-2d4af84b5c9a.jpg','ACTIVE',NULL,NULL,10),(52,15,'JBL Live Pro 2 TWS',NULL,'JBL Live Pro 2 TWS – thương hiệu JBL. Tai nghe true wireless với chống ồn thích ứng, Ambient Aware và TalkThru, sáu micro cho cuộc gọi, hộp sạc không dây và âm thanh JBL Signature Sound. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,2990000.00,'/uploads/e1426819-1124-41c6-aef1-8817d09c1914.jpg','ACTIVE',NULL,NULL,10),(53,15,'Anker Soundcore Liberty 4 NC',NULL,'Anker Soundcore Liberty 4 NC – thương hiệu Soundcore. Tai nghe true wireless có chống ồn thích ứng, driver lớn, EQ tùy chỉnh qua ứng dụng, kết nối đa điểm và thời lượng pin dài kèm hộp sạc. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,2290000.00,'/uploads/9fa631f3-cd38-4adb-bc85-fa96d04127db.jpg','ACTIVE',NULL,NULL,10),(54,15,'Logitech G Pro X 2 Lightspeed',NULL,'Logitech G Pro X 2 Lightspeed – thương hiệu Logitech. Tai nghe gaming không dây với driver graphene 50 mm, kết nối LIGHTSPEED, Bluetooth và 3,5 mm, micro tháo rời cùng thiết kế đệm tai thay thế. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,6490000.00,'/uploads/3eb4e80c-550e-41be-8467-a03f91e5d0b0.jpg','ACTIVE',NULL,NULL,10),(55,15,'Razer BlackShark V2 X',NULL,'Razer BlackShark V2 X – thương hiệu Razer. Tai nghe gaming có dây với driver Razer TriForce 50 mm, micro cardioid giảm tạp âm, đệm tai cách âm và kết nối 3,5 mm tương thích nhiều thiết bị. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,1290000.00,'/uploads/5209ade2-c5fe-41f9-8d5f-c9c9cc635598.jpg','ACTIVE',NULL,NULL,10),(56,16,'Dell UltraSharp U2723QE',NULL,'Dell UltraSharp U2723QE – thương hiệu Dell. Màn hình IPS Black 27 inch độ phân giải 4K UHD, độ tương phản cao hơn IPS thông thường, USB‑C hub, Ethernet và nhiều cổng USB phục vụ làm việc chuyên nghiệp. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,14990000.00,'/uploads/215c0678-f9f7-40e2-ae2f-d176bd788e1d.jpg','ACTIVE',NULL,NULL,10),(57,16,'Dell S2722QC',NULL,'Dell S2722QC – thương hiệu Dell. Màn hình 27 inch 4K UHD IPS, kết nối USB‑C hỗ trợ truyền hình ảnh và cấp nguồn cho laptop tương thích, loa tích hợp và thiết kế phù hợp văn phòng. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,8990000.00,'/uploads/b2f85a87-1307-4f1d-8ca4-a8dc50e2e09a.jpg','ACTIVE',NULL,NULL,10),(58,16,'LG UltraGear 27GR75Q-B',NULL,'LG UltraGear 27GR75Q-B – thương hiệu LG. Màn hình gaming 27 inch QHD IPS, tần số quét 165 Hz, thời gian phản hồi nhanh, hỗ trợ đồng bộ khung hình và chân đế điều chỉnh độ cao/nghiêng. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,7990000.00,'/uploads/06c2ec9d-d17f-4e3b-84d5-d42ab7dd295c.jpg','ACTIVE',NULL,NULL,10),(59,16,'LG 27UP850N-W',NULL,'LG 27UP850N-W – thương hiệu LG. Màn hình 27 inch 4K UHD IPS, hỗ trợ HDR, USB‑C và các cổng kết nối phổ biến; phù hợp chỉnh sửa nội dung, làm việc đa cửa sổ và giải trí. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,9490000.00,'/uploads/38a68084-9af1-4fa5-ba5a-cf80f1e87767.jpg','ACTIVE',NULL,NULL,10),(60,16,'ASUS TUF Gaming VG27AQ3A',NULL,'ASUS TUF Gaming VG27AQ3A – thương hiệu ASUS. Màn hình gaming 27 inch QHD Fast IPS với tần số quét cao, thời gian phản hồi thấp, ELMB Sync và Adaptive-Sync giúp giảm xé hình. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,6990000.00,'/uploads/efce1296-cc31-4fad-959b-887fe1fd2eb6.jpg','ACTIVE',NULL,NULL,10),(61,16,'ASUS ProArt PA278QV',NULL,'ASUS ProArt PA278QV – thương hiệu ASUS. Màn hình 27 inch QHD IPS hướng đến sáng tạo nội dung, độ phủ màu rộng, khả năng cân chỉnh màu tại nhà máy trên cấu hình tương ứng và chân đế công thái học. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,7490000.00,'/uploads/e7417ff6-6c30-4c88-8c13-cc29a76a2e44.jpg','ACTIVE',NULL,NULL,10),(62,16,'Samsung Odyssey G5 27-inch',NULL,'Samsung Odyssey G5 27-inch – thương hiệu Samsung. Màn hình gaming 27 inch độ phân giải QHD, tần số quét cao tùy phiên bản, thiết kế cong ở các mẫu G5 tương ứng và hỗ trợ đồng bộ khung hình. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,6490000.00,'/uploads/ffe227c8-f645-4722-a87b-e876002281c0.jpg','ACTIVE',NULL,NULL,10),(63,16,'Samsung ViewFinity S6 27-inch',NULL,'Samsung ViewFinity S6 27-inch – thương hiệu Samsung. Màn hình 27 inch QHD hướng đến văn phòng, tấm nền IPS trên phiên bản phù hợp, chân đế công thái học và kết nối USB-C trên một số mã. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,7990000.00,'/uploads/5b5120e9-cb61-44c4-8665-7cb163845619.jpg','ACTIVE',NULL,NULL,10),(64,16,'AOC 24G2SP',NULL,'AOC 24G2SP – thương hiệu AOC. Màn hình gaming 23,8 inch Full HD IPS, tần số quét 165 Hz, thời gian phản hồi nhanh và hỗ trợ Adaptive-Sync cho trải nghiệm chơi game mượt. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,4490000.00,'/uploads/f33e69f6-d1af-4806-88fc-cf23517ddc2e.jpg','ACTIVE',NULL,NULL,10),(65,16,'BenQ GW2790Q',NULL,'BenQ GW2790Q – thương hiệu BenQ. Màn hình 27 inch QHD hướng đến công việc hằng ngày, công nghệ hỗ trợ giảm mỏi mắt, chế độ màu đa dạng và kết nối HDMI/DisplayPort tùy phiên bản. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,5990000.00,'/uploads/16204e59-1953-4f56-b1a9-3415e816c033.jpg','ACTIVE',NULL,NULL,10),(66,17,'Logitech MX Keys S',NULL,'Logitech MX Keys S – thương hiệu Logitech. Bàn phím không dây cao cấp với phím lõm theo đầu ngón tay, đèn nền thông minh, kết nối Bluetooth hoặc Logi Bolt và khả năng chuyển đổi giữa nhiều thiết bị. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,2690000.00,'/uploads/15744494-4a3b-463f-8126-bd5be83ab261.jpg','ACTIVE',NULL,NULL,10),(67,17,'Logitech MX Mechanical',NULL,'Logitech MX Mechanical – thương hiệu Logitech. Bàn phím cơ không dây với lựa chọn switch cơ học, đèn nền thông minh, kết nối đa thiết bị và pin sạc, phù hợp công việc văn phòng và lập trình. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,3490000.00,'/uploads/297b659e-9fce-4196-b253-06fe61cb11be.jpg','ACTIVE',NULL,NULL,10),(68,17,'Logitech MX Master 3S',NULL,'Logitech MX Master 3S – thương hiệu Logitech. Chuột không dây công thái học với cảm biến 8.000 DPI hoạt động trên nhiều bề mặt, bánh xe cuộn MagSpeed, nút tùy chỉnh và kết nối nhiều thiết bị. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,2490000.00,'/uploads/0fe18893-4505-4144-a08e-e41eac19362d.jpg','ACTIVE',NULL,NULL,10),(69,17,'Logitech G502 X',NULL,'Logitech G502 X – thương hiệu Logitech. Chuột gaming có dây với cảm biến HERO 25K, công tắc LIGHTFORCE hybrid, nút DPI-shift có thể đổi vị trí và nhiều nút lập trình. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,1990000.00,'/uploads/0d9377f3-fe8e-49c9-bd0a-95a1d4183c9d.jpg','ACTIVE',NULL,NULL,10),(70,17,'Razer DeathAdder V3',NULL,'Razer DeathAdder V3 – thương hiệu Razer. Chuột gaming công thái học nhẹ, cảm biến quang học Focus Pro độ phân giải cao, switch quang học và dây Speedflex trên phiên bản có dây. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,1990000.00,'/uploads/df9a07fc-52a2-4e25-9a5c-8c8b0b7d3395.jpg','ACTIVE',NULL,NULL,10),(71,17,'Razer BlackWidow V4',NULL,'Razer BlackWidow V4 – thương hiệu Razer. Bàn phím cơ gaming với switch cơ học, đèn RGB Chroma từng phím, nút điều khiển đa phương tiện và các phím macro tùy cấu hình. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,4490000.00,'/uploads/3120451a-a85d-4db9-95af-311283e9a936.jpg','ACTIVE',NULL,NULL,10),(72,17,'Keychron K8 Pro',NULL,'Keychron K8 Pro – thương hiệu Keychron. Bàn phím cơ layout tenkeyless, kết nối Bluetooth và USB-C, hỗ trợ QMK/VIA trên phiên bản tương ứng, keycap và switch có thể thay đổi. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,2390000.00,'/uploads/a8ab4b16-2877-465b-843d-4b6abeb8e98e.jpg','ACTIVE',NULL,NULL,10),(73,17,'Keychron K2 Version 2',NULL,'Keychron K2 Version 2 – thương hiệu Keychron. Bàn phím cơ nhỏ gọn 75%, kết nối Bluetooth và USB-C, nhiều tùy chọn switch và tương thích macOS/Windows qua bố cục phím chuyển đổi. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,1790000.00,'/uploads/453e83f4-6d4f-4245-9158-8a56f332ea2e.jpg','ACTIVE',NULL,NULL,10),(74,17,'SteelSeries Apex 3',NULL,'SteelSeries Apex 3 – thương hiệu SteelSeries. Bàn phím gaming có dây với đèn RGB nhiều vùng, khả năng kháng nước theo công bố của hãng, nút đa phương tiện và kê tay từ tính. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,1690000.00,'/uploads/c6406d49-e69d-4a06-9647-f27565640b57.jpg','ACTIVE',NULL,NULL,10),(75,17,'Microsoft Bluetooth Ergonomic Mouse',NULL,'Microsoft Bluetooth Ergonomic Mouse – thương hiệu Microsoft. Chuột Bluetooth thiết kế công thái học, bánh xe cuộn, các nút điều hướng và khả năng kết nối không dây với máy tính tương thích. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,990000.00,'/uploads/ff0231da-e57f-4bf9-b3e4-b4fad3da1848.jpg','ACTIVE',NULL,NULL,10),(76,18,'Apple Watch Series 10',NULL,'Apple Watch Series 10 – thương hiệu Apple. Đồng hồ thông minh với màn hình Retina Always-On, theo dõi hoạt động và nhịp tim, thông báo, GPS trên bản GPS và các tính năng sức khỏe tùy khu vực. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,10990000.00,'/uploads/d7f2c09e-2450-4e03-aaff-de6146b90e7f.jpg','ACTIVE',NULL,NULL,10),(77,18,'Apple Watch SE (2nd generation)',NULL,'Apple Watch SE (2nd generation) – thương hiệu Apple. Đồng hồ thông minh Apple với theo dõi hoạt động, nhịp tim, phát hiện té ngã/sự cố trên tính năng hỗ trợ, thông báo và tích hợp iPhone. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,6490000.00,'/uploads/673730d5-b17c-4ae8-8d18-c01ea1743da4.jpg','ACTIVE',NULL,NULL,10),(78,18,'Samsung Galaxy Watch7',NULL,'Samsung Galaxy Watch7 – thương hiệu Samsung. Đồng hồ Wear OS với cảm biến sức khỏe BioActive, theo dõi giấc ngủ, hoạt động thể thao, GPS và kết nối với điện thoại Android tương thích. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,6990000.00,'/uploads/73e514ce-dab3-4f54-85bc-e249feb97562.jpg','ACTIVE',NULL,NULL,10),(79,18,'Samsung Galaxy Watch Ultra',NULL,'Samsung Galaxy Watch Ultra – thương hiệu Samsung. Đồng hồ thông minh bền bỉ với vỏ titanium, màn hình sáng, GPS tần số kép, pin lớn và tính năng theo dõi luyện tập ngoài trời; tương thích điện thoại Android. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,16990000.00,'/uploads/84754751-7834-46d8-9622-f10fd0570bf2.jpg','ACTIVE',NULL,NULL,10),(80,18,'Huawei Watch GT 5',NULL,'Huawei Watch GT 5 – thương hiệu Huawei. Đồng hồ thông minh với thiết kế kim loại, GPS, theo dõi nhịp tim, giấc ngủ và nhiều chế độ thể thao, thời lượng pin dài tùy cách sử dụng. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,5490000.00,'/uploads/7a48b480-202a-4f6e-8729-b1717588c3b3.jpg','ACTIVE',NULL,NULL,10),(81,18,'Huawei Watch Fit 3',NULL,'Huawei Watch Fit 3 – thương hiệu Huawei. Đồng hồ dạng mặt vuông với màn hình AMOLED, theo dõi sức khỏe và hoạt động thể thao, GPS tích hợp và thời lượng pin nhiều ngày tùy cường độ dùng. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,2990000.00,'/uploads/dc6676d2-2411-471f-9de6-fc7311bb5986.jpg','ACTIVE',NULL,NULL,10),(82,18,'Garmin Forerunner 265',NULL,'Garmin Forerunner 265 – thương hiệu Garmin. Đồng hồ chạy bộ với màn hình AMOLED, GPS đa băng tần, chỉ số luyện tập, theo dõi phục hồi và sức khỏe, hỗ trợ nhiều môn thể thao. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,10990000.00,'/uploads/4d71c0b5-10a4-4c73-8814-2f52232958a9.jpg','ACTIVE',NULL,NULL,10),(83,18,'Garmin Venu 3',NULL,'Garmin Venu 3 – thương hiệu Garmin. Đồng hồ GPS đa môn thể thao với màn hình AMOLED, theo dõi sức khỏe, giấc ngủ, Body Battery, loa/micro cho một số chức năng kết nối và pin dài. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,11990000.00,'/uploads/f8d56ad0-f449-407d-b87c-e9d6ee482174.jpg','ACTIVE',NULL,NULL,10),(84,18,'Xiaomi Smart Band 9',NULL,'Xiaomi Smart Band 9 – thương hiệu Xiaomi. Vòng đeo thông minh với màn hình AMOLED, theo dõi nhịp tim và giấc ngủ, nhiều chế độ thể thao, chống nước và thời lượng pin dài. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,990000.00,'/uploads/e281a848-a38f-4c50-87e3-79b0ef951bd1.jpg','ACTIVE',NULL,NULL,10),(85,18,'Amazfit Balance',NULL,'Amazfit Balance – thương hiệu Amazfit. Đồng hồ thông minh với màn hình AMOLED, GPS, theo dõi sức khỏe và thể thao, phân tích phục hồi, nghe gọi Bluetooth và thời lượng pin dài. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,5490000.00,'/uploads/04902fdd-0d35-4e42-a639-bfa008b1e6f5.jpg','ACTIVE',NULL,NULL,10),(86,19,'Canon EOS R50',NULL,'Canon EOS R50 – thương hiệu Canon. Máy ảnh mirrorless APS-C 24,2 MP, lấy nét Dual Pixel CMOS AF II, quay video 4K, màn hình cảm ứng xoay lật và kết nối Wi‑Fi/Bluetooth. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,18990000.00,'/uploads/b31a4ecf-2366-4281-b477-2d4b1185818f.jpg','ACTIVE',NULL,NULL,10),(87,19,'Canon EOS R10',NULL,'Canon EOS R10 – thương hiệu Canon. Máy ảnh mirrorless APS-C 24,2 MP với chụp liên tiếp tốc độ cao, lấy nét theo dõi chủ thể, quay video 4K và ngàm RF/RF-S. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,24990000.00,'/uploads/0580ca17-d969-4996-b22e-dd61f5b7f461.jpg','ACTIVE',NULL,NULL,10),(88,19,'Sony Alpha a6400',NULL,'Sony Alpha a6400 – thương hiệu Sony. Máy ảnh mirrorless APS-C 24,2 MP, lấy nét tự động theo mắt, chụp liên tục nhanh, quay 4K và màn hình lật lên phục vụ vlog. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,19990000.00,'/uploads/e3ba50a5-16bd-41a1-9f96-21e0b86b8755.jpg','ACTIVE',NULL,NULL,10),(89,19,'Sony Alpha a6700',NULL,'Sony Alpha a6700 – thương hiệu Sony. Máy ảnh mirrorless APS-C với cảm biến 26 MP, bộ xử lý BIONZ XR, lấy nét nhận diện chủ thể bằng AI, quay video 4K và chống rung trong thân máy. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,36990000.00,'/uploads/f0472bf6-3dc5-42b9-af5a-a7d376497238.jpg','ACTIVE',NULL,NULL,10),(90,19,'Sony ZV-E10 II',NULL,'Sony ZV-E10 II – thương hiệu Sony. Máy ảnh mirrorless hướng đến nhà sáng tạo nội dung, cảm biến APS-C, quay video 4K, chế độ Product Showcase, mic định hướng và màn hình xoay lật. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,27990000.00,'/uploads/93cd1ffc-00b7-42d9-bc78-f68bc44d5050.jpg','ACTIVE',NULL,NULL,10),(91,19,'Fujifilm X-S20',NULL,'Fujifilm X-S20 – thương hiệu Fujifilm. Máy ảnh mirrorless APS-C 26,1 MP, chống rung 5 trục trong thân máy, mô phỏng phim Fujifilm, quay video 6.2K và màn hình xoay lật. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,34990000.00,'/uploads/28fecfeb-70d6-4fe8-9e42-71a378069ed1.jpg','ACTIVE',NULL,NULL,10),(92,19,'Fujifilm X-T50',NULL,'Fujifilm X-T50 – thương hiệu Fujifilm. Máy ảnh mirrorless APS-C 40,2 MP, bộ xử lý X-Processor 5, chống rung trong thân máy, vòng xoay mô phỏng phim và khả năng quay video độ phân giải cao. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,39990000.00,'/uploads/3d545c87-4d1d-42c2-94a8-c1f697a6b243.jpg','ACTIVE',NULL,NULL,10),(93,19,'Nikon Z50II',NULL,'Nikon Z50II – thương hiệu Nikon. Máy ảnh mirrorless APS-C với cảm biến 20,9 MP, bộ xử lý EXPEED 7, lấy nét nhận diện chủ thể, quay video 4K và ngàm Z. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,27990000.00,'/uploads/8f69d38d-0c48-4153-886b-99df4809a443.jpg','ACTIVE',NULL,NULL,10),(94,19,'Nikon Z5',NULL,'Nikon Z5 – thương hiệu Nikon. Máy ảnh mirrorless full-frame 24,3 MP, chống rung 5 trục trong thân máy, kính ngắm điện tử, khe thẻ kép và quay video 4K. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,27990000.00,'/uploads/0195aec8-d5d3-4902-bc28-9b735aa70fd0.jpg','ACTIVE',NULL,NULL,10),(95,19,'GoPro HERO13 Black',NULL,'GoPro HERO13 Black – thương hiệu GoPro. Camera hành động nhỏ gọn quay video 5.3K, chống rung HyperSmooth, chống nước khi không dùng vỏ chuyên dụng trong giới hạn công bố, phù hợp thể thao và du lịch. Giá và thông số có thể thay đổi theo phiên bản, dung lượng, cấu hình và nhà bán lẻ tại Việt Nam. Vui lòng xác minh lại trước khi đăng bán.',NULL,10990000.00,'/uploads/7406c0f7-95aa-4ac9-baf5-d9e22eaa018f.jpg','ACTIVE',NULL,NULL,10);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotion_categories`
--

DROP TABLE IF EXISTS `promotion_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotion_categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `promotion_id` bigint NOT NULL,
  `category_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_promotion_category` (`promotion_id`,`category_id`),
  KEY `fk_promotion_category_category` (`category_id`),
  CONSTRAINT `fk_promotion_category_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_promotion_category_promotion` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotion_categories`
--

LOCK TABLES `promotion_categories` WRITE;
/*!40000 ALTER TABLE `promotion_categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `promotion_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotion_products`
--

DROP TABLE IF EXISTS `promotion_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotion_products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `promotion_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_promotion_product` (`promotion_id`,`product_id`),
  KEY `fk_promotion_product_product` (`product_id`),
  CONSTRAINT `fk_promotion_product_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_promotion_product_promotion` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotion_products`
--

LOCK TABLES `promotion_products` WRITE;
/*!40000 ALTER TABLE `promotion_products` DISABLE KEYS */;
/*!40000 ALTER TABLE `promotion_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotion_usages`
--

DROP TABLE IF EXISTS `promotion_usages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotion_usages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `promotion_id` bigint NOT NULL,
  `customer_id` bigint NOT NULL,
  `order_id` bigint NOT NULL,
  `used_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_promotion_customer` (`promotion_id`,`customer_id`),
  KEY `fk_promotion_usage_customer` (`customer_id`),
  KEY `fk_promotion_usage_order` (`order_id`),
  CONSTRAINT `fk_promotion_usage_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `fk_promotion_usage_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `fk_promotion_usage_promotion` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotion_usages`
--

LOCK TABLES `promotion_usages` WRITE;
/*!40000 ALTER TABLE `promotion_usages` DISABLE KEYS */;
/*!40000 ALTER TABLE `promotion_usages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotions`
--

DROP TABLE IF EXISTS `promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `code` varchar(50) NOT NULL,
  `discount_type` varchar(20) NOT NULL,
  `discount_value` decimal(15,2) NOT NULL,
  `max_discount` decimal(15,2) DEFAULT NULL,
  `min_order_amount` decimal(15,2) DEFAULT '0.00',
  `usage_limit` int NOT NULL,
  `used_count` int NOT NULL DEFAULT '0',
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `scope_type` varchar(20) NOT NULL DEFAULT 'ALL',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotions`
--

LOCK TABLES `promotions` WRITE;
/*!40000 ALTER TABLE `promotions` DISABLE KEYS */;
/*!40000 ALTER TABLE `promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ADMIN','Quản trị viên hệ thống','2026-08-13 15:34:03'),(2,'EMPLOYEE','Nhân viên bán hàng','2026-08-13 15:34:03'),(9,'CUSTOMER','Khách hàng','2026-08-19 15:22:52');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_chat_presence`
--

DROP TABLE IF EXISTS `staff_chat_presence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_chat_presence` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `staff_id` bigint NOT NULL,
  `last_seen_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_staff_chat_presence_staff` (`staff_id`),
  KEY `idx_staff_chat_presence_last_seen` (`last_seen_at`),
  CONSTRAINT `fk_staff_chat_presence_staff` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_chat_presence`
--

LOCK TABLES `staff_chat_presence` WRITE;
/*!40000 ALTER TABLE `staff_chat_presence` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_chat_presence` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `role_id` bigint NOT NULL,
  `status` enum('ACTIVE','INACTIVE','LOCKED') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_users_role` (`role_id`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'nguyenvana@gmail.com','123456','nguyenvana@gmail.com','Nguyễn Văn Aaa',2,'ACTIVE',NULL,NULL),(4,'admin','$2a$10$kJJoDsDHX6qQbMhJ1gAvFutyJNTBh5Lgh4TlmGzjxSud7L3EmyWa2','admin@smartsales.com','Quản trị viên',1,'ACTIVE',NULL,'2026-10-17 15:08:23'),(12,'customer01','$2a$10$49i5C6PvgSzagsAocJOkNuPpKMxmHscbUzbNX/E8ygZlMEwNwO8DO','customer01@gmail.com','Customer Test',9,'ACTIVE',NULL,'2026-10-17 14:43:25'),(13,'tuyenhoang2261978@gmail.com','$2a$10$.rPsYXcX3EUktXbk.uktSu.O4VmHAIBRw2xCYWgP8fECsh9yxk3DO','tuyenhoang2261978@gmail.com','Bằng Nguyễn Khắc',9,'ACTIVE','2026-09-07 15:03:13','2026-10-11 14:23:28'),(14,'123@smartsales.com','$2a$10$.1Ickck/J7IGaYJ0dHcAr.4zNNlD5v1RPfvJXPBNWbDIEDaf.mOvy','123@smartsales.com','04-Nguyễn Khắc Bằng',9,'INACTIVE','2026-09-08 14:58:58',NULL),(18,'nhanvien@smartsales.com','$2a$10$mjf2JmaOiPGejzujGr0xAuZJ6QbIJiERtOwHQyfQ2d.I54wUHRyRy','nhanvien@smartsales.com','Nguyễn Khắc Bằng',2,'ACTIVE','2026-09-15 14:52:05','2026-10-17 10:14:35');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'smart_sales'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-17 22:09:42
