-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: tuninghub_teste
-- ------------------------------------------------------
-- Server version	8.0.46-0ubuntu0.24.04.4

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
-- Current Database: `script_bd`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `script_bd` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `script_bd`;

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin` (
  `IdAdmin` int NOT NULL AUTO_INCREMENT,
  `Nome` varchar(150) NOT NULL,
  `Email` varchar(150) NOT NULL,
  `Senha` varchar(255) NOT NULL,
  `NivelAcesso` enum('SUPER','PADRAO') DEFAULT 'PADRAO',
  `DataCriacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `Ativo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`IdAdmin`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `assinatura`
--

DROP TABLE IF EXISTS `assinatura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assinatura` (
  `IdAssinatura` int NOT NULL AUTO_INCREMENT,
  `IdOficina` int NOT NULL,
  `IdPlano` int NOT NULL,
  `DataInicio` date NOT NULL,
  `DataFim` date DEFAULT NULL,
  `Status` enum('ATIVA','EXPIRADA','CANCELADA','PENDENTE') DEFAULT 'ATIVA',
  `IdCobrancaExterna` varchar(100) DEFAULT NULL,
  `DataCriacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`IdAssinatura`),
  KEY `IdOficina` (`IdOficina`),
  KEY `IdPlano` (`IdPlano`),
  CONSTRAINT `assinatura_ibfk_1` FOREIGN KEY (`IdOficina`) REFERENCES `oficina` (`IdOficina`),
  CONSTRAINT `assinatura_ibfk_2` FOREIGN KEY (`IdPlano`) REFERENCES `plano` (`IdPlano`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `categoriaservico`
--

DROP TABLE IF EXISTS `categoriaservico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoriaservico` (
  `IdCategoria` int NOT NULL AUTO_INCREMENT,
  `Nome` varchar(50) NOT NULL,
  `Ativo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`IdCategoria`),
  UNIQUE KEY `Nome` (`Nome`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `endereco`
--

DROP TABLE IF EXISTS `endereco`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `endereco` (
  `IdEndereco` int NOT NULL AUTO_INCREMENT,
  `IdOficina` int NOT NULL,
  `Rua` varchar(150) DEFAULT NULL,
  `Numero` varchar(20) DEFAULT NULL,
  `Bairro` varchar(100) DEFAULT NULL,
  `Cidade` varchar(100) DEFAULT NULL,
  `Estado` varchar(50) DEFAULT NULL,
  `CEP` varchar(20) DEFAULT NULL,
  `Latitude` decimal(10,8) DEFAULT NULL,
  `Longitude` decimal(11,8) DEFAULT NULL,
  `DataCriacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `DataAtualizacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`IdEndereco`),
  KEY `IdOficina` (`IdOficina`),
  CONSTRAINT `endereco_ibfk_1` FOREIGN KEY (`IdOficina`) REFERENCES `oficina` (`IdOficina`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `estilo`
--

DROP TABLE IF EXISTS `estilo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estilo` (
  `IdEstilo` int NOT NULL AUTO_INCREMENT,
  `Codigo` varchar(30) NOT NULL,
  `Nome` varchar(60) NOT NULL,
  `Ativo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`IdEstilo`),
  UNIQUE KEY `Codigo` (`Codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `estiloservicosugerido`
--

DROP TABLE IF EXISTS `estiloservicosugerido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estiloservicosugerido` (
  `IdEstiloServico` int NOT NULL AUTO_INCREMENT,
  `Estilo` varchar(30) NOT NULL,
  `IdServico` int NOT NULL,
  PRIMARY KEY (`IdEstiloServico`),
  UNIQUE KEY `uk_estilo_servico` (`Estilo`,`IdServico`),
  KEY `IdServico` (`IdServico`),
  CONSTRAINT `estiloservicosugerido_ibfk_1` FOREIGN KEY (`IdServico`) REFERENCES `servico` (`IdServico`),
  CONSTRAINT `esugerido_estilo_fk` FOREIGN KEY (`Estilo`) REFERENCES `estilo` (`Codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `imagem`
--

DROP TABLE IF EXISTS `imagem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `imagem` (
  `IdImagem` int NOT NULL AUTO_INCREMENT,
  `IdOficina` int NOT NULL,
  `UrlImagem` varchar(255) NOT NULL,
  `TipoImagem` enum('LOGO','GALERIA') NOT NULL,
  `Status` enum('ATIVO','INATIVO') DEFAULT 'ATIVO',
  `DataCriacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`IdImagem`),
  KEY `IdOficina` (`IdOficina`),
  CONSTRAINT `imagem_ibfk_1` FOREIGN KEY (`IdOficina`) REFERENCES `oficina` (`IdOficina`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `logsistema`
--

DROP TABLE IF EXISTS `logsistema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logsistema` (
  `IdLog` int NOT NULL AUTO_INCREMENT,
  `IdAdmin` int NOT NULL,
  `Acao` varchar(255) NOT NULL,
  `Entidade` varchar(100) DEFAULT NULL,
  `IdReferencia` int DEFAULT NULL,
  `DataAcao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`IdLog`),
  KEY `IdAdmin` (`IdAdmin`),
  CONSTRAINT `logsistema_ibfk_1` FOREIGN KEY (`IdAdmin`) REFERENCES `admin` (`IdAdmin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `modelo`
--

DROP TABLE IF EXISTS `modelo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `modelo` (
  `IdModelo` int NOT NULL AUTO_INCREMENT,
  `IdMontadora` int NOT NULL,
  `Nome` varchar(100) NOT NULL,
  `Ativo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`IdModelo`),
  KEY `IdMontadora` (`IdMontadora`),
  CONSTRAINT `modelo_ibfk_1` FOREIGN KEY (`IdMontadora`) REFERENCES `montadora` (`IdMontadora`)
) ENGINE=InnoDB AUTO_INCREMENT=7292 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `montadora`
--

DROP TABLE IF EXISTS `montadora`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `montadora` (
  `IdMontadora` int NOT NULL AUTO_INCREMENT,
  `Nome` varchar(100) NOT NULL,
  `Ativo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`IdMontadora`),
  UNIQUE KEY `Nome` (`Nome`)
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `oficina`
--

DROP TABLE IF EXISTS `oficina`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `oficina` (
  `IdOficina` int NOT NULL AUTO_INCREMENT,
  `NomeOficina` varchar(150) NOT NULL,
  `CNPJ` varchar(20) NOT NULL,
  `NomeProprietario` varchar(150) DEFAULT NULL,
  `Telefone` varchar(20) DEFAULT NULL,
  `Email` varchar(150) NOT NULL,
  `Senha` varchar(255) NOT NULL,
  `DataCriacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `DataAtualizacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `Ativo` tinyint(1) DEFAULT '1',
  `FaixaPreco` enum('$','$$','$$$') DEFAULT NULL,
  `CNAE` varchar(20) DEFAULT NULL,
  `TermosAceitos` tinyint(1) NOT NULL DEFAULT '0',
  `DataAceiteTermos` datetime DEFAULT NULL,
  PRIMARY KEY (`IdOficina`),
  UNIQUE KEY `CNPJ` (`CNPJ`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `oficinaservico`
--

DROP TABLE IF EXISTS `oficinaservico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `oficinaservico` (
  `IdOficinaServico` int NOT NULL AUTO_INCREMENT,
  `IdOficina` int NOT NULL,
  `IdServico` int NOT NULL,
  PRIMARY KEY (`IdOficinaServico`),
  KEY `IdOficina` (`IdOficina`),
  KEY `IdServico` (`IdServico`),
  CONSTRAINT `oficinaservico_ibfk_1` FOREIGN KEY (`IdOficina`) REFERENCES `oficina` (`IdOficina`),
  CONSTRAINT `oficinaservico_ibfk_2` FOREIGN KEY (`IdServico`) REFERENCES `servico` (`IdServico`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `plano`
--

DROP TABLE IF EXISTS `plano`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plano` (
  `IdPlano` int NOT NULL AUTO_INCREMENT,
  `Nome` varchar(100) NOT NULL,
  `Valor` decimal(10,2) DEFAULT '0.00',
  `DuracaoDias` int NOT NULL,
  `Ativo` tinyint(1) DEFAULT '1',
  `IdProdutoExterno` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`IdPlano`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `projeto`
--

DROP TABLE IF EXISTS `projeto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projeto` (
  `IdProjeto` int NOT NULL AUTO_INCREMENT,
  `IdUsuario` int NOT NULL,
  `IdModelo` int NOT NULL,
  `Descricao` varchar(255) DEFAULT NULL,
  `TipoCustomizacao` enum('ESTILO','PERSONALIZADA') NOT NULL DEFAULT 'PERSONALIZADA',
  `Estilo` varchar(30) DEFAULT NULL,
  `DataCriacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `DataAtualizacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `Ativo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`IdProjeto`),
  KEY `IdUsuario` (`IdUsuario`),
  KEY `IdModelo` (`IdModelo`),
  KEY `projeto_estilo_fk` (`Estilo`),
  CONSTRAINT `projeto_estilo_fk` FOREIGN KEY (`Estilo`) REFERENCES `estilo` (`Codigo`),
  CONSTRAINT `projeto_ibfk_1` FOREIGN KEY (`IdUsuario`) REFERENCES `usuario` (`IdUsuario`),
  CONSTRAINT `projeto_ibfk_2` FOREIGN KEY (`IdModelo`) REFERENCES `modelo` (`IdModelo`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `projetoservico`
--

DROP TABLE IF EXISTS `projetoservico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projetoservico` (
  `IdProjetoServico` int NOT NULL AUTO_INCREMENT,
  `IdProjeto` int NOT NULL,
  `IdServico` int NOT NULL,
  `Concluido` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`IdProjetoServico`),
  KEY `IdProjeto` (`IdProjeto`),
  KEY `IdServico` (`IdServico`),
  CONSTRAINT `projetoservico_ibfk_1` FOREIGN KEY (`IdProjeto`) REFERENCES `projeto` (`IdProjeto`),
  CONSTRAINT `projetoservico_ibfk_2` FOREIGN KEY (`IdServico`) REFERENCES `servico` (`IdServico`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `servico`
--

DROP TABLE IF EXISTS `servico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servico` (
  `IdServico` int NOT NULL AUTO_INCREMENT,
  `Nome` varchar(100) NOT NULL,
  `Descricao` varchar(255) DEFAULT NULL,
  `IdCategoria` int NOT NULL,
  `Ativo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`IdServico`),
  KEY `servico_ibfk_categoria` (`IdCategoria`),
  CONSTRAINT `servico_ibfk_categoria` FOREIGN KEY (`IdCategoria`) REFERENCES `categoriaservico` (`IdCategoria`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `token_recuperacao_senha`
--

DROP TABLE IF EXISTS `token_recuperacao_senha`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `token_recuperacao_senha` (
  `IdToken` int NOT NULL AUTO_INCREMENT,
  `IdUsuario` int NOT NULL,
  `Token` varchar(255) NOT NULL,
  `DataExpiracao` timestamp NOT NULL,
  `Usado` tinyint(1) NOT NULL DEFAULT '0',
  `DataCriacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`IdToken`),
  KEY `IdUsuario` (`IdUsuario`),
  CONSTRAINT `token_recuperacao_senha_ibfk_1` FOREIGN KEY (`IdUsuario`) REFERENCES `usuario` (`IdUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `IdUsuario` int NOT NULL AUTO_INCREMENT,
  `Nome` varchar(150) NOT NULL,
  `Email` varchar(150) NOT NULL,
  `Senha` varchar(255) NOT NULL,
  `DataCriacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `DataAtualizacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `Ativo` tinyint(1) DEFAULT '1',
  `TermosAceitos` tinyint(1) NOT NULL DEFAULT '0',
  `DataAceiteTermos` datetime DEFAULT NULL,
  PRIMARY KEY (`IdUsuario`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-14 23:44:07
